-- Add support for voice messages in messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio')),
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Create storage bucket for voice messages
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for voice messages
CREATE POLICY "Anyone can view voice messages" ON storage.objects FOR SELECT USING (bucket_id = 'voice-messages');
CREATE POLICY "Authenticated users can upload voice messages" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'voice-messages' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own voice messages" ON storage.objects FOR DELETE USING (bucket_id = 'voice-messages' AND auth.uid()::text = (storage.foldername(name))[1]);