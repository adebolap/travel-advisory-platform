import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const currencies = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  JPY: { symbol: "¥", rate: 149.50 },
  AUD: { symbol: "A$", rate: 1.53 },
};

const features = [
  "Personalized travel recommendations",
  "Advanced trip planning tools",
  "Real-time event updates",
  "Currency conversion",
  "Weather forecasts",
  "Travel personality insights",
  "Priority customer support",
  "Ad-free experience"
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<keyof typeof currencies>("USD");
  const { user } = useAuth();
  
  const basePrice = 12;
  const price = Math.round(basePrice * currencies[currency].rate);

  const handleSubscribe = async () => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency,
          priceId: "price_yearly_subscription",
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    }
  };

  return (
    <div className="container max-w-5xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Get access to all premium features for just {currencies[currency].symbol}{price}/year
        </p>
      </div>

      <div className="flex justify-end mb-8">
        <Select value={currency} onValueChange={(value: keyof typeof currencies) => setCurrency(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currencies).map(([code]) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="relative overflow-hidden border-primary/20">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            {currencies[currency].symbol}{price}
            <span className="text-xl text-muted-foreground">/year</span>
          </CardTitle>
          <CardDescription className="text-lg">
            All premium features included
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <ul className="grid gap-3 text-muted-foreground">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="mt-6"
              onClick={handleSubscribe}
            >
              {user ? "Subscribe Now" : "Sign up to Subscribe"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
