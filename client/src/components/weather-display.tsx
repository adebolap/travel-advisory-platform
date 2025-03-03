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
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
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
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  // Get one forecast per day (noon)
  const dailyForecasts = forecast.list.filter((item, index) => index % 8 === 4).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Current Weather in {currentWeather.name}</h3>
            <div className="flex flex-col items-center gap-2">
              {getWeatherIcon(currentWeather.weather[0].main)}
              <p className="text-3xl font-bold">{Math.round(currentWeather.main.temp)}°C</p>
              <p className="text-muted-foreground capitalize">{currentWeather.weather[0].description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 justify-center">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>{currentWeather.main.humidity}% Humidity</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Wind className="h-4 w-4 text-blue-500" />
                <span>{currentWeather.wind.speed} m/s Wind</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="text-xl font-semibold mb-4">5-Day Forecast</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {dailyForecasts.map((day) => (
            <Card key={day.dt} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="text-center">
                  <p className="font-medium text-sm">{format(new Date(day.dt * 1000), 'EEE')}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(day.dt * 1000), 'MMM d')}</p>
                </div>
                <div className="flex justify-center my-2">
                  {getWeatherIcon(day.weather[0].main)}
                </div>
                <p className="text-xl font-bold text-center">{Math.round(day.main.temp)}°C</p>
                <p className="text-xs text-center text-muted-foreground mb-2 capitalize">{day.weather[0].description}</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center justify-center gap-1 bg-muted/50 rounded p-1">
                    <Droplets className="h-3 w-3 text-blue-500" />
                    {day.main.humidity}%
                  </div>
                  <div className="flex items-center justify-center gap-1 bg-muted/50 rounded p-1">
                    <Wind className="h-3 w-3 text-blue-500" />
                    {day.wind.speed}m/s
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