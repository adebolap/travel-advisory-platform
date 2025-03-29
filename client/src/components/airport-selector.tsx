import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Plane, X, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Airport, searchAirports, getAirportByCity } from "@/lib/airport-data";
import GeolocationDetector from "./geolocation-detector";

interface AirportSelectorProps {
  onSelect: (airport: Airport) => void;
  initialCity?: string;
  label?: string;
  className?: string;
}

export default function AirportSelector({ 
  onSelect, 
  initialCity = "",
  label = "Select your airport",
  className = ""
}: AirportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Search for airports based on query
  useEffect(() => {
    const results = searchAirports(query);
    setAirports(results.slice(0, 10)); // Limit to top 10 results for performance
  }, [query]);

  // Set initial value if initialCity is provided
  useEffect(() => {
    if (initialCity) {
      const airport = getAirportByCity(initialCity);
      if (airport) {
        setValue(airport.code);
        // Don't call onSelect here to avoid unexpected behavior
      }
    }
  }, [initialCity]);

  // Handle airport selection
  const handleSelect = (airport: Airport) => {
    setValue(airport.code);
    setOpen(false);
    onSelect(airport);
  };

  // Handle clearing the selection
  const handleClear = () => {
    setValue("");
    setQuery("");
    setOpen(false);
  };

  // Handle location detection
  const handleLocationDetected = (city: string) => {
    const airport = getAirportByCity(city);
    if (airport) {
      setValue(airport.code);
      onSelect(airport);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => setOpen(!open)}
          >
            <div className="flex items-center">
              <Plane className="mr-2 h-4 w-4" />
              {value ? (
                airports.find((airport) => airport.code === value)?.city || 
                airports.find((airport) => airport.code === value)?.name || 
                value
              ) : (
                <span className="text-muted-foreground">{label}</span>
              )}
            </div>
            <div className="flex items-center">
              {value && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search airports..." 
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>No airports found.</CommandEmpty>
              <CommandGroup>
                {airports.map((airport) => (
                  <CommandItem
                    key={airport.code}
                    value={airport.code}
                    onSelect={() => handleSelect(airport)}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === airport.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="font-medium">{airport.city}</span>
                        <span className="ml-2 text-xs bg-muted rounded px-1">
                          {airport.code}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-6">
                        {airport.name}, {airport.country}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <GeolocationDetector onLocationDetected={handleLocationDetected} />
    </div>
  );
}