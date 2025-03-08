import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

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
  };
  wind: {
    speed: number;
  };
  name: string;
}

interface WeatherDisplayProps {
  city: string;
  onWeatherUpdate?: (weather: string) => void;
}

export default function WeatherDisplay({ city, onWeatherUpdate }: WeatherDisplayProps) {
  const { data: currentWeather, isLoading, error, refetch } = useQuery<WeatherData>({
    queryKey: ['/api/weather', encodeURIComponent(city)],
    enabled: Boolean(city),
    retry: 2,
    staleTime: 60000,
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <motion.div animate={{ rotate: [0, 20, -20, 0] }}><Sun className="h-6 w-6 text-yellow-500" /></motion.div>;
      case 'clouds':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
  };

  useEffect(() => {
    if (currentWeather && onWeatherUpdate) {
      const temp = currentWeather.main?.temp;
      let weatherCategory = 'Mild';
      if (temp <= 5) weatherCategory = 'Cold';
      else if (temp >= 30) weatherCategory = 'Hot';
      else if (temp >= 25) weatherCategory = 'Warm';
      onWeatherUpdate(weatherCategory);
    }
  }, [currentWeather, onWeatherUpdate]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
          <p>Failed to load weather data</p>
          <button 
            onClick={() => refetch()} 
            className="text-sm text-primary hover:underline mt-2"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!currentWeather) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No weather data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {getWeatherIcon(currentWeather.weather[0]?.main || 'unknown')}
          <div>
            <h3 className="font-semibold text-foreground">{currentWeather.name}</h3>
            <p className="text-2xl font-bold text-primary">
              {Math.round(currentWeather.main?.temp || 0)}°C
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {currentWeather.weather[0]?.description || 'No description available'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}