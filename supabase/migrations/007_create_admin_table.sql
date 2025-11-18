-- Create separate admin table for admin panel authentication
CREATE TABLE IF NOT EXISTS public.admin (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- In production, this should be hashed (bcrypt)
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_username ON public.admin(username);
CREATE INDEX IF NOT EXISTS idx_admin_status ON public.admin(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access for admin authentication" ON public.admin;

-- Policies for RLS
-- Allow public read access for authentication (password is still protected by application logic)
-- In production, you might want to restrict this further or use a service role
CREATE POLICY "Allow public read access for admin authentication"
ON public.admin FOR SELECT
TO anon, authenticated
USING (true);

-- Only service role can insert/update/delete (via Supabase Dashboard or API)
-- Regular users cannot modify admin table

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_admin_updated_at ON public.admin;

-- Trigger to update updated_at on each update
CREATE TRIGGER update_admin_updated_at
BEFORE UPDATE ON public.admin
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_updated_at();

-- Insert default admin user (username: admin, password: aa)
-- Note: In production, hash the password with bcrypt
INSERT INTO public.admin (username, password, status)
VALUES ('admin', 'aa', 'active')
ON CONFLICT (username) DO NOTHING;

