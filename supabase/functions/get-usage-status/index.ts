import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`Getting usage status for user: ${userId}`);

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
        JSON.stringify({ 
          hasSubscription: false,
          canUse: false,
          message: 'No active subscription',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get usage tracking record
    let { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription_id', subscription.id)
      .maybeSingle();

    const minutesLimit = PLAN_MINUTES[subscription.plan as keyof typeof PLAN_MINUTES] || 300;

    // Create usage record if doesn't exist
    if (!usage) {
      const billingEnd = new Date();
      billingEnd.setMonth(billingEnd.getMonth() + 1);

      const { data: newUsage } = await supabase
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

      usage = newUsage;
    }

    const totalAvailable = (usage?.minutes_limit || minutesLimit) + (usage?.minutes_carried_over || 0);
    const minutesUsed = usage?.minutes_used || 0;
    const minutesRemaining = Math.max(0, totalAvailable - minutesUsed);

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (subscription.status === 'trial' && subscription.subscription_end) {
      const trialEnd = new Date(subscription.subscription_end);
      const now = new Date();
      trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Get unread notifications count
    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    return new Response(
      JSON.stringify({
        hasSubscription: true,
        canUse: minutesRemaining > 0,
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          planDuration: subscription.plan_duration,
          status: subscription.status,
          trialDaysRemaining,
          subscriptionStart: subscription.subscription_start,
          subscriptionEnd: subscription.subscription_end,
        },
        usage: {
          minutesUsed,
          minutesLimit: totalAvailable,
          minutesRemaining,
          minutesCarriedOver: usage?.minutes_carried_over || 0,
          usagePercentage: Math.round((minutesUsed / totalAvailable) * 100),
          billingPeriodStart: usage?.billing_period_start,
          billingPeriodEnd: usage?.billing_period_end,
        },
        unreadNotifications: unreadNotifications || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-usage-status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
