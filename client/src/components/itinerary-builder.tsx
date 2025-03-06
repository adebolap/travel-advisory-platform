import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Clock, DollarSign, MapPin, GripVertical, Trash2, Share2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ShareButtons from "@/components/share-buttons";

interface ItineraryBuilderProps {
  city: string;
  dateRange?: DateRange;
  events?: Array<{
    id: number;
    name: string;
    date: string;
    type: string;
  }>;
}

interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location?: string;
  cost?: number;
  type: 'custom' | 'event' | 'attraction';
}

interface DayPlan {
  date: Date;
  items: ItineraryItem[];
}

interface Attraction {
  id: string;
  name: string;
  location: string;
  rating?: number;
  types: string[];
  photo?: string;
}

const defaultActivities = {
  morning: [
    "Visit local museums and galleries",
    "Take a guided walking tour",
    "Explore historic district",
    "Visit the main market",
    "Morning coffee and pastries"
  ],
  afternoon: [
    "Shopping in local boutiques",
    "Visit scenic viewpoints",
    "Explore hidden gems",
    "Visit parks and gardens",
    "Join a local workshop"
  ],
  evening: [
    "Try local cuisine",
    "Watch sunset at viewpoint",
    "Attend cultural performance",
    "Visit night market",
    "Local wine tasting"
  ]
};

// Helper function to generate random time within a range
function generateRandomTime(start: number, end: number): string {
  const hour = Math.floor(Math.random() * (end - start) + start);
  const minute = Math.random() < 0.5 ? "00" : "30";
  return `${hour.toString().padStart(2, '0')}:${minute}`;
}

function categorizeAttraction(types: string[]): 'morning' | 'afternoon' | 'evening' {
  const timeMapping: Record<string, 'morning' | 'afternoon' | 'evening'> = {
    museum: 'morning',
    art_gallery: 'morning',
    park: 'morning',
    church: 'morning',
    temple: 'morning',
    mosque: 'morning',
    tourist_attraction: 'afternoon',
    shopping_mall: 'afternoon',
    amusement_park: 'afternoon',
    zoo: 'afternoon',
    aquarium: 'afternoon',
    restaurant: 'evening',
    bar: 'evening',
    night_club: 'evening'
  };

  for (const type of types) {
    if (timeMapping[type]) {
      return timeMapping[type];
    }
  }

  return 'afternoon';
}

function generateDefaultSuggestions(date: Date, dayIndex: number): ItineraryItem[] {
  const suggestions: ItineraryItem[] = [];
  const timeVariation = dayIndex * 30; // Vary start times by 30 minutes each day

  const morningTime = generateRandomTime(8, 10);
  suggestions.push({
    id: `morning-${date.getTime()}`,
    time: morningTime,
    activity: defaultActivities.morning[Math.floor(Math.random() * defaultActivities.morning.length)],
    type: 'custom'
  });

  // Lunch with varying times
  suggestions.push({
    id: `lunch-${date.getTime()}`,
    time: generateRandomTime(12, 13),
    activity: "Lunch break at a local restaurant",
    type: 'custom'
  });

  const afternoonTime = generateRandomTime(14, 16);
  suggestions.push({
    id: `afternoon-${date.getTime()}`,
    time: afternoonTime,
    activity: defaultActivities.afternoon[Math.floor(Math.random() * defaultActivities.afternoon.length)],
    type: 'custom'
  });

  const eveningTime = generateRandomTime(18, 20);
  suggestions.push({
    id: `evening-${date.getTime()}`,
    time: eveningTime,
    activity: defaultActivities.evening[Math.floor(Math.random() * defaultActivities.evening.length)],
    type: 'custom'
  });

  return suggestions.sort((a, b) => a.time.localeCompare(b.time));
}

function generateAttractionSuggestions(
  attractions: Attraction[],
  date: Date,
  dayIndex: number,
  usedAttractions: Set<string>
): ItineraryItem[] {
  const suggestions: ItineraryItem[] = [];
  const timeVariation = dayIndex * 30; // Vary start times by 30 minutes each day

  // Filter out already used attractions
  const availableAttractions = attractions.filter(a => !usedAttractions.has(a.id));

  const categorizedAttractions = {
    morning: availableAttractions.filter(a => categorizeAttraction(a.types) === 'morning'),
    afternoon: availableAttractions.filter(a => categorizeAttraction(a.types) === 'afternoon'),
    evening: availableAttractions.filter(a => categorizeAttraction(a.types) === 'evening')
  };

  // Morning activities with varied times
  if (categorizedAttractions.morning.length > 0) {
    const morningAttractions = categorizedAttractions.morning.slice(0, 2);
    morningAttractions.forEach((attraction, index) => {
      const time = generateRandomTime(8 + index * 2, 10 + index * 2);
      suggestions.push({
        id: `morning-${index}-${date.getTime()}`,
        time,
        activity: `Visit ${attraction.name}`,
        location: attraction.location,
        type: 'attraction'
      });
      usedAttractions.add(attraction.id);
    });
  }

  // Lunch break with varying times
  suggestions.push({
    id: `lunch-${date.getTime()}`,
    time: generateRandomTime(12, 13),
    activity: "Lunch break at a local restaurant",
    type: 'custom'
  });

  // Afternoon activities with varied times
  if (categorizedAttractions.afternoon.length > 0) {
    const afternoonAttractions = categorizedAttractions.afternoon.slice(0, 2);
    afternoonAttractions.forEach((attraction, index) => {
      const time = generateRandomTime(14 + index * 2, 16 + index * 2);
      suggestions.push({
        id: `afternoon-${index}-${date.getTime()}`,
        time,
        activity: `Explore ${attraction.name}`,
        location: attraction.location,
        type: 'attraction'
      });
      usedAttractions.add(attraction.id);
    });
  }

  // Evening activities
  if (categorizedAttractions.evening.length > 0) {
    const eveningAttraction = categorizedAttractions.evening[0];
    const time = generateRandomTime(18, 20);
    suggestions.push({
      id: `evening-${date.getTime()}`,
      time,
      activity: `Experience ${eveningAttraction.name}`,
      location: eveningAttraction.location,
      type: 'attraction'
    });
    usedAttractions.add(eveningAttraction.id);
  } else {
    suggestions.push({
      id: `dinner-${date.getTime()}`,
      time: generateRandomTime(18, 20),
      activity: "Dinner at a local restaurant",
      type: 'custom'
    });
  }

  return suggestions.sort((a, b) => a.time.localeCompare(b.time));
}

export default function ItineraryBuilder({ city, dateRange, events }: ItineraryBuilderProps) {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [draggedItem, setDraggedItem] = useState<{dayIndex: number, itemIndex: number} | null>(null);

  // Fetch attractions for the city
  const { data: attractions, isLoading: isLoadingAttractions } = useQuery<Attraction[]>({
    queryKey: [`/api/attractions/${city}`],
    enabled: Boolean(city)
  });

  // Initialize or update itinerary when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const days = differenceInDays(dateRange.to, dateRange.from) + 1;
      const usedAttractions = new Set<string>();

      const newItinerary: DayPlan[] = Array.from({ length: days }, (_, i) => {
        const currentDate = addDays(dateRange.from!, i);
        return {
          date: currentDate,
          items: attractions?.length
            ? generateAttractionSuggestions(attractions, currentDate, i, usedAttractions)
            : generateDefaultSuggestions(currentDate, i)
        };
      });
      setItinerary(newItinerary);
    }
  }, [dateRange, attractions, city]);

  const addActivity = (dayIndex: number) => {
    if (!newActivity) return;

    const newItem: ItineraryItem = {
      id: `custom-${Date.now()}`,
      time: selectedTime,
      activity: newActivity,
      type: 'custom'
    };

    setItinerary(prev => {
      const updated = [...prev];
      updated[dayIndex].items.push(newItem);
      updated[dayIndex].items.sort((a, b) => a.time.localeCompare(b.time));
      return updated;
    });

    setNewActivity("");
  };

  const removeActivity = (dayIndex: number, itemIndex: number) => {
    setItinerary(prev => {
      const updated = [...prev];
      updated[dayIndex].items.splice(itemIndex, 1);
      return updated;
    });
  };

  const handleDragStart = (dayIndex: number, itemIndex: number) => {
    setDraggedItem({ dayIndex, itemIndex });
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number, itemIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    setItinerary(prev => {
      const updated = [...prev];
      const [draggedDay, draggedItemIndex] = [draggedItem.dayIndex, draggedItem.itemIndex];
      const item = updated[draggedDay].items[draggedItemIndex];

      updated[draggedDay].items.splice(draggedItemIndex, 1);
      updated[dayIndex].items.splice(itemIndex, 0, item);

      return updated;
    });
    setDraggedItem({ dayIndex, itemIndex });
  };

  const generateShareableDescription = () => {
    if (!dateRange?.from || !dateRange?.to) return '';

    const days = differenceInDays(dateRange.to, dateRange.from) + 1;
    const formattedStartDate = format(dateRange.from, 'MMM d');
    const formattedEndDate = format(dateRange.to, 'MMM d, yyyy');

    return `${days}-day itinerary for ${city} from ${formattedStartDate} to ${formattedEndDate}. Plan includes daily activities, attractions, and local experiences.`;
  };

  if (isLoadingAttractions) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Itinerary for {city}</h2>
        <ShareButtons
          title={`Travel Itinerary: ${city}`}
          description={generateShareableDescription()}
          url={`${window.location.origin}/itinerary/${encodeURIComponent(city)}`}
        />
      </div>
      {itinerary.map((day, dayIndex) => (
        <Card key={day.date.toISOString()} className="overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg">
              {format(day.date, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Activity list */}
              <div className="space-y-2">
                {day.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(dayIndex, itemIndex)}
                    onDragOver={(e) => handleDragOver(e, dayIndex, itemIndex)}
                    className="flex items-center gap-3 p-2 bg-card hover:bg-accent rounded-lg group"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100" />
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.time}</span>
                    <span className="flex-1">{item.activity}</span>
                    {item.location && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeActivity(dayIndex, itemIndex)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add new activity */}
              <div className="flex gap-2">
                <div className="w-24">
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Add activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addActivity(dayIndex);
                    }
                  }}
                />
                <Button
                  onClick={() => addActivity(dayIndex)}
                  disabled={!newActivity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}