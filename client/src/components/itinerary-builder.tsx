import { useState } from "react";
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

export default function ItineraryBuilder({ city, dateRange, events }: ItineraryBuilderProps) {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [draggedItem, setDraggedItem] = useState<{dayIndex: number, itemIndex: number} | null>(null);

  // Initialize itinerary when dateRange changes
  useState(() => {
    if (dateRange?.from && dateRange?.to) {
      const days = differenceInDays(dateRange.to, dateRange.from) + 1;
      const newItinerary: DayPlan[] = Array.from({ length: days }, (_, i) => ({
        date: addDays(dateRange.from!, i),
        items: []
      }));
      setItinerary(newItinerary);
    }
  }, [dateRange]);

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
