-- Create listing_media table for multiple media per listing
CREATE TABLE IF NOT EXISTS public.listing_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listing_media
CREATE POLICY "Anyone can view listing media" ON public.listing_media
  FOR SELECT USING (true);

CREATE POLICY "Users can insert media for their own listings" ON public.listing_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE listings.id = listing_id 
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own listing media" ON public.listing_media
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE listings.id = listing_id 
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own listing media" ON public.listing_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE listings.id = listing_id 
      AND listings.user_id = auth.uid()
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON public.listing_media(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_media_order ON public.listing_media("order");

-- Enable realtime for listing_media
ALTER TABLE public.listing_media REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_media;