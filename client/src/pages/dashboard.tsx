import { useState } from "react";
import CitySearch from "@/components/city-search";
import InterestSelector from "@/components/interest-selector";
import WeatherDisplay from "@/components/weather-display";
import TravelSuggestions from "@/components/travel-suggestions";
import EventList from "@/components/event-list";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Plan Your Perfect Trip</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6">
            <CitySearch onCitySelect={setSelectedCity} />
            <InterestSelector 
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
            />
          </Card>

          {selectedCity && (
            <Card className="p-6">
              <WeatherDisplay city={selectedCity} />
            </Card>
          )}
        </div>

        {selectedCity && selectedInterests.length > 0 && (
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <TravelSuggestions 
              city={selectedCity}
              interests={selectedInterests}
            />
            <EventList city={selectedCity} />
          </div>
        )}
      </div>
    </div>
  );
}
