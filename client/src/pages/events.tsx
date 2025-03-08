import { useState, Suspense } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import EventList from "@/components/event-list";
import CitySearch from "@/components/city-search";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Events() {
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setSearchSubmitted(true);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Discover Events</h1>

      <Card className="mb-8 shadow-lg">
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
                  className="bg-primary text-white hover:bg-primary/90 transition"
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
        >
          <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
            <EventList city={city} />
          </Suspense>
        </motion.div>
      )}
    </div>
  );
}
