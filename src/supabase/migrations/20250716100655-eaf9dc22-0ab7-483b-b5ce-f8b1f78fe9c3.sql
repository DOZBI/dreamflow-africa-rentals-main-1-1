-- Fix the listings table to properly reference profiles instead of auth.users
-- First, we need to update the foreign key relationship

-- Add foreign key constraint between listings.user_id and profiles.id
ALTER TABLE public.listings 
DROP CONSTRAINT IF EXISTS listings_user_id_fkey;

ALTER TABLE public.listings 
ADD CONSTRAINT listings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also fix other tables to reference profiles instead of auth.users for consistency
ALTER TABLE public.favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.listing_comments 
DROP CONSTRAINT IF EXISTS listing_comments_user_id_fkey;

ALTER TABLE public.listing_comments 
ADD CONSTRAINT listing_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.listing_questions 
DROP CONSTRAINT IF EXISTS listing_questions_user_id_fkey;

ALTER TABLE public.listing_questions 
ADD CONSTRAINT listing_questions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
DROP CONSTRAINT IF EXISTS conversations_buyer_id_fkey;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
DROP CONSTRAINT IF EXISTS conversations_seller_id_fkey;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;