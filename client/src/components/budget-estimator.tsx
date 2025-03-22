import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Plane, Bed, Utensils, MapPin } from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { formatCurrency } from "@/lib/currency";

interface BudgetEstimatorProps {
  city: string;
  travelStyle?: string;
  dateRange?: DateRange;
}

// Leave cityBaseCosts unchanged - it's already well structured
const cityBaseCosts: Record<string, {
  accommodation: number,
  food: number,
  activities: number,
  transport: number,
  currency: string,
  symbol: string,
  exchangeRate?: number // Optional exchange rate to USD for comparison
}> = {
  "London": {
    accommodation: 150,
    food: 40,
    activities: 30,
    transport: 15,
    currency: "GBP",
    symbol: "£",
    exchangeRate: 1.27
  },
  "Paris": {
    accommodation: 130,
    food: 35,
    activities: 25,
    transport: 12,
    currency: "EUR",
    symbol: "€",
    exchangeRate: 1.08
  },
  "New York": {
    accommodation: 200,
    food: 50,
    activities: 40,
    transport: 20,
    currency: "USD",
    symbol: "$",
    exchangeRate: 1
  },
  "Tokyo": {
    accommodation: 15000,
    food: 4000,
    activities: 3000,
    transport: 1000,
    currency: "JPY",
    symbol: "¥",
    exchangeRate: 0.0067
  },
  "Sydney": {
    accommodation: 200,
    food: 50,
    activities: 40,
    transport: 15,
    currency: "AUD",
    symbol: "A$",
    exchangeRate: 0.65
  },
  "Dubai": {
    accommodation: 500,
    food: 150,
    activities: 200,
    transport: 50,
    currency: "AED",
    symbol: "د.إ",
    exchangeRate: 0.27
  },
  "Singapore": {
    accommodation: 200,
    food: 30,
    activities: 40,
    transport: 10,
    currency: "SGD",
    symbol: "S$",
    exchangeRate: 0.74
  },
  "Amsterdam": {
    accommodation: 120,
    food: 35,
    activities: 25,
    transport: 10,
    currency: "EUR",
    symbol: "€",
    exchangeRate: 1.08
  },
  "Barcelona": {
    accommodation: 100,
    food: 30,
    activities: 20,
    transport: 8,
    currency: "EUR",
    symbol: "€",
    exchangeRate: 1.08
  },
  "Berlin": {
    accommodation: 90,
    food: 25,
    activities: 20,
    transport: 8,
    currency: "EUR",
    symbol: "€",
    exchangeRate: 1.08
  },
  "Bangkok": {
    accommodation: 2000,
    food: 500,
    activities: 800,
    transport: 200,
    currency: "THB",
    symbol: "฿",
    exchangeRate: 0.028
  },
  "Seoul": {
    accommodation: 100000,
    food: 30000,
    activities: 40000,
    transport: 10000,
    currency: "KRW",
    symbol: "₩",
    exchangeRate: 0.00076
  },
  "Mumbai": {
    accommodation: 5000,
    food: 1000,
    activities: 1500,
    transport: 500,
    currency: "INR",
    symbol: "₹",
    exchangeRate: 0.012
  },
  "Istanbul": {
    accommodation: 800,
    food: 200,
    activities: 300,
    transport: 100,
    currency: "TRY",
    symbol: "₺",
    exchangeRate: 0.031
  },
  "Mexico City": {
    accommodation: 1500,
    food: 400,
    activities: 500,
    transport: 150,
    currency: "MXN",
    symbol: "$",
    exchangeRate: 0.059
  }
};

// Default costs for cities not in our database (using USD)
const defaultCosts = {
  accommodation: 100,
  food: 30,
  activities: 20,
  transport: 10,
  currency: "USD",
  symbol: "$",
  exchangeRate: 1
};

const travelStyleMultipliers: Record<string, number> = {
  "Budget": 0.6,    // Hostels, street food, public transport
  "Cultural": 1.0,  // Mid-range hotels, local restaurants, mixed transport
  "Luxury": 2.5,    // Luxury hotels, fine dining, private transport
  "Adventure": 1.2, // Mix of accommodation, activity-focused spending
  "Family": 1.4     // Family-friendly hotels, kid-friendly activities
};


export default function BudgetEstimator({ city, travelStyle = "Cultural", dateRange }: BudgetEstimatorProps) {
  const [days, setDays] = useState(7);
  const [showUSD, setShowUSD] = useState(false);

  // Update days when dateRange changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const numberOfDays = differenceInDays(dateRange.to, dateRange.from) + 1;
      setDays(numberOfDays);
    }
  }, [dateRange]);

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
  const totalUSD = baseCosts.exchangeRate ? (totalCost * baseCosts.exchangeRate) : totalCost;

  const formatLocalCurrency = (amount: number) => {
    return formatCurrency(amount, baseCosts.currency, baseCosts.symbol);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Estimate ({baseCosts.currency})
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
              disabled={!!dateRange?.from && !!dateRange?.to}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>Accommodation</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatLocalCurrency(costs.accommodation)}</div>
                {baseCosts.currency !== 'USD' && (
                  <div className="text-sm text-muted-foreground">
                    ≈ ${Math.round(costs.accommodation * (baseCosts.exchangeRate || 1))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span>Food & Drinks</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatLocalCurrency(costs.food)}</div>
                {baseCosts.currency !== 'USD' && (
                  <div className="text-sm text-muted-foreground">
                    ≈ ${Math.round(costs.food * (baseCosts.exchangeRate || 1))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Activities</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatLocalCurrency(costs.activities)}</div>
                {baseCosts.currency !== 'USD' && (
                  <div className="text-sm text-muted-foreground">
                    ≈ ${Math.round(costs.activities * (baseCosts.exchangeRate || 1))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span>Local Transport</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatLocalCurrency(costs.transport)}</div>
                {baseCosts.currency !== 'USD' && (
                  <div className="text-sm text-muted-foreground">
                    ≈ ${Math.round(costs.transport * (baseCosts.exchangeRate || 1))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Estimated Total</span>
                <div className="text-right">
                  <div className="text-lg">{formatLocalCurrency(totalCost)}</div>
                  {baseCosts.currency !== 'USD' && (
                    <div className="text-sm text-muted-foreground">
                      ≈ ${Math.round(totalUSD)} USD
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                *Estimates based on {travelStyle.toLowerCase()} travel style in {city}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}