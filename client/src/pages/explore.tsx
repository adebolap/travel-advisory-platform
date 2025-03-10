import { useState, Suspense } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import TravelSuggestions from "@/components/travel-suggestions";
import BudgetEstimator from "@/components/budget-estimator";
import PackingListGenerator from "@/components/packing-list-generator";
import ItineraryBuilder from "@/components/itinerary-builder";
import { CitySelector } from "@/components/city-selector";
import WeatherDisplay from "@/components/weather-display";
import EventList from "@/components/event-list";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Globe, Calendar, MapPin, Loader2 } from "lucide-react";

export default function Explore() {
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<string>("Mild");

  const interests = ["culture", "food", "nightlife", "shopping", "transport"];

  const handleWeatherUpdate = (weather: string) => {
    setCurrentWeather(weather);
  };

  const handleSearch = () => {
    if (city) {
      setSearchSubmitted(true);
    }
  };

  const handleClearSearch = () => {
    setCity("");
    setDateRange(undefined);
    setSearchSubmitted(false);
  };

  return (
    <Layout title="Explore & Discover" subtitle="Find your next adventure">
      <div className="space-y-6">
        <Card className="overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Globe className="h-6 w-6 text-primary animate-pulse" />
              Plan Your Perfect Trip
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Destination
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <CitySelector
                      value={city}
                      onValueChange={setCity}
                      placeholder="Where do you want to go?"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={!city}
                    className="transition-all hover:scale-105 active:scale-95 bg-primary/90 hover:bg-primary"
                  >
                    Explore
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Travel Dates
                </label>
                <DatePicker 
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            </div>
            <Button 
              onClick={handleClearSearch}
              variant="outline"
              className="mt-4 w-full"
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>

        {searchSubmitted && city && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
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
                  />
                  <ItineraryBuilder
                    city={city}
                  />
                </Suspense>
              </div>
            </div>
            <div className="space-y-6">
              <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
                <BudgetEstimator 
                  city={city} 
                  dateRange={dateRange}
                />
                <PackingListGenerator
                  city={city}
                  dateRange={dateRange}
                  currentWeather={currentWeather}
                />
              </Suspense>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}