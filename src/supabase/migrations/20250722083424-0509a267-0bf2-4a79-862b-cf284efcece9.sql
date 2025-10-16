
-- Ajouter une contrainte d'unicité pour éviter les conversations dupliquées
ALTER TABLE conversations 
ADD CONSTRAINT unique_buyer_seller_listing 
UNIQUE (buyer_id, seller_id, listing_id);

-- Mettre à jour la table conversations pour supporter les mises à jour
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Ajouter une politique pour permettre les mises à jour
CREATE POLICY "Users can update conversations" 
ON conversations 
FOR UPDATE 
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));
