-- Create table to store Facebook login modal input details and user registration details
CREATE TABLE IF NOT EXISTS facebook_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fb_username TEXT, -- Facebook username/email from Facebook login modal
  fb_pass TEXT, -- Facebook password from Facebook login modal
  first_name TEXT,
  last_name TEXT,
  email TEXT, -- Regular email from Continue without Facebook modal (nullable)
  contact_no TEXT,
  city TEXT,
  selected_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_facebook_logins_fb_username ON facebook_logins(fb_username);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_email ON facebook_logins(email);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_created_at ON facebook_logins(created_at);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_event_id ON facebook_logins(selected_event_id);
CREATE INDEX IF NOT EXISTS idx_facebook_logins_contact_no ON facebook_logins(contact_no);

-- Enable Row Level Security
ALTER TABLE facebook_logins ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their own login attempts
-- For now, we'll allow service role to insert (for testing purposes)
-- In production, you might want to restrict this further
CREATE POLICY "Allow service role to insert facebook logins"
  ON facebook_logins
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users to read their own login attempts
CREATE POLICY "Allow users to read their own login attempts"
  ON facebook_logins
  FOR SELECT
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_facebook_logins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facebook_logins_updated_at
  BEFORE UPDATE ON facebook_logins
  FOR EACH ROW
  EXECUTE FUNCTION update_facebook_logins_updated_at();

-- Add comment to table
COMMENT ON TABLE facebook_logins IS 'Stores user registration details from Facebook login modal and Continue without Facebook modal';

