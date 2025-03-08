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
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { motion } from "framer-motion";

interface TripPlan {
  id: string;
  destination: string;
  date: string;
  notes: string;
  isCompleted: boolean;
}

export default function PlanPage() {
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<TripPlan | null>(null);
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

  const confirmDeleteTrip = (trip: TripPlan) => {
    setTripToDelete(trip);
    setIsModalOpen(true);
  };

  const deleteTrip = () => {
    if (tripToDelete) {
      setTrips(trips.filter((trip) => trip.id !== tripToDelete.id));
      setIsModalOpen(false);
      setTripToDelete(null);
    }
  };

  return (
    <Layout title="Travel Diary" subtitle="Plan your future adventures">
      <div className="space-y-8">
        <Card className="overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Plane className="h-6 w-6 text-primary animate-pulse" />
              Plan Your Next Adventure
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Destination
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
                            className="hover:border-primary hover:shadow-md focus:ring-primary/20"
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
                            className="hover:border-primary hover:shadow-md focus:ring-primary/20"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary/90 hover:bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Travel Plans
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {trips.map((trip) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-primary/40 bg-muted">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary animate-bounce" />
                    {trip.destination}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" /> {new Date(trip.date).toLocaleDateString()}
                  </p>
                  {trip.notes && <p className="text-sm italic mt-2">{trip.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => confirmDeleteTrip(trip)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete Trip</ModalTitle>
            </ModalHeader>
            <p>Are you sure you want to delete this trip?</p>
            <ModalFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteTrip}>
                Confirm Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Layout>
  );
}
