import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarPlus, Trash2 } from "lucide-react";
import CalendarIntegration from "@/components/calendar-integration";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function MyTrips() {
  const { toast } = useToast();
  
  const { data: trips, isLoading } = useQuery({
    queryKey: ["/api/trips"],
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete trip");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({
        title: "Trip deleted",
        description: "Your trip has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!trips?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No trips saved yet. Start planning your next adventure!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Trips</h1>
      <div className="space-y-6">
        {trips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">{trip.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTripMutation.mutate(trip.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground">{trip.description}</p>
                  <p className="text-sm mt-2">
                    {format(new Date(trip.startDate), "MMM d, yyyy")} -{" "}
                    {format(new Date(trip.endDate), "MMM d, yyyy")}
                  </p>
                </div>
                <CalendarIntegration
                  event={{
                    id: trip.id,
                    name: trip.title,
                    description: trip.description,
                    date: trip.startDate,
                    endDate: trip.endDate,
                    location: trip.city,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
