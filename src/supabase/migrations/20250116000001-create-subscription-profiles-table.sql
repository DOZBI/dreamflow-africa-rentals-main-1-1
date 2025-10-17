-- Table des profils basés sur les codes d'abonnement
CREATE TABLE IF NOT EXISTS subscription_profiles (
  code TEXT PRIMARY KEY REFERENCES abonnements(code) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  full_name TEXT DEFAULT 'Utilisateur',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_subscription_profiles_numero ON subscription_profiles(numero);
CREATE INDEX IF NOT EXISTS idx_subscription_profiles_updated ON subscription_profiles(updated_at DESC);

-- Enable RLS
ALTER TABLE subscription_profiles ENABLE ROW LEVEL SECURITY;

-- Policies (tout le monde peut lire, seul le propriétaire peut modifier)
CREATE POLICY "Anyone can view profiles" ON subscription_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON subscription_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON subscription_profiles FOR UPDATE USING (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_subscription_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_subscription_profile_updated_at ON subscription_profiles;
CREATE TRIGGER trigger_update_subscription_profile_updated_at
BEFORE UPDATE ON subscription_profiles
FOR EACH ROW
EXECUTE FUNCTION update_subscription_profile_updated_at();

COMMENT ON TABLE subscription_profiles IS 'Profils utilisateurs basés sur les codes d''abonnement';