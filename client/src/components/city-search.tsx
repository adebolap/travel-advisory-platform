import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, MapPin, Loader2, Globe2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CitySearchProps {
  onCitySelect: (city: string) => void;
}

interface City {
  id: string;
  name: string;
  description: string;
  country: string;
}

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const { data: cities, isLoading } = useQuery({
    queryKey: ['/api/cities/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await fetch(`/api/cities/search?query=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json();
    },
    enabled: searchTerm.length >= 2
  });

  const handleCitySelect = (city: City) => {
    setSearchTerm(city.name);
    onCitySelect(city.name);
    setIsDropdownVisible(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-3 top-3 flex items-center gap-1 text-muted-foreground">
          <Globe2 className="h-4 w-4" />
          <Search className="h-4 w-4" />
        </div>
        {isLoading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <Input
          placeholder="✈️ Search for a city..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownVisible(true);
          }}
          onFocus={() => setIsDropdownVisible(true)}
          onBlur={() => {
            // Delay hiding the dropdown to allow click events to fire
            setTimeout(() => setIsDropdownVisible(false), 200);
          }}
          className="pl-14"
        />
        {isDropdownVisible && cities && cities.length > 0 && (
          <div 
            className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[300px] overflow-y-auto animate-in fade-in-0 slide-in-from-top-2"
          >
            {cities.map((city: City) => (
              <button
                key={city.id}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur from firing immediately
                  handleCitySelect(city);
                }}
                className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{city.name}</div>
                    <div className="text-sm text-muted-foreground">🌍 {city.country}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}