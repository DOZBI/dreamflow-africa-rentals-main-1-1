-- Migration pour système basé uniquement sur les codes d'abonnement
-- Plus besoin de auth.users, tout est basé sur le code d'abonnement

-- 1. Créer table profiles basée sur les codes d'abonnement
CREATE TABLE IF NOT EXISTS public.subscription_profiles (
  code TEXT PRIMARY KEY,
  numero TEXT NOT NULL,
  full_name TEXT DEFAULT 'Utilisateur',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Modifier la table listings pour utiliser subscription_code
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_user_id_fkey;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS subscription_code TEXT;
ALTER TABLE public.listings ADD CONSTRAINT listings_subscription_code_fkey 
  FOREIGN KEY (subscription_code) REFERENCES public.subscription_profiles(code) ON DELETE CASCADE;

-- 3. Modifier la table favorites
ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS subscription_code TEXT;
ALTER TABLE public.favorites ADD CONSTRAINT favorites_subscription_code_fkey 
  FOREIGN KEY (subscription_code) REFERENCES public.subscription_profiles(code) ON DELETE CASCADE;
ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_listing_id_key;
ALTER TABLE public.favorites ADD CONSTRAINT favorites_code_listing_unique UNIQUE (subscription_code, listing_id);

-- 4. Modifier la table listing_comments
ALTER TABLE public.listing_comments DROP CONSTRAINT IF EXISTS listing_comments_user_id_fkey;
ALTER TABLE public.listing_comments ADD COLUMN IF NOT EXISTS subscription_code TEXT;
ALTER TABLE public.listing_comments ADD CONSTRAINT listing_comments_subscription_code_fkey 
  FOREIGN KEY (subscription_code) REFERENCES public.subscription_profiles(code) ON DELETE CASCADE;

-- 5. Modifier la table conversations
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_buyer_id_fkey;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_seller_id_fkey;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS buyer_code TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS seller_code TEXT;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_buyer_code_fkey 
  FOREIGN KEY (buyer_code) REFERENCES public.subscription_profiles(code) ON DELETE CASCADE;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_seller_code_fkey 
  FOREIGN KEY (seller_code) REFERENCES public.subscription_profiles(code) ON DELETE CASCADE;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_listing_id_buyer_id_seller_id_key;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_listing_buyer_seller_unique 
  UNIQUE (listing_id, buyer_code, seller_code);

-- 6. Modifier la table messages
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_code TEXT;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_code_fkey 
  FOREIGN KEY (sender_code) REFERENCES public.subscription_profiles(code) ON DELETE CASCADE;

-- 7. Modifier les RLS policies pour utiliser subscription_code

-- Listings policies
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;

CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert listings" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (true);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (true);

-- Favorites policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

CREATE POLICY "Everyone can view favorites" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "Anyone can insert favorites" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete favorites" ON public.favorites FOR DELETE USING (true);

-- Comments policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.listing_comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.listing_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.listing_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.listing_comments;

CREATE POLICY "Comments are viewable by everyone" ON public.listing_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.listing_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update comments" ON public.listing_comments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete comments" ON public.listing_comments FOR DELETE USING (true);

-- Conversations policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON public.conversations;

CREATE POLICY "Everyone can view conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations" ON public.conversations FOR UPDATE USING (true);

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON public.messages;

CREATE POLICY "Everyone can view messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);

-- 8. Enable RLS on subscription_profiles
ALTER TABLE public.subscription_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.subscription_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profiles" ON public.subscription_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update profiles" ON public.subscription_profiles FOR UPDATE USING (true);

-- 9. Créer des profils pour les codes d'admin existants
INSERT INTO public.subscription_profiles (code, numero, full_name)
VALUES
  ('000001', '+241065119788', 'Administrateur 1'),
  ('000002', '+241065119788', 'Administrateur 2'),
  ('000003', '+241065119788', 'Administrateur 3')
ON CONFLICT (code) DO NOTHING;

-- 10. Enable realtime
ALTER TABLE public.subscription_profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_profiles;