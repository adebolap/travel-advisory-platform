import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

interface CitySearchProps {
  onCitySelect: (city: string) => void;
}

const popularCities = [
  "Paris", "Tokyo", "New York", "London", "Barcelona",
  "Rome", "Dubai", "Singapore", "Sydney", "Istanbul"
];

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = popularCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for a city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {searchTerm && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filteredCities.map((city) => (
            <button
              key={city}
              onClick={() => {
                onCitySelect(city);
                setSearchTerm(city);
              }}
              className="p-2 text-sm rounded-md hover:bg-accent text-left"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
