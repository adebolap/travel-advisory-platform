import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import TravelSuggestions from "@/components/travel-suggestions";
import CitySearch from "@/components/city-search";

export default function Explore() {
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Mock interests for now - will be personalized later
  const interests = ["culture", "food", "nightlife", "shopping", "transport"];

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
  };

  const handleSearch = () => {
    if (city) {
      setSearchSubmitted(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Explore Destinations</h1>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <CitySearch onCitySelect={handleCitySelect} />
                </div>
                <Button onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Travel Dates</label>
              <DatePicker 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {searchSubmitted && city && (
        <TravelSuggestions 
          city={city}
          interests={interests}
        />
      )}
    </div>
  );
}