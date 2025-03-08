import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Map, Globe, Star, Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Layout } from "@/components/layout";
import { insertCitySchema, popularCities, type InsertCity } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AchievementsGrid } from "@/components/achievements/achievements-grid";
import type { AchievementType, AchievementLevel } from "@shared/schema";

interface CityEntry {
  id: string;
  name: string;
  country: string;
  visitDate: string;
  memories?: string;
  rating: number;
  photos?: string[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [cities, setCities] = useState<CityEntry[]>([]);
  const form = useForm<InsertCity>({
    resolver: zodResolver(insertCitySchema),
  });
  const [achievements, setAchievements] = useState<Array<{
    type: AchievementType;
    level: AchievementLevel;
    progress: number;
    isNew?: boolean;
  }>>([]);

  const onSubmit = (data: InsertCity) => {
    setCities([
      ...cities,
      {
        id: Date.now().toString(),
        ...data,
        visitDate: new Date(data.visitDate).toISOString(),
      },
    ]);
    form.reset();
  };

  const deleteCity = (id: string) => {
    setCities(cities.filter((city) => city.id !== id));
  };

  // Calculate statistics
  const totalCities = cities.length;
  const totalCountries = new Set(cities.map((city) => city.country)).size;

  useEffect(() => {
    const newAchievements = [
      {
        type: "citiesVisited" as AchievementType,
        level: "bronze" as AchievementLevel,
        progress: cities.length,
        isNew: cities.length === 5 // Example of when to show the "New!" badge
      },
      {
        type: "countriesVisited" as AchievementType,
        level: "bronze" as AchievementLevel,
        progress: new Set(cities.map(city => city.country)).size
      },
      {
        type: "ratings" as AchievementType,
        level: "bronze" as AchievementLevel,
        progress: cities.filter(city => city.rating > 0).length
      }
    ];
    setAchievements(newAchievements);
  }, [cities]);

  return (
    <Layout title="Travel Profile" subtitle="Track your adventures">
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Cities Visited</h3>
              </div>
              <p className="text-3xl font-bold mt-2">{totalCities}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Countries Explored</h3>
              </div>
              <p className="text-3xl font-bold mt-2">{totalCountries}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add New City Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Visited City</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {popularCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="memories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memories</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Share your favorite memory..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Rate your experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {"⭐".repeat(rating)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add City
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Add Achievements Section */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementsGrid achievements={achievements} />
          </CardContent>
        </Card>

        {/* Cities List */}
        <div className="grid gap-4">
          {cities.map((city) => (
            <Card key={city.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Map className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{city.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Visited on {new Date(city.visitDate).toLocaleDateString()}
                    </p>
                    {city.memories && (
                      <p className="text-sm mt-2">{city.memories}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: city.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteCity(city.id)}
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