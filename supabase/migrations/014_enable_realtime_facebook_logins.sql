-- Enable Realtime for facebook_logins table
-- This allows the admin panel to receive real-time updates when new entries are added

-- Enable Realtime publication for facebook_logins table
ALTER PUBLICATION supabase_realtime ADD TABLE public.facebook_logins;

-- Note: If the above doesn't work, you may need to enable it manually in Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Find the 'facebook_logins' table
-- 3. Toggle the switch to enable replication

