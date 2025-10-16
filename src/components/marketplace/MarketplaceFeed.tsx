import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useAuthAction } from '@/hooks/useAuthAction';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import SearchFilters from './SearchFilters';
import LoginPromptModal from '../auth/LoginPromptModal';
import ListingComments from '@/components/listing/ListingComments';
import MediaCarousel from '@/components/ui/MediaCarousel';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Phone, 
  MoreHorizontal,
  MapPin,
  User,
  LogIn,
  Bookmark
} from 'lucide-react';
import { staggerContainerVariants, staggerItemVariants, scaleVariants, gpuStyles } from '@/lib/animations';

const MarketplaceFeed = () => {
  const { listings, categories, loading, toggleFavorite, fetchListings } = useMarketplace();
  const { executeAction, showLoginPrompt, currentAction, closeLoginPrompt } = useAuthAction();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.intersectionRatio < 0.5) {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: [0.5] }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const registerVideo = (listingId: string, videoElement: HTMLVideoElement | null) => {
    if (!videoElement) {
      videoRefs.current.delete(listingId);
      return;
    }

    videoRefs.current.set(listingId, videoElement);
    if (observerRef.current) {
      observerRef.current.observe(videoElement);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleFiltersChange = (filters: any) => {
    fetchListings(filters);
  };

  const handleFavorite = (listingId: string) => {
    executeAction('favorite', () => toggleFavorite(listingId));
  };

  const handleComment = (listingId: string) => {
    executeAction('comment', () => {
      setSelectedListing(listingId);
      setShowComments(true);
    });
  };

  const handleShare = (listingId: string) => {
    const url = `${window.location.origin}/listing/${listingId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Annonce Marketplace',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleContact = (listingId: string) => {
    executeAction('contact', () => {
      navigate(`/messages?listing=${listingId}`);
    });
  };

  const handleCardClick = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-50 h-screen max-h-screen flex flex-col overflow-hidden">
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 h-screen max-h-screen flex flex-col overflow-hidden">
      {/* Fixed Login Button */}
      {!user && (
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          style={gpuStyles}
          className="fixed top-4 right-4 z-[60]"
        >
          <Button
            onClick={() => navigate('/auth')}
            size="sm"
            className="shadow-lg bg-blue-500 hover:bg-blue-600"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Connexion
          </Button>
        </motion.div>
      )}

      {/* Search and Filters - Fixed at top */}
      <div className="flex-shrink-0 bg-white z-50 shadow-sm">
        <div className="p-4">
          <SearchFilters 
            onFiltersChange={handleFiltersChange}
            categories={categories}
          />
        </div>
      </div>

      {/* Feed - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <motion.div 
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          style={gpuStyles}
          className="p-4 space-y-4 pb-20"
        >
          <AnimatePresence mode="popLayout">
            {listings.map((listing) => (
              <motion.div
                key={listing.id}
                variants={staggerItemVariants}
                layout
                style={gpuStyles}
              >
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Post Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 cursor-pointer flex-shrink-0" onClick={() => navigate(`/listing/${listing.id}`)}>
                          <AvatarImage src={listing.profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-blue-500 text-white">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm hover:underline cursor-pointer truncate" onClick={() => navigate(`/listing/${listing.id}`)}>
                            {listing.profile?.full_name || 'Utilisateur'}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-1">
                            <span className="truncate">{formatDate(listing.created_at)}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{listing.location}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-5 w-5 text-gray-600" />
                      </Button>
                    </div>

                    {/* Title & Description */}
                    <div className="mt-3">
                      <h3 
                        className="font-semibold text-base mb-1 cursor-pointer hover:underline line-clamp-2"
                        onClick={() => handleCardClick(listing.id)}
                      >
                        {listing.title}
                      </h3>
                      {listing.description && (
                        <p className="text-gray-700 text-sm line-clamp-3 mb-2">
                          {listing.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(listing.price)} FCFA
                        </div>
                        {listing.category && (
                          <Badge variant="secondary" className="text-xs">
                            {listing.category.icon} {listing.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Media */}
                  <div onClick={() => handleCardClick(listing.id)} className="cursor-pointer bg-gray-100">
                    <MediaCarousel
                      media={listing.media}
                      price={0}
                      onVideoMount={(index, video) => {
                        if (index === 0 && video) {
                          registerVideo(listing.id, video);
                        }
                      }}
                    />
                  </div>

                  {/* Stats Bar */}
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        {listing.favorites_count > 0 && (
                          <>
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            <span>{listing.favorites_count}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {listing.comments_count > 0 && (
                          <span className="hover:underline cursor-pointer" onClick={() => handleComment(listing.id)}>
                            {listing.comments_count} commentaire{listing.comments_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="px-2 py-1">
                    <div className="flex items-center justify-around">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 ${
                          listing.is_favorite ? 'text-red-500' : 'text-gray-600'
                        }`}
                        onClick={() => handleFavorite(listing.id)}
                      >
                        <Heart className={`h-5 w-5 ${listing.is_favorite ? 'fill-current' : ''}`} />
                        <span className="font-medium text-sm hidden sm:inline">J'aime</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        onClick={() => handleComment(listing.id)}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-medium text-sm hidden sm:inline">Commenter</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        onClick={() => handleShare(listing.id)}
                      >
                        <Share2 className="h-5 w-5" />
                        <span className="font-medium text-sm hidden sm:inline">Partager</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Section */}
                  <div className="p-3 bg-gray-50">
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
                      onClick={() => handleContact(listing.id)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contacter le vendeur
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {listings.length === 0 && !loading && (
          <div className="text-center py-12 px-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune annonce disponible</h3>
            <p className="text-gray-500 mb-4">Réessayez avec d'autres filtres</p>
            <Button 
              variant="outline" 
              onClick={() => fetchListings()}
            >
              Actualiser
            </Button>
          </div>
        )}
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        action={currentAction}
      />

      {/* Comments Sheet */}
      <Sheet open={showComments} onOpenChange={setShowComments}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Commentaires</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-full overflow-y-auto">
            {selectedListing && (
              <ListingComments 
                listingId={selectedListing}
                onCommentAdded={() => {
                  fetchListings();
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MarketplaceFeed;