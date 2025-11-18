-- Migration: Remove users table and update participants to use facebook_logins
-- This migration removes the public.users table and updates all references

-- Step 1: Drop RLS policies that reference user_id FIRST (before dropping the column)
DROP POLICY IF EXISTS "Users can join events" ON public.participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON public.participants;
DROP POLICY IF EXISTS "Users can view all participants" ON public.participants;

-- Step 2: Drop the foreign key constraint from participants table
ALTER TABLE IF EXISTS public.participants 
DROP CONSTRAINT IF EXISTS participants_user_id_fkey;

-- Step 3: Update participants table to reference facebook_logins instead
-- First, add a new column for facebook_login_id
ALTER TABLE IF EXISTS public.participants 
ADD COLUMN IF NOT EXISTS facebook_login_id UUID REFERENCES public.facebook_logins(id) ON DELETE CASCADE;

-- Step 4: Migrate existing data (if any) - link participants to facebook_logins by email
-- This assumes you have matching emails in facebook_logins
UPDATE public.participants p
SET facebook_login_id = (
    SELECT fl.id 
    FROM public.facebook_logins fl 
    WHERE fl.email = (
        SELECT u.email 
        FROM public.users u 
        WHERE u.id = p.user_id
    )
    OR fl.fb_username = (
        SELECT u.email 
        FROM public.users u 
        WHERE u.id = p.user_id
    )
    LIMIT 1
)
WHERE p.facebook_login_id IS NULL AND EXISTS (SELECT 1 FROM public.users WHERE id = p.user_id);

-- Step 5: Make facebook_login_id NOT NULL (after migration)
-- First, delete any participants that don't have a matching facebook_login
DELETE FROM public.participants 
WHERE facebook_login_id IS NULL;

-- Now make it NOT NULL
ALTER TABLE IF EXISTS public.participants 
ALTER COLUMN facebook_login_id SET NOT NULL;

-- Step 6: Drop the old user_id column (policies are already dropped)
ALTER TABLE IF EXISTS public.participants 
DROP COLUMN IF EXISTS user_id;

-- Step 7: Update the unique constraint to use facebook_login_id
ALTER TABLE IF EXISTS public.participants 
DROP CONSTRAINT IF EXISTS participants_event_id_user_id_key;

ALTER TABLE IF EXISTS public.participants 
ADD CONSTRAINT participants_event_id_facebook_login_id_key 
UNIQUE (event_id, facebook_login_id);

-- Step 8: Update indexes
DROP INDEX IF EXISTS idx_participants_user_id;
CREATE INDEX IF NOT EXISTS idx_participants_facebook_login_id 
ON public.participants(facebook_login_id);

-- Step 9: Drop the trigger that creates users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 10: Drop RLS policies on users table (before dropping the table)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Step 11: Drop the users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 12: Create new participants policies
-- Drop existing policies first if they exist
DROP POLICY IF EXISTS "Anyone can view participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can insert participants" ON public.participants;

-- Create new policies (if RLS is enabled)
-- Note: These policies might need adjustment based on your auth setup
CREATE POLICY "Anyone can view participants"
    ON public.participants FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert participants"
    ON public.participants FOR INSERT
    WITH CHECK (true);

-- Step 13: Update participants table comment
COMMENT ON TABLE public.participants IS 'Stores event participants linked to facebook_logins instead of users table';

-- Verification query
SELECT 
    'Migration completed' as status,
    (SELECT COUNT(*) FROM public.participants) as total_participants,
    (SELECT COUNT(*) FROM public.facebook_logins) as total_facebook_logins;

