import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, MapPin, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  location: string;
  price: string;
  category: string;
  url: string;
  image: string;
}

interface EventListProps {
  city: string;
  dateRange?: DateRange;
}

export default function EventList({ city, dateRange }: EventListProps) {
  const { data: events, isLoading, error, refetch } = useQuery<Event[]>({
    queryKey: ['events', city, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      // Construct query parameters
      const params = new URLSearchParams({
        city: city.trim()
      });

      if (dateRange?.from) {
        params.append('from', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange?.to) {
        params.append('to', format(dateRange.to, 'yyyy-MM-dd'));
      }

      console.log('Fetching events with params:', params.toString());

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch events');
      }
      return response.json();
    },
    enabled: Boolean(city?.trim()),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <CardTitle className="text-lg">Unable to Load Events</CardTitle>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load events'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!events?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">
            No events found for {city} during the selected dates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 rounded-lg border bg-card transition-colors hover:bg-accent/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold line-clamp-2">{event.name}</h3>
                <div className="flex flex-wrap gap-y-2 gap-x-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(parseISO(event.date), 'PPp')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{event.venue}</span>
                  </div>
                  {event.price && (
                    <div className="flex items-center gap-2 text-sm">
                      <Ticket className="h-4 w-4" />
                      <span>{event.price}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge>
                {event.category}
              </Badge>
            </div>
            {event.url && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  asChild
                >
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    View Details
                  </a>
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}