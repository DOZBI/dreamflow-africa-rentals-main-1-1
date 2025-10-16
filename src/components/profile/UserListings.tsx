
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserListing {
  id: string;
  title: string;
  price: number;
  location: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  is_active: boolean;
  category: {
    name: string;
    icon: string;
  } | null;
}

const UserListings = () => {
  const { user } = useAuth();
  const { deleteListing } = useMarketplace();
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserListings();
    }
  }, [user]);

  const fetchUserListings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          location,
          media_url,
          media_type,
          created_at,
          is_active,
          category:categories(name, icon)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the media_type to ensure it matches our interface
      const typedData = (data || []).map(listing => ({
        ...listing,
        media_type: listing.media_type as 'image' | 'video'
      }));
      
      setUserListings(typedData);
    } catch (error) {
      console.error('Error fetching user listings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos annonces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await deleteListing(listingId);
      setUserListings(prev => prev.filter(listing => listing.id !== listingId));
      setDeleteListingId(null);
    } catch (error) {
      // Error is already handled in the deleteListing function
    }
  };

  const toggleListingStatus = async (listingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_active: !currentStatus })
        .eq('id', listingId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, is_active: !currentStatus }
            : listing
        )
      );

      toast({
        title: currentStatus ? "Annonce désactivée" : "Annonce activée",
        description: currentStatus ? "Votre annonce est maintenant masquée" : "Votre annonce est maintenant visible"
      });
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'annonce",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (userListings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Vous n'avez pas encore d'annonces</p>
        <Button onClick={() => window.location.href = '/create'}>
          Créer votre première annonce
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userListings.map((listing) => (
        <Card key={listing.id}>
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <div className="relative">
                {listing.media_type === 'image' ? (
                  <img
                    src={listing.media_url}
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={listing.media_url}
                    className="w-20 h-20 object-cover rounded-lg"
                    muted
                  />
                )}
                {!listing.is_active && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-80" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500">{listing.location}</p>
                    <p className="text-lg font-bold text-primary">
                      {listing.price.toLocaleString()} FCFA
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {listing.category && (
                        <Badge variant="secondary" className="text-xs">
                          {listing.category.icon} {listing.category.name}
                        </Badge>
                      )}
                      <Badge variant={listing.is_active ? "default" : "secondary"} className="text-xs">
                        {listing.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleListingStatus(listing.id, listing.is_active)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {listing.is_active ? "Désactiver" : "Activer"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteListingId(listing.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deleteListingId} onOpenChange={() => setDeleteListingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'annonce</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteListingId && handleDeleteListing(deleteListingId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserListings;
