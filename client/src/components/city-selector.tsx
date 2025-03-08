import { useState, useMemo, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { popularCities, cityToContinentMap } from "@shared/schema";
import { cn } from "@/lib/utils";
import geoip from 'geoip-lite';

interface CitySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CitySelector({ value, onValueChange, placeholder = "Select a city..." }: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userContinent, setUserContinent] = useState<string | null>(null);

  useEffect(() => {
    // Get user's IP and determine continent
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        const geo = geoip.lookup(data.ip);
        if (geo) {
          const continentMap: Record<string, string> = {
            'EU': 'Europe 🇪🇺',
            'AS': 'Asia 🌏',
            'NA': 'Americas 🌎',
            'SA': 'Americas 🌎',
            'OC': 'Oceania 🏝️',
            'AF': 'Africa 🌍'
          };
          setUserContinent(continentMap[geo.continent] || null);
        }
      })
      .catch(() => setUserContinent(null));
  }, []);

  // Sort cities and group by region
  const sortedCities = useMemo(() => {
    const regions = {
      "Europe 🇪🇺": [] as string[],
      "Middle East 🌅": [] as string[],
      "Asia 🌏": [] as string[],
      "Americas 🌎": [] as string[],
      "Oceania 🏝️": [] as string[],
      "Africa 🌍": [] as string[],
    };

    popularCities.forEach(city => {
      const country = city.split(", ")[1];
      // Find which region this country belongs to
      for (const [region, countries] of Object.entries(cityToContinentMap)) {
        if (countries.some(c => country.includes(c))) {
          regions[region as keyof typeof regions].push(city);
          break;
        }
      }
    });

    // Sort cities within each region
    Object.keys(regions).forEach(region => {
      regions[region as keyof typeof regions].sort();
    });

    // If user's continent is known, move it to the top
    if (userContinent) {
      const orderedRegions: typeof regions = {} as any;
      orderedRegions[userContinent] = regions[userContinent];
      Object.keys(regions).forEach(region => {
        if (region !== userContinent) {
          orderedRegions[region] = regions[region];
        }
      });
      return orderedRegions;
    }

    return regions;
  }, [userContinent]);

  const filteredCities = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered: typeof sortedCities = {} as any;

    Object.entries(sortedCities).forEach(([region, cities]) => {
      const matchedCities = cities.filter(city => 
        city.toLowerCase().includes(searchLower)
      );
      if (matchedCities.length > 0) {
        filtered[region] = matchedCities;
      }
    });

    return filtered;
  }, [sortedCities, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between hover:border-primary transition-colors"
        >
          {value ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {value}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Search className="h-4 w-4" />
              {placeholder}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search cities..." 
            value={search}
            onValueChange={setSearch}
            className="border-none focus:ring-0"
          />
          <CommandEmpty>No cities found.</CommandEmpty>
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
            {Object.entries(filteredCities).map(([region, cities]) => (
              <CommandGroup key={region} heading={region}>
                {cities.map(city => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer py-2 px-3 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={cn(
                        "h-4 w-4",
                        value === city ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="flex-1">{city}</span>
                      {userContinent && region === userContinent && (
                        <span className="text-xs text-muted-foreground">Local</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}