import { useState, Suspense } from "react";
import CitySearch from "@/components/city-search";
import InterestSelector from "@/components/interest-selector";
import WeatherDisplay from "@/components/weather-display";
import TravelSuggestions from "@/components/travel-suggestions";
import EventList from "@/components/event-list";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Plan Your Perfect Trip</h1>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <Card className="md:col-span-2 p-6">
            <CitySearch onCitySelect={setSelectedCity} />
            <InterestSelector 
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
            />
          </Card>

          {selectedCity && (
            <Card className="p-6">
              <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
                <WeatherDisplay city={selectedCity} />
              </Suspense>
            </Card>
          )}
        </motion.div>

        {selectedCity && selectedInterests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-8 grid md:grid-cols-2 gap-6"
          >
            <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
              <TravelSuggestions 
                city={selectedCity}
                interests={selectedInterests}
              />
            </Suspense>
            <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
              <EventList city={selectedCity} />
            </Suspense>
          </motion.div>
        )}
      </div>
    </div>
  );
}
