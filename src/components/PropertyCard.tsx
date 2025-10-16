import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Square, Star } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  currency = "FCFA",
  image,
  bedrooms,
  bathrooms,
  area,
  rating,
  reviews,
  isNew = false,
  isFeatured = false,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  return (
    <Card className="property-card overflow-hidden border-0 shadow-card bg-card">
      <div className="relative">
        {/* Property Image */}
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && (
            <Badge className="bg-success text-success-foreground font-medium">
              Nouveau
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-accent text-accent-foreground font-medium">
              Coup de cœur
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-smooth ${
            isFavorite ? "text-red-500" : "text-gray-600"
          }`}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-warm">
            {formatPrice(price)} {currency}/mois
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="font-semibold text-card-foreground text-lg mb-1 line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* Property Features */}
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{area}m²</span>
          </div>
        </div>

        {/* Rating and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">({reviews})</span>
          </div>
          <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-smooth">
            Voir détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;