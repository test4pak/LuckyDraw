-- Update facebook_logins table structure
-- Add fb_username column and rename email to be separate from Facebook username

-- Add fb_username column
ALTER TABLE public.facebook_logins
ADD COLUMN IF NOT EXISTS fb_username TEXT;

-- Rename existing email column to email (keep it as is, but it will be separate from fb_username)
-- The email column already exists, so we just need to ensure fb_username is added

-- Create index on fb_username for faster lookups
CREATE INDEX IF NOT EXISTS idx_facebook_logins_fb_username ON public.facebook_logins(fb_username);

-- Update comment to reflect new structure
COMMENT ON TABLE public.facebook_logins IS 'Stores user registration details including Facebook login credentials and personal information';

