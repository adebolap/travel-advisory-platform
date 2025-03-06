import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

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

export default function EventList({ city }: EventListProps) {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: [`/api/events/${city}`],
    enabled: !!city,
  });

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

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <div className="md:flex">
            {event.image && (
              <div className="w-full md:w-48 h-48 md:h-auto">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{event.name}</h3>
                <Badge variant="secondary" className="capitalize">
                  {event.category.toLowerCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {event.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(parseISO(event.date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.venue}, {event.location}
                </div>
                <div className="flex items-center gap-1">
                  <Ticket className="h-4 w-4" />
                  {event.price}
                </div>
              </div>
              <div className="mt-4">
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Event Details
                </a>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}