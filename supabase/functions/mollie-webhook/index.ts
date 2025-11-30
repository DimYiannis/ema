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
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!mollieApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload = await req.json();
    const paymentId = payload.id;

    if (!paymentId) {
      console.error('No payment ID in webhook payload');
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing Mollie webhook for payment:', paymentId);

    // Fetch payment details from Mollie API to verify and get latest status
    const mollieResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
      },
    });

    if (!mollieResponse.ok) {
      console.error('Failed to fetch payment from Mollie:', await mollieResponse.text());
      throw new Error('Failed to verify payment with Mollie');
    }

    const payment = await mollieResponse.json();
    console.log('Payment status:', payment.status);
    console.log('Payment metadata:', payment.metadata);

    const userId = payment.metadata?.user_id;
    const paymentType = payment.metadata?.type;

    if (!userId) {
      console.error('No user_id in payment metadata');
      return new Response(JSON.stringify({ error: 'Invalid payment metadata' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process based on payment status
    switch (payment.status) {
      case 'paid':
        console.log('Payment successful for user:', userId);
        
        // Log payment to history
        const { error: historyError } = await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            mollie_payment_id: paymentId,
            amount: payment.amount.value,
            currency: payment.amount.currency,
            status: 'paid',
            payment_type: paymentType || 'subscription',
            description: payment.description,
            paid_at: new Date().toISOString(),
          });

        if (historyError) {
          console.error('Error logging payment history:', historyError);
        }
        
        // Check if this is a card verification payment
        if (paymentType === 'card_verification') {
          console.log('Card verification completed, updating mandate info');
          
          // Get the mandate ID from the payment
          const mandateId = payment.mandateId;
          
          if (mandateId) {
            // Fetch mandate details
            const mandateResponse = await fetch(
              `https://api.mollie.com/v2/customers/${payment.customerId}/mandates/${mandateId}`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${mollieApiKey}`,
                },
              }
            );

            if (mandateResponse.ok) {
              const mandate = await mandateResponse.json();
              console.log('Mandate details:', mandate);

              // Extract card details if available
              const cardDetails = mandate.details;
              
              // Update payment method with mandate and card details
              const { error: updateError } = await supabase
                .from('payment_methods')
                .update({
                  mollie_mandate_id: mandateId,
                  payment_method_type: mandate.method || 'creditcard',
                  card_last_four: cardDetails?.cardNumber?.slice(-4) || null,
                  card_expiry: cardDetails?.cardExpiryDate || null,
                  is_active: true,
                })
                .eq('user_id', userId);

              if (updateError) {
                console.error('Error updating payment method:', updateError);
              } else {
                console.log('Payment method updated successfully with mandate');
              }
            }
          }
        } else {
          // Regular subscription payment
          console.log('Subscription payment received');
          
          // Update payment method to mark as active and extend trial/subscription
          const { error: updateError } = await supabase
            .from('payment_methods')
            .update({
              is_active: true,
              subscription_status: 'active',
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Error updating payment method:', updateError);
          }
        }
        break;

      case 'failed':
      case 'expired':
      case 'canceled':
        console.log(`Payment ${payment.status} for user:`, userId);
        
        // Log failed payment to history
        await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            mollie_payment_id: paymentId,
            amount: payment.amount.value,
            currency: payment.amount.currency,
            status: payment.status,
            payment_type: paymentType || 'subscription',
            description: payment.description,
          });
        
        // Mark payment method as inactive if payment fails
        const { error: deactivateError } = await supabase
          .from('payment_methods')
          .update({
            is_active: false,
            subscription_status: 'inactive',
          })
          .eq('user_id', userId);

        if (deactivateError) {
          console.error('Error deactivating payment method:', deactivateError);
        }
        break;

      case 'pending':
      case 'open':
        console.log('Payment pending/open, no action needed');
        break;

      default:
        console.log('Unhandled payment status:', payment.status);
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, status: payment.status }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in mollie-webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});