import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

interface CitySearchProps {
  onCitySelect: (city: string) => void;
}

// Extended list of cities including more European cities
const popularCities = [
  "Amsterdam", "Antwerp", "Barcelona", "Berlin", "Brussels",
  "Copenhagen", "Dubai", "Dublin", "Edinburgh", "Florence",
  "Geneva", "Hamburg", "Istanbul", "London", "Madrid",
  "Milan", "Munich", "New York", "Oslo", "Paris",
  "Prague", "Rome", "Singapore", "Stockholm", "Sydney",
  "Tokyo", "Venice", "Vienna", "Zurich"
].sort();

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = searchTerm
    ? popularCities.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : popularCities;

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
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {filteredCities.map((city) => (
            <button
              key={city}
              onClick={() => {
                setSearchTerm(city);
                onCitySelect(city);
              }}
              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}