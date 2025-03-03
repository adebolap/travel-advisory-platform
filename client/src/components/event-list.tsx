import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { DatePicker } from "./date-picker";
import { useState } from "react";

interface Event {
  id: number;
  name: string;
  date: string;
  type: string;
  description: string;
  highlight: boolean;
}

interface EventListProps {
  city: string;
}

export default function EventList({ city }: EventListProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', city, selectedDate?.toISOString()],
    enabled: !!city
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Events in {city}</h2>
        <DatePicker 
          date={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <div className="space-y-4">
        {events?.map((event) => (
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
              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
              <Badge 
                variant={event.highlight ? "default" : "secondary"}
                className="capitalize"
              >
                {event.type}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}