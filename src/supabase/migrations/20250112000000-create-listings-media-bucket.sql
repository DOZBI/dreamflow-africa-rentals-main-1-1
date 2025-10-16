-- Create storage bucket for listings media (photos and videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings-media',
  'listings-media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for listings media
CREATE POLICY "Anyone can view listings media" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings-media');

CREATE POLICY "Authenticated users can upload listings media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings-media' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own listings media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listings-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own listings media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listings-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );