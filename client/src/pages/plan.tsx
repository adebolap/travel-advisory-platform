import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Calendar, MapPin, Edit2, Trash2, Plane, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Layout } from "@/components/layout";
import { CitySelector } from "@/components/city-selector";
import type { InsertCity } from "@shared/schema";

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
        <Card className="overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Plane className="h-6 w-6 text-primary animate-pulse" />
              Plan Your Next Adventure
            </CardTitle>
          </CardHeader>
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
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Where do you want to go?
                      </FormLabel>
                      <FormControl>
                        <CitySelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Choose your destination..."
                        />
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
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          When?
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="transition-all hover:border-primary hover:shadow-md focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Edit2 className="h-4 w-4 text-primary" />
                          Notes
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Add some notes..."
                            {...field}
                            className="transition-all hover:border-primary hover:shadow-md focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full transition-all hover:scale-105 active:scale-95 bg-primary/90 hover:bg-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Travel Plans
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Trip List */}
        <div className="grid gap-4">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className={`transition-all duration-300 transform hover:scale-[1.02] border-2 ${
                trip.isCompleted ? "bg-muted border-primary/20" : "border-primary/40"
              }`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary animate-bounce" />
                    <h3 className="font-medium text-lg">{trip.destination}</h3>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{new Date(trip.date).toLocaleDateString()}</span>
                    </div>
                    {trip.notes && (
                      <p className="mt-2 text-sm italic">{trip.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleComplete(trip.id)}
                    className="transition-transform hover:scale-110 active:scale-95 hover:border-primary hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteTrip(trip.id)}
                    className="transition-transform hover:scale-110 active:scale-95 hover:bg-destructive hover:text-destructive-foreground"
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