import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Globe2, Crown, Sparkles, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { premiumFeatures } from "@shared/schema";
import { usePremium } from "@/hooks/use-premium";

const currencies = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  JPY: { symbol: "¥", rate: 149.50 },
  AUD: { symbol: "A$", rate: 1.53 },
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
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe2 className="h-8 w-8 text-primary animate-spin-slow" />
          <h1 className="text-4xl font-bold gradient-text">Choose Your Travel Experience</h1>
        </div>
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
            <Globe2 className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currencies).map(([code, data]) => (
              <SelectItem key={code} value={code as keyof typeof currencies}>
                {code} {data.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Plan */}
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Basic Plan</CardTitle>
            </div>
            <CardDescription>Free forever ⭐</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 mb-6">
              {Object.entries(premiumFeatures).map(([key, feature]) => (
                'basic' in feature && (
                  <li key={key} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <span>{(feature as any).basic}</span>
                  </li>
                )
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
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl">
                Premium Plan
                <span className="block text-xl text-muted-foreground">
                  {currencies[currency].symbol}{price}/year
                </span>
              </CardTitle>
            </div>
            <CardDescription>✨ Unlock all premium features</CardDescription>
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
            {isPremium ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full group"
                onClick={handleSubscribe}
              >
                <CreditCard className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                {user ? "Upgrade Now" : "Sign up to Subscribe"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}