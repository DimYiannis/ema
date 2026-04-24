import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  userId: string;
  userName: string;
  userEmail: string;
  planType: 'basic' | 'premium';
  planDuration: 'monthly' | '6-month' | 'annual';
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

const TRIAL_DAYS = 14;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!mollieApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, userName, userEmail, planType, planDuration }: SubscriptionRequest = await req.json();

    // Validate required fields
    if (!userId || !userName || !userEmail || !planType || !planDuration) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, userName, userEmail, planType, planDuration' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate planType
    if (!['basic', 'premium'].includes(planType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid planType. Must be "basic" or "premium"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate planDuration
    if (!['monthly', '6-month', 'annual'].includes(planDuration)) {
      return new Response(
        JSON.stringify({ error: 'Invalid planDuration. Must be "monthly", "6-month", or "annual"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating subscription for user: ${userId}, plan: ${planType}, duration: ${planDuration}`);

    // Check for existing active/trial subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
      .maybeSingle();

    if (existingSub) {
      console.log('User already has an active subscription');
      return new Response(
        JSON.stringify({ 
          error: 'User already has an active subscription',
          existingSubscriptionId: existingSub.mollie_subscription_id,
          status: existingSub.status,
          trialRemainingDays: existingSub.remaining_trial_days
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create Mollie customer
    const { data: existingCustomer } = await supabase
      .from('mollie_customers')
      .select('mollie_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    let mollieCustomerId = existingCustomer?.mollie_customer_id;

    if (!mollieCustomerId) {
      console.log('Creating new Mollie customer');
      const customerResponse = await fetch('https://api.mollie.com/v2/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mollieApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          metadata: { user_id: userId },
        }),
      });

      const customerData = await customerResponse.json();

      if (!customerResponse.ok) {
        console.error('Failed to create Mollie customer:', customerData);
        throw new Error(customerData.detail || 'Failed to create customer');
      }

      mollieCustomerId = customerData.id;
      console.log('Mollie customer created:', mollieCustomerId);

      // Store in mollie_customers table
      const { error: customerDbError } = await supabase
        .from('mollie_customers')
        .insert({
          user_id: userId,
          mollie_customer_id: mollieCustomerId,
        });

      if (customerDbError) {
        console.error('Failed to store customer:', customerDbError);
        throw new Error('Failed to store customer information');
      }
    }

    // Check for valid mandate
    const mandatesResponse = await fetch(
      `https://api.mollie.com/v2/customers/${mollieCustomerId}/mandates`,
      { headers: { 'Authorization': `Bearer ${mollieApiKey}` } }
    );

    const mandatesData = await mandatesResponse.json();
    const validMandate = mandatesData._embedded?.mandates?.find(
      (m: any) => m.status === 'valid' || m.status === 'pending'
    );

    const planConfig = PLAN_PRICING[planType][planDuration];
    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;
    const baseRedirectUrl = req.headers.get('origin') || 'http://localhost:8080';
    const redirectUrl = `${baseRedirectUrl}/subscription?status=paid`;

    // If no valid mandate, create first payment for card verification
    if (!validMandate) {
      console.log('No valid mandate, creating first payment for card verification');

      const firstPaymentResponse = await fetch('https://api.mollie.com/v2/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mollieApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: { currency: 'EUR', value: '0.01' },
          customerId: mollieCustomerId,
          sequenceType: 'first',
          description: `Card verification - ${planType} ${planDuration} plan`,
          redirectUrl: redirectUrl,
          webhookUrl: webhookUrl,
          metadata: {
            user_id: userId,
            plan_type: planType,
            plan_duration: planDuration,
            payment_type: 'subscription_setup',
          },
        }),
      });

      const firstPaymentData = await firstPaymentResponse.json();

      if (!firstPaymentResponse.ok) {
        console.error('Failed to create first payment:', firstPaymentData);
        throw new Error(firstPaymentData.detail || 'Failed to create payment');
      }

      // Create trial subscription record
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

      const { data: newSub, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          mollie_subscription_id: `pending_${Date.now()}`,
          plan: planType,
          plan_duration: planDuration,
          status: 'trial',
          remaining_trial_days: TRIAL_DAYS,
          billing_amount: planConfig.amount,
          currency: 'EUR',
          subscription_start: new Date().toISOString(),
          subscription_end: trialEndDate.toISOString(),
        })
        .select()
        .single();

      if (subError) {
        console.error('Failed to create subscription record:', subError);
        throw new Error('Failed to store subscription');
      }

      // Create or update payment_methods for the user
      const { error: pmError } = await supabase
        .from('payment_methods')
        .upsert({
          user_id: userId,
          mollie_customer_id: mollieCustomerId,
          plan: planType,
          subscription_status: 'pending',
          is_active: false,
          trial_end_date: trialEndDate.toISOString(),
        }, { onConflict: 'user_id' });

      if (pmError) {
        console.error('Failed to update payment method:', pmError);
      }

      return new Response(
        JSON.stringify({
          subscriptionId: newSub.id,
          status: 'trial',
          trialRemainingDays: TRIAL_DAYS,
          paymentUrl: firstPaymentData._links.checkout.href,
          message: 'Complete card verification to start your free trial',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create subscription with valid mandate
    console.log('Creating subscription with mandate:', validMandate.id);

    // For trial, we create the subscription to start after trial ends
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

    const subscriptionResponse = await fetch(
      `https://api.mollie.com/v2/customers/${mollieCustomerId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mollieApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: { currency: 'EUR', value: planConfig.amount },
          interval: planConfig.interval,
          description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan - ${planDuration}`,
          startDate: trialEndDate.toISOString().split('T')[0], // Start billing after trial
          webhookUrl: webhookUrl,
          metadata: {
            user_id: userId,
            plan_type: planType,
            plan_duration: planDuration,
          },
        }),
      }
    );

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      console.error('Failed to create subscription:', subscriptionData);
      throw new Error(subscriptionData.detail || 'Failed to create subscription');
    }

    console.log('Mollie subscription created:', subscriptionData.id);

    // Calculate subscription end date based on plan duration
    const subscriptionEndDate = new Date(trialEndDate);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + planConfig.months);

    // Store subscription details
    const { data: newSub, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        mollie_subscription_id: subscriptionData.id,
        plan: planType,
        plan_duration: planDuration,
        status: 'trial',
        remaining_trial_days: TRIAL_DAYS,
        billing_amount: planConfig.amount,
        currency: 'EUR',
        subscription_start: new Date().toISOString(),
        subscription_end: subscriptionEndDate.toISOString(),
      })
      .select()
      .single();

    if (subError) {
      console.error('Failed to store subscription:', subError);
      throw new Error('Failed to store subscription');
    }

    // Create or update payment_methods for the user
    const { error: pmError } = await supabase
      .from('payment_methods')
      .upsert({
        user_id: userId,
        mollie_customer_id: mollieCustomerId,
        mollie_subscription_id: subscriptionData.id,
        plan: planType,
        subscription_status: 'active',
        is_active: true,
        trial_end_date: trialEndDate.toISOString(),
        subscription_start: new Date().toISOString(),
        subscription_end: subscriptionEndDate.toISOString(),
      }, { onConflict: 'user_id' });

    if (pmError) {
      console.error('Failed to update payment method:', pmError);
    }

    return new Response(
      JSON.stringify({
        subscriptionId: subscriptionData.id,
        status: 'trial',
        trialRemainingDays: TRIAL_DAYS,
        planType: planType,
        planDuration: planDuration,
        billingAmount: planConfig.amount,
        nextBillingDate: trialEndDate.toISOString().split('T')[0],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-mollie-subscription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
