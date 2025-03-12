import { useAuth } from "@/hooks/use-auth";
import { premiumFeatures } from "@shared/schema";

type PremiumFeature = keyof typeof premiumFeatures;

export function usePremium() {
  const { user } = useAuth();
  const isPremium = user?.isSubscribed ?? false;

  const canAccess = (feature: PremiumFeature) => {
    if (!user) return false; // Not logged in
    if (isPremium) return true; // Premium users can access everything
    
    // Basic users can only access basic features
    return premiumFeatures[feature].basic !== undefined;
  };

  const getFeatureDescription = (feature: PremiumFeature) => {
    if (!user) return null;
    return isPremium ? 
      premiumFeatures[feature].premium : 
      premiumFeatures[feature].basic;
  };

  const isPremiumFeature = (feature: PremiumFeature) => {
    return !canAccess(feature) && premiumFeatures[feature].premium !== undefined;
  };

  return {
    isPremium,
    canAccess,
    getFeatureDescription,
    isPremiumFeature,
  };
}
