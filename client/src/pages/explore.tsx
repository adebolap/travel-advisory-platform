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
import TravelPricing from "@/components/travel-pricing";
import AirportSelector from "@/components/airport-selector";
import DestinationComparison from "@/components/destination-comparison";
import { Airport } from "@/lib/airport-data";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Explore() {
  const { toast } = useToast();
  const [city, setCity] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<string>("Mild");
  const [showOriginInput, setShowOriginInput] = useState(false);

  const interests = ["culture", "food", "nightlife", "shopping", "transport"];

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowOriginInput(true);
  };

  const handleOriginCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOriginCity(e.target.value);
  };
  
  const handleAirportSelect = (airport: Airport) => {
    setOriginCity(airport.city);
  };

  const handleOriginSubmit = () => {
    if (originCity.trim()) {
      setSearchSubmitted(true);
      toast({
        title: "Origin selected",
        description: `Planning your trip from ${originCity} to ${city}`,
      });
    } else {
      toast({
        title: "Origin required",
        description: "Please enter your departure city",
        variant: "destructive",
      });
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold gradient-text">
          Explore Destinations
        </h1>
        {city && dateRange?.from && dateRange?.to && (
          <Button
            onClick={() => saveTripMutation.mutate()}
            disabled={saveTripMutation.isPending}
            className="w-full sm:w-auto"
          >
            {saveTripMutation.isPending ? "Saving..." : "Save Trip"}
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="flex-1 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6 flex flex-col">
            <h3 className="font-semibold text-md mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Where to?
            </h3>
            <CitySearch onCitySelect={handleCitySelect} />
          </CardContent>
        </Card>
        
        <Card className="flex-1 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6 flex flex-col">
            <h3 className="font-semibold text-md mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
                <path d="M16 18h.01" />
              </svg>
              When?
            </h3>
            <DatePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </CardContent>
        </Card>
      </div>
      
      {showOriginInput && city && !searchSubmitted && (
        <Card className="mb-6 sm:mb-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-md mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                <path d="M2 18L10 2l8 16" />
                <path d="M4 14h16" />
                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              </svg>
              Where are you flying from?
            </h3>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <AirportSelector 
                  onSelect={handleAirportSelect}
                  initialCity={originCity}
                  label="Select your departure airport"
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleOriginSubmit}
                className="flex-shrink-0"
              >
                Continue
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This will be used to calculate flight prices and travel times.
            </p>
          </CardContent>
        </Card>
      )}

      {searchSubmitted && city && (
        <Tabs defaultValue="single" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="single">Single Destination</TabsTrigger>
            <TabsTrigger value="compare">Compare Destinations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              <div className="lg:col-span-2 space-y-4 sm:space-y-8">
                <WeatherDisplay
                  city={city}
                  onWeatherUpdate={handleWeatherUpdate}
                  className="w-full"
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
              <div className="space-y-4 sm:space-y-8">
                <TravelPricing
                  city={city}
                  originCity={originCity}
                  dateRange={dateRange}
                  className="mb-4 sm:mb-8"
                />
                <BudgetEstimator
                  city={city}
                  dateRange={dateRange}
                  originCity={originCity}
                />
                <PackingListGenerator
                  city={city}
                  dateRange={dateRange}
                  currentWeather={currentWeather}
                  activities={interests}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="compare">
            <DestinationComparison 
              originCity={originCity}
              dateRange={dateRange}
              initialDestinations={[city]}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}