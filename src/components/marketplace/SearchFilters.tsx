
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, X } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Array<{id: string; name: string; icon: string}>;
}

interface FilterOptions {
  search?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}

const SearchFilters = ({ onFiltersChange, categories }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const locations = [
    'Brazzaville',
    'Pointe-Noire',
    'Dolisie',
    'Nkayi',
    'Ouesso',
    'Impfondo',
    'Madingou',
    'Owando'
  ];

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleSearchChange = (value: string) => {
    updateFilters({ search: value });
  };

  const handleCategoryChange = (value: string) => {
    updateFilters({ category: value === 'all' ? undefined : value });
  };

  const handleLocationChange = (value: string) => {
    updateFilters({ location: value === 'all' ? undefined : value });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    updateFilters({ 
      minPrice: values[0] > 0 ? values[0] : undefined,
      maxPrice: values[1] < 1000000 ? values[1] : undefined
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setPriceRange([0, 1000000]);
    setActiveFilters([]);
    onFiltersChange({});
  };

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey as keyof FilterOptions];
    
    if (filterKey === 'price') {
      setPriceRange([0, 1000000]);
      delete newFilters.minPrice;
      delete newFilters.maxPrice;
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
    return price.toString();
  };

  // Update active filters display
  useEffect(() => {
    const active = [];
    if (filters.search) active.push(`Recherche: ${filters.search}`);
    if (filters.category) {
      const categoryName = categories.find(c => c.id === filters.category)?.name;
      if (categoryName) active.push(`Catégorie: ${categoryName}`);
    }
    if (filters.location) active.push(`Lieu: ${filters.location}`);
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || 1000000;
      active.push(`Prix: ${formatPrice(min)} - ${formatPrice(max)} FCFA`);
    }
    setActiveFilters(active);
  }, [filters, categories]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher des annonces..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Select value={filters.location || 'all'} onValueChange={handleLocationChange}>
          <SelectTrigger className="w-40 flex-shrink-0">
            <MapPin className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Lieu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les lieux</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-40 flex-shrink-0">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex-shrink-0"
        >
          <Filter className="h-4 w-4 mr-1" />
          Plus de filtres
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="pr-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                if (filter.startsWith('Recherche:')) removeFilter('search');
                else if (filter.startsWith('Catégorie:')) removeFilter('category');
                else if (filter.startsWith('Lieu:')) removeFilter('location');
                else if (filter.startsWith('Prix:')) removeFilter('price');
              }}
            >
              {filter}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-auto p-1 text-xs text-muted-foreground"
          >
            Tout effacer
          </Button>
        </div>
      )}

      {/* Extended Filters */}
      {isFiltersOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Fourchette de prix (FCFA)
              </Label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={1000000}
                  min={0}
                  step={10000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatPrice(priceRange[0])} FCFA</span>
                <span>{formatPrice(priceRange[1])} FCFA</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchFilters;
