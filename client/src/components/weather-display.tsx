import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

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
}

export default function WeatherDisplay({ city }: WeatherDisplayProps) {
  const { data: currentWeather, isLoading: isLoadingCurrent, error: currentError } = useQuery<WeatherData>({
    queryKey: [`/api/weather/${encodeURIComponent(city)}`],
    enabled: Boolean(city)
  });

  const { data: forecast, isLoading: isLoadingForecast, error: forecastError } = useQuery<ForecastData>({
    queryKey: [`/api/forecast/${encodeURIComponent(city)}`],
    enabled: Boolean(city)
  });

  if (isLoadingCurrent || isLoadingForecast) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (currentError || forecastError) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          Unable to load weather data. Please try again later.
        </CardContent>
      </Card>
    );
  }

  if (!currentWeather || !forecast) return null;

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  // Get next 4 days forecast
  const dailyForecasts = forecast.list.filter((item, index) => index % 8 === 4).slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Current Weather - Compact Horizontal Layout */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getWeatherIcon(currentWeather.weather[0].main)}
              <div>
                <h3 className="font-semibold">{currentWeather.name}</h3>
                <p className="text-2xl font-bold">{Math.round(currentWeather.main.temp)}°C</p>
                <p className="text-sm text-muted-foreground capitalize">{currentWeather.weather[0].description}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{currentWeather.main.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{currentWeather.wind.speed}m/s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4-Day Forecast */}
      <div>
        <h3 className="text-lg font-semibold mb-3">4-Day Forecast</h3>
        <div className="grid grid-cols-4 gap-3">
          {dailyForecasts.map((day) => (
            <Card key={day.dt} className="h-full">
              <CardContent className="p-4">
                <div className="flex flex-col h-full">
                  <div className="text-center border-b border-border/50 pb-2">
                    <p className="font-medium">{format(new Date(day.dt * 1000), 'EEE')}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(day.dt * 1000), 'MMM d')}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 flex-grow">
                    {getWeatherIcon(day.weather[0].main)}
                    <p className="text-2xl font-bold mt-2">{Math.round(day.main.temp)}°C</p>
                    <p className="text-xs text-center text-muted-foreground mt-1 h-8 flex items-center">
                      {day.weather[0].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 rounded-lg p-2 mt-auto">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span>{day.main.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px]">
                      <Wind className="h-3 w-3 text-blue-500" />
                      <span>{day.wind.speed.toFixed(1)}m/s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}