import { useState, useMemo, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Globe } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { popularCities, cityToContinentMap } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useVirtualizer } from '@tanstack/react-virtual';

interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  population?: number;
  isRecent?: boolean;
}

interface CitySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

type RegionMap = Record<string, City[]>;

export function CitySelector({ 
  value, 
  onValueChange, 
  placeholder = "Select a city...",
  disabled = false 
}: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userContinent, setUserContinent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSelections, setRecentSelections] = useState<City[]>(() => {
    try {
      const saved = localStorage.getItem('recentCities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Get user's continent
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/user-location')
      .then(response => response.json())
      .then(data => {
        if (data.continent) {
          setUserContinent(data.continent);
        }
      })
      .catch(error => {
        console.error("Failed to fetch user location:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Save recent selections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('recentCities', JSON.stringify(recentSelections));
    } catch (error) {
      console.warn('Failed to save recent cities:', error);
    }
  }, [recentSelections]);

  // Helper function to get continent for a country
  const getContinentForCountry = (country: string): string => {
    if (!country) return "Other 🌐";

    for (const [continent, countries] of Object.entries(cityToContinentMap)) {
      if (countries.some(c => country.includes(c))) {
        return continent;
      }
    }
    return "Other 🌐";
  };

  // Convert static city list to City objects
  const staticCities = useMemo<City[]>(() => {
    return popularCities.map(cityString => {
      const [cityName, country] = cityString.split(", ");
      return {
        id: cityString,
        name: cityString,
        country: country || "",
        region: country ? getContinentForCountry(country) : "Other 🌐"
      };
    });
  }, []);

  // Group cities by continent
  const sortedCities = useMemo<RegionMap>(() => {
    const regions: RegionMap = {
      ...(recentSelections.length > 0 ? { "Recent Selections ⭐": recentSelections } : {}),
      "Europe 🇪🇺": [],
      "Middle East 🌅": [],
      "Asia 🌏": [],
      "Americas 🌎": [],
      "Oceania 🏝️": [],
      "Africa 🌍": [],
      "Other 🌐": []
    };

    staticCities.forEach(city => {
      if (city.region && regions[city.region]) {
        regions[city.region].push(city);
      } else {
        regions["Other 🌐"].push(city);
      }
    });

    // Sort cities alphabetically within each region
    Object.keys(regions).forEach(region => {
      if (region !== "Recent Selections ⭐") {
        regions[region].sort((a, b) => a.name.localeCompare(b.name));
      }
    });

    // Prioritize user's continent
    if (userContinent) {
      const orderedRegions: RegionMap = { 
        ...(regions["Recent Selections ⭐"] ? { "Recent Selections ⭐": regions["Recent Selections ⭐"] } : {}),
        ...(regions[userContinent] ? { [userContinent]: regions[userContinent] } : {})
      };

      Object.keys(regions).forEach(region => {
        if (region !== userContinent && region !== "Recent Selections ⭐") {
          if (regions[region] && regions[region].length > 0) {
            orderedRegions[region] = regions[region];
          }
        }
      });

      return orderedRegions;
    }

    return regions;
  }, [userContinent, recentSelections, staticCities]);

  // Filter cities based on search
  const filteredCities = useMemo<RegionMap>(() => {
    if (!search.trim()) return sortedCities;

    const searchLower = search.toLowerCase();
    return Object.fromEntries(
      Object.entries(sortedCities).map(([region, cities]) => [
        region,
        cities.filter(city => city.name.toLowerCase().includes(searchLower))
      ]).filter(([_, cities]) => cities.length > 0)
    );
  }, [sortedCities, search]);

  // Prepare data for virtualization
  const flattenedItems = useMemo(() => {
    const items: Array<{ type: 'header' | 'item', value: City | string }> = [];

    Object.entries(filteredCities).forEach(([region, cities]) => {
      if (cities.length > 0) {
        items.push({ type: 'header', value: region });
        cities.forEach(city => {
          items.push({ type: 'item', value: city });
        });
      }
    });

    return items;
  }, [filteredCities]);

  // Virtual list ref
  const parentRef = useRef<HTMLDivElement>(null);

  // Set up virtualizer
  const virtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => flattenedItems[index].type === 'header' ? 30 : 40,
    overscan: 10,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between transition-colors",
            value ? "text-foreground" : "text-muted-foreground",
            !disabled && "hover:border-primary focus:ring-1 focus:ring-primary/20"
          )}
        >
          {value ? (
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="truncate">{value}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 flex-shrink-0" />
              {isLoading ? "Loading locations..." : placeholder}
              {isLoading && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search cities..." 
            value={search}
            onValueChange={setSearch}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-[300px] overflow-hidden" ref={parentRef}>
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = flattenedItems[virtualRow.index];
                const style = {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                };

                if (item.type === 'header') {
                  return (
                    <CommandGroup 
                      key={virtualRow.index} 
                      heading={item.value as string}
                      style={style}
                    />
                  );
                }

                const city = item.value as City;
                return (
                  <CommandItem
                    key={virtualRow.index}
                    value={city.name}
                    onSelect={() => {
                      onValueChange(city.name);
                      setOpen(false);
                      // Add to recent selections
                      setRecentSelections(prev => {
                        const newRecent = prev.filter(c => c.id !== city.id);
                        return [{ ...city, isRecent: true }, ...newRecent].slice(0, 5);
                      });
                    }}
                    style={style}
                    className="cursor-pointer py-2 px-3 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={cn(
                        "h-4 w-4",
                        value === city.name ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div className="flex-1 truncate">
                        <div className="truncate">{city.name}</div>
                        {city.population && (
                          <div className="text-xs text-muted-foreground">
                            Pop: {city.population.toLocaleString()}
                          </div>
                        )}
                      </div>
                      {userContinent && city.region === userContinent && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Local</span>
                      )}
                      {city.isRecent && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Recent</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}