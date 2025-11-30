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
  plan: 'basic' | 'premium';
}

const PLAN_PRICES = {
  basic: { amount: '9.99', interval: '1 month', description: 'Basic Plan - Monthly' },
  premium: { amount: '19.99', interval: '1 month', description: 'Premium Plan - Monthly' },
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
      console.error('Missing environment variables');
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, userName, userEmail, plan }: SubscriptionRequest = await req.json();

    // Validate required fields
    if (!userId || !userName || !userEmail || !plan) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, userName, userEmail, plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!PLAN_PRICES[plan]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan. Must be "basic" or "premium"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating subscription for user: ${userId}, plan: ${plan}`);

    // Check for existing active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSub?.mollie_subscription_id) {
      console.log('User already has an active subscription');
      return new Response(
        JSON.stringify({ 
          error: 'User already has an active subscription',
          existingSubscriptionId: existingSub.mollie_subscription_id 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Get or create Mollie customer
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

    // Step 2: Check for valid mandate
    const mandatesResponse = await fetch(
      `https://api.mollie.com/v2/customers/${mollieCustomerId}/mandates`,
      { headers: { 'Authorization': `Bearer ${mollieApiKey}` } }
    );

    const mandatesData = await mandatesResponse.json();
    const validMandate = mandatesData._embedded?.mandates?.find(
      (m: any) => m.status === 'valid' || m.status === 'pending'
    );

    // Step 3: If no mandate, create first payment
    if (!validMandate) {
      console.log('No valid mandate, creating first payment');
      
      const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;
      const redirectUrl = `${req.headers.get('origin') || 'https://ysqnwkysszqjwvnuqruk.lovable.app'}/subscription?setup=complete`;

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
          description: 'Card verification for subscription',
          redirectUrl: redirectUrl,
          webhookUrl: webhookUrl,
          metadata: {
            user_id: userId,
            plan: plan,
            payment_type: 'subscription_setup',
          },
        }),
      });

      const firstPaymentData = await firstPaymentResponse.json();

      if (!firstPaymentResponse.ok) {
        console.error('Failed to create first payment:', firstPaymentData);
        throw new Error(firstPaymentData.detail || 'Failed to create payment');
      }

      // Store pending subscription
      await supabase.from('subscriptions').insert({
        user_id: userId,
        mollie_subscription_id: `pending_${Date.now()}`,
        plan: plan,
        status: 'pending',
      });

      return new Response(
        JSON.stringify({
          status: 'pending_mandate',
          paymentUrl: firstPaymentData._links.checkout.href,
          message: 'Complete payment to activate subscription',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Create subscription
    console.log('Creating subscription with mandate:', validMandate.id);
    const planConfig = PLAN_PRICES[plan];
    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

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
          description: planConfig.description,
          webhookUrl: webhookUrl,
          metadata: { user_id: userId, plan: plan },
        }),
      }
    );

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      console.error('Failed to create subscription:', subscriptionData);
      throw new Error(subscriptionData.detail || 'Failed to create subscription');
    }

    console.log('Subscription created:', subscriptionData.id);

    // Step 5: Store subscription
    const startDate = new Date(subscriptionData.startDate);
    const endDate = subscriptionData.nextPaymentDate 
      ? new Date(subscriptionData.nextPaymentDate)
      : new Date(startDate.setMonth(startDate.getMonth() + 1));

    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: userId,
      mollie_subscription_id: subscriptionData.id,
      plan: plan,
      status: subscriptionData.status,
      subscription_start: subscriptionData.startDate,
      subscription_end: endDate.toISOString(),
    });

    if (subError) {
      console.error('Failed to store subscription:', subError);
      throw new Error('Failed to store subscription');
    }

    return new Response(
      JSON.stringify({
        subscriptionId: subscriptionData.id,
        status: subscriptionData.status,
        plan: plan,
        startDate: subscriptionData.startDate,
        nextPaymentDate: subscriptionData.nextPaymentDate,
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
