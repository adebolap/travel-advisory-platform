import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Star, Info, BadgeCheck, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { premiumFeatures } from "@shared/schema";
import { motion } from "framer-motion";

const currencies = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  JPY: { symbol: "¥", rate: 149.50 },
  AUD: { symbol: "A$", rate: 1.53 },
};

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
    <div className="container max-w-6xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Travel Experience</h1>
        <p className="text-xl text-muted-foreground">
          Get access to premium features for just {currencies[currency].symbol}{price}/year
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

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              Basic Plan
              <Star className="h-5 w-5 text-yellow-500" />
            </CardTitle>
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

        <Card className="relative overflow-hidden border-2 border-primary/40">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              Premium Plan
              <BadgeCheck className="h-5 w-5 text-primary" />
              <span className="block text-xl text-muted-foreground">
                {currencies[currency].symbol}{price}/year
              </span>
            </CardTitle>
            <CardDescription>Unlock all premium features and save 20% annually!</CardDescription>
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
                className="w-full transition-all hover:scale-105 active:scale-95 bg-primary/90 hover:bg-primary"
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
