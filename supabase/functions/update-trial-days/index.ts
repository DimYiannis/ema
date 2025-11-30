import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily trial days update...');

    // Get all trial subscriptions with remaining days > 0
    const { data: trialSubs, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, user_id, remaining_trial_days, mollie_subscription_id')
      .eq('status', 'trial')
      .gt('remaining_trial_days', 0);

    if (fetchError) {
      console.error('Error fetching trial subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${trialSubs?.length || 0} trial subscriptions to update`);

    let updatedCount = 0;
    let expiredCount = 0;

    for (const sub of trialSubs || []) {
      const newTrialDays = sub.remaining_trial_days - 1;

      if (newTrialDays <= 0) {
        // Trial expired - update status to active (billing will start)
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            remaining_trial_days: 0,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        if (updateError) {
          console.error(`Error updating expired trial for subscription ${sub.id}:`, updateError);
        } else {
          expiredCount++;
          console.log(`Trial expired for subscription ${sub.id}, status changed to active`);
        }
      } else {
        // Decrement trial days
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            remaining_trial_days: newTrialDays,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        if (updateError) {
          console.error(`Error updating trial days for subscription ${sub.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }

    const summary = {
      totalProcessed: trialSubs?.length || 0,
      daysDecremented: updatedCount,
      trialsExpired: expiredCount,
      timestamp: new Date().toISOString(),
    };

    console.log('Daily trial update completed:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-trial-days:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
