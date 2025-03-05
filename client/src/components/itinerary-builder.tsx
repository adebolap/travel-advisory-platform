import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Clock, DollarSign, MapPin, GripVertical, Trash2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInDays } from "date-fns";

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
  type: 'custom' | 'event';
}

interface DayPlan {
  date: Date;
  items: ItineraryItem[];
}

const cityActivities: Record<string, {
  morning: string[],
  afternoon: string[],
  evening: string[],
  landmarks: string[],
  dining: string[]
}> = {
  "London": {
    morning: [
      "Visit the Tower of London",
      "Explore Borough Market",
      "Walk through Hyde Park",
      "Tour Westminster Abbey",
      "Visit the British Museum"
    ],
    afternoon: [
      "Shop at Covent Garden",
      "Visit the Tate Modern",
      "Take a Thames River Cruise",
      "Explore the Natural History Museum",
      "Visit Buckingham Palace"
    ],
    evening: [
      "Watch a West End Show",
      "Dine in Soho",
      "Take a Jack the Ripper Tour",
      "Visit Sky Garden",
      "Enjoy live music in Camden"
    ],
    landmarks: [
      "Big Ben",
      "London Eye",
      "Tower Bridge",
      "St. Paul's Cathedral",
      "Trafalgar Square"
    ],
    dining: [
      "Traditional pub lunch",
      "Afternoon tea at The Ritz",
      "Fish and chips in Greenwich",
      "Indian cuisine in Brick Lane",
      "Fine dining in Mayfair"
    ]
  },
  // Add more cities with their activities...
};

const defaultActivities = {
  morning: [
    "Visit the main museum",
    "Explore the local market",
    "Take a walking tour",
    "Visit historical sites",
    "Enjoy breakfast at a local cafe"
  ],
  afternoon: [
    "Visit popular attractions",
    "Shopping in city center",
    "Take a guided tour",
    "Visit art galleries",
    "Explore local neighborhoods"
  ],
  evening: [
    "Dinner at local restaurant",
    "Attend cultural shows",
    "Night city tour",
    "Visit rooftop bars",
    "Experience local nightlife"
  ],
  landmarks: [
    "Main square",
    "Historical district",
    "Cultural center",
    "City park",
    "Local monument"
  ],
  dining: [
    "Local cuisine restaurant",
    "Popular cafe",
    "Street food market",
    "Traditional restaurant",
    "Modern fusion dining"
  ]
};

function generateSuggestions(city: string, date: Date): ItineraryItem[] {
  const activities = cityActivities[city] || defaultActivities;
  const suggestions: ItineraryItem[] = [];

  // Morning activity
  suggestions.push({
    id: `morning-${date.getTime()}`,
    time: "09:00",
    activity: activities.morning[Math.floor(Math.random() * activities.morning.length)],
    type: 'custom'
  });

  // Landmark visit
  suggestions.push({
    id: `landmark-${date.getTime()}`,
    time: "11:30",
    activity: `Visit ${activities.landmarks[Math.floor(Math.random() * activities.landmarks.length)]}`,
    type: 'custom'
  });

  // Lunch
  suggestions.push({
    id: `lunch-${date.getTime()}`,
    time: "13:00",
    activity: activities.dining[Math.floor(Math.random() * activities.dining.length)],
    type: 'custom'
  });

  // Afternoon activity
  suggestions.push({
    id: `afternoon-${date.getTime()}`,
    time: "15:00",
    activity: activities.afternoon[Math.floor(Math.random() * activities.afternoon.length)],
    type: 'custom'
  });

  // Evening activity
  suggestions.push({
    id: `evening-${date.getTime()}`,
    time: "19:00",
    activity: activities.evening[Math.floor(Math.random() * activities.evening.length)],
    type: 'custom'
  });

  return suggestions;
}

export default function ItineraryBuilder({ city, dateRange, events }: ItineraryBuilderProps) {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [draggedItem, setDraggedItem] = useState<{dayIndex: number, itemIndex: number} | null>(null);

  // Initialize itinerary when dateRange changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const days = differenceInDays(dateRange.to, dateRange.from) + 1;
      const newItinerary: DayPlan[] = Array.from({ length: days }, (_, i) => {
        const currentDate = addDays(dateRange.from!, i);
        return {
          date: currentDate,
          items: generateSuggestions(city, currentDate) 
        };
      });
      setItinerary(newItinerary);
    }
  }, [dateRange, city]);

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
      

      // Remove from original position
      updated[draggedDay].items.splice(draggedItemIndex, 1);
      // Add to new position
      updated[dayIndex].items.splice(itemIndex, 0, item);
      

      return updated;
    });
    setDraggedItem({ dayIndex, itemIndex });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Itinerary for {city}</h2>
      

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