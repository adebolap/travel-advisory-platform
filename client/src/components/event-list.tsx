import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";

interface Event {
  id: number;
  name: string;
  url: string;
  date: string;
  image: string;
  venue: string;
  location: string;
  price: string;
  category: string;
  description: string;
}

interface EventListProps {
  city: string;
  dateRange?: DateRange;
  compact?: boolean;
}

// Predefined categories for filtering
const eventCategories = {
  "music": { label: "Music", color: "bg-blue-100 text-blue-800" },
  "sports": { label: "Sports", color: "bg-red-100 text-red-800" },
  "arts": { label: "Arts & Theatre", color: "bg-purple-100 text-purple-800" },
  "family": { label: "Family", color: "bg-green-100 text-green-800" },
  "other": { label: "Other", color: "bg-gray-100 text-gray-800" }
};

function EventSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventList({ city, dateRange, compact = false }: EventListProps) {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: [`/api/events/${city}`],
    enabled: !!city,
  });

  // Filter and group events by date, ensuring chronological order
  const groupedEvents = useMemo(() => {
    if (!events) return new Map<string, Event[]>();

    // Sort events by date first
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter events based on dateRange if provided
    const filteredEvents = dateRange?.from && dateRange?.to
      ? sortedEvents.filter(event => {
          const eventDate = parseISO(event.date);
          return isWithinInterval(eventDate, {
            start: dateRange.from,
            end: dateRange.to
          });
        })
      : sortedEvents;

    // Group events by date
    const grouped = new Map<string, Event[]>();
    filteredEvents.forEach(event => {
      const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    return grouped;
  }, [events, dateRange]);

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <EventSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No events found for {city}</p>
      </Card>
    );
  }

  // Convert groupedEvents to array and sort by date
  const sortedDates = Array.from(groupedEvents.keys()).sort();

  return (
    <div className="space-y-4">
      {sortedDates.map((dateKey) => {
        const dateEvents = groupedEvents.get(dateKey)!;
        return (
          <Card key={dateKey} className="overflow-hidden">
            <CardHeader 
              className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer"
              onClick={() => toggleDateExpansion(dateKey)}
            >
              <CardTitle className="text-lg">
                {format(parseISO(dateKey), 'EEEE, MMMM d')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{dateEvents.length} events</Badge>
                {expandedDates.includes(dateKey) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {(expandedDates.includes(dateKey) || compact) && (
              <CardContent>
                <div className="space-y-4">
                  {dateEvents.map((event) => (
                    <div key={event.id} className={`${compact ? 'py-2' : 'md:flex border-b last:border-0 pb-4'}`}>
                      {!compact && event.image && (
                        <div className="w-full md:w-48 h-48 md:h-auto">
                          <img
                            src={event.image}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`${compact ? 'text-base' : 'text-xl'} font-semibold`}>
                            {event.name}
                          </h3>
                          <Badge variant="secondary" className="capitalize">
                            {event.category.toLowerCase()}
                          </Badge>
                        </div>
                        {!compact && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {event.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.venue}
                          </div>
                          <div className="flex items-center gap-1">
                            <Ticket className="h-4 w-4" />
                            {event.price}
                          </div>
                        </div>
                        <div className="mt-2">
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}