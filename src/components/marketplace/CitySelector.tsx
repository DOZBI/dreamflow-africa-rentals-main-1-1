
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface CitySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const CitySelector = ({ value, onValueChange, placeholder = "Sélectionnez une ville" }: CitySelectorProps) => {
  const cities = [
    // Quartiers de Brazzaville
    'Bacongo', 'Poto-Poto', 'Moungali', 'Ouenzé', 'Talangaï', 'Mfilou', 'Djiri', 'Madibou', 
    'Makélékélé', 'Centre-ville Brazzaville', 'Plateau des 15 ans', 'Case de Gaulle', 
    'Brazzaville-Sud', 'Nkombo', 'Kombé', 'Vindoulou', 'Kintambo', 'Mpissa',
    
    // Quartiers de Pointe-Noire
    'Lumumba', 'Mongo-Kamba', 'Tié-Tié', 'Mpita', 'Vindoulou', 'Ngoyo', 'Fond Tié-Tié',
    'Centre-ville Pointe-Noire', 'Côte Matève', 'Camp de Gaulle', 'Siafoumou', 'Mvou-Mvou',
    'Nchanga', 'Tchimbamba', 'Fouta', 'Ngondji', 'Mvoumvou', 'Kassaï',
    
    // Autres villes principales du Congo
    'Dolisie', 'Nkayi', 'Ouesso', 'Impfondo', 'Madingou', 'Owando', 'Sibiti', 'Gamboma',
    'Ewo', 'Kinkala', 'Boko', 'Loudima', 'Jacob', 'Mossendjo', 'Komono', 'Souanké',
    
    // Villes de la RDC
    'Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Bukavu', 'Kananga', 'Kolwezi',
    'Likasi', 'Tshikapa', 'Beni', 'Goma', 'Uvira', 'Butembo', 'Matadi', 'Mbandaka',
    
    // Villes du Cameroun
    'Yaoundé', 'Douala', 'Bamenda', 'Garoua', 'Maroua', 'Bafoussam', 'Kumba', 'Ngaoundéré',
    'Bertoua', 'Loum', 'Edéa', 'Foumban', 'Kribi', 'Limbé', 'Ebolowa',
    
    // Villes du Gabon
    'Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné',
    'Tchibanga', 'Koulamoutou', 'Makokou', 'Bitam', 'Gamba', 'Mitzic', 'Ndendé',
    
    // Villes de Centrafrique
    'Bangui', 'Berbérati', 'Carnot', 'Bambari', 'Bouar', 'Bossangoa', 'Bria', 'Bangassou',
    'Nola', 'Kaga-Bandoro', 'Sibut', 'Mbaiki', 'Zemio', 'Bozoum',
    
    // Villes du Tchad
    "N'Djamena", 'Moundou', 'Sarh', 'Abéché', 'Kelo', 'Koumra', 'Pala', 'Am Timan',
    'Bongor', 'Mongo', 'Doba', 'Ati', 'Laï', 'Massakory'
  ].sort();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {cities.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CitySelector;
