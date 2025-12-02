-- Portfolio Showcase Migration for OpenPools DNA
-- Run this in your Supabase SQL Editor

-- Showcase items table (simplified schema)
CREATE TABLE IF NOT EXISTS public.showcase_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Core fields
  type TEXT NOT NULL CHECK (type IN ('project', 'certification', 'research', 'publication', 'talk', 'course', 'award', 'patent')),
  title TEXT NOT NULL,
  description TEXT, -- Max 500 chars (enforced in app)
  links JSONB DEFAULT '[]'::jsonb, -- Array of links: [{ label: "GitHub", url: "..." }, ...]
  image_url TEXT, -- Cover image
  start_date DATE, -- Start date
  end_date DATE, -- End date (nullable)
  is_present BOOLEAN DEFAULT FALSE, -- Currently ongoing
  tags TEXT[], -- Skills array

  -- Display settings
  visible BOOLEAN DEFAULT TRUE, -- Simple on/off
  pinned BOOLEAN DEFAULT FALSE, -- Show on certificate
  position INTEGER DEFAULT 0, -- For ordering

  -- Flexible metadata for everything else
  metadata JSONB DEFAULT '{}'::jsonb, -- { collaborators: [], institution: '', etc. }

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_showcase_items_user_id ON public.showcase_items(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_items_type ON public.showcase_items(type);
CREATE INDEX IF NOT EXISTS idx_showcase_items_visible ON public.showcase_items(visible);
CREATE INDEX IF NOT EXISTS idx_showcase_items_pinned ON public.showcase_items(pinned);
CREATE INDEX IF NOT EXISTS idx_showcase_items_position ON public.showcase_items(position);
CREATE INDEX IF NOT EXISTS idx_showcase_items_created_at ON public.showcase_items(created_at DESC);

-- Enable RLS
ALTER TABLE public.showcase_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for showcase_items
-- Anyone can view visible items
CREATE POLICY "Anyone can view visible showcase items" ON public.showcase_items
  FOR SELECT USING (visible = true);

-- Users can view all their own items
CREATE POLICY "Users can view own showcase items" ON public.showcase_items
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own items
CREATE POLICY "Users can create own showcase items" ON public.showcase_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update own showcase items" ON public.showcase_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "Users can delete own showcase items" ON public.showcase_items
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_showcase_updated_at ON public.showcase_items;
CREATE TRIGGER set_showcase_updated_at
  BEFORE UPDATE ON public.showcase_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to limit pinned items to 3 per user
CREATE OR REPLACE FUNCTION public.validate_pinned_showcase_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to pin an item
  IF NEW.pinned = true THEN
    -- Count existing pinned items for this user (excluding current item if updating)
    IF (
      SELECT COUNT(*)
      FROM public.showcase_items
      WHERE user_id = NEW.user_id
        AND pinned = true
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) >= 3 THEN
      RAISE EXCEPTION 'You can only pin up to 3 showcase items for your certificate';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce pinned limit
DROP TRIGGER IF EXISTS enforce_pinned_limit ON public.showcase_items;
CREATE TRIGGER enforce_pinned_limit
  BEFORE INSERT OR UPDATE ON public.showcase_items
  FOR EACH ROW
  WHEN (NEW.pinned = true)
  EXECUTE FUNCTION public.validate_pinned_showcase_limit();

COMMENT ON TABLE public.showcase_items IS 'Portfolio showcase items for DNA profiles - simplified magical version';
COMMENT ON COLUMN public.showcase_items.metadata IS 'Flexible JSONB field for collaborators, institution, etc.';
COMMENT ON COLUMN public.showcase_items.links IS 'Array of link objects with label and url';
COMMENT ON FUNCTION public.validate_pinned_showcase_limit IS 'Ensures users can only pin max 3 items for certificates';
