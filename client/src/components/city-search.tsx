import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FixedSizeList as List } from "react-window";

interface CitySearchProps {
  onCitySelect: (city: string) => void;
}

// Fallback popular cities if API fails
const popularCities = [
  "Amsterdam", "Antwerp", "Barcelona", "Berlin", "Brussels",
  "Copenhagen", "Dubai", "Dublin", "Edinburgh", "Florence",
  "Geneva", "Hamburg", "Istanbul", "London", "Madrid",
  "Milan", "Munich", "New York", "Oslo", "Paris",
  "Prague", "Rome", "Singapore", "Stockholm", "Sydney",
  "Tokyo", "Venice", "Vienna", "Zurich"
].sort();

interface City {
  id: string;
  name: string;
  country: string;
}

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch cities from API when search term changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchTerm.length < 2) {
      setCities([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(searchTerm)}&limit=20`, {
          headers: {
            'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
            'x-rapidapi-key': '13728fb9e5mshd1e9e62b966a4ddp18af58jsndfb3d5e9d681'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }

        const data = await response.json();
        setCities(data.data.map((city: any) => ({
          id: city.id,
          name: city.name,
          country: city.country
        })));
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to fetch cities. Showing popular cities instead.');
        // Use fallback cities
        setCities(popularCities.map(city => ({
          id: city,
          name: city,
          country: ''
        })));
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const handleCitySelect = (city: City) => {
    setSearchTerm(city.name);
    onCitySelect(city.name);
    setIsDropdownVisible(false);
    inputRef.current?.blur();
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Display either API results or fallback to filtered popular cities
  const displayCities = cities.length > 0 
    ? cities 
    : popularCities
        .filter(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(city => ({ id: city, name: city, country: '' }));

  // Row renderer for virtualized list
  const CityRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const city = displayCities[index];
    return (
      <button
        key={city.id}
        style={style}
        onMouseDown={(e) => {
          e.preventDefault();
          handleCitySelect(city);
        }}
        className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors focus:bg-accent focus:text-accent-foreground focus:outline-none"
      >
        <div className="flex flex-col">
          <span>{city.name}</span>
          {city.country && (
            <span className="text-xs text-muted-foreground">{city.country}</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search for a city..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownVisible(true);
          }}
          onFocus={() => setIsDropdownVisible(true)}
          className="pl-9"
          autoComplete="off"
          aria-expanded={isDropdownVisible}
          aria-controls="city-dropdown"
          aria-autocomplete="list"
        />
        <AnimatePresence>
          {isDropdownVisible && (
            <motion.div
              ref={dropdownRef}
              id="city-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg"
              style={{ maxHeight: '300px' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading cities...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {error}
                </div>
              ) : displayCities.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No cities found. Try a different search term.
                </div>
              ) : (
                <List
                  ref={listRef}
                  height={Math.min(300, displayCities.length * 50)}
                  width="100%"
                  itemCount={displayCities.length}
                  itemSize={50}
                  overscanCount={5}
                >
                  {CityRow}
                </List>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}