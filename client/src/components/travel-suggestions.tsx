import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Moon, Calendar, Sun, Umbrella, DollarSign, Lightbulb, Home, Train } from "lucide-react";

interface TravelSuggestionsProps {
  city: string;
  interests: string[];
}

const mockSuggestions = {
  shopping: {
    icon: ShoppingBag,
    title: "Shopping Hours",
    suggestion: "Most shops open 10AM-8PM, late night Thursdays"
  },
  nightlife: {
    icon: Moon,
    title: "Nightlife Scene",
    suggestion: "Best venues active 10PM-3AM, peak Thu-Sat"
  },
  culture: {
    icon: Calendar,
    title: "Cultural Events",
    suggestion: "Plan for July-August for festivals"
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
  },
  budget: {
    icon: DollarSign,
    title: "Budget-Friendly Period",
    suggestion: "Visit during off-season (Nov-Feb)"
  },
  tips: {
    icon: Lightbulb,
    title: "Travel Tips",
    suggestion: "Book 3 months ahead for best rates"
  },
  local: {
    icon: Home,
    title: "Local Experience",
    suggestion: "Weekend community events in city center"
  },
  transport: {
    icon: Train,
    title: "Transportation",
    suggestion: "Public transport 5AM-midnight"
  }
};

export default function TravelSuggestions({ city, interests }: TravelSuggestionsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Best Time to Visit {city}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {interests.map(interest => {
          const suggestion = mockSuggestions[interest as keyof typeof mockSuggestions];
          if (!suggestion) return null;

          const Icon = suggestion.icon;

          return (
            <Card key={interest} className="bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-h-[60px]">
                    <h3 className="text-sm font-semibold mb-1">{suggestion.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.suggestion}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}