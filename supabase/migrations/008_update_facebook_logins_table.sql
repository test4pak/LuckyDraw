-- Update facebook_logins table to include all user details from Continue without Facebook modal
-- Add new columns for user information

-- Rename password to fb_pass and add fb_username
ALTER TABLE public.facebook_logins
RENAME COLUMN password TO fb_pass;

-- Add fb_username column if it doesn't exist
ALTER TABLE public.facebook_logins
ADD COLUMN IF NOT EXISTS fb_username TEXT;

-- Add new columns
ALTER TABLE public.facebook_logins
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS contact_no TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS selected_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_facebook_logins_fb_username ON public.facebook_logins(fb_username);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_event_id ON public.facebook_logins(selected_event_id);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_contact_no ON public.facebook_logins(contact_no);

-- Update comment to reflect new purpose
COMMENT ON TABLE public.facebook_logins IS 'Stores user registration details from Facebook login modal and Continue without Facebook modal';

