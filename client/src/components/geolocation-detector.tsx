import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Loader2 } from 'lucide-react';
import { getAirportByCode, majorAirports } from '@/lib/airport-data';
import { useToast } from "@/hooks/use-toast";

// We'll use a simple API to get the city from coordinates
const GEOCODE_API_URL = "https://geocode.maps.co/reverse";

interface GeolocationDetectorProps {
  onLocationDetected: (city: string) => void;
}

export default function GeolocationDetector({ onLocationDetected }: GeolocationDetectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const detectLocation = () => {
    setIsLoading(true);
    setError(null);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Call geocoding API to get city name from coordinates
          const response = await fetch(
            `${GEOCODE_API_URL}?lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error("Failed to get location information");
          }
          
          const data = await response.json();
          
          // Get city from response
          let city = "";
          
          if (data.address) {
            city = data.address.city || 
                   data.address.town || 
                   data.address.village || 
                   data.address.county ||
                   data.address.state;
          }
          
          if (!city) {
            throw new Error("Could not determine your city");
          }
          
          // Find nearest airport city
          const nearestAirport = findNearestAirportCity(city);
          
          onLocationDetected(nearestAirport || city);
          toast({
            title: "Location detected",
            description: `Your location: ${nearestAirport || city}`,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred");
          toast({
            title: "Location detection failed",
            description: err instanceof Error ? err.message : "An unknown error occurred",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        setIsLoading(false);
        toast({
          title: "Location detection failed",
          description: `Error: ${err.message}`,
          variant: "destructive",
        });
      },
      { 
        enableHighAccuracy: false, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  // Find nearest airport city from our list
  const findNearestAirportCity = (detectedCity: string): string | null => {
    // Simple string match for now
    const lowercaseCity = detectedCity.toLowerCase();
    
    for (const airport of majorAirports) {
      if (airport.city.toLowerCase().includes(lowercaseCity) || 
          lowercaseCity.includes(airport.city.toLowerCase())) {
        return airport.city;
      }
    }
    
    return null;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={detectLocation}
            disabled={isLoading}
            aria-label="Detect my location"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Detect my location</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}