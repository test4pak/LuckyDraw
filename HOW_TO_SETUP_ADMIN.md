# How to Access the Admin Panel

The admin panel is a completely separate interface for managing events and prizes. It's restricted to users with admin privileges only.

## Quick Access Guide

### Option 1: Direct URL (After Setup)
Once you're set up as an admin, simply go to:
```
http://localhost:3000/admin
```
or on your production site:
```
https://yourdomain.com/admin
```

### Option 2: Via Navbar (After Setup)
1. **Log in** to your account (must be an admin)
2. Click on your **profile avatar** in the top-right corner of the navbar
3. Click **"Admin Panel"** from the dropdown menu

---

## First-Time Setup (Required)

Before you can access the admin panel, you need to set up admin access:

### Step 1: Run the Admin Migration

1. Go to your **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy and paste the contents of `supabase/migrations/005_add_admin_role.sql`
6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

This migration:
- ✅ Adds an `is_admin` column to the users table
- ✅ Creates admin-only RLS policies
- ✅ Sets up proper security

### Step 2: Make Yourself an Admin

After running the migration, mark your user as admin:

#### Method 1: Using Supabase Dashboard (Easiest)

1. In Supabase Dashboard, go to **Table Editor** (left sidebar)
2. Click on the **`users`** table
3. Find your user account (by email or name)
4. Click on the row to edit it
5. Find the **`is_admin`** column
6. Change it from `false` to `true`
7. Click **"Save"** or press `Enter`

#### Method 2: Using SQL Editor

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL query (replace `YOUR_EMAIL@example.com` with your actual email):

```sql
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = 'YOUR_EMAIL@example.com';
```

Or if you know your user ID:

```sql
UPDATE public.users 
SET is_admin = TRUE 
WHERE id = 'YOUR_USER_ID_HERE';
```

### Step 3: Access the Admin Panel

1. **Log out** and **log back in** (to refresh your session)
2. You should now see **"Admin Panel"** in your profile dropdown
3. Click it, or go directly to `/admin`

---

## Troubleshooting

### ❌ "Access Denied" or Redirected to Homepage

**Problem:** You're not set as an admin yet.

**Solution:**
1. Make sure you ran the migration (Step 1)
2. Make sure your user has `is_admin = TRUE` in the database
3. Log out and log back in to refresh your session

### ❌ "Admin Panel" Link Not Showing in Navbar

**Problem:** Your session hasn't refreshed or you're not an admin.

**Solution:**
1. Check in Supabase that `is_admin = TRUE` for your user
2. Log out completely
3. Log back in
4. The link should appear

### ❌ Can't Find My User in the Database

**Problem:** You haven't created a user account yet.

**Solution:**
1. First, register/login through the website (using Facebook login or "Continue without Facebook")
2. This will create a user record in the `users` table
3. Then follow Step 2 to make yourself an admin

## Security Features

- ✅ Only users with `is_admin = TRUE` can access `/admin`
- ✅ Only admins can create, edit, or delete events
- ✅ Only admins can manage prizes
- ✅ Non-admin users will be redirected if they try to access `/admin`
- ✅ Admin panel link only shows in navbar for admin users

## Making Multiple Admins

To make multiple users admins, simply update their `is_admin` field to `true`:

```sql
-- Make multiple users admins by email
UPDATE public.users 
SET is_admin = TRUE 
WHERE email IN ('admin1@example.com', 'admin2@example.com');

-- Or make all users with a specific domain admins (use with caution)
UPDATE public.users 
SET is_admin = TRUE 
WHERE email LIKE '%@yourdomain.com';
```

## Removing Admin Access

To remove admin access from a user:

```sql
UPDATE public.users 
SET is_admin = FALSE 
WHERE email = 'USER_EMAIL';
```

## Important Notes

- ⚠️ **Never** set `is_admin = TRUE` for all users in production
- ⚠️ Only trusted users should have admin access
- ⚠️ Admin users have full control over events and prizes
- ✅ The admin panel is completely hidden from non-admin users
- ✅ Non-admin users cannot access `/admin` even if they know the URL

