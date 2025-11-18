-- Fix RLS Policy for Admin Table
-- Run this in Supabase SQL Editor if login is not working
-- This script is safe to run multiple times

-- First, check if the policy exists
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'admin';

-- Drop existing policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Allow public read access for admin authentication" ON public.admin;

-- Create the policy with explicit permissions
CREATE POLICY "Allow public read access for admin authentication"
ON public.admin FOR SELECT
TO anon, authenticated
USING (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'admin';

-- Test query (should return the admin user)
SELECT id, username, password, status
FROM public.admin
WHERE username = 'admin';
