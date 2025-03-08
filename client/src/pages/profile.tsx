import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Map, Globe, Star, Plus, Trash2, ImagePlus, Search, Filter, Award } from "lucide-react";
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
import { motion } from "framer-motion";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const newAchievements = [
      {
        type: "citiesVisited" as AchievementType,
        level: "bronze" as AchievementLevel,
        progress: cities.length,
        isNew: cities.length === 5
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
        <div className="flex gap-4 items-center mb-6">
          <Input
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="grid gap-4">
          {filteredCities.map((city) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{city.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Visited on {new Date(city.visitDate).toLocaleDateString()}
                    </p>
                    {city.memories && <p className="mt-1 text-sm">{city.memories}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCity(city.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementsGrid achievements={achievements} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
