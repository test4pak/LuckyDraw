-- Fix RLS policy to allow updates on facebook_logins table
-- Run this in Supabase SQL Editor if updates are not working

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Allow users to update facebook logins" ON public.facebook_logins;

-- Create update policy
CREATE POLICY "Allow users to update facebook logins"
  ON public.facebook_logins
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'facebook_logins';

