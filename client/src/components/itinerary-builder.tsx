import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, GripVertical, Trash2, LayoutGrid, LayoutList, Plus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface ItineraryBuilderProps {
  city: string;
  dateRange?: DateRange;
  travelStyle?: 'adventure' | 'cultural' | 'relaxation' | 'family';
  intensity?: 'light' | 'moderate' | 'full';
  interests?: string[];
}

interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location?: string;
  address?: string;
  rating?: number;
  type: 'custom' | 'event' | 'attraction';
  description?: string;
  imageUrl?: string;
}

interface DayPlan {
  date: Date;
  items: ItineraryItem[];
}

interface Attraction {
  id: string;
  name: string;
  location: string;
  rating: number;
  types: string[];
  photo?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  }
}

export default function ItineraryBuilder({ city, dateRange, travelStyle = 'cultural', intensity = 'moderate', interests = [] }: ItineraryBuilderProps) {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);

  // Fetch attractions from Google Places API
  const { data: attractions } = useQuery<Attraction[]>({
    queryKey: [`/api/attractions/${city}`],
    enabled: !!city,
  });

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && attractions?.length) {
      const tripDuration = differenceInDays(dateRange.to, dateRange.from) + 1;

      // Generate itinerary based on attractions and preferences
      const newItinerary = Array.from({ length: tripDuration }, (_, i) => {
        const dayAttractions = generateDayAttractions(attractions, i, tripDuration);
        return {
          date: addDays(dateRange.from!, i),
          items: generateDayPlan(dayAttractions, i, intensity)
        };
      });

      setItinerary(newItinerary);
    }
  }, [dateRange, city, attractions, intensity, travelStyle]);

  function generateDayAttractions(attractions: Attraction[], dayIndex: number, totalDays: number): Attraction[] {
    // Sort attractions by rating and distribute them across days
    const sortedAttractions = [...attractions].sort((a, b) => b.rating - a.rating);
    const attractionsPerDay = Math.ceil(sortedAttractions.length / totalDays);
    return sortedAttractions.slice(
      dayIndex * attractionsPerDay,
      (dayIndex + 1) * attractionsPerDay
    );
  }

  function generateDayPlan(attractions: Attraction[], dayIndex: number, intensity: 'light' | 'moderate' | 'full'): ItineraryItem[] {
    const timeSlots = generateTimeSlots(intensity);
    return timeSlots.map((slot, index) => {
      const attraction = attractions[index % attractions.length];
      return {
        id: `activity-${dayIndex}-${index}`,
        time: `${slot.start.toString().padStart(2, '0')}:00`,
        activity: attraction.name,
        location: attraction.name,
        address: attraction.location,
        rating: attraction.rating,
        type: 'attraction',
        imageUrl: attraction.photo,
        description: `Visit this highly rated attraction (${attraction.rating}/5). Known for: ${attraction.types.join(', ')}`
      };
    });
  }

  function generateTimeSlots(intensity: 'light' | 'moderate' | 'full'): { start: number; end: number }[] {
    switch (intensity) {
      case 'light':
        return [
          { start: 10, end: 12 },
          { start: 14, end: 16 },
          { start: 19, end: 21 }
        ];
      case 'full':
        return [
          { start: 8, end: 10 },
          { start: 10, end: 12 },
          { start: 14, end: 16 },
          { start: 16, end: 18 },
          { start: 19, end: 21 }
        ];
      default: // moderate
        return [
          { start: 9, end: 11 },
          { start: 13, end: 15 },
          { start: 15, end: 17 },
          { start: 19, end: 21 }
        ];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Itinerary for {city}</h2>
      </div>
      <AnimatePresence>
        {itinerary.map((day, dayIndex) => (
          <motion.div
            key={day.date.toISOString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg">
                  {format(day.date, 'EEEE, MMMM d')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {day.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex flex-col gap-2 p-4 bg-card rounded-lg border shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.time}</span>
                        <span className="flex-1 font-medium">{item.activity}</span>
                        {item.rating && (
                          <span className="text-sm text-muted-foreground">
                            ★ {item.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {item.address && (
                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span>{item.address}</span>
                        </div>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground ml-7">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}