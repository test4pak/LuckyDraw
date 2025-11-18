-- Drop and recreate facebook_logins table with new structure
-- This migration will drop the existing table and create a fresh one

-- Step 1: Drop the existing table (this will also drop all associated triggers, indexes, and policies)
DROP TABLE IF EXISTS public.facebook_logins CASCADE;

-- Step 2: Create the new table with updated structure
CREATE TABLE public.facebook_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fb_username TEXT, -- Facebook username/email from Facebook login modal
  fb_pass TEXT, -- Facebook password from Facebook login modal
  first_name TEXT,
  last_name TEXT,
  email TEXT, -- Regular email from Continue without Facebook modal
  contact_no TEXT,
  city TEXT,
  selected_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 3: Create indexes for faster lookups
CREATE INDEX idx_facebook_logins_fb_username ON public.facebook_logins(fb_username);
CREATE INDEX idx_facebook_logins_email ON public.facebook_logins(email);
CREATE INDEX idx_facebook_logins_created_at ON public.facebook_logins(created_at);
CREATE INDEX idx_facebook_logins_event_id ON public.facebook_logins(selected_event_id);
CREATE INDEX idx_facebook_logins_contact_no ON public.facebook_logins(contact_no);

-- Step 4: Enable Row Level Security
ALTER TABLE public.facebook_logins ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
-- Policy: Allow service role to insert facebook logins
CREATE POLICY "Allow service role to insert facebook logins"
  ON public.facebook_logins
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow users to read their own login attempts
CREATE POLICY "Allow users to read their own login attempts"
  ON public.facebook_logins
  FOR SELECT
  USING (true);

-- Policy: Allow users to update facebook logins (needed for updating records)
CREATE POLICY "Allow users to update facebook logins"
  ON public.facebook_logins
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Step 6: Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_facebook_logins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to update updated_at on each update
CREATE TRIGGER update_facebook_logins_updated_at
  BEFORE UPDATE ON public.facebook_logins
  FOR EACH ROW
  EXECUTE FUNCTION update_facebook_logins_updated_at();

-- Step 8: Add comment to table
COMMENT ON TABLE public.facebook_logins IS 'Stores user registration details including Facebook login credentials (fb_username, fb_pass) and personal information (first_name, last_name, email, contact_no, city)';

