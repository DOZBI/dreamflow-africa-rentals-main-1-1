-- Table des conversations basées sur les codes d'abonnement
CREATE TABLE IF NOT EXISTS subscription_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_code TEXT NOT NULL REFERENCES subscription_profiles(code),
  seller_code TEXT NOT NULL REFERENCES subscription_profiles(code),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_code, seller_code, listing_id)
);

-- Table des messages basés sur les codes d'abonnement
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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscription_conversations_buyer ON subscription_conversations(buyer_code);
CREATE INDEX IF NOT EXISTS idx_subscription_conversations_seller ON subscription_conversations(seller_code);
CREATE INDEX IF NOT EXISTS idx_subscription_conversations_listing ON subscription_conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_subscription_conversations_updated ON subscription_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_messages_conversation ON subscription_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_subscription_messages_sender ON subscription_messages(sender_code);
CREATE INDEX IF NOT EXISTS idx_subscription_messages_created ON subscription_messages(created_at);

-- Fonction pour mettre à jour automatiquement le timestamp de la conversation
CREATE OR REPLACE FUNCTION update_subscription_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subscription_conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger qui s'exécute après l'insertion d'un nouveau message
DROP TRIGGER IF EXISTS trigger_update_subscription_conversation_timestamp ON subscription_messages;
CREATE TRIGGER trigger_update_subscription_conversation_timestamp
AFTER INSERT ON subscription_messages
FOR EACH ROW
EXECUTE FUNCTION update_subscription_conversation_timestamp();

-- Enable RLS
ALTER TABLE subscription_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_messages ENABLE ROW LEVEL SECURITY;

-- Policies pour subscription_conversations (tout le monde peut lire et créer)
CREATE POLICY "Anyone can view conversations" ON subscription_conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can create conversations" ON subscription_conversations FOR INSERT WITH CHECK (true);

-- Policies pour subscription_messages (tout le monde peut lire et créer)
CREATE POLICY "Anyone can view messages" ON subscription_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create messages" ON subscription_messages FOR INSERT WITH CHECK (true);