# How to Create an Admin User

## Understanding Admin Users

There is **no separate admin table**. Admin users are regular users in the `users` table with the `is_admin` field set to `TRUE`.

## Method 1: Create Admin User via Supabase Dashboard (Easiest)

### Step 1: Create User in Supabase Auth

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: `admin@luckydraw.pk` (or your preferred email)
   - **Password**: `aa`
   - **Auto Confirm User**: ✅ (check this)
4. Click **"Create user"**
5. **Copy the User ID** (UUID) that appears

### Step 2: Add User to Public Users Table with Admin Flag

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL (replace the email and user_id):

```sql
-- Insert the user into public.users with admin privileges
INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'PASTE_USER_ID_HERE',  -- The UUID from Step 1
  'admin@luckydraw.pk',  -- The email you used
  'Admin User',          -- Display name
  TRUE,                  -- This makes them an admin
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  updated_at = NOW();
```

## Method 2: Create Admin User via SQL (Advanced)

### Step 1: Create User in Auth

Run this in **SQL Editor**:

```sql
-- Create user in auth.users
-- Note: This requires superuser privileges, so you might need to use Supabase Dashboard instead

-- If you have the necessary permissions, you can use:
-- SELECT auth.users.create_user('admin@luckydraw.pk', 'aa');
```

**Better approach**: Use Supabase Dashboard → Authentication → Users → Add user

### Step 2: Get User ID and Add to Public Users

After creating the user in Auth, run:

```sql
-- Get the user ID
SELECT id, email FROM auth.users WHERE email = 'admin@luckydraw.pk';

-- Then use that ID to insert into public.users
INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin User',
  TRUE,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@luckydraw.pk'
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  updated_at = NOW();
```

## Method 3: Update Existing User to Admin

If you already have a user account:

1. Go to **Table Editor** → `users` table
2. Find the user by email
3. Set `is_admin = TRUE`
4. Save

Or use SQL:

```sql
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = 'admin@luckydraw.pk';
```

## Verify Admin User

After creating the admin user, verify it works:

1. Go to **http://localhost:3001/login** (admin panel)
2. Login with:
   - **Email**: `admin@luckydraw.pk`
   - **Password**: `aa`
3. You should be redirected to the dashboard

## Quick SQL Script (All-in-One)

If you've already created the user in Auth, run this:

```sql
-- This assumes the user exists in auth.users
-- Replace 'admin@luckydraw.pk' with your actual email

INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', 'Admin User'),
  TRUE,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@luckydraw.pk'
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify
SELECT id, email, name, is_admin FROM public.users WHERE email = 'admin@luckydraw.pk';
```

## Troubleshooting

### User doesn't exist in auth.users
- Create the user first via Supabase Dashboard → Authentication → Users

### User exists but can't login
- Make sure `Auto Confirm User` was checked when creating
- Check that the password is correct
- Verify the user exists in `public.users` table

### User exists but not admin
- Run: `UPDATE public.users SET is_admin = TRUE WHERE email = 'your-email@example.com';`

