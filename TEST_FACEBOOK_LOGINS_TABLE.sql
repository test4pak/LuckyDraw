-- Test script to verify facebook_logins table structure and RLS policies
-- Run this in Supabase SQL Editor

-- 1. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'facebook_logins'
ORDER BY ordinal_position;

-- 2. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'facebook_logins';

-- 3. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'facebook_logins';

-- 4. Test insert (should work with anon role)
-- This will help identify if RLS is blocking inserts
INSERT INTO public.facebook_logins (fb_username, fb_pass, first_name, last_name, email, contact_no, city)
VALUES ('test@example.com', 'testpass', 'Test', 'User', 'test@example.com', '1234567890', 'Test City')
RETURNING id, fb_username, fb_pass, first_name, last_name, email, contact_no, city;

-- 5. Test update (should work with anon role)
-- Update the test record
UPDATE public.facebook_logins
SET first_name = 'Updated', last_name = 'Name'
WHERE fb_username = 'test@example.com'
RETURNING id, fb_username, first_name, last_name;

-- 6. Clean up test data
DELETE FROM public.facebook_logins WHERE fb_username = 'test@example.com';

