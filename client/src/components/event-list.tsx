import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: number;
  name: string;
  date: string;
  type: string;
}

interface EventListProps {
  city: string;
}

export default function EventList({ city }: EventListProps) {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', city],
    enabled: !!city
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upcoming Events in {city}</h2>
      <div className="space-y-4">
        {events?.map((event) => (
          <Card key={event.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{event.name}</CardTitle>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {event.date}
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{event.type}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}