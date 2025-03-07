import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Calendar, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Layout } from "@/components/layout";

interface TripPlan {
  id: string;
  destination: string;
  date: string;
  notes: string;
  isCompleted: boolean;
}

export default function PlanPage() {
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const form = useForm<Omit<TripPlan, "id" | "isCompleted">>();

  const onSubmit = (data: Omit<TripPlan, "id" | "isCompleted">) => {
    setTrips([
      ...trips,
      {
        id: Date.now().toString(),
        ...data,
        isCompleted: false,
      },
    ]);
    form.reset();
  };

  const toggleComplete = (id: string) => {
    setTrips(
      trips.map((trip) =>
        trip.id === id ? { ...trip, isCompleted: !trip.isCompleted } : trip
      )
    );
  };

  const deleteTrip = (id: string) => {
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  return (
    <Layout title="Travel Diary" subtitle="Plan your future adventures">
      <div className="space-y-8">
        {/* Add New Trip Form */}
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where do you want to go?</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter destination..."
                            {...field}
                            className="flex-1"
                          />
                          <Button type="submit">
                            <Plus className="h-4 w-4" />
                            <span className="ml-2">Add Trip</span>
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>When?</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Add some notes..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Trip List */}
        <div className="grid gap-4">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className={`transition-colors ${
                trip.isCompleted ? "bg-muted" : ""
              }`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{trip.destination}</h3>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(trip.date).toLocaleDateString()}</span>
                    </div>
                    {trip.notes && (
                      <p className="mt-1 text-sm">{trip.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleComplete(trip.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteTrip(trip.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
