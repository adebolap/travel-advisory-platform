import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, ChevronDown, ChevronUp, Clock, ExternalLink, Filter, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, startOfMonth, endOfMonth, addMonths, isSameDay } from "date-fns";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  maxEvents?: number;
  onEventClick?: (event: Event) => void;
}

const eventCategories = {
  "music": { label: "Music", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  "sports": { label: "Sports", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  "arts": { label: "Arts & Theatre", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  "family": { label: "Family", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  "comedy": { label: "Comedy", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  "food": { label: "Food & Drink", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  "other": { label: "Other", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" }
} as const;

export default function EventList({ 
  city, 
  dateRange, 
  compact = false, 
  maxEvents = 50,
  onEventClick 
}: EventListProps) {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [visibleEvents, setVisibleEvents] = useState(compact ? 3 : 10);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Create default date range if none provided (current month)
  const effectiveDateRange = useMemo(() => {
    if (dateRange?.from && dateRange?.to) return dateRange;
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: endOfMonth(addMonths(today, 1))
    };
  }, [dateRange]);

  // Format dates for API query
  const formattedFrom = effectiveDateRange.from ? format(effectiveDateRange.from, 'yyyy-MM-dd') : undefined;
  const formattedTo = effectiveDateRange.to ? format(effectiveDateRange.to, 'yyyy-MM-dd') : undefined;

  const { data: events, isLoading, error, refetch } = useQuery<Event[]>({
    queryKey: ['events', city, formattedFrom, formattedTo],
    queryFn: async () => {
      const response = await fetch(`/api/events?city=${encodeURIComponent(city)}&from=${formattedFrom}&to=${formattedTo}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    enabled: Boolean(city) && Boolean(formattedFrom) && Boolean(formattedTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Manual intersection observer implementation
  useEffect(() => {
    if (!loadMoreRef.current || compact) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleEvents(prev => Math.min(prev + 10, maxEvents));
      }
    }, { threshold: 0.1 });

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [compact, maxEvents]);

  // Reset visible events when city or date range changes
  useEffect(() => {
    setVisibleEvents(compact ? 3 : 10);
  }, [city, formattedFrom, formattedTo, compact]);

  // Auto-expand today's events
  useEffect(() => {
    if (events?.length) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const hasTodayEvents = events.some(event => {
        const eventDate = format(parseISO(event.date), 'yyyy-MM-dd');
        return eventDate === today;
      });

      if (hasTodayEvents) {
        setExpandedDates(prev => prev.includes(today) ? prev : [...prev, today]);
      }
    }
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events?.length) return [];

    return events.filter(event => {
      if (activeFilter === "all") return true;
      return event.category === activeFilter;
    });
  }, [events, activeFilter]);

  const groupedEvents = useMemo(() => {
    if (!filteredEvents?.length) return new Map<string, Event[]>();

    const sortedEvents = [...filteredEvents].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const grouped = new Map<string, Event[]>();
    sortedEvents.forEach(event => {
      const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    return grouped;
  }, [filteredEvents]);

  const availableCategories = useMemo(() => {
    if (!events?.length) return [];

    const categories = new Set<string>();
    events.forEach(event => categories.add(event.category));

    return ["all", ...Array.from(categories)];
  }, [events]);

  const toggleDateExpansion = useCallback((dateKey: string) => {
    setExpandedDates(prev => 
      prev.includes(dateKey) ? prev.filter(d => d !== dateKey) : [...prev, dateKey]
    );
  }, []);

  const handleEventClick = useCallback((event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    } else if (event.url) {
      window.open(event.url, '_blank', 'noopener,noreferrer');
    }
  }, [onEventClick]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="p-4 border rounded-lg">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <div className="flex gap-4 mb-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <CardTitle className="text-lg">Unable to Load Events</CardTitle>
          <p className="text-sm text-muted-foreground mb-4">
            There was a problem loading events for {city}.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </Card>
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

  if (filteredEvents.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CardTitle className="text-lg mb-2">No Matching Events</CardTitle>
        <p className="text-sm text-muted-foreground mb-4">
          There are no {activeFilter !== "all" ? activeFilter : ""} events matching your filter.
        </p>
        <Button onClick={() => setActiveFilter("all")} variant="outline" size="sm">
          Show All Events
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {availableCategories.length > 1 && (
        <div className="flex justify-between items-center">
          <Tabs 
            value={activeFilter} 
            onValueChange={setActiveFilter}
            className="w-full overflow-auto pb-1"
          >
            <TabsList className="w-full justify-start">
              {availableCategories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category === "all" ? "All Events" : eventCategories[category as keyof typeof eventCategories]?.label || category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className={compact ? "max-h-[400px] overflow-auto pr-1" : ""}>
        <div className="space-y-4">
          {[...groupedEvents.entries()]
            .slice(0, visibleEvents)
            .map(([dateKey, dateEvents]) => (
            <Card key={dateKey} className="overflow-hidden">
              <CardHeader
                className={cn(
                  "flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer transition-colors",
                  expandedDates.includes(dateKey) ? "bg-accent/50" : "hover:bg-accent/30"
                )}
                onClick={() => toggleDateExpansion(dateKey)}
              >
                <div className="flex flex-col">
                  <CardTitle className="text-lg">
                    {format(parseISO(dateKey), 'EEEE, MMMM d')}
                  </CardTitle>
                  <CardDescription>
                    {dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  {expandedDates.includes(dateKey) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardHeader>

              <AnimatePresence>
                {expandedDates.includes(dateKey) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {dateEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                              "p-4 rounded-lg border bg-card transition-colors",
                              onEventClick ? "hover:bg-accent/50 cursor-pointer" : "hover:bg-accent/30"
                            )}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <h3 className="font-semibold line-clamp-2">{event.name}</h3>
                                <div className="flex flex-wrap gap-y-2 gap-x-4">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate max-w-[200px]">{event.venue}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                    <span>{format(parseISO(event.date), 'h:mm a')}</span>
                                  </div>
                                  {event.price && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Ticket className="h-4 w-4 flex-shrink-0" />
                                      <span>{event.price}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge className={cn(
                                "whitespace-nowrap flex-shrink-0",
                                eventCategories[event.category as keyof typeof eventCategories]?.color ||
                                eventCategories.other.color
                              )}>
                                {eventCategories[event.category as keyof typeof eventCategories]?.label ||
                                eventCategories.other.label}
                              </Badge>
                            </div>
                            {!compact && event.description && (
                              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            {event.url && (
                              <div className="mt-3 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                                    View Details
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}

          {!compact && filteredEvents.length > visibleEvents && (
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setVisibleEvents(prev => Math.min(prev + 10, maxEvents))}
              >
                Load More Events
              </Button>
            </div>
          )}

          {compact && filteredEvents.length > visibleEvents && (
            <div className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setVisibleEvents(maxEvents)}
              >
                Show All Events
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}