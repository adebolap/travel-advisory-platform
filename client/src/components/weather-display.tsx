import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, Droplets, ChevronDown, AlertTriangle } from "lucide-react";
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

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    wind: {
      speed: number;
    };
  }>;
  city: {
    name: string;
  };
}

interface WeatherDisplayProps {
  city: string;
  onWeatherUpdate?: (weather: string) => void;
}

export default function WeatherDisplay({ city, onWeatherUpdate }: WeatherDisplayProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const { data: currentWeather, isLoading: isLoadingCurrent, error: currentError, refetch: refetchCurrent } = useQuery<WeatherData>({
    queryKey: [`/api/weather/${encodeURIComponent(city)}`],
    enabled: Boolean(city),
    retry: 2, // Retry failed requests
    staleTime: 60000, // Cache data for 1 minute
  });

  const { data: forecast, isLoading: isLoadingForecast, error: forecastError, refetch: refetchForecast } = useQuery<ForecastData>({
    queryKey: [`/api/forecast/${encodeURIComponent(city)}`],
    enabled: Boolean(city),
    retry: 2,
    staleTime: 60000,
  });

  const mapWeatherToCategory = (temp: number, description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle')) return 'Rainy';
    if (desc.includes('wind')) return 'Windy';
    if (desc.includes('snow') || desc.includes('sleet')) return 'Cold';
    if (temp <= 5) return 'Freezing';
    if (temp <= 15) return 'Cold';
    if (temp >= 30) return 'Hot';
    if (temp >= 25) return 'Warm';
    return 'Mild';
  };

  useEffect(() => {
    if (forecast && onWeatherUpdate) {
      const upcomingWeather = forecast.list.map(day => mapWeatherToCategory(day.main.temp, day.weather[0].description));
      const mostFrequentWeather = upcomingWeather.sort((a, b) =>
        upcomingWeather.filter(v => v === a).length - upcomingWeather.filter(v => v === b).length
      ).pop();
      if (mostFrequentWeather) {
        onWeatherUpdate(mostFrequentWeather);
      }
    }
  }, [forecast, onWeatherUpdate]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <motion.div animate={{ rotate: [0, 20, -20, 0] }}><Sun className="h-6 w-6 text-accent" /></motion.div>;
      case 'clouds':
        return <Cloud className="h-6 w-6 text-muted-foreground" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-6 w-6 text-primary" />;
      case 'wind':
        return <Wind className="h-6 w-6 text-secondary" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
    }
  };

  useEffect(() => {
    if (currentWeather?.main.temp > 35) {
      toast({
        title: "Heat Alert",
        description: "It's extremely hot today. Stay hydrated and avoid direct sunlight!",
        variant: "destructive"
      });
    }
  }, [currentWeather]);

  if (currentError || forecastError) {
    return (
      <Card className="bg-background shadow-sm">
        <CardContent className="p-6 text-center text-destructive">
          Unable to load weather data. Please try again later.
          <button onClick={() => { refetchCurrent(); refetchForecast(); }} className="mt-4 text-primary hover:underline">
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {currentWeather && getWeatherIcon(currentWeather.weather[0].main)}
          <div>
            <h3 className="font-semibold text-foreground">{currentWeather?.name}</h3>
            <p className="text-2xl font-bold text-primary">{Math.round(currentWeather?.main.temp)}°C</p>
            <p className="text-sm text-muted-foreground capitalize">{currentWeather?.weather[0].description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
