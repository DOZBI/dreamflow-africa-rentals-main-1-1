
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  MessageCircle, 
  Star,
  Clock
} from "lucide-react";
import type { PropertyVideo } from "@/hooks/useVideoFeed";

interface PropertyOverlayProps {
  property: PropertyVideo;
  onContactOwner: () => void;
}

const PropertyOverlay = ({ property, onContactOwner }: PropertyOverlayProps) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
      
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content container */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-auto">
        
        {/* Top section - Owner info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={property.owner.avatar} alt={property.owner.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {property.owner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                {property.owner.name}
              </p>
              <div className="flex items-center space-x-2 text-xs text-white/80">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{property.owner.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{property.owner.responseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Property info */}
        <div className="space-y-4">
          {/* Property details */}
          <div className="space-y-2">
            <h2 className="text-white text-xl font-bold leading-tight">
              {property.title}
            </h2>
            
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>

            {/* Price badge */}
            <div className="inline-block">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground px-3 py-1 text-base font-semibold">
                {formatPrice(property.price)} {property.currency}/mois
              </Badge>
            </div>

            {/* Property features */}
            <div className="flex items-center space-x-4 text-white/90 text-sm">
              <div className="flex items-center space-x-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Square className="h-4 w-4" />
                <span>{property.area}m²</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button 
            onClick={onContactOwner}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 rounded-xl transition-smooth shadow-lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Discuter avec le propriétaire
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyOverlay;
