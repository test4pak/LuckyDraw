-- QUICK SCRIPT: Create Admin User
-- Run this AFTER creating the user in Supabase Dashboard → Authentication → Users

-- Step 1: Create user in Supabase Dashboard first:
--   1. Go to Authentication → Users → Add user
--   2. Email: admin@luckydraw.pk
--   3. Password: aa
--   4. Check "Auto Confirm User"
--   5. Click "Create user"
--   6. Copy the User ID (UUID)

-- Step 2: Run this SQL (replace USER_ID_HERE with the UUID from Step 1):

INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Replace with actual UUID from auth.users
  'admin@luckydraw.pk',
  'Admin User',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  email = 'admin@luckydraw.pk',
  name = 'Admin User',
  updated_at = NOW();

-- Step 3: Verify
SELECT id, email, name, is_admin 
FROM public.users 
WHERE email = 'admin@luckydraw.pk';

-- Expected result: is_admin should be TRUE

