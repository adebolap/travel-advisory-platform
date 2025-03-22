import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/date-picker";
import TravelSuggestions from "@/components/travel-suggestions";
import BudgetEstimator from "@/components/budget-estimator";
import PackingListGenerator from "@/components/packing-list-generator";
import ItineraryBuilder from "@/components/itinerary-builder";
import CitySearch from "@/components/city-search";
import WeatherDisplay from "@/components/weather-display";
import EventList from "@/components/event-list";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

export default function Explore() {
  const { toast } = useToast();
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<string>("Mild");

  const interests = ["culture", "food", "nightlife", "shopping", "transport"];

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setSearchSubmitted(true);
  };

  const handleWeatherUpdate = (weather: string) => {
    setCurrentWeather(weather);
  };

  const saveTripMutation = useMutation({
    mutationFn: async () => {
      if (!city || !dateRange?.from || !dateRange?.to) {
        throw new Error("Please select a city and travel dates");
      }

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
          title: `Trip to ${city}`,
          description: `Planned trip to ${city}`,
          startDate: dateRange.from,
          endDate: dateRange.to,
          events: [], 
          activities: interests,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save trip");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({
        title: "Trip saved!",
        description: "Your trip has been saved to your profile.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
          Explore Destinations
        </h1>
        {city && dateRange?.from && dateRange?.to && (
          <Button
            onClick={() => saveTripMutation.mutate()}
            disabled={saveTripMutation.isPending}
          >
            {saveTripMutation.isPending ? "Saving..." : "Save Trip"}
          </Button>
        )}
      </div>

      <Card className="mb-6 sm:mb-8 funky-card">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <CitySearch onCitySelect={handleCitySelect} />
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
              <EventList
                city={city}
                dateRange={dateRange}
              />
              <ItineraryBuilder
                city={city}
                dateRange={dateRange}
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
              activities={interests}
            />
          </div>
        </div>
      )}
    </div>
  );
}