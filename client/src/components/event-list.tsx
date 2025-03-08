import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";

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

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: [`/api/events/${city}`],
    enabled: !!city,
  });

  const groupedEvents = useMemo(() => {
    if (!events) return new Map<string, Event[]>();

    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const filteredEvents = dateRange?.from && dateRange?.to
      ? sortedEvents.filter(event => isWithinInterval(parseISO(event.date), {
          start: dateRange.from!,
          end: dateRange.to!
        }))
      : sortedEvents;

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
    setExpandedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
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
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
