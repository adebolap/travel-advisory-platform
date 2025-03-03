import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Sun, Umbrella } from "lucide-react";

interface TravelSuggestionsProps {
  city: string;
  interests: string[];
}

const mockSuggestions = {
  budget: {
    icon: DollarSign,
    title: "Budget-Friendly Period",
    suggestion: "Visit during off-season (November-February) for better deals"
  },
  culture: {
    icon: Calendar,
    title: "Cultural Events",
    suggestion: "Plan for July-August when most festivals happen"
  },
  food: {
    icon: Sun,
    title: "Food Festivals",
    suggestion: "Spring (March-May) has the best food festivals"
  },
  nature: {
    icon: Umbrella,
    title: "Outdoor Activities",
    suggestion: "Best weather from April to June"
  }
};

export default function TravelSuggestions({ city, interests }: TravelSuggestionsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Best Time to Visit {city}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {interests.map(interest => {
          const suggestion = mockSuggestions[interest as keyof typeof mockSuggestions];
          if (!suggestion) return null;

          const Icon = suggestion.icon;

          return (
            <Card key={interest}>
              <CardHeader className="flex flex-row items-center space-x-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{suggestion.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{suggestion.suggestion}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
