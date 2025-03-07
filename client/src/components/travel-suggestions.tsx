import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Moon, Calendar, Sun, Umbrella, DollarSign, Lightbulb, Home, Train } from "lucide-react";
import type { SearchPreference } from "@shared/schema";

interface TravelSuggestionsProps {
  city: string;
  interests: string[];
  preferences?: SearchPreference;
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
    title: "Transport",
    suggestion: "Public transport runs 5AM to midnight"
  }
};

export default function TravelSuggestions({ city, interests, preferences }: TravelSuggestionsProps) {
  // Get personalized suggestions based on user preferences
  const getPersonalizedSuggestion = (interest: string) => {
    const suggestion = mockSuggestions[interest as keyof typeof mockSuggestions];
    if (!suggestion) return null;

    // Modify suggestion based on preferences
    if (preferences?.travelStyle === 'Budget' && interest === 'budget') {
      return {
        ...suggestion,
        suggestion: "Best deals in off-season (Nov-Feb), book 3 months ahead"
      };
    }

    if (preferences?.travelWithKids && (interest === 'culture' || interest === 'food')) {
      return {
        ...suggestion,
        suggestion: `Family-friendly ${suggestion.suggestion.toLowerCase()}`
      };
    }

    return suggestion;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Best Time to Visit {city}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {interests.map(interest => {
          const suggestion = getPersonalizedSuggestion(interest);
          if (!suggestion) return null;

          const Icon = suggestion.icon;

          return (
            <Card key={interest} className="bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="bg-primary/5 p-3 rounded-lg shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {/* Decorative curved line */}
                    <svg
                      className="absolute -right-2 -bottom-2 text-primary/10"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 12s3-3 6-3 6 3 6 3" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-h-[70px]">
                    <h3 className="text-sm font-semibold mb-1">{suggestion.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
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