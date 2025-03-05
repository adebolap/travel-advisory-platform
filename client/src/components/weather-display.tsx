import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, Droplets, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useState } from "react";

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
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dailyForecasts.map((day, index) => (
            <Card 
              key={day.dt} 
              className="h-full cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => setExpandedDay(expandedDay === index ? null : index)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col h-full">
                  <div className="text-center border-b border-border/50 pb-2">
                    <p className="font-medium">{format(new Date(day.dt * 1000), 'EEE')}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(day.dt * 1000), 'MMM d')}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center py-3 sm:py-4 flex-grow">
                    {getWeatherIcon(day.weather[0].main)}
                    <p className="text-xl sm:text-2xl font-bold mt-2">{Math.round(day.main.temp)}°C</p>
                    <p className="text-xs text-center text-muted-foreground mt-1 h-8 flex items-center">
                      {day.weather[0].description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span>{day.main.humidity}%</span>
                    </div>

                    <div className={`overflow-hidden transition-all duration-200 ${expandedDay === index ? 'max-h-8' : 'max-h-0'}`}>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                        <Wind className="h-3 w-3" />
                        <span>{day.wind.speed.toFixed(1)}m/s</span>
                      </div>
                    </div>

                    <div className="flex justify-center mt-2">
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedDay === index ? 'rotate-180' : ''}`} />
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