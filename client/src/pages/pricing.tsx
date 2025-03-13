import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { premiumFeatures } from "@shared/schema";
import { usePremium } from "@/hooks/use-premium"; // Import the usePremium hook


const currencies = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  JPY: { symbol: "¥", rate: 149.50 },
  AUD: { symbol: "A$", rate: 1.53 },
  // Add more currencies
  SGD: { symbol: "S$", rate: 1.34 },
  CAD: { symbol: "C$", rate: 1.35 },
  CNY: { symbol: "¥", rate: 7.19 },
  INR: { symbol: "₹", rate: 82.85 },
  AED: { symbol: "د.إ", rate: 3.67 }
};

export default function PricingPage() {
  const [currency, setCurrency] = useState<keyof typeof currencies>("USD");
  const { user } = useAuth();
  const { isPremium } = usePremium();

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
    <div className="container max-w-6xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 gradient-text">Choose Your Travel Experience</h1>
        <p className="text-xl text-muted-foreground">
          Get access to premium features for just {currencies[currency].symbol}{price}/year
        </p>
      </div>

      <div className="flex justify-end mb-8">
        <Select 
          value={currency} 
          onValueChange={(value: keyof typeof currencies) => setCurrency(value)}
          disabled={!isPremium}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currencies).map(([code]) => (
              <SelectItem key={code} value={code}>
                {code} {currencies[code].symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Plan */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-2xl">Basic Plan</CardTitle>
            <CardDescription>Free forever</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 mb-6">
              {Object.entries(premiumFeatures).map(([key, feature]) => (
                <li key={key} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <span>{feature.basic}</span>
                </li>
              ))}
            </ul>
            <Button disabled className="w-full" variant="outline">
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="relative overflow-hidden border-primary/20 card-hover">
          <div className="absolute inset-x-0 top-0 h-1 gradient-border" />
          <CardHeader>
            <CardTitle className="text-2xl">
              Premium Plan
              <span className="block text-xl text-muted-foreground">
                {currencies[currency].symbol}{price}/year
              </span>
            </CardTitle>
            <CardDescription>Unlock all premium features</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 mb-6">
              {Object.entries(premiumFeatures).map(([key, feature]) => (
                <li key={key} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>{feature.premium}</span>
                </li>
              ))}
            </ul>
            {user?.isSubscribed ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleSubscribe}
              >
                {user ? "Upgrade Now" : "Sign up to Subscribe"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}