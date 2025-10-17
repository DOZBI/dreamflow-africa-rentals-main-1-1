import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthAction } from '@/hooks/useAuthAction';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import MediaCarousel from '@/components/ui/MediaCarousel';
import ListingComments from '@/components/listing/ListingComments';
import LoginPromptModal from '@/components/auth/LoginPromptModal';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Phone, 
  Share2,
  MapPin,
  User,
  BedDouble,
  Bath,
  Home,
  Utensils,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ListingDetail {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  created_at: string;
  user_id: string;
  category_id: string | null;
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
  media: { url: string; type: 'image' | 'video' }[];
  is_favorite: boolean;
  favorites_count: number;
  comments_count: number;
}

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { executeAction, showLoginPrompt, currentAction, closeLoginPrompt } = useAuthAction();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListingDetail();
    }
  }, [id, user]);

  // Real-time subscription for favorites
  useEffect(() => {
    if (!id || !user) return;

    const favoritesChannel = supabase
      .channel(`listing_${id}_favorites`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `listing_id=eq.${id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newFavorite = payload.new as { user_id: string };
            setListing(prev => prev ? {
              ...prev,
              favorites_count: prev.favorites_count + 1,
              is_favorite: newFavorite.user_id === user.id ? true : prev.is_favorite,
            } : null);
          } else if (payload.eventType === 'DELETE') {
            const deletedFavorite = payload.old as { user_id: string };
            setListing(prev => prev ? {
              ...prev,
              favorites_count: Math.max(0, prev.favorites_count - 1),
              is_favorite: deletedFavorite.user_id === user.id ? false : prev.is_favorite,
            } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(favoritesChannel);
    };
  }, [id, user]);

  const fetchListingDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profile:profiles!listings_user_id_fkey(full_name, avatar_url),
          category:categories(name, icon)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const { data: mediaData } = await supabase
        .from('listing_media')
        .select('media_url, media_type')
        .eq('listing_id', id)
        .order('order');

      const media = (mediaData || []).map(m => ({ 
        url: m.media_url, 
        type: m.media_type as 'image' | 'video' 
      }));

      if (media.length === 0 && data.media_url) {
        media.push({ url: data.media_url, type: data.media_type as 'image' | 'video' });
      }

      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', id);

      let isFavorite = false;
      if (user) {
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('id')
          .eq('listing_id', id)
          .eq('user_id', user.id)
          .limit(1)
          .single();
        isFavorite = !!favoriteData;
      }

      const { count: commentsCount } = await supabase
        .from('listing_comments')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', id);

      setListing({
        ...data,
        media,
        is_favorite: isFavorite,
        favorites_count: favoritesCount || 0,
        comments_count: commentsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'annonce",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user || !listing) {
      executeAction('favorite', () => {});
      return;
    }

    const newFavoriteState = !listing.is_favorite;
    setListing(prev => prev ? {
      ...prev,
      is_favorite: newFavoriteState,
      favorites_count: newFavoriteState ? prev.favorites_count + 1 : prev.favorites_count - 1
    } : null);

    try {
      if (listing.is_favorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('listing_id', listing.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('favorites')
          .insert({ listing_id: listing.id, user_id: user.id });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setListing(prev => prev ? {
        ...prev,
        is_favorite: !newFavoriteState,
        favorites_count: newFavoriteState ? prev.favorites_count - 1 : prev.favorites_count + 1
      } : null);
    }
  };

  const handleContact = () => {
    if (!user || !listing) {
      executeAction('contact', () => {});
      return;
    }
    navigate(`/messages?listing=${listing.id}`);
  };

  const handleShare = () => {
    if (!listing) return;
    const url = `${window.location.origin}/listing/${listing.id}`;
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description || '',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié",
        description: "Le lien de l'annonce a été copié",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-lg mb-4">Annonce introuvable</p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      {/* Fixed Header with Transparent Background */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full h-10 w-10"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className={`backdrop-blur-sm rounded-full h-10 w-10 ${
                listing.is_favorite 
                  ? 'bg-red-500/90 hover:bg-red-500 text-white' 
                  : 'bg-white/90 hover:bg-white'
              }`}
            >
              <Heart className={`h-5 w-5 ${listing.is_favorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Media Section - Full Width */}
      <div className="relative">
        <MediaCarousel media={listing.media} />
        
        {/* Price Badge Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm">
            <div className="text-3xl font-bold">
              {formatPrice(listing.price)} FCFA
            </div>
          </div>
          {listing.category && (
            <Badge className="bg-white/95 text-gray-900 backdrop-blur-sm px-4 py-2 text-sm font-medium shadow-lg">
              {listing.category.icon} {listing.category.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-5 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {listing.title}
          </h1>
          <div className="flex items-center text-gray-600 text-sm space-x-3">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{listing.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(listing.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Seller Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-blue-100">
                  <AvatarImage src={listing.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {listing.profile?.full_name || 'Utilisateur'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Vendeur particulier
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Voir le profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        {(listing.bedrooms || listing.living_rooms || listing.bathrooms || listing.kitchens) && (
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Caractéristiques</h3>
              <div className="grid grid-cols-2 gap-4">
                {listing.bedrooms !== null && listing.bedrooms > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BedDouble className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chambres</p>
                      <p className="font-semibold">{listing.bedrooms}</p>
                    </div>
                  </div>
                )}
                {listing.living_rooms !== null && listing.living_rooms > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Home className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salons</p>
                      <p className="font-semibold">{listing.living_rooms}</p>
                    </div>
                  </div>
                )}
                {listing.bathrooms !== null && listing.bathrooms > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Bath className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Toilettes</p>
                      <p className="font-semibold">{listing.bathrooms}</p>
                    </div>
                  </div>
                )}
                {listing.kitchens !== null && listing.kitchens > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Utensils className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cuisines</p>
                      <p className="font-semibold">{listing.kitchens}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {listing.description && (
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats & Actions */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-around text-center">
              <div>
                <div className="flex items-center justify-center space-x-1 text-red-500 mb-1">
                  <Heart className="h-5 w-5 fill-current" />
                  <span className="font-bold">{listing.favorites_count}</span>
                </div>
                <p className="text-xs text-gray-500">J'aime</p>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <button 
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center"
              >
                <div className="flex items-center space-x-1 text-blue-500 mb-1">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-bold">{listing.comments_count}</span>
                </div>
                <p className="text-xs text-gray-500">Commentaires</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Spacer for fixed bottom bar */}
        <div className="h-20"></div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setShowComments(true)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Commenter
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={handleContact}
            disabled={user?.id === listing.user_id}
          >
            <Phone className="h-5 w-5 mr-2" />
            Contacter
          </Button>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        action={currentAction}
      />

      {/* Comments Sheet */}
      <Sheet open={showComments} onOpenChange={setShowComments}>
        <SheetContent side="bottom" className="h-[85vh]">
          <div className="h-full overflow-y-auto">
            <ListingComments 
              listingId={listing.id}
              onCommentAdded={fetchListingDetail}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ListingDetailPage;