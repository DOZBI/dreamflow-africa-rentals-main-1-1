
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ListingCard from './ListingCard';
import { useListings } from '@/hooks/useListings';

const ListingsFeed = () => {
  const { listings, isLoading, fetchListings } = useListings();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement des annonces...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <p className="text-lg font-medium">Aucune annonce disponible</p>
        <p className="text-muted-foreground">Soyez le premier à publier une annonce !</p>
        <Button onClick={fetchListings} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Annonces récentes ({listings.length})
        </h2>
        <Button onClick={fetchListings} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Listings Grid */}
      <div className="space-y-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default ListingsFeed;
