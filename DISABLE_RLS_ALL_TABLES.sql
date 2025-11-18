-- Disable Row Level Security (RLS) for all tables
-- Run this in Supabase SQL Editor to disable RLS on all tables

-- Disable RLS on users table
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on events table
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;

-- Disable RLS on prizes table
ALTER TABLE IF EXISTS public.prizes DISABLE ROW LEVEL SECURITY;

-- Disable RLS on participants table
ALTER TABLE IF EXISTS public.participants DISABLE ROW LEVEL SECURITY;

-- Disable RLS on facebook_logins table
ALTER TABLE IF EXISTS public.facebook_logins DISABLE ROW LEVEL SECURITY;

-- Disable RLS on admin table
ALTER TABLE IF EXISTS public.admin DISABLE ROW LEVEL SECURITY;

-- Verify RLS status (should show rowsecurity = false for all tables)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

