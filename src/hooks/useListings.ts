
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  media_url: string;
  media_type: 'image' | 'video';
  contact_method: string;
  contact_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
}

export interface CreateListingData {
  title: string;
  description?: string;
  price: number;
  location: string;
  media_url: string;
  media_type: 'image' | 'video';
  contact_method?: string;
  contact_info?: string;
}

// Mock data for development
const mockListings: Listing[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Bel appartement T3',
    description: 'Appartement moderne avec vue sur mer, 2 chambres, cuisine équipée',
    price: 850000,
    location: 'Poto-Poto, Brazzaville',
    media_url: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800',
    media_type: 'image',
    contact_method: 'phone',
    contact_info: '+242 06 123 45 67',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: 'Marie Dubois',
      phone: '+242 06 123 45 67',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b3-d?w=150'
    }
  },
  {
    id: '2',
    user_id: 'user2',
    title: 'Villa familiale',
    description: 'Grande villa avec jardin, 4 chambres, garage',
    price: 1200000,
    location: 'Bacongo, Brazzaville',
    media_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800',
    media_type: 'image',
    contact_method: 'chat',
    contact_info: null,
    is_active: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: {
      full_name: 'Jean Mbemba',
      phone: '+242 06 987 65 43',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  }
];

export const useListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setListings(mockListings);
      
      toast({
        title: "Annonces chargées",
        description: `${mockListings.length} annonces trouvées`,
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createListing = async (listingData: CreateListingData) => {
    try {
      setIsCreating(true);
      
      // Create new listing with mock data
      const newListing: Listing = {
        id: Date.now().toString(),
        user_id: 'current-user',
        title: listingData.title,
        description: listingData.description || null,
        price: listingData.price,
        location: listingData.location,
        media_url: listingData.media_url,
        media_type: listingData.media_type,
        contact_method: listingData.contact_method || 'chat',
        contact_info: listingData.contact_info || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: {
          full_name: 'Utilisateur Actuel',
          phone: '+242 06 000 00 00',
          avatar_url: null
        }
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to existing listings
      setListings(prev => [newListing, ...prev]);

      toast({
        title: "Annonce créée",
        description: "Votre annonce a été publiée avec succès",
      });

      return newListing;
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'annonce",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    isLoading,
    isCreating,
    fetchListings,
    createListing,
  };
};
