import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Luggage, Sun, Umbrella, ThermometerSun, Wind } from "lucide-react";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";

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

const categories = {
  clothing: "Clothing",
  accessories: "Accessories",
  footwear: "Footwear",
  essentials: "Essential Items",
  documents: "Documents & Tech"
};

export default function PackingListGenerator({ city, travelStyle = "Cultural", dateRange, currentWeather = "Mild" }: PackingListGeneratorProps) {
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedList = generatePackingList(city, currentWeather, travelStyle);
      setPackingList(generatedList);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Luggage className="h-5 w-5" />
          Packing List Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {packingList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
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
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {Object.entries(categories).map(([categoryKey, categoryLabel]) => (
                <div key={categoryKey} className="space-y-3">
                  <h3 className="text-sm font-medium">{categoryLabel}</h3>
                  <div className="space-y-2">
                    {packingList.filter(item => item.category === categoryKey).map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(item.id)}
                          id={item.id}
                        />
                        <label htmlFor={item.id} className="text-sm">
                          {item.name}
                          {item.essential && <Badge variant="secondary" className="ml-2">Essential</Badge>}
                        </label>
                      </motion.div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function generatePackingList(city: string, weatherType: string, travelStyle: string): PackingItem[] {
  return [
    { id: "passport", name: "Passport", category: "documents", essential: true, checked: false },
    { id: "wallet", name: "Wallet & Cards", category: "documents", essential: true, checked: false },
    { id: "phone", name: "Phone & Charger", category: "documents", essential: true, checked: false }
  ];
}
