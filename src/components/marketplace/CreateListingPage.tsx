import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthAction } from '@/hooks/useAuthAction';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UploadProgress } from '@/components/ui/UploadProgress';
import MultiMediaPicker from './MultiMediaPicker';
import CitySelector from './CitySelector';
import LoginPromptModal from '../auth/LoginPromptModal';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const CreateListingPage = () => {
  const { user } = useAuth();
  const { categories, createListing, isCreatingListing, uploadProgress } = useMarketplace();
  const { executeAction, showLoginPrompt, currentAction, closeLoginPrompt } = useAuthAction();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category_id: '',
    bedrooms: '',
    living_rooms: '',
    bathrooms: '',
    kitchens: '',
  });
  
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    if (!user) {
      executeAction('create', () => {});
    }
  }, [user, executeAction]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      executeAction('create', () => {});
      return;
    }

    if (mediaFiles.length === 0) {
      toast({
        title: "Média requis",
        description: "Veuillez ajouter au moins une image ou une vidéo",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.price || !formData.location || !formData.category_id) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await createListing({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        category_id: formData.category_id,
        mediaFiles: mediaFiles,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        living_rooms: formData.living_rooms ? parseInt(formData.living_rooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        kitchens: formData.kitchens ? parseInt(formData.kitchens) : 0,
      });
      
      navigate('/');
    } catch (error) {
      const err = error as Error;
      console.error('Error creating listing:', err);
      toast({
        title: "Erreur lors de la création",
        description: err.message || "Une erreur inconnue est survenue.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <>
        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-lg mb-4">Connexion requise</p>
            <p className="text-gray-600 mb-6">Vous devez être connecté pour créer une annonce</p>
            <Button onClick={() => navigate('/auth')}>
              Se connecter
            </Button>
          </div>
        </div>
        <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={closeLoginPrompt}
          action={currentAction}
        />
      </>
    );
  }

  return (
    <>
      <UploadProgress progress={uploadProgress} isVisible={isCreatingListing} />
      
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="sticky top-0 bg-white z-50 p-4 border-b">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Créer une annonce</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Médias *</CardTitle>
              <p className="text-sm text-gray-600">
                Ajoutez jusqu'à 10 images et 3 vidéos
              </p>
            </CardHeader>
            <CardContent>
              <MultiMediaPicker
                onMediaChange={setMediaFiles}
                maxImages={10}
                maxVideos={3}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Titre de votre annonce"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre article..."
                rows={4}
                className="mt-1 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Lieu *</Label>
              <div className="mt-1">
                <CitySelector
                  value={formData.location}
                  onValueChange={(value) => handleInputChange('location', value)}
                  placeholder="Sélectionnez votre ville"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Détails de la propriété</CardTitle>
                <p className="text-sm text-gray-600">
                  Informations sur les pièces (optionnel)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Chambres</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="living_rooms">Salons</Label>
                    <Input
                      id="living_rooms"
                      type="number"
                      value={formData.living_rooms}
                      onChange={(e) => handleInputChange('living_rooms', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Toilettes</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kitchens">Cuisines</Label>
                    <Input
                      id="kitchens"
                      type="number"
                      value={formData.kitchens}
                      onChange={(e) => handleInputChange('kitchens', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 text-lg font-semibold"
            disabled={isCreatingListing}
          >
            {isCreatingListing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Publication en cours...
              </>
            ) : (
              'Publier l\'annonce'
            )}
          </Button>
        </form>
      </div>
    </>
  );
};

export default CreateListingPage;