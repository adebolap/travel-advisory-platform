import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Loader2, Globe2, X, Compass } from "lucide-react";
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

// Popular cities data for when no search term is entered
const popularCities: City[] = [
  { id: 'paris', name: 'Paris', description: 'City of Lights', country: 'France', countryCode: 'FR', averageCost: 150 },
  { id: 'tokyo', name: 'Tokyo', description: 'Modern metropolis', country: 'Japan', countryCode: 'JP', averageCost: 130 },
  { id: 'london', name: 'London', description: 'Historic capital', country: 'United Kingdom', countryCode: 'GB', averageCost: 165 },
  { id: 'new-york', name: 'New York', description: 'The Big Apple', country: 'United States', countryCode: 'US', averageCost: 190 },
  { id: 'barcelona', name: 'Barcelona', description: 'Catalonia\'s vibrant capital', country: 'Spain', countryCode: 'ES', averageCost: 120 },
  { id: 'singapore', name: 'Singapore', description: 'Garden city', country: 'Singapore', countryCode: 'SG', averageCost: 140 },
  { id: 'dubai', name: 'Dubai', description: 'Futuristic desert city', country: 'United Arab Emirates', countryCode: 'AE', averageCost: 180 },
  { id: 'sydney', name: 'Sydney', description: 'Harbour city', country: 'Australia', countryCode: 'AU', averageCost: 145 },
  { id: 'rome', name: 'Rome', description: 'The Eternal City', country: 'Italy', countryCode: 'IT', averageCost: 125 },
  { id: 'bangkok', name: 'Bangkok', description: 'City of Angels', country: 'Thailand', countryCode: 'TH', averageCost: 85 },
];

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

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
    setSelectedCity(city);
    onCitySelect(city.name);
    setIsDropdownVisible(false);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) clearTimeout(dropdownTimeout);
    };
  }, [dropdownTimeout]);

  const handleInputBlur = () => {
    // Clear any existing timeout
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
    
    // Set a new timeout with longer delay (3000ms - give user more time to interact)
    const timeout = setTimeout(() => setIsDropdownVisible(false), 3000);
    setDropdownTimeout(timeout);
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

  // Determine which cities to show in the dropdown 
  // Always show popular cities when no search term, even if dropdown is showing without a search term
  const citiesToShow = searchTerm.length >= 2 ? cities : popularCities;

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
        {selectedCity ? (
          <div className="border-2 border-primary/60 rounded-lg px-4 py-2 h-12 sm:h-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{selectedCity.name}</span>
                <span className="text-xs text-muted-foreground ml-1">({selectedCity.country})</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7" 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                setSelectedCity(null);
                setSearchTerm("");
                setIsDropdownVisible(true);
              }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <Input
            placeholder="✈️ Search for a city..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownVisible(true);
            }}
            onClick={() => setIsDropdownVisible(true)} 
            onFocus={() => setIsDropdownVisible(true)}
            onBlur={handleInputBlur}
            className="pl-14 pr-10 h-12 text-base sm:h-10 sm:text-sm rounded-lg w-full cursor-pointer"
          />
        )}
      </div>
      
      {isDropdownVisible && (
        <div 
          className="absolute left-0 right-0 z-[100] mt-1 bg-background border rounded-lg shadow-xl 
                   overflow-y-auto animate-in fade-in-0 slide-in-from-top-2
                   overscroll-contain w-full"
          style={{
            minHeight: isLoading ? '80px' : '320px',
            maxHeight: 'min(500px, 70vh)',
            position: 'absolute',
            top: '100%'
          }}
          onMouseDown={(e: React.MouseEvent) => {
            // Prevent parent blur event from hiding dropdown when clicking on the dropdown itself
            e.preventDefault();
          }}
          onMouseEnter={() => {
            // Clear the timeout when mouse enters dropdown
            if (dropdownTimeout) {
              clearTimeout(dropdownTimeout);
              setDropdownTimeout(null);
            }
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <p className="text-muted-foreground">Searching cities...</p>
            </div>
          ) : citiesToShow && citiesToShow.length > 0 ? (
            <>
              {searchTerm.length < 2 && (
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Compass className="h-4 w-4" />
                    <h3 className="font-medium">Popular Destinations</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Click any destination below or type to search for more cities</p>
                </div>
              )}
              
              {citiesToShow.map((city: City) => (
                <button
                  key={city.id}
                  onMouseDown={(e: React.MouseEvent) => {
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
            </>
          ) : searchTerm.length >= 2 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-muted-foreground">No cities found matching "{searchTerm}"</p>
              <p className="text-xs text-muted-foreground mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Globe2 className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Start typing to search for cities</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}