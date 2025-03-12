import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Luggage, Sun, Umbrella, ThermometerSun, Wind } from "lucide-react";
import { DateRange } from "react-day-picker";

interface PackingListGeneratorProps {
  city: string;
  travelStyle?: string;
  dateRange?: DateRange;
  currentWeather?: string;
}

interface PackingItem {
  id: string;
  name: string;
  category: string;
  weather?: string;
  essential: boolean;
  checked: boolean;
}

const weatherBasedItems = {
  "Warm": {
    clothing: ["T-shirts", "Tank tops", "Shorts", "Lightweight dresses", "Swimwear"],
    accessories: ["Sun hat", "Sunglasses", "Light scarf", "Waterproof phone pouch"],
    footwear: ["Sandals", "Flip-flops", "Lightweight sneakers"],
    essentials: ["Sunscreen", "Aloe vera gel", "Bug repellent", "Water bottle", "Cooling towel"]
  },
  "Rainy": {
    clothing: ["Quick-dry clothing", "Waterproof jacket", "Light layers", "Capris"],
    accessories: ["Umbrella", "Waterproof bag", "Lightweight poncho", "Brimmed hat"],
    footwear: ["Waterproof shoes", "Quick-dry socks", "Sandals with grip"],
    essentials: ["Waterproof phone case", "Microfiber towel", "Insect repellent"]
  },
  "Cold": {
    clothing: ["Thermal layers", "Wool/fleece layers", "Waterproof coat", "Sweaters"],
    accessories: ["Beanie", "Gloves", "Scarf", "Thermal socks"],
    footwear: ["Waterproof boots", "Warm socks", "Snow grips"],
    essentials: ["Lip balm", "Hand warmers", "Moisturizer", "Thermos"]
  },
  "Mild": {
    clothing: ["T-shirts", "Long-sleeves", "Jeans", "Light sweater"],
    accessories: ["Sunglasses", "Light hat", "Small backpack"],
    footwear: ["Walking shoes", "Light boots", "Water-resistant shoes"],
    essentials: ["Umbrella", "Travel blanket", "Lip balm"]
  },
  "Windy": {
    clothing: ["Long sleeves", "Loose clothing", "Light windbreaker"],
    accessories: ["Wraparound sunglasses", "Hat with strap", "Buff or face covering"],
    footwear: ["Closed-toe shoes", "Walking shoes"],
    essentials: ["Moisturizer", "Hydration pack", "Eye drops"]
  }
};

const categories = {
  clothing: "Clothing",
  accessories: "Accessories",
  footwear: "Footwear",
  essentials: "Essential Items",
  documents: "Documents & Tech"
};

// Generate packing list based on weather and travel details
const generatePackingList = (
  city: string,
  weatherType: string = "Mild",
  travelStyle: string = "Cultural"
): PackingItem[] => {
  const baseList: PackingItem[] = [
    { id: "passport", name: "Passport", category: "documents", essential: true, checked: false },
    { id: "wallet", name: "Wallet & Cards", category: "documents", essential: true, checked: false },
    { id: "phone", name: "Phone & Charger", category: "documents", essential: true, checked: false },
    { id: "adapter", name: "Universal Adapter", category: "documents", essential: true, checked: false },
  ];

  // Add weather-specific items
  const weatherItems = weatherBasedItems[weatherType as keyof typeof weatherBasedItems] || weatherBasedItems.Mild;

  Object.entries(weatherItems).forEach(([category, items]) => {
    items.forEach((item, index) => {
      baseList.push({
        id: `${category}-${index}`,
        name: item,
        category,
        weather: weatherType,
        essential: category === "essentials",
        checked: false
      });
    });
  });

  return baseList;
};

export default function PackingListGenerator({ city, travelStyle = "Cultural", dateRange, currentWeather = "Mild" }: PackingListGeneratorProps) {
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI processing time
    setTimeout(() => {
      const newList = generatePackingList(city, currentWeather, travelStyle);
      setPackingList(newList);
      setIsGenerating(false);
    }, 1000);
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

  const getWeatherIcon = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case 'warm':
        return <Sun className="h-3 w-3 text-yellow-500" />;
      case 'rainy':
        return <Umbrella className="h-3 w-3 text-blue-500" />;
      case 'cold':
        return <ThermometerSun className="h-3 w-3 text-blue-500" />;
      case 'windy':
        return <Wind className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

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
              Get a personalized packing list based on your destination, weather, and travel style.
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
                        {item.weather && getWeatherIcon(item.weather)}
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