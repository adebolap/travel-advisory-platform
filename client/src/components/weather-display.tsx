import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, Droplets, AlertTriangle, Snowflake, CloudLightning, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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

  const { data: weather, isLoading, error, refetch } = useQuery<WeatherData>({
    queryKey: ['/api/weather', city],
    queryFn: async () => {
      const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch weather data');
      }
      return response.json();
    },
    enabled: Boolean(city),
    retry: 1,
  });

  useEffect(() => {
    if (weather) {
      // Show alerts based on weather conditions
      if (weather.main.temp >= 35) {
        toast({
          title: "Heat Alert",
          description: "Very hot conditions. Stay hydrated and avoid direct sunlight.",
          variant: "destructive",
        });
      } else if (weather.main.temp <= 0) {
        toast({
          title: "Cold Alert",
          description: "Freezing conditions. Bundle up and stay warm.",
          variant: "destructive",
        });
      }

      if (onWeatherUpdate) {
        const temp = weather.main.temp;
        let category = 'Mild';

        if (temp <= 0) category = 'Freezing';
        else if (temp <= 10) category = 'Cold';
        else if (temp >= 30) category = 'Hot';
        else if (temp >= 22) category = 'Warm';

        onWeatherUpdate(category);
      }
    }
  }, [weather, onWeatherUpdate, toast]);

  const getWeatherIcon = (condition: string) => {
    const iconClass = "h-10 w-10";
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'clouds':
        return <Cloud className={`${iconClass} text-slate-400`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className={`${iconClass} text-blue-400`} />;
      case 'snow':
        return <Snowflake className={`${iconClass} text-blue-200`} />;
      case 'thunderstorm':
        return <CloudLightning className={`${iconClass} text-yellow-600`} />;
      default:
        return <Cloud className={`${iconClass} text-slate-300`} />;
    }
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
          <p className="text-destructive font-medium mb-2">Unable to load weather data</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <button 
            onClick={() => refetch()} 
            className="text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No weather data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getWeatherIcon(weather.weather[0].main)}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">
                  {weather.name}, {weather.sys.country}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {weather.weather[0].main}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">
                  {Math.round(weather.main.temp)}°C
                </p>
                <span className="text-sm text-muted-foreground">
                  Feels like {Math.round(weather.main.feels_like)}°C
                </span>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {weather.weather[0].description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <Thermometer className="h-4 w-4 text-primary mb-1" />
            <span className="text-sm font-medium">
              {Math.round(weather.main.temp_min)}° / {Math.round(weather.main.temp_max)}°
            </span>
            <span className="text-xs text-muted-foreground">Min/Max</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <Droplets className="h-4 w-4 text-blue-500 mb-1" />
            <span className="text-sm font-medium">{weather.main.humidity}%</span>
            <span className="text-xs text-muted-foreground">Humidity</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <Wind className="h-4 w-4 text-slate-500 mb-1" />
            <span className="text-sm font-medium">
              {Math.round(weather.wind.speed * 3.6)} km/h
            </span>
            <span className="text-xs text-muted-foreground">Wind</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}