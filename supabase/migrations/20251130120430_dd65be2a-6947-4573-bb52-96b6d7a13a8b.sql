-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view profile by phone" ON public.profiles;

-- Create a security definer function to safely check phone access
CREATE OR REPLACE FUNCTION public.get_user_phone(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone FROM public.profiles WHERE id = _user_id
$$;

-- Recreate a safe policy using the function
CREATE POLICY "Users can view profile by phone" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR phone = public.get_user_phone(auth.uid())
);