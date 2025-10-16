-- Add parent_id column to listing_comments for hierarchical structure
ALTER TABLE public.listing_comments
ADD COLUMN parent_id UUID REFERENCES public.listing_comments(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_listing_comments_parent_id ON public.listing_comments(parent_id);
CREATE INDEX idx_listing_comments_listing_parent ON public.listing_comments(listing_id, parent_id);