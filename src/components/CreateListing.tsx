
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import MediaPicker from './MediaPicker';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useListings, CreateListingData } from '@/hooks/useListings';
import { useToast } from '@/hooks/use-toast';

interface CreateListingProps {
  onSuccess?: () => void;
}

const CreateListing = ({ onSuccess }: CreateListingProps) => {
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
  });

  const { toast } = useToast();
  const { uploadMedia, isUploading } = useMediaUpload();
  const { createListing, isCreating } = useListings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMedia) {
      toast({
        title: "Média requis",
        description: "Veuillez sélectionner une photo ou vidéo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.price || !formData.location) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload media first
      const mediaUrl = await uploadMedia(selectedMedia);
      
      // Create listing
      const listingData: CreateListingData = {
        title: formData.title,
        description: formData.description || undefined,
        price: parseInt(formData.price),
        location: formData.location,
        media_url: mediaUrl,
        media_type: selectedMedia.type.startsWith('video/') ? 'video' : 'image',
        contact_method: 'chat',
      };

      await createListing(listingData);

      // Reset form
      setSelectedMedia(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        location: '',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const isSubmitting = isUploading || isCreating;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Upload className="h-5 w-5" />
          Créer une annonce
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Media Picker */}
          <div>
            <Label>Photo ou Vidéo *</Label>
            <MediaPicker
              onMediaSelected={setSelectedMedia}
              selectedMedia={selectedMedia}
              className="mt-2"
            />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Ex: Bel appartement à louer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre propriété..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Prix (FCFA) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="Ex: 150000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Lieu *</Label>
            <Input
              id="location"
              placeholder="Ex: Poto-Poto, Brazzaville"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isUploading ? 'Upload en cours...' : 'Publication...'}
              </>
            ) : (
              'Publier l\'annonce'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateListing;
