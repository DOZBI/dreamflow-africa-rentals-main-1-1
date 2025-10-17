-- Table abonnements pour gérer les codes d'abonnement par SMS
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

-- Index pour recherche rapide par numéro et code
CREATE INDEX IF NOT EXISTS idx_abonnements_numero ON abonnements(numero);
CREATE INDEX IF NOT EXISTS idx_abonnements_code ON abonnements(code);
CREATE INDEX IF NOT EXISTS idx_abonnements_statut ON abonnements(statut);

-- Insertion de 3 codes permanents pour administrateurs (expiration dans 100 ans)
INSERT INTO abonnements (numero, code, montant, duree, date_expiration, statut) VALUES
  ('ADMIN', 'ADMIN001', 99999, 52560000, NOW() + INTERVAL '100 years', 'actif'),
  ('ADMIN', 'ADMIN002', 99999, 52560000, NOW() + INTERVAL '100 years', 'actif'),
  ('ADMIN', 'ADMIN003', 99999, 52560000, NOW() + INTERVAL '100 years', 'actif');

-- Commentaires
COMMENT ON TABLE abonnements IS 'Table pour gérer les abonnements par SMS avec codes de validation';
COMMENT ON COLUMN abonnements.numero IS 'Numéro de téléphone du client';
COMMENT ON COLUMN abonnements.code IS 'Code d''abonnement unique';
COMMENT ON COLUMN abonnements.montant IS 'Montant payé en FCFA';
COMMENT ON COLUMN abonnements.duree IS 'Durée en minutes';
COMMENT ON COLUMN abonnements.statut IS 'Statut: actif / expiré / utilisé';