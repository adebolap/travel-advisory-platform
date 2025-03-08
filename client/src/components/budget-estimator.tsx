import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Plane, Bed, Utensils, MapPin } from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { motion } from "framer-motion";

interface BudgetEstimatorProps {
  city: string;
  travelStyle?: string;
  dateRange?: DateRange;
}

const cityData = {
  "London": { currency: "GBP", symbol: "£", rate: 1.27 },
  "Paris": { currency: "EUR", symbol: "€", rate: 1.08 },
  "New York": { currency: "USD", symbol: "$", rate: 1 },
  "Tokyo": { currency: "JPY", symbol: "¥", rate: 0.0067 },
  "Sydney": { currency: "AUD", symbol: "A$", rate: 0.65 }
};

const travelStyleMultipliers = {
  "Budget": 0.6,
  "Cultural": 1.0,
  "Luxury": 2.5,
  "Adventure": 1.2,
  "Family": 1.4
};

function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export default function BudgetEstimator({ city, travelStyle = "Cultural", dateRange }: BudgetEstimatorProps) {
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setDays(differenceInDays(dateRange.to, dateRange.from) + 1);
    }
  }, [dateRange]);

  const { currency, symbol, rate } = cityData[city] || { currency: "USD", symbol: "$", rate: 1 };
  const multiplier = travelStyleMultipliers[travelStyle] || 1.0;

  const costs = {
    accommodation: 100 * multiplier * days,
    food: 30 * multiplier * days,
    activities: 20 * multiplier * days,
    transport: 10 * multiplier * days
  };

  const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const convertedCost = totalCost * rate;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Estimate ({currency})
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

            {Object.entries(costs).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{key}</span>
                <span className="font-medium">{formatCurrency(value * rate, symbol)}</span>
              </div>
            ))}

            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Estimated Total</span>
                <div className="text-lg">{formatCurrency(convertedCost, symbol)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                *Estimates for {travelStyle.toLowerCase()} travel style in {city}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
