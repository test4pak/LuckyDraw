-- Complete migration to update facebook_logins table structure
-- Run this if you have an existing table that needs to be updated

-- Step 1: Add fb_username column if it doesn't exist
ALTER TABLE public.facebook_logins
ADD COLUMN IF NOT EXISTS fb_username TEXT;

-- Step 2: Rename password to fb_pass (if password column exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'facebook_logins' 
        AND column_name = 'password'
    ) THEN
        ALTER TABLE public.facebook_logins RENAME COLUMN password TO fb_pass;
    END IF;
END $$;

-- Step 3: Add fb_pass column if it doesn't exist (in case password was already renamed)
ALTER TABLE public.facebook_logins
ADD COLUMN IF NOT EXISTS fb_pass TEXT;

-- Step 4: Ensure email column exists and is nullable (it should already exist)
ALTER TABLE public.facebook_logins
ADD COLUMN IF NOT EXISTS email TEXT;

-- Remove NOT NULL constraint from email if it exists
ALTER TABLE public.facebook_logins
ALTER COLUMN email DROP NOT NULL;

-- Step 5: Add other columns if they don't exist
ALTER TABLE public.facebook_logins
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS contact_no TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS selected_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_facebook_logins_fb_username ON public.facebook_logins(fb_username);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_email ON public.facebook_logins(email);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_event_id ON public.facebook_logins(selected_event_id);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_contact_no ON public.facebook_logins(contact_no);

-- Step 7: Update comment
COMMENT ON TABLE public.facebook_logins IS 'Stores user registration details including Facebook login credentials (fb_username, fb_pass) and personal information (first_name, last_name, email, contact_no, city)';

