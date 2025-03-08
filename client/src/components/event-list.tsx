import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

const eventCategories = {
  "music": { label: "Music", color: "bg-blue-100 text-blue-800" },
  "sports": { label: "Sports", color: "bg-red-100 text-red-800" },
  "arts": { label: "Arts & Theatre", color: "bg-purple-100 text-purple-800" },
  "family": { label: "Family", color: "bg-green-100 text-green-800" },
  "other": { label: "Other", color: "bg-gray-100 text-gray-800" }
} as const;

export default function EventList({ city, dateRange, compact = false }: EventListProps) {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  // Create default date range if none provided (current month)
  const effectiveDateRange = useMemo(() => {
    if (dateRange?.from && dateRange?.to) return dateRange;
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: endOfMonth(today)
    };
  }, [dateRange]);

  // Format dates for API query
  const formattedFrom = effectiveDateRange.from ? format(effectiveDateRange.from, 'yyyy-MM-dd') : undefined;
  const formattedTo = effectiveDateRange.to ? format(effectiveDateRange.to, 'yyyy-MM-dd') : undefined;

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', city, formattedFrom, formattedTo],
    enabled: !!city && !!formattedFrom && !!formattedTo,
  });

  const groupedEvents = useMemo(() => {
    if (!events) return new Map<string, Event[]>();

    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const filteredEvents = sortedEvents.filter(event => 
      isWithinInterval(parseISO(event.date), {
        start: effectiveDateRange.from!,
        end: effectiveDateRange.to!
      })
    );

    const grouped = new Map<string, Event[]>();
    filteredEvents.forEach(event => {
      const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    return grouped;
  }, [events, effectiveDateRange]);

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 text-center animate-pulse">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <Card className="p-6 text-center">
        <CardTitle className="text-lg mb-2">No Events Found</CardTitle>
        <p className="text-sm text-muted-foreground">
          There are no events scheduled in {city} for the selected dates.
        </p>
      </Card>
    );
  }

  const sortedDates = Array.from(groupedEvents.keys()).sort();

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {sortedDates.map((dateKey) => {
          const dateEvents = groupedEvents.get(dateKey)!;
          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader
                  className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => toggleDateExpansion(dateKey)}
                >
                  <CardTitle className="text-lg font-semibold">
                    {format(parseISO(dateKey), 'EEEE, MMMM d')}
                  </CardTitle>
                  <Button variant="ghost" size="icon">
                    {expandedDates.includes(dateKey) ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </CardHeader>
                {expandedDates.includes(dateKey) && (
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {dateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="font-semibold">{event.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{event.venue}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{format(parseISO(event.date), 'h:mm a')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Ticket className="h-4 w-4" />
                                <span>{event.price}</span>
                              </div>
                              {event.location && (
                                <div className="text-sm text-muted-foreground mt-2">
                                  <strong>Address:</strong> {event.location}
                                </div>
                              )}
                            </div>
                            <Badge 
                              className={cn(
                                "whitespace-nowrap",
                                eventCategories[event.category as keyof typeof eventCategories]?.color || 
                                eventCategories.other.color
                              )}
                            >
                              {eventCategories[event.category as keyof typeof eventCategories]?.label || 
                               eventCategories.other.label}
                            </Badge>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                          {event.url && (
                            <Button
                              variant="link"
                              className="mt-2 p-0 h-auto text-primary"
                              asChild
                            >
                              <a href={event.url} target="_blank" rel="noopener noreferrer">
                                View Details
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}