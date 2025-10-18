import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import imageCompression from 'browser-image-compression';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  user_id: string;
  category_id: string | null;
  is_active: boolean;
  bedrooms: number | null;
  living_rooms: number | null;
  bathrooms: number | null;
  kitchens: number | null;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
  category: {
    name: string;
    icon: string;
  } | null;
  is_favorite: boolean;
  favorites_count: number;
  comments_count: number;
  media: { url: string; type: 'image' | 'video' }[];
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  location: string;
  category_id: string;
  mediaFiles: MediaFile[];
  bedrooms?: number;
  living_rooms?: number;
  bathrooms?: number;
  kitchens?: number;
}

const BUCKET_NAME = 'listings-media'; 

export const useMarketplace = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{id: string; name: string; icon: string}>>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Setup real-time subscription for favorites
  useEffect(() => {
    const favoritesChannel = supabase
      .channel('marketplace_favorites')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'favorites',
        },
        (payload) => {
          const newFavorite = payload.new as { listing_id: string; user_id: string };
          setListings(prev => prev.map(listing => {
            if (listing.id === newFavorite.listing_id) {
              return {
                ...listing,
                favorites_count: listing.favorites_count + 1,
                is_favorite: newFavorite.user_id === user?.id ? true : listing.is_favorite,
              };
            }
            return listing;
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'favorites',
        },
        (payload) => {
          const deletedFavorite = payload.old as { listing_id: string; user_id: string };
          setListings(prev => prev.map(listing => {
            if (listing.id === deletedFavorite.listing_id) {
              return {
                ...listing,
                favorites_count: Math.max(0, listing.favorites_count - 1),
                is_favorite: deletedFavorite.user_id === user?.id ? false : listing.is_favorite,
              };
            }
            return listing;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(favoritesChannel);
    };
  }, [user]);

  const fetchListings = async (filters?: {
    search?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching listings...');
      
      let query = supabase
        .from('listings')
        .select(`
          *,
          profile:profiles!user_id(full_name, avatar_url),
          category:categories(name, icon)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching listings:', error);
        throw error;
      }

      console.log('✅ Fetched listings:', data?.length || 0);

      if (!data || data.length === 0) {
        setListings([]);
        return;
      }

      const listingIds = data.map(l => l.id);
      
      // Fetch all media
      const { data: mediaData, error: mediaError } = await supabase
        .from('listing_media')
        .select('listing_id, media_url, media_type, order')
        .in('listing_id', listingIds)
        .order('order', { ascending: true });

      if (mediaError) {
        console.error('❌ Error fetching media:', mediaError);
      }

      const allMedia = mediaData || [];

      // Fetch all favorites counts and user favorites in parallel
      const favoritesPromises = data.map(async (listing) => {
        try {
          const { count: favoritesCount } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id);

          let isFavorite = false;
          if (user) {
            const { data: favoriteData } = await supabase
              .from('favorites')
              .select('id')
              .eq('listing_id', listing.id)
              .eq('user_id', user.id)
              .maybeSingle();
            isFavorite = !!favoriteData;
          }

          return { listingId: listing.id, favoritesCount: favoritesCount || 0, isFavorite };
        } catch (err) {
          console.error('❌ Error fetching favorites for listing:', listing.id, err);
          return { listingId: listing.id, favoritesCount: 0, isFavorite: false };
        }
      });

      // Fetch all comments counts in parallel
      const commentsPromises = data.map(async (listing) => {
        try {
          const { count: commentsCount } = await supabase
            .from('listing_comments')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id);
          return { listingId: listing.id, commentsCount: commentsCount || 0 };
        } catch (err) {
          console.error('❌ Error fetching comments for listing:', listing.id, err);
          return { listingId: listing.id, commentsCount: 0 };
        }
      });

      const favoritesResults = await Promise.all(favoritesPromises);
      const commentsResults = await Promise.all(commentsPromises);

      const favoritesMap = new Map(favoritesResults.map(r => [r.listingId, r]));
      const commentsMap = new Map(commentsResults.map(r => [r.listingId, r]));

      const listingsWithExtras = data.map((listing) => {
        const favorites = favoritesMap.get(listing.id) || { favoritesCount: 0, isFavorite: false };
        const comments = commentsMap.get(listing.id) || { commentsCount: 0 };
        
        const media = allMedia
          .filter(m => m.listing_id === listing.id)
          .map(m => ({ url: m.media_url, type: m.media_type as 'image' | 'video' }));

        if (media.length === 0 && listing.media_url) {
          media.push({ url: listing.media_url, type: listing.media_type as 'image' | 'video' });
        }

        return {
          ...listing,
          is_favorite: favorites.isFavorite,
          favorites_count: favorites.favoritesCount,
          comments_count: comments.commentsCount,
          media_type: listing.media_type as 'image' | 'video',
          media: media
        };
      });

      console.log('✅ Processed listings with extras:', listingsWithExtras.length);
      setListings(listingsWithExtras as MarketplaceListing[]);
    } catch (error: any) {
      console.error('❌ Error fetching listings:', error);
      toast({
        title: "Erreur de chargement",
        description: error?.message || "Impossible de charger les annonces. Vérifiez votre connexion.",
        variant: "destructive"
      });
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteListings = async () => {
    if (!user) return [];
  
    try {
      setLoading(true);
      const { data: favoriteIds, error: favoriteError } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);
  
      if (favoriteError) throw favoriteError;
      if (!favoriteIds || favoriteIds.length === 0) {
        setLoading(false);
        return [];
      }
  
      const listingIds = favoriteIds.map(f => f.listing_id);
  
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profile:profiles!user_id(full_name, avatar_url),
          category:categories(name, icon)
        `)
        .in('id', listingIds);
  
      if (error) throw error;
  
      const listingsWithExtras = await Promise.all(
        (data || []).map(async (listing) => {
          const { count: favoritesCount } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id);
          
          const { count: commentsCount } = await supabase
            .from('listing_comments')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id);

          const { data: mediaData } = await supabase
            .from('listing_media')
            .select('media_url, media_type')
            .eq('listing_id', listing.id)
            .order('order');
            
          const media = (mediaData || []).map(m => ({ url: m.media_url, type: m.media_type as 'image'|'video' }));
          if (media.length === 0 && listing.media_url) {
            media.push({ url: listing.media_url, type: listing.media_type as 'image' | 'video' });
          }

          return {
            ...listing,
            is_favorite: true,
            favorites_count: favoritesCount || 0,
            comments_count: commentsCount || 0,
            media: media,
            media_type: listing.media_type as 'image' | 'video',
          };
        })
      );
  
      return listingsWithExtras as MarketplaceListing[];
  
    } catch (error) {
      console.error("Error fetching favorite listings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les favoris",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    // Skip compression for videos
    if (file.type.startsWith('video/')) {
      return file;
    }

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type,
      };
      
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original if compression fails
    }
  };

  const createListing = async (listingData: CreateListingData) => {
    if (!user) {
      throw new Error('User must be authenticated to create listings');
    }
    if (!listingData.mediaFiles || listingData.mediaFiles.length === 0) {
        throw new Error('At least one media file is required.');
    }

    setIsCreatingListing(true);
    setUploadProgress(0);
    let uploadedFilePaths: string[] = [];

    try {
      const { mediaFiles, ...dbData } = listingData;
      
      // Step 1: Compression (0-30%)
      toast({
        title: "Compression en cours",
        description: `Compression de ${mediaFiles.length} média(s)...`,
      });
      
      const compressedFiles = [];
      for (let i = 0; i < mediaFiles.length; i++) {
        const compressed = await compressImage(mediaFiles[i].file);
        compressedFiles.push({ ...mediaFiles[i], file: compressed });
        setUploadProgress(0.3 * ((i + 1) / mediaFiles.length));
      }

      // Step 2: Upload (30-70%)
      toast({
        title: "Téléchargement en cours",
        description: `Téléchargement de ${mediaFiles.length} média(s)...`,
      });

      const uploadPromises = compressedFiles.map(async (mediaFile, index) => {
        const cleanFileName = mediaFile.file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
        const fileName = `${user.id}/${Date.now()}-${cleanFileName}`;
        const result = await supabase.storage.from(BUCKET_NAME).upload(fileName, mediaFile.file);
        setUploadProgress(0.3 + (0.4 * ((index + 1) / compressedFiles.length)));
        return result;
      });

      const uploadResults = await Promise.all(uploadPromises);

      const mediaData = [];
      for (let i = 0; i < uploadResults.length; i++) {
        const result = uploadResults[i];
        if (result.error) {
          console.error('Storage Error:', result.error);
          throw new Error(`Erreur lors de l'upload du média: ${result.error.message}`);
        }
        if (result.data.path) {
          uploadedFilePaths.push(result.data.path);
        }
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(result.data.path);
        mediaData.push({
          url: urlData.publicUrl,
          type: compressedFiles[i].type,
        });
      }
      
      // Step 3: Database creation (70-100%)
      setUploadProgress(0.7);
      toast({
        title: "Finalisation",
        description: "Création de l'annonce...",
      });
        
      const { data: listingResult, error: insertError } = await supabase
        .from('listings')
        .insert([
          {
            ...dbData,
            user_id: user.id,
            media_url: mediaData[0].url,
            media_type: mediaData[0].type,
            bedrooms: dbData.bedrooms || 0,
            living_rooms: dbData.living_rooms || 0,
            bathrooms: dbData.bathrooms || 0,
            kitchens: dbData.kitchens || 0,
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newListingId = listingResult.id;
      setUploadProgress(0.85);

      const listingMediaToInsert = mediaData.map((media, index) => ({
        listing_id: newListingId,
        media_url: media.url,
        media_type: media.type,
        order: index,
      }));
      
      const { error: mediaInsertError } = await supabase
        .from('listing_media')
        .insert(listingMediaToInsert);
          
      if (mediaInsertError) throw mediaInsertError;
      
      setUploadProgress(1);
      
      toast({
        title: "Annonce créée",
        description: "Votre annonce a été publiée avec succès"
      });

      await fetchListings();
    } catch(error) {
      if (uploadedFilePaths.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedFilePaths);
      }
      throw error;
    } finally {
      setIsCreatingListing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };
  
  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter aux favoris",
        variant: "destructive"
      });
      return;
    }

    const originalListings = [...listings];
    const updatedListings = listings.map(listing => {
      if (listing.id === listingId) {
        return {
          ...listing,
          is_favorite: !listing.is_favorite,
          favorites_count: listing.is_favorite ? listing.favorites_count - 1 : listing.favorites_count + 1,
        };
      }
      return listing;
    });
    setListings(updatedListings);

    const listingToUpdate = originalListings.find(l => l.id === listingId);
    if (!listingToUpdate) return;
    
    try {
      if (listingToUpdate.is_favorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('listing_id', listingId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ listing_id: listingId, user_id: user.id }]);
        if (error) throw error;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les favoris. Veuillez réessayer.",
        variant: "destructive",
      });
      setListings(originalListings);
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete listings');
    }

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Annonce supprimée",
        description: "Votre annonce a été supprimée avec succès"
      });

      await fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, [user]);

  return {
    listings,
    categories,
    loading,
    isCreatingListing,
    uploadProgress,
    fetchListings,
    createListing,
    toggleFavorite,
    deleteListing,
    fetchCategories,
    fetchFavoriteListings
  };
};