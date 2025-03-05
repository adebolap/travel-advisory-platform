import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
//import { DatePicker } from "./date-picker"; // Removed as date picker is now a prop
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";

interface Event {
  id: number;
  name: string;
  date: string;
  type: string;
  description: string;
  highlight: boolean;
  source?: string;
  url?: string;
  location?: string;
  category?: string;
  price?: string;
  culturalSignificance?: string;
}

interface EventListProps {
  city: string;
  dateRange?: DateRange;
}

// Event categories with visual styling
const eventCategories = {
  "cultural": { label: "Cultural", color: "bg-purple-100 text-purple-800" },
  "festival": { label: "Festival", color: "bg-green-100 text-green-800" },
  "music": { label: "Music", color: "bg-blue-100 text-blue-800" },
  "art": { label: "Art", color: "bg-pink-100 text-pink-800" },
  "food": { label: "Food", color: "bg-orange-100 text-orange-800" },
  "sport": { label: "Sport", color: "bg-red-100 text-red-800" }
};

function EventSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventList({ city, dateRange }: EventListProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', city, dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), selectedCategories],
    enabled: !!city
  });

  const filteredEvents = events?.filter(event =>
    selectedCategories.length === 0 || selectedCategories.includes(event.category || 'other')
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h2 className="text-2xl font-bold">Events in {city}</h2>
          {/* DatePicker removed */}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <EventSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Events in {city}</h2>
        {/* DatePicker removed */}

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(eventCategories).map(([key, { label, color }]) => (
            <Button
              key={key}
              variant={selectedCategories.includes(key) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCategory(key)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents?.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {event.highlight && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
                {event.name}
              </CardTitle>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {format(parseISO(event.date), 'MMM d, yyyy')}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                {event.category && (
                  <Badge
                    variant="secondary"
                    className={`capitalize ${eventCategories[event.category as keyof typeof eventCategories]?.color || ''}`}
                  >
                    {event.category}
                  </Badge>
                )}
                {event.culturalSignificance && (
                  <Badge variant="outline" className="bg-purple-50">
                    Cultural Event
                  </Badge>
                )}
                {event.price && (
                  <span className="text-xs text-muted-foreground">
                    Price: {event.price}
                  </span>
                )}
                {event.location && (
                  <span className="text-xs text-muted-foreground">
                    Location: {event.location}
                  </span>
                )}
                {event.source && (
                  <span className="text-xs text-muted-foreground">
                    Source: {event.source}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}