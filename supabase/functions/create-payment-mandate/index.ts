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
    const { customerId, redirectUrl } = await req.json();
    
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!mollieApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Creating payment mandate for customer:', customerId);

    // Create a first payment to set up the mandate (€0.01 for card verification)
    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: '0.01', // Minimal amount for card verification
        },
        customerId: customerId,
        sequenceType: 'first',
        description: 'Card verification for subscription',
        redirectUrl: redirectUrl || `${req.headers.get('origin')}/dashboard`,
        webhookUrl: `${supabaseUrl}/functions/v1/mollie-webhook`,
        metadata: {
          user_id: user.id,
          type: 'card_verification',
        },
      }),
    });

    const paymentData = await response.json();

    if (!response.ok) {
      console.error('Mollie API error:', paymentData);
      throw new Error(paymentData.detail || 'Failed to create payment mandate');
    }

    console.log('Payment mandate created:', paymentData.id);

    return new Response(
      JSON.stringify({
        checkoutUrl: paymentData._links.checkout.href,
        paymentId: paymentData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-payment-mandate:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});