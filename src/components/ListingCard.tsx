import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone } from 'lucide-react';
import { Listing } from '@/hooks/useListings';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import MediaCarousel from '@/components/ui/MediaCarousel';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleContact = () => {
    // Redirige vers la page de messages avec le paramètre listing
    navigate(`/messages?listing=${listing.id}`);
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Créer un tableau de médias à partir des données de l'annonce
  const mediaItems = listing.media_url ? [{ 
    url: listing.media_url, 
    type: listing.media_type as 'image' | 'video' 
  }] : [];

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      {/* User Info Header */}
      <div className="p-3 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={listing.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {getUserInitials(listing.profiles?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-sm">
            {listing.profiles?.full_name || 'Utilisateur'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(listing.created_at)}
          </p>
        </div>
      </div>

      {/* Media Carousel */}
      {mediaItems.length > 0 && (
        <MediaCarousel 
          media={mediaItems}
          price={listing.price}
        />
      )}

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight">{listing.title}</h3>

        {/* Description */}
        {listing.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{listing.location}</span>
        </div>

        {/* Contact Button */}
        <Button 
          onClick={handleContact}
          className="w-full h-11 text-base font-medium"
        >
          <Phone className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ListingCard;