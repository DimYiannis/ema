-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Create mollie_customers table
CREATE TABLE public.mollie_customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mollie_customer_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(mollie_customer_id)
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mollie_subscription_id text NOT NULL,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  subscription_start timestamp with time zone DEFAULT now(),
  subscription_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(mollie_subscription_id)
);

-- Enable RLS on new tables
ALTER TABLE public.mollie_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for mollie_customers
CREATE POLICY "Users can view own mollie customer" 
ON public.mollie_customers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mollie customer" 
ON public.mollie_customers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
begin
  insert into public.profiles (id, first_name, last_name, phone, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.email
  );
  return new;
end;
$$;