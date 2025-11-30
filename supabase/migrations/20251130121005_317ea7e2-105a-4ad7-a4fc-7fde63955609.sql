-- Add new columns to subscriptions table for plan duration and trial tracking
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS plan_duration text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS remaining_trial_days integer DEFAULT 14,
ADD COLUMN IF NOT EXISTS billing_amount text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';

-- Update status to allow 'trial' value
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- Create index for efficient trial day updates
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_active 
ON public.subscriptions (status, remaining_trial_days) 
WHERE status = 'trial' AND remaining_trial_days > 0;

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;