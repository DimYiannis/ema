import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, phone, email, temporaryPassword, subscriptionData } = await req.json();

    console.log('Starting user migration for:', { firstName, lastName, phone, email });

    if (!firstName || !lastName || !phone || !email || !temporaryPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: firstName, lastName, phone, email, temporaryPassword' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase service role client (admin access)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create new auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created auth user:', authData.user.id);

    // Update profile with phone number (trigger should have created profile)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ phone: phone })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Continue anyway, phone is in user metadata
    }

    // If subscription data provided, create payment_methods record
    if (subscriptionData) {
      const { error: paymentError } = await supabaseAdmin
        .from('payment_methods')
        .insert({
          user_id: authData.user.id,
          mollie_customer_id: subscriptionData.mollieCustomerId || null,
          mollie_subscription_id: subscriptionData.mollieSubscriptionId || null,
          plan: subscriptionData.plan || null,
          subscription_start: subscriptionData.subscriptionStart || null,
          subscription_end: subscriptionData.subscriptionEnd || null,
          subscription_status: subscriptionData.status || 'inactive',
          is_active: subscriptionData.status === 'active',
        });

      if (paymentError) {
        console.error('Error creating payment method:', paymentError);
        return new Response(
          JSON.stringify({ 
            warning: 'User created but failed to migrate subscription data',
            userId: authData.user.id,
            error: paymentError.message
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('User migration completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User migrated successfully',
        userId: authData.user.id,
        email: email,
        phone: phone
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Migration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});