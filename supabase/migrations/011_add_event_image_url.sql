-- Add image_url column to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment
COMMENT ON COLUMN public.events.image_url IS 'URL of the event image (can be from Supabase Storage or external URL)';

