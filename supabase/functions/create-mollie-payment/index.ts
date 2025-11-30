import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, description, redirectUrl, userInfo } = await req.json();
    
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    
    if (!mollieApiKey) {
      throw new Error('Mollie API key not configured');
    }

    console.log('Creating Mollie payment:', { amount, description });

    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: amount,
        },
        description: description || 'Registration Payment',
        redirectUrl: redirectUrl || `${req.headers.get('origin')}/payment-success`,
        webhookUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mollie-webhook`,
        metadata: {
          userInfo: JSON.stringify(userInfo),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mollie API error:', data);
      throw new Error(data.detail || 'Failed to create payment');
    }

    console.log('Payment created successfully:', data.id);

    return new Response(
      JSON.stringify({
        checkoutUrl: data._links.checkout.href,
        paymentId: data.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-mollie-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
