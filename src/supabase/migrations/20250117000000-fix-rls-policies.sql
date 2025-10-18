-- Fix RLS policies for all tables to ensure data can be loaded

-- Enable RLS on all tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Public can view categories" ON categories;

DROP POLICY IF EXISTS "Public can view favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

DROP POLICY IF EXISTS "Public can view comments" ON listing_comments;
DROP POLICY IF EXISTS "Users can insert comments" ON listing_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON listing_comments;

DROP POLICY IF EXISTS "Public can view listing media" ON listing_media;
DROP POLICY IF EXISTS "Users can insert their own listing media" ON listing_media;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- LISTINGS policies
CREATE POLICY "Public can view active listings"
ON listings FOR SELECT
TO authenticated, anon
USING (is_active = true);

CREATE POLICY "Users can insert their own listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON listings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON listings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- PROFILES policies
CREATE POLICY "Public can view profiles"
ON profiles FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- CATEGORIES policies
CREATE POLICY "Public can view categories"
ON categories FOR SELECT
TO authenticated, anon
USING (true);

-- FAVORITES policies
CREATE POLICY "Public can view favorites"
ON favorites FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can insert their own favorites"
ON favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- LISTING_COMMENTS policies
CREATE POLICY "Public can view comments"
ON listing_comments FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can insert comments"
ON listing_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON listing_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- LISTING_MEDIA policies
CREATE POLICY "Public can view listing media"
ON listing_media FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can insert their own listing media"
ON listing_media FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM listings
    WHERE listings.id = listing_media.listing_id
    AND listings.user_id = auth.uid()
  )
);

-- CONVERSATIONS policies
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

-- MESSAGES policies
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);