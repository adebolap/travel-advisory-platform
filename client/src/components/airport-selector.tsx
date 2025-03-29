import { useState, useEffect, useRef } from 'react';
import { Search, Map, Plane } from 'lucide-react';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Airport, searchAirports } from '@/lib/airport-data';

interface AirportSelectorProps {
  onSelect: (airport: Airport) => void;
  initialCity?: string;
  label?: string;
  className?: string;
}

export default function AirportSelector({ 
  onSelect, 
  initialCity, 
  label = "Select your departure airport",
  className = ""
}: AirportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search as user types
  useEffect(() => {
    setAirports(searchAirports(query));
  }, [query]);

  // If an initial city is provided, try to use it
  useEffect(() => {
    if (initialCity && !selectedAirport) {
      const airports = searchAirports(initialCity);
      if (airports.length > 0) {
        setSelectedAirport(airports[0]);
        onSelect(airports[0]);
      }
    }
  }, [initialCity, selectedAirport, onSelect]);

  const handleSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    setOpen(false);
    onSelect(airport);
  };

  return (
    <div className={`${className} space-y-2`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedAirport ? (
              <div className="flex items-center space-x-2 text-left">
                <Plane className="h-4 w-4 shrink-0 opacity-50" />
                <div className="flex flex-col">
                  <span className="font-medium">{selectedAirport.city}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {selectedAirport.name} ({selectedAirport.code})
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Map className="h-4 w-4 shrink-0 opacity-50" />
                <span>{label}</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command>
            <CommandInput 
              placeholder="Search airports or cities..." 
              value={query}
              onValueChange={setQuery}
              ref={inputRef}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                {query.length < 2 ? (
                  <div className="py-6 text-center text-sm">
                    Type at least 2 characters to search
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm">
                    No results found
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {airports.map((airport) => (
                  <CommandItem
                    key={airport.code}
                    value={`${airport.city} ${airport.code}`}
                    onSelect={() => handleSelect(airport)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-medium">{airport.city}</span>
                        <span className="ml-2 text-xs bg-muted px-1 rounded">
                          {airport.code}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {airport.country}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {airport.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}