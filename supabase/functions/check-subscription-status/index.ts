import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function checks trial status and sends notifications
// Should be called daily via cron job

const PLAN_MINUTES = {
  basic: 300,
  premium: 1000,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Running subscription status check...');

    // Get all trial subscriptions
    const { data: trialSubs, error: trialError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'trial');

    if (trialError) {
      console.error('Error fetching trial subscriptions:', trialError);
      throw new Error('Failed to fetch trial subscriptions');
    }

    const now = new Date();
    let processedCount = 0;
    let notificationsCreated = 0;

    for (const sub of trialSubs || []) {
      // Calculate days remaining
      const trialEnd = sub.subscription_end ? new Date(sub.subscription_end) : null;
      
      if (!trialEnd) continue;

      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Update remaining_trial_days
      if (sub.remaining_trial_days !== daysRemaining) {
        await supabase
          .from('subscriptions')
          .update({ 
            remaining_trial_days: Math.max(0, daysRemaining),
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);
      }

      // Send trial ending notification (2 days before)
      if (daysRemaining === 2) {
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', sub.user_id)
          .eq('type', 'trial_ending')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!existingNotif) {
          await supabase
            .from('notifications')
            .insert({
              user_id: sub.user_id,
              type: 'trial_ending',
              title: 'Trial Ending Soon',
              message: `Your free trial ends in ${daysRemaining} days. Subscribe now to continue enjoying our service!`,
            });
          notificationsCreated++;
          console.log(`Created trial ending notification for user: ${sub.user_id}`);
        }
      }

      // Handle trial ended
      if (daysRemaining <= 0) {
        // Update subscription status to expired
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'expired',
            remaining_trial_days: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        // Send trial ended notification
        const { data: existingEndedNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', sub.user_id)
          .eq('type', 'trial_ended')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!existingEndedNotif) {
          await supabase
            .from('notifications')
            .insert({
              user_id: sub.user_id,
              type: 'trial_ended',
              title: 'Trial Ended',
              message: 'Your free trial has ended. Subscribe now to continue using our voice assistant features!',
            });
          notificationsCreated++;
          console.log(`Created trial ended notification for user: ${sub.user_id}`);
        }
      }

      processedCount++;
    }

    // Reset usage for subscriptions at new billing period
    const { data: usageRecords, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*, subscriptions(plan, plan_duration)')
      .lt('billing_period_end', now.toISOString());

    if (!usageError && usageRecords) {
      for (const usage of usageRecords) {
        const subscription = usage.subscriptions as any;
        const isAnnualPremium = subscription?.plan === 'premium' && subscription?.plan_duration === 'annual';
        
        // Calculate carryover for annual premium users (max 50% of unused)
        let carryOver = 0;
        if (isAnnualPremium) {
          const unusedMinutes = usage.minutes_limit - usage.minutes_used;
          carryOver = Math.floor(Math.min(unusedMinutes * 0.5, usage.minutes_limit * 0.25)); // Max 25% of limit
        }

        // Calculate new billing period
        const newStart = new Date();
        const newEnd = new Date();
        newEnd.setMonth(newEnd.getMonth() + 1);

        await supabase
          .from('usage_tracking')
          .update({
            minutes_used: 0,
            minutes_carried_over: carryOver,
            billing_period_start: newStart.toISOString(),
            billing_period_end: newEnd.toISOString(),
            last_reset_date: newStart.toISOString(),
            updated_at: newStart.toISOString(),
          })
          .eq('id', usage.id);

        console.log(`Reset usage for user, carryover: ${carryOver} minutes`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        notificationsCreated,
        message: `Processed ${processedCount} subscriptions, created ${notificationsCreated} notifications`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-subscription-status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
