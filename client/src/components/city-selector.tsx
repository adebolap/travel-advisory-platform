import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Extended list of cities including more European cities
const cities = [
  "Amsterdam", "Antwerp", "Barcelona", "Berlin", "Brussels",
  "Copenhagen", "Dubai", "Dublin", "Edinburgh", "Florence",
  "Geneva", "Hamburg", "Istanbul", "London", "Madrid",
  "Milan", "Munich", "New York", "Oslo", "Paris",
  "Prague", "Rome", "Singapore", "Stockholm", "Sydney",
  "Tokyo", "Venice", "Vienna", "Zurich"
].sort();

interface CitySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CitySelector({ 
  value, 
  onValueChange, 
  placeholder = "Select a city...",
  disabled = false 
}: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCities = search.length > 0
    ? cities.filter(city => 
        city.toLowerCase().includes(search.toLowerCase())
      )
    : cities;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{value}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {placeholder}
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
          />
          <CommandList>
            {filteredCities.length === 0 ? (
              <CommandEmpty>No cities found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredCities.map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onValueChange(city);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={cn(
                        "h-4 w-4",
                        value === city ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span>{city}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}