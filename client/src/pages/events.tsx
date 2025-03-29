import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import EventList from "@/components/event-list";
import CitySearch from "@/components/city-search";

export default function Events() {
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setSearchSubmitted(true); // Automatically trigger search when city is selected
  };

  const handleSearch = () => {
    if (city) {
      setSearchSubmitted(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Discover Events</h1>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <CitySearch onCitySelect={handleCitySelect} />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={!city}
                  variant="secondary"
                >
                  Update
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Dates</label>
              <DatePicker 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {searchSubmitted && city && (
        <EventList city={city} dateRange={dateRange} />
      )}
    </div>
  );
}