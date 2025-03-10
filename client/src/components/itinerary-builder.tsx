import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, MapPin, GripVertical, Trash2, LayoutGrid, LayoutList, 
  Plus, Calendar, Settings2, Save 
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ItineraryBuilderProps {
  city: string;
  dateRange?: DateRange;
  travelStyle?: 'adventure' | 'cultural' | 'relaxation' | 'family';
  intensity?: 'light' | 'moderate' | 'full';
  interests?: string[];
  onSave?: (itinerary: DayPlan[]) => void;
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
  duration?: number; // in minutes
  price?: string;
  bookingUrl?: string;
  tags?: string[];
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
  description?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  price_level?: number;
  opening_hours?: {
    periods: Array<{
      open: { time: string; day: number };
      close: { time: string; day: number };
    }>;
  };
}

// Helper: Generate time slots based on intensity.
function generateTimeSlots(intensity: 'light' | 'moderate' | 'full') {
  if (intensity === 'light') {
    return [{ start: 9, end: 11 }, { start: 13, end: 15 }];
  } else if (intensity === 'full') {
    return [
      { start: 8, end: 10 },
      { start: 11, end: 13 },
      { start: 14, end: 16 },
      { start: 17, end: 19 },
    ];
  }
  // Moderate intensity by default.
  return [{ start: 9, end: 11 }, { start: 12, end: 14 }, { start: 15, end: 17 }];
}

export default function ItineraryBuilder({ 
  city, 
  dateRange, 
  travelStyle = 'cultural', 
  intensity = 'moderate', 
  interests = [],
  onSave 
}: ItineraryBuilderProps) {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attractions from API.
  const { data: attractions, isLoading: isLoadingAttractions, error: attractionsError } = useQuery<Attraction[]>({
    queryKey: ['/api/attractions', city],
    enabled: !!city,
    retry: 2,
    onError: () => {
      toast({
        title: "Error loading attractions",
        description: "Failed to load attractions. Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Save itinerary mutation.
  const saveMutation = useMutation({
    mutationFn: async (itinerary: DayPlan[]) => {
      const payload = {
        city,
        dateRange: {
          from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
          to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
        },
        itinerary,
      };
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save itinerary');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Itinerary saved",
        description: "Your itinerary has been saved successfully",
      });
      if (onSave) onSave(itinerary);
    },
    onError: () => {
      toast({
        title: "Failed to save",
        description: "Could not save your itinerary. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate itinerary whenever inputs change.
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && attractions?.length) {
      const tripDuration = differenceInDays(dateRange.to, dateRange.from) + 1;
      const newItinerary = Array.from({ length: tripDuration }, (_, i) => {
        const currentDate = addDays(dateRange.from!, i);
        const dayAttractions = generateDayAttractions(attractions, currentDate, tripDuration);
        return {
          date: currentDate,
          items: generateDayPlan(dayAttractions, i, intensity)
        };
      });
      setItinerary(newItinerary);
    }
  }, [dateRange, city, attractions, intensity, travelStyle]);

  // Optionally filter attractions based on interests.
  const filteredAttractions = useMemo(() => {
    if (!attractions) return [];
    return attractions.filter(attraction => 
      !interests.length || 
      attraction.types.some(type => interests.includes(type.toLowerCase()))
    );
  }, [attractions, interests]);

  function generateDayAttractions(attractions: Attraction[], date: Date, totalDays: number): Attraction[] {
    const sortedAttractions = [...attractions]
      .sort((a, b) => b.rating - a.rating)
      .filter(attraction => isAttractionOpen(attraction, date));
    const attractionsPerDay = Math.ceil(sortedAttractions.length / totalDays);
    const dayIndex = differenceInDays(date, dateRange!.from!);
    return sortedAttractions.slice(
      dayIndex * attractionsPerDay,
      (dayIndex + 1) * attractionsPerDay
    );
  }

  function isAttractionOpen(attraction: Attraction, date: Date): boolean {
    if (!attraction.opening_hours?.periods) return true;
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    return attraction.opening_hours.periods.some(period => period.open.day === dayOfWeek);
  }

  function generateDayPlan(attractions: Attraction[], dayIndex: number, intensity: 'light' | 'moderate' | 'full'): ItineraryItem[] {
    const timeSlots = generateTimeSlots(intensity);
    return timeSlots.map((slot, index) => {
      const attraction = attractions[index % attractions.length];
      return {
        id: `activity-${dayIndex}-${index}`,
        time: `${String(slot.start).padStart(2, '0')}:00`,
        activity: attraction.name,
        location: attraction.name,
        address: attraction.location,
        rating: attraction.rating,
        type: 'attraction',
        imageUrl: attraction.photo,
        duration: (slot.end - slot.start) * 60,
        price: attraction.price_level ? '💰'.repeat(attraction.price_level) : undefined,
        description: attraction.description || 
          `Visit this highly rated attraction (${attraction.rating}/5). Known for: ${attraction.types.join(', ')}`,
        tags: attraction.types
      };
    });
  }

  function handleReorderItems(dayIndex: number, items: ItineraryItem[]) {
    setItinerary(current => 
      current.map((day, i) => i === dayIndex ? { ...day, items } : day)
    );
  }

  function handleAddCustomActivity(dayIndex: number) {
    const newItem: ItineraryItem = {
      id: `custom-${Date.now()}`,
      time: "12:00",
      activity: "Custom Activity",
      type: 'custom',
      duration: 60
    };
    setItinerary(current => 
      current.map((day, i) => i === dayIndex 
        ? { ...day, items: [...day.items, newItem] }
        : day
      )
    );
  }

  function handleDeleteActivity(dayIndex: number, itemId: string) {
    setItinerary(current => 
      current.map((day, i) => i === dayIndex 
        ? { ...day, items: day.items.filter(item => item.id !== itemId) }
        : day
      )
    );
  }

  if (isLoadingAttractions) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (attractionsError) {
    return (
      <Card className="text-center p-6">
        <CardTitle className="mb-2">Error Loading Attractions</CardTitle>
        <CardDescription>
          We encountered an error while loading attractions for {city}.
          Please try again later.
        </CardDescription>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries(['/api/attractions', city])}
        >
          Retry
        </Button>
      </Card>
    );
  }

  if (!attractions?.length) {
    return (
      <Card className="text-center p-6">
        <CardTitle className="mb-2">No Attractions Found</CardTitle>
        <CardDescription>
          We couldn't find any attractions for {city}. Try selecting a different city.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Itinerary for {city}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {dateRange?.from && dateRange?.to 
              ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
              : 'No dates selected'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? <LayoutGrid className="h-4 w-4" /> : <LayoutList className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveMutation.mutate(itinerary)}
            disabled={saveMutation.isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
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
              <CardHeader className={cn("bg-primary/5", selectedDay === dayIndex && "bg-primary/10")}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(day.date, 'EEEE, MMMM d')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddCustomActivity(dayIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Activity
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Reorder.Group
                  axis="y"
                  values={day.items}
                  onReorder={(items) => handleReorderItems(dayIndex, items)}
                  className="space-y-4"
                >
                  {day.items.map((item) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      className={cn(
                        "flex flex-col gap-2 p-4 bg-card rounded-lg border shadow-sm",
                        "hover:border-primary/50 transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.time}</span>
                        <span className="flex-1 font-medium">{item.activity}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings2 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleDeleteActivity(dayIndex, item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 ml-7">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
