```typescript
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Plane, Bed, Utensils, MapPin } from "lucide-react";

interface BudgetEstimatorProps {
  city: string;
  travelStyle?: string;
}

// Mock data for cost estimates (to be replaced with real data)
const cityBaseCosts: Record<string, {
  accommodation: number,
  food: number,
  activities: number,
  transport: number
}> = {
  "London": { accommodation: 150, food: 50, activities: 40, transport: 20 },
  "Paris": { accommodation: 130, food: 45, activities: 35, transport: 15 },
  "New York": { accommodation: 200, food: 60, activities: 50, transport: 25 },
  // Add more cities as needed
};

// Default costs for unknown cities
const defaultCosts = {
  accommodation: 100,
  food: 40,
  activities: 30,
  transport: 15
};

const travelStyleMultipliers: Record<string, number> = {
  "Budget": 0.7,
  "Cultural": 1.0,
  "Luxury": 1.8,
  "Adventure": 1.2,
  "Family": 1.3
};

export default function BudgetEstimator({ city, travelStyle = "Cultural" }: BudgetEstimatorProps) {
  const [days, setDays] = useState(7);
  
  // Get base costs for the city or use defaults
  const baseCosts = cityBaseCosts[city] || defaultCosts;
  
  // Apply travel style multiplier
  const multiplier = travelStyleMultipliers[travelStyle] || 1.0;
  
  const costs = {
    accommodation: Math.round(baseCosts.accommodation * multiplier * days),
    food: Math.round(baseCosts.food * multiplier * days),
    activities: Math.round(baseCosts.activities * multiplier * days),
    transport: Math.round(baseCosts.transport * multiplier * days)
  };

  const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Estimate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="days">Duration (days)</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>Accommodation</span>
              </div>
              <span className="font-medium">${costs.accommodation}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span>Food & Drinks</span>
              </div>
              <span className="font-medium">${costs.food}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Activities</span>
              </div>
              <span className="font-medium">${costs.activities}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span>Local Transport</span>
              </div>
              <span className="font-medium">${costs.transport}</span>
            </div>

            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Estimated Total</span>
                <span className="text-lg">${totalCost}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                *Estimates based on {travelStyle.toLowerCase()} travel style
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```
