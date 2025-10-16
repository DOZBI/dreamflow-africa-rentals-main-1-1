import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MediaCarousel from '@/components/ui/MediaCarousel';

const FavoriteListingCard = ({ listing }: { listing: MarketplaceListing }) => {
  return (
    <Card className="overflow-hidden shadow-sm">
      <Link to={`/`}> {/* Link to the main feed for now */}
        <MediaCarousel media={listing.media} />
        <CardContent className="p-3">
          <p className="font-semibold truncate">{listing.title}</p>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          <p className="font-bold text-primary mt-2">
            {listing.price.toLocaleString()} FCFA
          </p>
        </CardContent>
      </Link>
    </Card>
  );
};

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { fetchFavoriteListings, loading } = useMarketplace();
  const [favorites, setFavorites] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const favListings = await fetchFavoriteListings();
      setFavorites(favListings || []);
    };
    loadFavorites();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Mes favoris</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement des favoris...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun favori pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">
              Cliquez sur le cœur sur une annonce pour l'ajouter ici.
            </p>
            <Button asChild variant="link" className="mt-4">
              <Link to="/">Découvrir des annonces</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((listing) => (
              <FavoriteListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;