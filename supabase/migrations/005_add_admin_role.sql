-- Add admin role to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);

-- Update existing policies to be more restrictive
-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to insert prizes" ON public.prizes;
DROP POLICY IF EXISTS "Allow authenticated users to update prizes" ON public.prizes;
DROP POLICY IF EXISTS "Allow authenticated users to delete prizes" ON public.prizes;

-- Create admin-only policies for events
CREATE POLICY "Only admins can insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Only admins can update events"
ON public.events FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Only admins can delete events"
ON public.events FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Create admin-only policies for prizes
CREATE POLICY "Only admins can insert prizes"
ON public.prizes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Only admins can update prizes"
ON public.prizes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Only admins can delete prizes"
ON public.prizes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Function to check if user is admin (helper function)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To make a user an admin, run this SQL (replace USER_EMAIL with the admin's email):
-- UPDATE public.users SET is_admin = TRUE WHERE email = 'USER_EMAIL';

