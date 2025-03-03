import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
}

export default function WeatherDisplay({ city }: WeatherDisplayProps) {
  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: ['/api/weather', city],
    enabled: !!city
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        Error loading weather data
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-12 w-12 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      default:
        return <Sun className="h-12 w-12 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Current Weather in {weather.name}</h3>
          <div className="flex flex-col items-center gap-2">
            {getWeatherIcon(weather.weather[0].main)}
            <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</p>
            <p className="text-muted-foreground capitalize">{weather.weather[0].description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 justify-center">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>{weather.main.humidity}% Humidity</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Wind className="h-4 w-4 text-blue-500" />
              <span>{weather.wind.speed} m/s Wind</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}