import { Link } from "wouter";
import { CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/use-premium";
import { premiumFeatures } from "@shared/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PremiumFeatureProps {
  feature: keyof typeof premiumFeatures;
  children: React.ReactNode;
}

export function PremiumFeature({ feature, children }: PremiumFeatureProps) {
  const { isPremium, isPremiumFeature } = usePremium();

  if (!isPremiumFeature(feature) || isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/pricing">
                <Button variant="outline" size="sm">
                  <Lock className="h-4 w-4 mr-2" />
                  <CreditCard className="h-4 w-4 mr-2" />
                  Premium Feature
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upgrade to Premium to access this feature</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
