-- Add property details columns to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS living_rooms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS kitchens INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.listings.bedrooms IS 'Nombre de chambres';
COMMENT ON COLUMN public.listings.living_rooms IS 'Nombre de salons';
COMMENT ON COLUMN public.listings.bathrooms IS 'Nombre de toilettes/salles de bain';
COMMENT ON COLUMN public.listings.kitchens IS 'Nombre de cuisines';