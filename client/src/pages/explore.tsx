import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import TravelSuggestions from "@/components/travel-suggestions";
import BudgetEstimator from "@/components/budget-estimator";
import PackingListGenerator from "@/components/packing-list-generator";
import CitySearch from "@/components/city-search";
import WeatherDisplay from "@/components/weather-display";

export default function Explore() {
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<string>("Mild");

  // Mock interests for now - will be personalized later
  const interests = ["culture", "food", "nightlife", "shopping", "transport"];

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setSearchSubmitted(true); // Automatically trigger search when city is selected
  };

  const handleWeatherUpdate = (weather: string) => {
    setCurrentWeather(weather);
  };

  const handleSearch = () => {
    if (city) {
      setSearchSubmitted(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8">Explore Destinations</h1>

      <Card className="mb-6 sm:mb-8">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4 sm:space-y-8">
              <WeatherDisplay 
                city={city}
                onWeatherUpdate={handleWeatherUpdate}
              />
              <TravelSuggestions 
                city={city}
                interests={interests}
              />
            </div>
          </div>
          <div className="space-y-4 sm:space-y-8">
            <BudgetEstimator 
              city={city} 
              dateRange={dateRange}
            />
            <PackingListGenerator
              city={city}
              dateRange={dateRange}
              currentWeather={currentWeather}
            />
          </div>
        </div>
      )}
    </div>
  );
}