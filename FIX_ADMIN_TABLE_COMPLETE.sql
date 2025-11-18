-- Complete fix for admin table - Safe to run multiple times
-- This will fix RLS policies and ensure everything is set up correctly

-- 1. Ensure the admin table exists (won't recreate if it exists)
CREATE TABLE IF NOT EXISTS public.admin (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_admin_username ON public.admin(username);
CREATE INDEX IF NOT EXISTS idx_admin_status ON public.admin(status);

-- 3. Enable RLS
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;

-- 4. Drop and recreate the RLS policy
DROP POLICY IF EXISTS "Allow public read access for admin authentication" ON public.admin;

CREATE POLICY "Allow public read access for admin authentication"
ON public.admin FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Create or replace the function
CREATE OR REPLACE FUNCTION public.update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_admin_updated_at ON public.admin;

CREATE TRIGGER update_admin_updated_at
BEFORE UPDATE ON public.admin
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_updated_at();

-- 7. Insert admin user if it doesn't exist
INSERT INTO public.admin (username, password, status)
VALUES ('admin', 'aa', 'active')
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    status = EXCLUDED.status;

-- 8. Verify everything is set up
SELECT 
    'Table exists' AS check_item,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin'
    ) AS result
UNION ALL
SELECT 
    'RLS enabled',
    rowsecurity::text
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'admin'
UNION ALL
SELECT 
    'Policy exists',
    EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin'
    )::text
UNION ALL
SELECT 
    'Admin user exists',
    EXISTS (
        SELECT 1 FROM public.admin WHERE username = 'admin'
    )::text;

-- 9. Show the admin user
SELECT id, username, status, created_at
FROM public.admin
WHERE username = 'admin';

