-- ============================================
-- MIGRATIONS COMPLÈTES POUR LE SYSTÈME D'ABONNEMENT SMS
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABLE ABONNEMENTS (déjà créée normalement)
-- ============================================
CREATE TABLE IF NOT EXISTS abonnements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  montant INT NOT NULL,
  duree INT NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_expiration TIMESTAMP WITH TIME ZONE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'expiré', 'utilisé'))
);

CREATE INDEX IF NOT EXISTS idx_abonnements_numero ON abonnements(numero);
CREATE INDEX IF NOT EXISTS idx_abonnements_code ON abonnements(code);
CREATE INDEX IF NOT EXISTS idx_abonnements_statut ON abonnements(statut);

-- Codes administrateurs permanents
INSERT INTO abonnements (numero, code, montant, duree, date_expiration, statut) 
VALUES
  ('+241065119788', '000001', 99999, 52560000, NOW() + INTERVAL '100 years', 'actif'),
  ('+241065119788', '000002', 99999, 52560000, NOW() + INTERVAL '100 years', 'actif'),
  ('+241065119788', '000003', 99999, 52560000, NOW() + INTERVAL '100 years', 'actif')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. TABLE SUBSCRIPTION_PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_profiles (
  code TEXT PRIMARY KEY REFERENCES abonnements(code) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  full_name TEXT DEFAULT 'Utilisateur',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_profiles_numero ON subscription_profiles(numero);
CREATE INDEX IF NOT EXISTS idx_subscription_profiles_updated ON subscription_profiles(updated_at DESC);

ALTER TABLE subscription_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles" ON subscription_profiles;
CREATE POLICY "Anyone can view profiles" ON subscription_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON subscription_profiles;
CREATE POLICY "Users can insert their own profile" ON subscription_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON subscription_profiles;
CREATE POLICY "Users can update their own profile" ON subscription_profiles FOR UPDATE USING (true);

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_subscription_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_profile_updated_at ON subscription_profiles;
CREATE TRIGGER trigger_update_subscription_profile_updated_at
BEFORE UPDATE ON subscription_profiles
FOR EACH ROW
EXECUTE FUNCTION update_subscription_profile_updated_at();

-- ============================================
-- 3. TABLES CHAT BASÉES SUR LES CODES
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_code TEXT NOT NULL REFERENCES subscription_profiles(code),
  seller_code TEXT NOT NULL REFERENCES subscription_profiles(code),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_code, seller_code, listing_id)
);

CREATE TABLE IF NOT EXISTS subscription_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES subscription_conversations(id) ON DELETE CASCADE,
  sender_code TEXT NOT NULL REFERENCES subscription_profiles(code),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image')),
  audio_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_subscription_conversations_buyer ON subscription_conversations(buyer_code);
CREATE INDEX IF NOT EXISTS idx_subscription_conversations_seller ON subscription_conversations(seller_code);
CREATE INDEX IF NOT EXISTS idx_subscription_conversations_listing ON subscription_conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_subscription_conversations_updated ON subscription_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_messages_conversation ON subscription_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_subscription_messages_sender ON subscription_messages(sender_code);
CREATE INDEX IF NOT EXISTS idx_subscription_messages_created ON subscription_messages(created_at);

-- Fonction pour mettre à jour timestamp conversation
CREATE OR REPLACE FUNCTION update_subscription_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subscription_conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_conversation_timestamp ON subscription_messages;
CREATE TRIGGER trigger_update_subscription_conversation_timestamp
AFTER INSERT ON subscription_messages
FOR EACH ROW
EXECUTE FUNCTION update_subscription_conversation_timestamp();

-- RLS
ALTER TABLE subscription_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view conversations" ON subscription_conversations;
CREATE POLICY "Anyone can view conversations" ON subscription_conversations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create conversations" ON subscription_conversations;
CREATE POLICY "Anyone can create conversations" ON subscription_conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view messages" ON subscription_messages;
CREATE POLICY "Anyone can view messages" ON subscription_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create messages" ON subscription_messages;
CREATE POLICY "Anyone can create messages" ON subscription_messages FOR INSERT WITH CHECK (true);

-- ============================================
-- 4. AJOUTER SUBSCRIPTION_CODE AUX TABLES EXISTANTES
-- ============================================

-- Ajouter subscription_code à listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subscription_code TEXT REFERENCES subscription_profiles(code);
CREATE INDEX IF NOT EXISTS idx_listings_subscription_code ON listings(subscription_code);

-- Ajouter subscription_code à favorites  
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS subscription_code TEXT REFERENCES subscription_profiles(code);
CREATE INDEX IF NOT EXISTS idx_favorites_subscription_code ON favorites(subscription_code);

-- Créer index unique pour éviter doublons favoris
DROP INDEX IF EXISTS idx_favorites_user_code_listing;
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_subscription_code_listing ON favorites(subscription_code, listing_id) 
WHERE subscription_code IS NOT NULL;

-- Ajouter subscription_code à listing_comments
ALTER TABLE listing_comments ADD COLUMN IF NOT EXISTS subscription_code TEXT REFERENCES subscription_profiles(code);
CREATE INDEX IF NOT EXISTS idx_listing_comments_subscription_code ON listing_comments(subscription_code);

-- ============================================
-- 5. COMMENTAIRES ET DESCRIPTIONS
-- ============================================
COMMENT ON TABLE abonnements IS 'Table pour gérer les abonnements par SMS avec codes de validation';
COMMENT ON TABLE subscription_profiles IS 'Profils utilisateurs basés sur les codes d''abonnement';
COMMENT ON TABLE subscription_conversations IS 'Conversations basées sur les codes d''abonnement';
COMMENT ON TABLE subscription_messages IS 'Messages basés sur les codes d''abonnement';
COMMENT ON COLUMN listings.subscription_code IS 'Code d''abonnement du propriétaire de l''annonce';
COMMENT ON COLUMN favorites.subscription_code IS 'Code d''abonnement de l''utilisateur qui a mis en favori';
COMMENT ON COLUMN listing_comments.subscription_code IS 'Code d''abonnement de l''auteur du commentaire';

-- ============================================
-- FIN DES MIGRATIONS
-- ============================================
-- Toutes les tables sont créées et configurées
-- Le système utilise maintenant les codes d'abonnement SMS
-- comme identifiants principaux pour le chat et les interactions
-- ============================================