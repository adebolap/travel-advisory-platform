import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, GripVertical, Trash2, LayoutGrid, LayoutList, Plus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import TimelineView from "./timeline-view";
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
  type: 'custom' | 'event' | 'attraction';
}

interface DayPlan {
  date: Date;
  items: ItineraryItem[];
}

const travelStyleSettings = {
  adventure: { morning: 2, afternoon: 2, evening: 1 },
  cultural: { morning: 3, afternoon: 2, evening: 1 },
  relaxation: { morning: 1, afternoon: 1, evening: 1 },
  family: { morning: 2, afternoon: 2, evening: 1 }
};

const interestPreferences = {
  shopping: 2,
  nightlife: 1,
  culture: 3,
  food: 2,
  nature: 1
};

export default function ItineraryBuilder({ city, dateRange, travelStyle = 'cultural', intensity = 'moderate', interests = [] }: ItineraryBuilderProps) {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const tripDuration = differenceInDays(dateRange.to, dateRange.from) + 1;
      const newItinerary = Array.from({ length: tripDuration }, (_, i) => ({
        date: addDays(dateRange.from!, i),
        items: generateDayPlan(i, tripDuration, travelStyle, intensity, interests)
      }));
      setItinerary(newItinerary);
    }
  }, [dateRange, city, travelStyle, intensity, interests]);

  function generateDayPlan(dayIndex: number, tripDuration: number, style: string, intensity: string, interests: string[]): ItineraryItem[] {
    const items: ItineraryItem[] = [];
    const timeSlots = generateTimeSlots(intensity);
    timeSlots.forEach((slot, index) => {
      items.push({
        id: `activity-${dayIndex}-${index}`,
        time: `${slot.start.toString().padStart(2, '0')}:00`,
        activity: `Activity ${index + 1}`,
        type: 'custom'
      });
    });
    return items;
  }

  function generateTimeSlots(intensity: 'light' | 'moderate' | 'full'): { start: number; end: number }[] {
    if (intensity === 'light') {
      return [{ start: 10, end: 12 }, { start: 14, end: 16 }, { start: 19, end: 21 }];
    } else if (intensity === 'full') {
      return [
        { start: 8, end: 10 }, { start: 10, end: 12 }, 
        { start: 14, end: 16 }, { start: 16, end: 18 }, 
        { start: 19, end: 21 }
      ];
    }
    return [{ start: 9, end: 11 }, { start: 13, end: 14 }, { start: 15, end: 17 }, { start: 19, end: 21 }];
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
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-card rounded-lg">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.time}</span>
                      <span className="flex-1">{item.activity}</span>
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
