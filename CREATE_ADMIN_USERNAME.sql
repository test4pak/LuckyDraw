-- Create Admin User with Username and Password
-- This script creates an admin user using username as email

-- IMPORTANT: Supabase Auth requires an email, so we'll use: username@admin.local
-- Example: If username is "admin", email will be "admin@admin.local"

-- Step 1: Create user in Supabase Dashboard:
--   1. Go to Authentication → Users → Add user
--   2. Email: admin@admin.local (or your-username@admin.local)
--   3. Password: aa
--   4. ✅ Check "Auto Confirm User"
--   5. Click "Create user"
--   6. Copy the User ID (UUID)

-- Step 2: Run this SQL (replace USER_ID_HERE with the UUID from Step 1):

INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Replace with actual UUID from auth.users
  'admin@admin.local',  -- Email format: username@admin.local
  'Admin',              -- Display name (username)
  TRUE,                 -- Admin flag
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  email = 'admin@admin.local',
  name = 'Admin',
  updated_at = NOW();

-- Step 3: Verify
SELECT id, email, name, is_admin 
FROM public.users 
WHERE email = 'admin@admin.local';

-- Login credentials:
-- Email: admin@admin.local
-- Password: aa

