# ⚡ Quick Admin Setup

## Step 1: Create Admin Table

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the migration: `supabase/migrations/007_create_admin_table.sql`
3. This creates the `admin` table and inserts a default admin user

## Step 2: Login

1. Go to **http://localhost:3001/login**
2. Login with:
   - **Username**: `admin`
   - **Password**: `aa`

That's it! 🎉

## Admin Table Structure

The `admin` table has:
- `id` - UUID (primary key)
- `username` - TEXT (unique)
- `password` - TEXT
- `status` - TEXT ('active', 'inactive', 'suspended')
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Add More Admins

Run this SQL:

```sql
INSERT INTO public.admin (username, password, status)
VALUES ('newadmin', 'password123', 'active');
```

## Change Status

```sql
-- Deactivate
UPDATE public.admin SET status = 'inactive' WHERE username = 'admin';

-- Activate
UPDATE public.admin SET status = 'active' WHERE username = 'admin';
```

## Change Password

```sql
UPDATE public.admin SET password = 'newpassword' WHERE username = 'admin';
```

