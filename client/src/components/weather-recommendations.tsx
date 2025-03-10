import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sun, Cloud, CloudRain, Snow, Wind, 
  Umbrella, Coffee, Museum, Beach, 
  TreePine, Mountain, Tent 
} from "lucide-react";
import { motion } from "framer-motion";

interface WeatherRecommendationsProps {
  city: string;
  currentWeather: string;
  temperature?: number;
  weatherCondition?: string;
}

interface Recommendation {
  title: string;
  description: string;
  icon: React.ElementType;
  tags: string[];
}

export default function WeatherRecommendations({ 
  city, 
  currentWeather, 
  temperature, 
  weatherCondition 
}: WeatherRecommendationsProps) {
  
  const getRecommendations = (): Recommendation[] => {
    const baseRecommendations: Recommendation[] = [];

    // Temperature-based recommendations
    if (temperature !== undefined) {
      if (temperature > 25) {
        baseRecommendations.push({
          title: "Beach & Water Activities",
          description: "Perfect weather for swimming and beach activities",
          icon: Beach,
          tags: ["outdoor", "water", "relaxation"]
        });
      } else if (temperature < 10) {
        baseRecommendations.push({
          title: "Indoor Cultural Sites",
          description: "Great time to explore museums and galleries",
          icon: Museum,
          tags: ["indoor", "cultural", "education"]
        });
      }
    }

    // Weather condition based recommendations
    switch (weatherCondition?.toLowerCase()) {
      case "rain":
      case "drizzle":
        baseRecommendations.push({
          title: "Indoor Activities",
          description: "Visit museums, cafes, or shopping centers",
          icon: Coffee,
          tags: ["indoor", "culture", "food"]
        });
        break;
      case "snow":
        baseRecommendations.push({
          title: "Winter Activities",
          description: "Perfect for skiing or winter sports",
          icon: Mountain,
          tags: ["outdoor", "sports", "winter"]
        });
        break;
      case "clear":
        baseRecommendations.push({
          title: "Outdoor Adventures",
          description: "Ideal weather for hiking and outdoor activities",
          icon: TreePine,
          tags: ["outdoor", "nature", "active"]
        });
        break;
      case "clouds":
        baseRecommendations.push({
          title: "City Exploration",
          description: "Good conditions for walking tours and sightseeing",
          icon: Tent,
          tags: ["outdoor", "sightseeing", "moderate"]
        });
        break;
    }

    // Add seasonal recommendations based on temperature ranges
    if (temperature !== undefined) {
      if (temperature >= 20 && temperature <= 28) {
        baseRecommendations.push({
          title: "Perfect Outdoor Time",
          description: "Ideal temperature for all outdoor activities",
          icon: Sun,
          tags: ["outdoor", "comfortable", "versatile"]
        });
      }
    }

    return baseRecommendations;
  };

  const recommendations = getRecommendations();

  if (!recommendations.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weather-Smart Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rec.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
