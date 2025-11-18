# 🚀 Quick Guide: How to Access Admin Panel

## Direct Access URL
```
http://localhost:3000/admin
```
*(Replace with your production URL if deployed)*

---

## ⚡ Quick Setup (3 Steps)

### 1️⃣ Run Migration
- Go to **Supabase Dashboard** → **SQL Editor**
- Copy/paste contents of `supabase/migrations/005_add_admin_role.sql`
- Click **Run**

### 2️⃣ Make Yourself Admin
In Supabase **Table Editor** → `users` table:
- Find your user
- Set `is_admin` = `true`
- Save

**OR** use SQL:
```sql
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

### 3️⃣ Access Admin Panel
- **Log out** and **log back in**
- Click your profile avatar → **"Admin Panel"**
- OR go directly to: `/admin`

---

## ✅ What You'll See

Once you have admin access:
- **Dark-themed admin interface** (separate from main site)
- **Stats dashboard** (Total Events, Running, Upcoming, Participants)
- **Event management** (Create, Edit, Delete events)
- **Prize management** (Add, Edit, Delete prizes for each event)
- **Admin header** with logout and "View Site" button

---

## 🔒 Security

- ✅ Only users with `is_admin = TRUE` can access `/admin`
- ✅ Non-admin users are automatically redirected
- ✅ Admin panel link only shows for admins
- ✅ Database-level security via RLS policies

---

## 📝 Need Help?

See `HOW_TO_SETUP_ADMIN.md` for detailed instructions.

