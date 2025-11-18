-- Create Admin User with Username and Password
-- Note: Supabase Auth requires an email, so we use format: username@admin.local
-- Example: username "admin" becomes email "admin@admin.local"

-- Step 1: Create user in Supabase Dashboard:
--   1. Go to Authentication → Users → Add user
--   2. Email: admin@admin.local
--   3. Password: aa
--   4. ✅ Check "Auto Confirm User"
--   5. Click "Create user"
--   6. Copy the User ID (UUID)

-- Step 2: Run the INSERT statement below (replace USER_ID_HERE with the UUID from Step 1)

-- Option 1: Create new admin user (run after creating in Auth)
-- Insert admin user into public.users (replace USER_ID_HERE with actual UUID)
INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Replace with UUID from auth.users
  'admin@admin.local',
  'Admin',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  email = 'admin@admin.local',
  name = 'Admin',
  updated_at = NOW();

-- Option 2: Update existing user to admin
-- UPDATE public.users SET is_admin = TRUE WHERE email = 'admin@admin.local';

-- Verify admin user
-- SELECT id, email, name, is_admin FROM public.users WHERE email = 'admin@admin.local';

