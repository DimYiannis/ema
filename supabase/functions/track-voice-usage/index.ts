import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackUsageRequest {
  userId: string;
  minutesUsed: number;
}

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
    const { userId, minutesUsed }: TrackUsageRequest = await req.json();

    if (!userId || minutesUsed === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or minutesUsed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Tracking ${minutesUsed} minutes for user: ${userId}`);

    // Get user's current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      throw new Error('Failed to fetch subscription');
    }

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found', canUse: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create usage tracking record
    let { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription_id', subscription.id)
      .maybeSingle();

    const minutesLimit = PLAN_MINUTES[subscription.plan as keyof typeof PLAN_MINUTES] || 300;

    if (!usage) {
      // Create new usage tracking record
      const billingEnd = new Date();
      billingEnd.setMonth(billingEnd.getMonth() + 1);

      const { data: newUsage, error: createError } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          subscription_id: subscription.id,
          minutes_used: 0,
          minutes_limit: minutesLimit,
          billing_period_start: new Date().toISOString(),
          billing_period_end: billingEnd.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating usage record:', createError);
        throw new Error('Failed to create usage record');
      }

      usage = newUsage;
    }

    // Calculate total available minutes (including carryover)
    const totalAvailable = usage.minutes_limit + (usage.minutes_carried_over || 0);
    const currentUsed = usage.minutes_used || 0;
    const newTotal = currentUsed + minutesUsed;

    // Check if user would exceed limit
    if (newTotal > totalAvailable) {
      return new Response(
        JSON.stringify({ 
          error: 'Monthly minute limit reached',
          canUse: false,
          minutesUsed: currentUsed,
          minutesLimit: totalAvailable,
          minutesRemaining: Math.max(0, totalAvailable - currentUsed),
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update usage
    const { error: updateError } = await supabase
      .from('usage_tracking')
      .update({ 
        minutes_used: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', usage.id);

    if (updateError) {
      console.error('Error updating usage:', updateError);
      throw new Error('Failed to update usage');
    }

    // Check if user reached 80% usage and send notification
    const usagePercentage = (newTotal / totalAvailable) * 100;
    if (usagePercentage >= 80 && (currentUsed / totalAvailable) * 100 < 80) {
      // User just crossed 80% threshold - create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'usage_warning',
          title: 'Usage Warning',
          message: `You've used ${Math.round(usagePercentage)}% of your monthly minutes. Consider upgrading your plan if you need more.`,
        });

      console.log(`Created 80% usage warning notification for user: ${userId}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        canUse: true,
        minutesUsed: newTotal,
        minutesLimit: totalAvailable,
        minutesRemaining: totalAvailable - newTotal,
        usagePercentage: Math.round((newTotal / totalAvailable) * 100),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in track-voice-usage:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
