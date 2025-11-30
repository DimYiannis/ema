import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateSubscriptionRequest {
  userId: string;
  newPlanType: 'basic' | 'premium';
  newPlanDuration: 'monthly' | '6-month' | 'annual';
}

const PLAN_PRICING = {
  basic: {
    monthly: { amount: '9.99', interval: '1 month', months: 1 },
    '6-month': { amount: '49.99', interval: '6 months', months: 6 },
    annual: { amount: '89.99', interval: '12 months', months: 12 },
  },
  premium: {
    monthly: { amount: '19.99', interval: '1 month', months: 1 },
    '6-month': { amount: '99.99', interval: '6 months', months: 6 },
    annual: { amount: '179.99', interval: '12 months', months: 12 },
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!mollieApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, newPlanType, newPlanDuration }: UpdateSubscriptionRequest = await req.json();

    if (!userId || !newPlanType || !newPlanDuration) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating subscription for user: ${userId} to ${newPlanType} ${newPlanDuration}`);

    // Get current subscription
    const { data: currentSub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !currentSub) {
      console.error('No active subscription found:', subError);
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Mollie customer
    const { data: customer } = await supabase
      .from('mollie_customers')
      .select('mollie_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!customer?.mollie_customer_id) {
      return new Response(
        JSON.stringify({ error: 'No Mollie customer found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newPlanConfig = PLAN_PRICING[newPlanType][newPlanDuration];
    const mollieCustomerId = customer.mollie_customer_id;
    const oldSubscriptionId = currentSub.mollie_subscription_id;

    // If we have a real Mollie subscription, cancel it first
    if (oldSubscriptionId && !oldSubscriptionId.startsWith('pending_')) {
      console.log('Canceling old subscription:', oldSubscriptionId);
      
      const cancelResponse = await fetch(
        `https://api.mollie.com/v2/customers/${mollieCustomerId}/subscriptions/${oldSubscriptionId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${mollieApiKey}` },
        }
      );

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json();
        console.error('Failed to cancel old subscription:', errorData);
        // Continue anyway - the subscription might already be canceled
      }
    }

    // Check for valid mandate
    const mandatesResponse = await fetch(
      `https://api.mollie.com/v2/customers/${mollieCustomerId}/mandates`,
      { headers: { 'Authorization': `Bearer ${mollieApiKey}` } }
    );

    const mandatesData = await mandatesResponse.json();
    const validMandate = mandatesData._embedded?.mandates?.find(
      (m: any) => m.status === 'valid'
    );

    if (!validMandate) {
      return new Response(
        JSON.stringify({ error: 'No valid payment mandate. Please add a payment method first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate start date - for trial users, keep the trial end date; for active, start immediately
    let startDate: string;
    if (currentSub.status === 'trial' && currentSub.remaining_trial_days && currentSub.remaining_trial_days > 0) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + currentSub.remaining_trial_days);
      startDate = trialEnd.toISOString().split('T')[0];
    } else {
      // Start from next billing cycle (tomorrow for immediate effect)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      startDate = tomorrow.toISOString().split('T')[0];
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    // Create new subscription
    console.log('Creating new subscription with mandate:', validMandate.id);
    
    const subscriptionResponse = await fetch(
      `https://api.mollie.com/v2/customers/${mollieCustomerId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mollieApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: { currency: 'EUR', value: newPlanConfig.amount },
          interval: newPlanConfig.interval,
          description: `${newPlanType.charAt(0).toUpperCase() + newPlanType.slice(1)} Plan - ${newPlanDuration}`,
          startDate: startDate,
          webhookUrl: webhookUrl,
          metadata: {
            user_id: userId,
            plan_type: newPlanType,
            plan_duration: newPlanDuration,
            upgraded_from: currentSub.plan,
          },
        }),
      }
    );

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      console.error('Failed to create new subscription:', subscriptionData);
      throw new Error(subscriptionData.detail || 'Failed to create new subscription');
    }

    console.log('New Mollie subscription created:', subscriptionData.id);

    // Calculate new subscription end date
    const subscriptionEndDate = new Date(startDate);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + newPlanConfig.months);

    // Update the subscription record
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        mollie_subscription_id: subscriptionData.id,
        plan: newPlanType,
        plan_duration: newPlanDuration,
        billing_amount: newPlanConfig.amount,
        subscription_end: subscriptionEndDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSub.id);

    if (updateError) {
      console.error('Failed to update subscription record:', updateError);
      throw new Error('Failed to update subscription record');
    }

    // Also update payment_methods table if it exists
    await supabase
      .from('payment_methods')
      .update({
        plan: newPlanType,
        mollie_subscription_id: subscriptionData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscriptionData.id,
        planType: newPlanType,
        planDuration: newPlanDuration,
        billingAmount: newPlanConfig.amount,
        nextBillingDate: startDate,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-mollie-subscription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
