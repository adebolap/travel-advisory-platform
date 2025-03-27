import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, MapPin, Loader2, Globe2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, getLocalCurrency } from "@/lib/currency";

interface CitySearchProps {
  onCitySelect: (city: string) => void;
}

interface City {
  id: string;
  name: string;
  description: string;
  country: string;
  countryCode: string;
  averageCost?: number;
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

  const renderCityCost = (city: City) => {
    if (!city.averageCost) return null;

    const localCurrency = getLocalCurrency(city.countryCode);
    return (
      <div className="text-sm text-muted-foreground">
        💰 From {formatCurrency(city.averageCost, "USD")}
        {localCurrency !== "USD" && ` (${formatCurrency(city.averageCost, localCurrency)})`}
        <span className="text-xs"> per day</span>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground z-10">
          <Globe2 className="h-4 w-4" />
          <Search className="h-4 w-4" />
        </div>
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
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
            // Increase timeout to give user more time to interact with dropdown
            setTimeout(() => setIsDropdownVisible(false), 500);
          }}
          className="pl-14 pr-10 h-12 text-base sm:h-10 sm:text-sm rounded-lg w-full"
        />
      </div>
      {searchTerm.length >= 2 && cities && cities.length > 0 && (
        <div 
          className="absolute left-0 right-0 z-[100] mt-1 bg-background border rounded-lg shadow-xl 
                   overflow-y-auto animate-in fade-in-0 slide-in-from-top-2
                   overscroll-contain w-full"
          style={{
            minHeight: '200px',
            maxHeight: 'min(400px, 60vh)',
            position: 'absolute',
            top: '100%'
          }}
          onMouseDown={(e) => {
            // Prevent parent blur event from hiding dropdown when clicking on the dropdown itself
            e.preventDefault();
          }}
        >
          {cities.map((city: City) => (
            <button
              key={city.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleCitySelect(city);
              }}
              className="w-full px-4 py-3 text-left hover:bg-accent/50 
                       hover:text-accent-foreground transition-colors
                       flex items-center gap-2 touch-manipulation
                       first:rounded-t-lg last:rounded-b-lg
                       border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3 min-h-[44px] w-full">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base truncate">{city.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    🌍 {city.country}
                  </div>
                  {renderCityCost(city)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}