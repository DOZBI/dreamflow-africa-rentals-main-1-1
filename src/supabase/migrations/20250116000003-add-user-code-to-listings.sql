-- Ajouter la colonne user_code à la table listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS user_code TEXT REFERENCES subscription_profiles(code);

-- Créer un index pour user_code
CREATE INDEX IF NOT EXISTS idx_listings_user_code ON listings(user_code);

-- Mettre à jour les listings existants pour avoir un user_code par défaut (optionnel)
-- UPDATE listings SET user_code = '000001' WHERE user_code IS NULL;

-- Ajouter la colonne user_code à la table favorites
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS user_code TEXT REFERENCES subscription_profiles(code);

-- Créer un index pour user_code dans favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_code ON favorites(user_code);

-- Rendre user_code unique avec listing_id dans favorites pour éviter les doublons
DROP INDEX IF EXISTS idx_favorites_user_listing;
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_code_listing ON favorites(user_code, listing_id);

COMMENT ON COLUMN listings.user_code IS 'Code d''abonnement du propriétaire de l''annonce';
COMMENT ON COLUMN favorites.user_code IS 'Code d''abonnement de l''utilisateur qui a mis en favori';