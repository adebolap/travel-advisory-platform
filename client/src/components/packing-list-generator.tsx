import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Luggage, Sun, Umbrella, ThermometerSun } from "lucide-react";

interface PackingListGeneratorProps {
  city: string;
  travelStyle?: string;
  dateRange?: DateRange;
}

interface PackingItem {
  id: string;
  name: string;
  category: string;
  weather?: string;
  essential: boolean;
  checked: boolean;
}

const categories = {
  essentials: "Essential Items",
  clothing: "Clothing",
  electronics: "Electronics",
  toiletries: "Toiletries",
  documents: "Documents",
  misc: "Miscellaneous"
};

// Mock AI-generated packing lists based on context
const generatePackingList = (city: string, travelStyle: string = "Cultural", season: string = "Summer"): PackingItem[] => {
  const baseList: PackingItem[] = [
    { id: "passport", name: "Passport", category: "documents", essential: true, checked: false },
    { id: "wallet", name: "Wallet & Cards", category: "documents", essential: true, checked: false },
    { id: "phone", name: "Phone & Charger", category: "electronics", essential: true, checked: false },
    { id: "adapter", name: "Universal Adapter", category: "electronics", essential: true, checked: false },
  ];

  // Add weather-specific items
  if (season === "Summer") {
    baseList.push(
      { id: "sunscreen", name: "Sunscreen", category: "toiletries", weather: "sunny", essential: true, checked: false },
      { id: "sunglasses", name: "Sunglasses", category: "clothing", weather: "sunny", essential: false, checked: false },
      { id: "hat", name: "Sun Hat", category: "clothing", weather: "sunny", essential: false, checked: false }
    );
  }

  // Add style-specific items
  if (travelStyle === "Adventure") {
    baseList.push(
      { id: "hikingBoots", name: "Hiking Boots", category: "clothing", essential: true, checked: false },
      { id: "backpack", name: "Day Backpack", category: "misc", essential: true, checked: false },
      { id: "firstAid", name: "First Aid Kit", category: "misc", essential: true, checked: false }
    );
  }

  return baseList;
};

export default function PackingListGenerator({ city, travelStyle = "Cultural", dateRange }: PackingListGeneratorProps) {
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI processing time
    setTimeout(() => {
      const newList = generatePackingList(city, travelStyle);
      setPackingList(newList);
      setIsGenerating(false);
    }, 1500);
  };

  const toggleItem = (itemId: string) => {
    setPackingList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const groupedItems = packingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Luggage className="h-5 w-5" />
          Packing List Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {packingList.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get a personalized packing list based on your destination, dates, and travel style.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Packing List"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-medium">{categories[category as keyof typeof categories]}</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id)}
                        id={item.id}
                      />
                      <label
                        htmlFor={item.id}
                        className="text-sm flex items-center gap-2"
                      >
                        {item.name}
                        {item.essential && (
                          <Badge variant="secondary" className="text-xs">
                            Essential
                          </Badge>
                        )}
                        {item.weather && (
                          <span className="text-muted-foreground">
                            {item.weather === "sunny" ? <Sun className="h-3 w-3" /> : <Umbrella className="h-3 w-3" />}
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button
              onClick={handleGenerate}
              variant="outline"
              className="w-full"
            >
              Regenerate List
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
