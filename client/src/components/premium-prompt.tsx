import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { premiumFeatures } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function PremiumPrompt() {
  const [open, setOpen] = useState(false);

  // Check guest session status periodically
  const { data: guestStatus } = useQuery({
    queryKey: ["/api/guest-status"],
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    if (guestStatus?.shouldPromptPremium) {
      setOpen(true);
    }
  }, [guestStatus]);

  const handleUpgrade = async () => {
    try {
      const response = await apiRequest("POST", "/api/create-checkout-session", { currency: 'USD' });
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogDescription>
            You've been exploring our amazing features for an hour! Upgrade to Premium to unlock even more possibilities.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            {Object.entries(premiumFeatures).map(([key, { basic, premium }]) => (
              <div key={key} className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Basic:</span> {basic}
                </div>
                <div>
                  <span className="font-medium">Premium:</span> {premium}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Continue as Guest
          </Button>
          <Button onClick={handleUpgrade}>
            Upgrade Now - $12/year
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
