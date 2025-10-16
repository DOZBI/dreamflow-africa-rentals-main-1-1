import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter, MapPin, Home, DollarSign } from "lucide-react";

const SearchFilters = () => {
  const [priceRange, setPriceRange] = useState([50000, 500000]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const propertyTypes = [
    "Appartement",
    "Maison",
    "Studio",
    "Villa",
    "Duplex",
    "Bureau",
  ];

  const amenities = [
    "Climatisation",
    "Parking",
    "Piscine",
    "Jardin",
    "Sécurité 24h",
    "Internet",
    "Générateur",
    "Eau courante",
  ];

  const addFilter = (filter: string) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  return (
    <div className="w-full">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full justify-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres {selectedFilters.length > 0 && `(${selectedFilters.length})`}
        </Button>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {selectedFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="pr-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                onClick={() => removeFilter(filter)}
              >
                {filter}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFilters([])}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              Tout effacer
            </Button>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <Card className={`${isFiltersOpen ? 'block' : 'hidden'} md:block shadow-card`}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2 text-primary" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Localisation
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brazzaville">Brazzaville</SelectItem>
                <SelectItem value="pointe-noire">Pointe-Noire</SelectItem>
                <SelectItem value="dolisie">Dolisie</SelectItem>
                <SelectItem value="nkayi">Nkayi</SelectItem>
                <SelectItem value="ouesso">Ouesso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Home className="h-4 w-4 mr-2 text-primary" />
              Type de bien
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addFilter(type)}
                  className={`justify-start h-auto py-2 ${
                    selectedFilters.includes(type) 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'hover:bg-primary/10'
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              Fourchette de prix (FCFA/mois)
            </Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000000}
                min={10000}
                step={10000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatPrice(priceRange[0])} FCFA</span>
              <span>{formatPrice(priceRange[1])} FCFA</span>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nombre de chambres</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="sm"
                  onClick={() => addFilter(`${num} chambre${num > 1 ? 's' : ''}`)}
                  className={`w-12 h-10 ${
                    selectedFilters.includes(`${num} chambre${num > 1 ? 's' : ''}`)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-primary/10'
                  }`}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Équipements</Label>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity) => (
                <Button
                  key={amenity}
                  variant="outline"
                  size="sm"
                  onClick={() => addFilter(amenity)}
                  className={`justify-start h-auto py-2 text-xs ${
                    selectedFilters.includes(amenity)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-primary/10'
                  }`}
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </div>

          {/* Apply Filters */}
          <div className="pt-4 border-t">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Appliquer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchFilters;