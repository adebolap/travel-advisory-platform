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
    suggestion: "Most shops are open 10AM-8PM, with late night shopping on Thursdays"
  },
  nightlife: {
    icon: Moon,
    title: "Nightlife Scene",
    suggestion: "Best venues are active from 10PM-3AM, peak days Thursday to Saturday"
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
  },
  budget: {
    icon: DollarSign,
    title: "Budget-Friendly Period",
    suggestion: "Visit during off-season (November-February) for better deals"
  },
  tips: {
    icon: Lightbulb,
    title: "Travel Tips",
    suggestion: "Book accommodations 3 months in advance for best rates"
  },
  local: {
    icon: Home,
    title: "Local Experience",
    suggestion: "Join local community events every weekend in the city center"
  },
  transport: {
    icon: Train,
    title: "Transportation",
    suggestion: "Public transport runs from 5AM to midnight, get a travel card for discounts"
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
            <Card key={interest} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                </div>
                <p className="text-muted-foreground">{suggestion.suggestion}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}