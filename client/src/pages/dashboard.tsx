import { useState } from "react";
import CitySearch from "@/components/city-search";
import InterestSelector from "@/components/interest-selector";
import WeatherDisplay from "@/components/weather-display";
import TravelSuggestions from "@/components/travel-suggestions";
import EventList from "@/components/event-list";
import SeasonalExpectations from "@/components/seasonal-expectations";
import TravelPricing from "@/components/travel-pricing";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/date-picker";
import { DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plane, UtensilsCrossed, Music, DollarSign } from "lucide-react";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });

  // Convert date range to string format for API calls
  const getDateRangeStrings = () => {
    if (!dateRange?.from) return { startDate: undefined, endDate: undefined };
    
    const startDate = format(dateRange.from, 'yyyy-MM-dd');
    const endDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : startDate;
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRangeStrings();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Plan Your Perfect Trip</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Where & When</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Destination</label>
                  <CitySearch onCitySelect={setSelectedCity} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Travel Dates</label>
                  <DatePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Interests</h2>
              <InterestSelector 
                selectedInterests={selectedInterests}
                onInterestsChange={setSelectedInterests}
              />
            </div>
          </Card>

          {selectedCity && (
            <Card className="p-6">
              <WeatherDisplay city={selectedCity} />
            </Card>
          )}
        </div>

        {selectedCity && dateRange?.from && (
          <div className="mt-8">
            <SeasonalExpectations 
              city={selectedCity}
              startDate={startDate}
              endDate={endDate}
              className="mb-8"
            />
            
            <Tabs defaultValue="events" className="mt-8">
              <TabsList className="grid w-full grid-cols-5 md:w-auto">
                <TabsTrigger value="events">
                  <Calendar className="w-4 h-4 mr-2" /> Events
                </TabsTrigger>
                <TabsTrigger value="attractions">
                  <Plane className="w-4 h-4 mr-2" /> Attractions
                </TabsTrigger>
                <TabsTrigger value="pricing">
                  <DollarSign className="w-4 h-4 mr-2" /> Pricing
                </TabsTrigger>
                <TabsTrigger value="food">
                  <UtensilsCrossed className="w-4 h-4 mr-2" /> Food
                </TabsTrigger>
                <TabsTrigger value="nightlife">
                  <Music className="w-4 h-4 mr-2" /> Nightlife
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="events" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <EventList 
                      city={selectedCity} 
                      dateRange={dateRange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attractions" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <TravelSuggestions 
                      city={selectedCity}
                      interests={selectedInterests.length > 0 ? selectedInterests : ['Culture', 'Sightseeing']}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pricing" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Travel Cost Estimates for {selectedCity}</h3>
                    <TravelPricing
                      city={selectedCity}
                      dateRange={dateRange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="food" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Food & Dining in {selectedCity}</h3>
                    {selectedInterests.includes('Food') ? (
                      <TravelSuggestions 
                        city={selectedCity}
                        interests={['Food']}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        Select "Food" in your interests to see personalized dining recommendations.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="nightlife" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Nightlife in {selectedCity}</h3>
                    {selectedInterests.includes('Nightlife') ? (
                      <TravelSuggestions 
                        city={selectedCity}
                        interests={['Nightlife']}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        Select "Nightlife" in your interests to see personalized nightlife recommendations.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
