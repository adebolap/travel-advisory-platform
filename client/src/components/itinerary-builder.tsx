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
}

const defaultActivities = {
  morning: [
    "Visit local museums and galleries",
    "Explore historic sites",
    "Take a walking tour",
    "Visit main attractions",
    "Morning coffee at local cafe"
  ],
  afternoon: [
    "Shopping in city center",
    "Visit popular landmarks",
    "Explore local neighborhoods",
    "Visit parks and gardens",
    "Cultural activities"
  ],
  evening: [
    "Dinner at local restaurant",
    "Evening entertainment",
    "Night tour",
    "Local cultural events",
    "Visit viewpoints"
  ]
};

function generateDefaultSuggestions(date: Date): ItineraryItem[] {
  const suggestions: ItineraryItem[] = [];

  // Morning activity
  suggestions.push({
    id: `morning-${date.getTime()}`,
    time: "09:00",
    activity: defaultActivities.morning[Math.floor(Math.random() * defaultActivities.morning.length)],
    type: 'custom'
  });

  // Lunch
  suggestions.push({
    id: `lunch-${date.getTime()}`,
    time: "12:00",
    activity: "Lunch break at a local restaurant",
    type: 'custom'
  });

  // Afternoon activity
  suggestions.push({
    id: `afternoon-${date.getTime()}`,
    time: "14:00",
    activity: defaultActivities.afternoon[Math.floor(Math.random() * defaultActivities.afternoon.length)],
    type: 'custom'
  });

  // Evening activity
  suggestions.push({
    id: `evening-${date.getTime()}`,
    time: "19:00",
    activity: defaultActivities.evening[Math.floor(Math.random() * defaultActivities.evening.length)],
    type: 'custom'
  });

  return suggestions;
}

function categorizeAttraction(types: string[]): 'morning' | 'afternoon' | 'evening' {
  const timeMapping: Record<string, 'morning' | 'afternoon' | 'evening'> = {
    museum: 'morning',
    art_gallery: 'morning',
    park: 'morning',
    tourist_attraction: 'afternoon',
    shopping_mall: 'afternoon',
    amusement_park: 'afternoon',
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

function generateAttractionSuggestions(attractions: Attraction[], date: Date): ItineraryItem[] {
  const suggestions: ItineraryItem[] = [];
  const categorizedAttractions = {
    morning: attractions.filter(a => categorizeAttraction(a.types) === 'morning'),
    afternoon: attractions.filter(a => categorizeAttraction(a.types) === 'afternoon'),
    evening: attractions.filter(a => categorizeAttraction(a.types) === 'evening')
  };

  // Morning activities
  if (categorizedAttractions.morning.length > 0) {
    const morningAttraction = categorizedAttractions.morning[Math.floor(Math.random() * categorizedAttractions.morning.length)];
    suggestions.push({
      id: `morning-${date.getTime()}`,
      time: "09:00",
      activity: `Visit ${morningAttraction.name}`,
      location: morningAttraction.location,
      type: 'attraction'
    });
  }

  // Add lunch
  suggestions.push({
    id: `lunch-${date.getTime()}`,
    time: "12:00",
    activity: "Lunch break at a local restaurant",
    type: 'custom'
  });

  // Afternoon activities
  if (categorizedAttractions.afternoon.length > 0) {
    const afternoonAttraction = categorizedAttractions.afternoon[Math.floor(Math.random() * categorizedAttractions.afternoon.length)];
    suggestions.push({
      id: `afternoon-${date.getTime()}`,
      time: "14:00",
      activity: `Explore ${afternoonAttraction.name}`,
      location: afternoonAttraction.location,
      type: 'attraction'
    });
  }

  // Evening activities
  if (categorizedAttractions.evening.length > 0) {
    const eveningAttraction = categorizedAttractions.evening[Math.floor(Math.random() * categorizedAttractions.evening.length)];
    suggestions.push({
      id: `evening-${date.getTime()}`,
      time: "19:00",
      activity: `Experience ${eveningAttraction.name}`,
      location: eveningAttraction.location,
      type: 'attraction'
    });
  } else {
    suggestions.push({
      id: `dinner-${date.getTime()}`,
      time: "19:00",
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
      const newItinerary: DayPlan[] = Array.from({ length: days }, (_, i) => {
        const currentDate = addDays(dateRange.from!, i);
        return {
          date: currentDate,
          items: attractions?.length 
            ? generateAttractionSuggestions(attractions, currentDate)
            : generateDefaultSuggestions(currentDate)
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