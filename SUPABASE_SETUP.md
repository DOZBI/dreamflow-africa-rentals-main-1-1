# Configuration Supabase

## Bucket de stockage 'listings-media'

Pour que l'application fonctionne correctement, vous devez créer un bucket de stockage dans Supabase pour héberger les images et vidéos des annonces.

### Étapes de configuration

1. **Accédez à votre projet Supabase**
   - Connectez-vous à [https://supabase.com](https://supabase.com)
   - Ouvrez votre projet

2. **Créez le bucket de stockage**
   - Dans le menu latéral, cliquez sur **Storage**
   - Cliquez sur **New bucket**
   - Configurez le bucket comme suit:
     - **Name**: `listings-media`
     - **Public bucket**: ✅ Cochez cette option (les fichiers doivent être accessibles publiquement)
     - Cliquez sur **Create bucket**

3. **Configurez les politiques de sécurité (RLS)**
   
   Pour permettre aux utilisateurs authentifiés de télécharger des fichiers et à tous de les lire, ajoutez les politiques suivantes:

   #### Politique de lecture (SELECT)
   ```sql
   -- Permettre à tout le monde de lire les fichiers
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'listings-media');
   ```

   #### Politique d'insertion (INSERT)
   ```sql
   -- Permettre aux utilisateurs authentifiés d'uploader des fichiers
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'listings-media' 
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   #### Politique de mise à jour (UPDATE)
   ```sql
   -- Permettre aux utilisateurs de mettre à jour leurs propres fichiers
   CREATE POLICY "Users can update own files"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'listings-media' 
     AND (storage.foldername(name))[1] = auth.uid()::text
   )
   WITH CHECK (
     bucket_id = 'listings-media' 
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   #### Politique de suppression (DELETE)
   ```sql
   -- Permettre aux utilisateurs de supprimer leurs propres fichiers
   CREATE POLICY "Users can delete own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'listings-media' 
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

4. **Ajoutez ces politiques via le SQL Editor**
   - Allez dans **SQL Editor** dans le menu Supabase
   - Copiez et exécutez chaque politique SQL ci-dessus
   - Cliquez sur **Run** pour chaque requête

5. **Vérifiez la configuration**
   - Retournez dans **Storage** > **listings-media**
   - Cliquez sur **Policies** pour vérifier que les 4 politiques sont actives

### Configuration des types MIME autorisés (optionnel)

Pour limiter les types de fichiers uploadés, vous pouvez configurer les types MIME autorisés:

```sql
-- Limiter aux images et vidéos courantes
ALTER TABLE storage.objects
ADD CONSTRAINT check_file_type
CHECK (
  bucket_id != 'listings-media' OR
  (
    (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'))
  )
);
```

### Structure des dossiers

Les fichiers sont organisés par utilisateur:
```
listings-media/
  ├── {user_id_1}/
  │   ├── 1234567890-image1.jpg
  │   ├── 1234567891-video1.mp4
  │   └── ...
  ├── {user_id_2}/
  │   └── ...
```

### Compression automatique

L'application compresse automatiquement les images avant l'upload:
- **Taille maximale**: 1 MB
- **Résolution maximale**: 1920px (largeur ou hauteur)
- **Format**: Préservé (JPEG, PNG, WebP, etc.)

Les vidéos ne sont pas compressées côté client pour préserver la qualité.

## Dépannage

### Erreur "bucket not found"
- Vérifiez que le bucket `listings-media` existe dans votre projet Supabase
- Assurez-vous que l'option **Public bucket** est activée
- Vérifiez que vos variables d'environnement Supabase sont correctement configurées

### Erreur d'upload
- Vérifiez que les politiques RLS sont correctement configurées
- Assurez-vous que l'utilisateur est authentifié
- Vérifiez la taille et le type du fichier

### Les images ne s'affichent pas
- Vérifiez que le bucket est public
- Vérifiez que la politique de lecture (SELECT) est active
- Testez l'URL publique du fichier directement dans le navigateur