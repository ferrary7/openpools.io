-- Add phone visibility toggle to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS show_phone_to_collaborators BOOLEAN DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.show_phone_to_collaborators IS 'Controls whether phone number is fully visible to collaborators (true) or partially hidden showing only first 3 digits (false)';
