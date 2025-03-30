import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Clock, DollarSign, MapPin, GripVertical, Trash2, LayoutGrid, LayoutList, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ShareButtons from "@/components/share-buttons";
import TimelineView from "./timeline-view";
import { useToast } from "@/hooks/use-toast";

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
  coordinates?: {
    lat: number;
    lng: number;
  };
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
  geometry: {
    lat: number;
    lng: number;
  };
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Group nearby attractions
function groupNearbyAttractions(attractions: Attraction[], maxDistance: number = 2): Attraction[][] {
  const groups: Attraction[][] = [];
  const used = new Set<string>();

  attractions.forEach(attraction => {
    if (used.has(attraction.id)) return;

    const group = [attraction];
    used.add(attraction.id);

    attractions.forEach(other => {
      if (used.has(other.id)) return;

      const distance = calculateDistance(
        attraction.geometry.lat,
        attraction.geometry.lng,
        other.geometry.lat,
        other.geometry.lng
      );

      if (distance <= maxDistance) {
        group.push(other);
        used.add(other.id);
      }
    });

    groups.push(group);
  });

  return groups;
}

function generateTimeSlots(tripDuration: number): { start: number; end: number }[] {
  // For shorter trips (1-3 days), create more time slots per day
  if (tripDuration <= 3) {
    return [
      { start: 9, end: 11 },   // Morning activity 1
      { start: 11, end: 13 },  // Morning activity 2
      { start: 13, end: 14 },  // Lunch
      { start: 14, end: 16 },  // Afternoon activity 1
      { start: 16, end: 18 },  // Afternoon activity 2
      { start: 19, end: 21 }   // Evening activity
    ];
  }

  // For longer trips, spread activities more
  return [
    { start: 10, end: 12 },  // Morning activity
    { start: 13, end: 14 },  // Lunch
    { start: 15, end: 17 },  // Afternoon activity
    { start: 19, end: 21 }   // Evening activity
  ];
}

function generateItinerary(
  attractions: Attraction[],
  date: Date,
  dayIndex: number,
  tripDuration: number,
  usedAttractions: Set<string>
): ItineraryItem[] {
  const suggestions: ItineraryItem[] = [];
  const timeSlots = generateTimeSlots(tripDuration);

  // For shorter trips, group nearby attractions
  if (tripDuration <= 3) {
    const attractionGroups = groupNearbyAttractions(
      attractions.filter(a => !usedAttractions.has(a.id))
    );

    if (attractionGroups.length > 0) {
      const dayGroup = attractionGroups[dayIndex % attractionGroups.length];

      dayGroup.forEach((attraction, index) => {
        if (index < timeSlots.length - 2) { // Reserve slots for lunch and evening
          const slot = timeSlots[index];
          const time = `${slot.start.toString().padStart(2, '0')}:00`;

          suggestions.push({
            id: `attraction-${attraction.id}`,
            time,
            activity: `Visit ${attraction.name}`,
            location: attraction.location,
            type: 'attraction',
            coordinates: attraction.geometry
          });

          usedAttractions.add(attraction.id);
        }
      });
    }
  } else {
    // For longer trips, spread out attractions more evenly
    const availableAttractions = attractions.filter(a => !usedAttractions.has(a.id));

    timeSlots.forEach((slot, index) => {
      if (index === 1) { // Lunch slot
        suggestions.push({
          id: `lunch-${date.getTime()}`,
          time: `${slot.start.toString().padStart(2, '0')}:00`,
          activity: "Lunch break at a local restaurant",
          type: 'custom'
        });
        return;
      }

      if (availableAttractions.length > 0) {
        const attraction = availableAttractions[0];
        const time = `${slot.start.toString().padStart(2, '0')}:00`;

        suggestions.push({
          id: `attraction-${attraction.id}`,
          time,
          activity: `Visit ${attraction.name}`,
          location: attraction.location,
          type: 'attraction',
          coordinates: attraction.geometry
        });

        usedAttractions.add(attraction.id);
        availableAttractions.shift();
      }
    });
  }

  return suggestions.sort((a, b) => a.time.localeCompare(b.time));
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

function generateRandomTime(start: number, end: number): string {
  const hour = Math.floor(Math.random() * (end - start) + start);
  const minute = Math.random() < 0.5 ? "00" : "30";
  return `${hour.toString().padStart(2, '0')}:${minute}`;
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

export default function ItineraryBuilder({ city, dateRange, events }: ItineraryBuilderProps) {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [draggedItem, setDraggedItem] = useState<{ dayIndex: number; itemIndex: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [approvedItems, setApprovedItems] = useState<Set<string>>(new Set());
  const [refreshingItem, setRefreshingItem] = useState<{dayIndex: number, itemIndex: number} | null>(null);
  const { toast } = useToast();

  // Fetch attractions for the city
  const { data: attractions, isLoading: isLoadingAttractions } = useQuery<Attraction[]>({
    queryKey: [`/api/attractions/${city}`],
    enabled: Boolean(city)
  });

  // Initialize or update itinerary when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && attractions?.length) {
      const tripDuration = differenceInDays(dateRange.to, dateRange.from) + 1;
      const usedAttractions = new Set<string>();

      const newItinerary: DayPlan[] = Array.from({ length: tripDuration }, (_, i) => {
        const currentDate = addDays(dateRange.from!, i);
        return {
          date: currentDate,
          items: generateItinerary(attractions, currentDate, i, tripDuration, usedAttractions)
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

  const handleReorder = (dayIndex: number, newItems: ItineraryItem[]) => {
    setItinerary(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        items: newItems
      };
      return updated;
    });
  };
  
  // Function to mark an activity as approved
  const approveActivity = (itemId: string) => {
    setApprovedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
    
    toast({
      title: "Activity approved",
      description: "This activity will be kept in your itinerary.",
      duration: 2000,
    });
  };
  
  // Function to refresh/replace an activity with another suggestion
  const refreshActivity = (dayIndex: number, itemIndex: number) => {
    setRefreshingItem({dayIndex, itemIndex});
    
    const currentItem = itinerary[dayIndex].items[itemIndex];
    const isCustomOrLunch = currentItem.type === 'custom' || currentItem.activity.toLowerCase().includes('lunch');
    
    // Don't replace lunch or custom activities
    if (isCustomOrLunch) {
      toast({
        title: "Can't replace this activity",
        description: "Custom activities and meals can't be automatically replaced.",
        variant: "destructive",
        duration: 3000
      });
      setRefreshingItem(null);
      return;
    }
    
    // If it's an attraction, find another attraction not already in the itinerary
    if (currentItem.type === 'attraction' && attractions?.length) {
      // Get all currently used attraction IDs in the itinerary
      const usedAttractionIds = new Set<string>();
      itinerary.forEach(day => {
        day.items.forEach(item => {
          if (item.type === 'attraction' && item.id.startsWith('attraction-')) {
            const attractionId = item.id.replace('attraction-', '');
            usedAttractionIds.add(attractionId);
          }
        });
      });
      
      // Find unused attractions
      const unusedAttractions = attractions.filter(a => !usedAttractionIds.has(a.id));
      
      if (unusedAttractions.length === 0) {
        toast({
          title: "No more attractions available",
          description: "All attractions for this city are already in your itinerary.",
          variant: "destructive",
          duration: 3000
        });
        setRefreshingItem(null);
        return;
      }
      
      // Choose a random unused attraction
      const randomAttraction = unusedAttractions[Math.floor(Math.random() * unusedAttractions.length)];
      
      // Create a new itinerary item for the attraction
      const newItem: ItineraryItem = {
        id: `attraction-${randomAttraction.id}`,
        time: currentItem.time,
        activity: `Visit ${randomAttraction.name}`,
        location: randomAttraction.location,
        type: 'attraction',
        coordinates: randomAttraction.geometry
      };
      
      // Replace the current item with the new one
      setItinerary(prev => {
        const updated = [...prev];
        updated[dayIndex].items[itemIndex] = newItem;
        return updated;
      });
      
      toast({
        title: "Activity refreshed",
        description: `Added: ${randomAttraction.name}`,
        duration: 3000
      });
    } else {
      // For non-attraction items, replace with a default activity suggestion
      const timeOfDay = getTimeOfDay(currentItem.time);
      const defaultActivitiesList = defaultActivities[timeOfDay];
      
      // Filter out activities that are already in the itinerary
      const usedActivities = new Set<string>();
      itinerary.forEach(day => {
        day.items.forEach(item => {
          usedActivities.add(item.activity);
        });
      });
      
      const availableActivities = defaultActivitiesList.filter(activity => !usedActivities.has(activity));
      
      if (availableActivities.length === 0) {
        // If all activities have been used, just pick a random one
        const randomActivity = defaultActivitiesList[Math.floor(Math.random() * defaultActivitiesList.length)];
        
        const newItem: ItineraryItem = {
          id: `activity-${Date.now()}`,
          time: currentItem.time,
          activity: randomActivity,
          type: 'custom'
        };
        
        setItinerary(prev => {
          const updated = [...prev];
          updated[dayIndex].items[itemIndex] = newItem;
          return updated;
        });
      } else {
        // Use an unused activity
        const randomActivity = availableActivities[Math.floor(Math.random() * availableActivities.length)];
        
        const newItem: ItineraryItem = {
          id: `activity-${Date.now()}`,
          time: currentItem.time,
          activity: randomActivity,
          type: 'custom'
        };
        
        setItinerary(prev => {
          const updated = [...prev];
          updated[dayIndex].items[itemIndex] = newItem;
          return updated;
        });
      }
      
      toast({
        title: "Activity refreshed",
        description: "A new suggestion has been added to your itinerary.",
        duration: 3000
      });
    }
    
    setRefreshingItem(null);
  };
  
  // Helper function to determine if a time is morning, afternoon, or evening
  const getTimeOfDay = (time: string): 'morning' | 'afternoon' | 'evening' => {
    const hour = parseInt(time.split(':')[0]);
    
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-accent' : ''}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('timeline')}
            className={viewMode === 'timeline' ? 'bg-accent' : ''}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {itinerary.map((day, dayIndex) => (
        <Card key={day.date.toISOString()} className="overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg">
              {format(day.date, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {viewMode === 'timeline' ? (
              <TimelineView
                items={day.items}
                onReorder={(newItems) => handleReorder(dayIndex, newItems)}
                onApprove={approveActivity}
                onRefresh={(itemIndex) => refreshActivity(dayIndex, itemIndex)}
                onRemove={(itemIndex) => removeActivity(dayIndex, itemIndex)}
                approvedItems={approvedItems}
                refreshingIndex={refreshingItem?.dayIndex === dayIndex ? refreshingItem.itemIndex : undefined}
              />
            ) : (
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

                      {/* Thumbs up button for approval */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => approveActivity(item.id)}
                        className={`opacity-0 group-hover:opacity-100 ${
                          approvedItems.has(item.id) ? "text-green-500 opacity-100" : ""
                        }`}
                        title="I like this"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>

                      {/* Refresh button to get new suggestion */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refreshActivity(dayIndex, itemIndex)}
                        className="opacity-0 group-hover:opacity-100"
                        disabled={refreshingItem !== null}
                        title="Show me something else"
                      >
                        {refreshingItem?.dayIndex === dayIndex && refreshingItem?.itemIndex === itemIndex ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsDown className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeActivity(dayIndex, itemIndex)}
                        className="opacity-0 group-hover:opacity-100"
                        title="Remove activity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add new activity */}
                <div className="flex gap-2 mt-4">
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
                  <Button onClick={() => addActivity(dayIndex)} disabled={!newActivity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}