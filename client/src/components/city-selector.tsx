import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { popularCities } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CitySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CitySelector({ value, onValueChange, placeholder = "Select a city..." }: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

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
      if (city.includes("France") || city.includes("UK") || city.includes("Spain") || 
          city.includes("Italy") || city.includes("Netherlands") || city.includes("Germany")) {
        regions["Europe 🇪🇺"].push(city);
      } else if (city.includes("UAE") || city.includes("Qatar") || city.includes("Oman") || 
                city.includes("Turkey") || city.includes("Israel")) {
        regions["Middle East 🌅"].push(city);
      } else if (city.includes("Japan") || city.includes("Korea") || city.includes("Singapore") || 
                city.includes("Thailand") || city.includes("China")) {
        regions["Asia 🌏"].push(city);
      } else if (city.includes("USA") || city.includes("Canada") || city.includes("Brazil") || 
                city.includes("Mexico")) {
        regions["Americas 🌎"].push(city);
      } else if (city.includes("Australia") || city.includes("Zealand") || city.includes("Fiji")) {
        regions["Oceania 🏝️"].push(city);
      } else {
        regions["Africa 🌍"].push(city);
      }
    });

    // Sort cities within each region
    Object.keys(regions).forEach(region => {
      regions[region as keyof typeof regions].sort();
    });

    return regions;
  }, []);

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
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search cities..." 
            value={search}
            onValueChange={setSearch}
            className="border-none focus:ring-0"
          />
          <CommandEmpty>No cities found.</CommandEmpty>
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
                  className="cursor-pointer"
                >
                  <MapPin className={cn(
                    "mr-2 h-4 w-4",
                    value === city ? "text-primary" : "text-muted-foreground"
                  )} />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
