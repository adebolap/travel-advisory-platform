import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sun, Cloud, CloudRain, Wind, Droplets, AlertTriangle, 
  Snowflake, CloudLightning, Thermometer 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WeatherData {
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  name: string;
  sys: {
    country: string;
  };
  wind: {
    speed: number;
  };
}

interface WeatherDisplayProps {
  city: string;
  onWeatherUpdate?: (weather: string) => void;
}

export default function WeatherDisplay({ city, onWeatherUpdate }: WeatherDisplayProps) {
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: weather, isLoading, error, refetch } = useQuery<WeatherData>({
    queryKey: ['/api/weather', city],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch weather data');
        }
        const data = await response.json();
        setLastUpdate(new Date());
        return data;
      } catch (error) {
        console.error('Weather fetch error:', error);
        throw error;
      }
    },
    enabled: Boolean(city),
    retry: 1,
    staleTime: 1000 * 60 * 15, // Consider data fresh for 15 minutes
    cacheTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  useEffect(() => {
    if (weather) {
      // Show weather alerts
      const temp = weather.main.temp;
      if (temp >= 35) {
        toast({
          title: "Extreme Heat Warning",
          description: "Very hot conditions expected. Stay hydrated and avoid prolonged sun exposure.",
          variant: "destructive",
          duration: 6000,
        });
      } else if (temp <= 0) {
        toast({
          title: "Freezing Conditions Alert",
          description: "Freezing temperatures expected. Take precautions and dress warmly.",
          variant: "destructive",
          duration: 6000,
        });
      }

      // Update parent component with weather category
      if (onWeatherUpdate) {
        const category = getWeatherCategory(temp);
        onWeatherUpdate(category);
      }
    }
  }, [weather, onWeatherUpdate, toast]);

  const getWeatherCategory = (temp: number): string => {
    if (temp <= 0) return 'Freezing';
    if (temp <= 10) return 'Cold';
    if (temp >= 30) return 'Hot';
    if (temp >= 22) return 'Warm';
    return 'Mild';
  };

  const getWeatherIcon = (condition: string) => {
    const iconClass = "h-10 w-10";
    const icons = {
      clear: <Sun className={`${iconClass} text-yellow-500`} />,
      clouds: <Cloud className={`${iconClass} text-slate-400`} />,
      rain: <CloudRain className={`${iconClass} text-blue-400`} />,
      drizzle: <CloudRain className={`${iconClass} text-blue-400`} />,
      snow: <Snowflake className={`${iconClass} text-blue-200`} />,
      thunderstorm: <CloudLightning className={`${iconClass} text-yellow-600`} />,
    };
    return icons[condition.toLowerCase() as keyof typeof icons] || 
           <Cloud className={`${iconClass} text-slate-300`} />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium mb-2">Weather Data Unavailable</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <Button 
            variant="outline"
            onClick={() => refetch()}
            className="mx-auto"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No weather data available for {city}
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            {/* ... existing content ... */}

            {/* Add last updated time */}
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Last updated: {format(lastUpdate, 'HH:mm')}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}