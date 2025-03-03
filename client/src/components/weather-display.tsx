import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain } from "lucide-react";

interface WeatherData {
  weather: Array<{
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
  };
}

interface WeatherDisplayProps {
  city: string;
}

export default function WeatherDisplay({ city }: WeatherDisplayProps) {
  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ['/api/weather', city],
    enabled: !!city
  });

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'Clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      default:
        return <CloudRain className="h-8 w-8 text-blue-500" />;
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-lg font-medium mb-4">Current Weather</h3>
      {weather && (
        <div className="space-y-2">
          {getWeatherIcon(weather.weather[0].main)}
          <p className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</p>
          <p className="text-muted-foreground">{weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
}