import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, Droplets, ChevronDown, AlertTriangle, Snowflake, Thermometer, CloudLightning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { format, fromUnixTime } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  visibility: number;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
    sunrise: number;
    sunset: number;
  };
}

interface WeatherDisplayProps {
  city: string;
  onWeatherUpdate?: (weather: string) => void;
}

export default function WeatherDisplay({ city, onWeatherUpdate }: WeatherDisplayProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("current");

  const { data: currentWeather, isLoading: isLoadingCurrent, error: currentError, refetch: refetchCurrent } = useQuery<WeatherData>({
    queryKey: [`weather-${city}`],
    queryFn: async () => {
      const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch current weather');
      }
      return response.json();
    },
    enabled: Boolean(city),
    retry: 2,
    staleTime: 300000, // Cache data for 5 minutes
  });

  const { data: forecast, isLoading: isLoadingForecast, error: forecastError, refetch: refetchForecast } = useQuery<ForecastData>({
    queryKey: [`forecast-${city}`],
    queryFn: async () => {
      const response = await fetch(`/api/forecast/${encodeURIComponent(city)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch forecast');
      }
      return response.json();
    },
    enabled: Boolean(city),
    retry: 2,
    staleTime: 300000,
  });

  const mapWeatherToCategory = (temp: number, description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('thunderstorm')) return 'Stormy';
    if (desc.includes('rain') || desc.includes('drizzle')) return 'Rainy';
    if (desc.includes('snow') || desc.includes('sleet')) return 'Snowy';
    if (desc.includes('wind') || desc.includes('gust')) return 'Windy';
    if (desc.includes('fog') || desc.includes('mist')) return 'Foggy';
    if (temp <= 0) return 'Freezing';
    if (temp <= 10) return 'Cold';
    if (temp >= 30) return 'Hot';
    if (temp >= 22) return 'Warm';
    if (desc.includes('clear')) return 'Sunny';
    if (desc.includes('cloud')) return 'Cloudy';
    return 'Mild';
  };

  // Group forecast by day
  const dailyForecast = useMemo(() => {
    if (!forecast) return [];

    const days: Record<string, ForecastData['list'][0][]> = {};

    forecast.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!days[date]) {
        days[date] = [];
      }
      days[date].push(item);
    });

    return Object.entries(days).map(([date, items]) => {
      // Find the most common weather condition for the day
      const weatherCounts: Record<string, number> = {};
      items.forEach(item => {
        const main = item.weather[0].main;
        weatherCounts[main] = (weatherCounts[main] || 0) + 1;
      });

      const dominantWeather = Object.entries(weatherCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

      // Calculate average temperature
      const avgTemp = items.reduce((sum, item) => sum + item.main.temp, 0) / items.length;

      // Get min and max temps
      const minTemp = Math.min(...items.map(item => item.main.temp_min));
      const maxTemp = Math.max(...items.map(item => item.main.temp_max));

      return {
        date,
        formattedDate: format(new Date(date), 'EEE, MMM d'),
        items,
        dominantWeather,
        avgTemp,
        minTemp,
        maxTemp
      };
    });
  }, [forecast]);

  useEffect(() => {
    if (forecast && onWeatherUpdate) {
      const upcomingWeather = forecast.list.map(day => 
        mapWeatherToCategory(day.main.temp, day.weather[0].description)
      );

      // Count occurrences of each weather category
      const weatherCounts: Record<string, number> = {};
      upcomingWeather.forEach(weather => {
        weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
      });

      // Find the most frequent weather
      const mostFrequentWeather = Object.entries(weatherCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

      onWeatherUpdate(mostFrequentWeather);
    }
  }, [forecast, onWeatherUpdate]);

  const getWeatherIcon = (condition: string, size = 6) => {
    const iconClass = `h-${size} w-${size}`;

    switch (condition.toLowerCase()) {
      case 'clear':
        return <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }}>
          <Sun className={`${iconClass} text-yellow-500`} />
        </motion.div>;
      case 'clouds':
        return <Cloud className={`${iconClass} text-slate-400`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className={`${iconClass} text-blue-400`} />;
      case 'thunderstorm':
        return <CloudLightning className={`${iconClass} text-purple-500`} />;
      case 'snow':
        return <Snowflake className={`${iconClass} text-blue-200`} />;
      case 'mist':
      case 'fog':
        return <Cloud className={`${iconClass} text-slate-300`} />;
      case 'wind':
        return <Wind className={`${iconClass} text-slate-500`} />;
      default:
        return <Sun className={`${iconClass} text-yellow-500`} />;
    }
  };

  // Show weather alerts based on conditions
  useEffect(() => {
    if (currentWeather) {
      if (currentWeather.main.temp > 35) {
        toast({
          title: "Extreme Heat Alert",
          description: "It's extremely hot today. Stay hydrated and avoid direct sunlight!",
          variant: "destructive"
        });
      } else if (currentWeather.main.temp < 0) {
        toast({
          title: "Freezing Alert",
          description: "Temperatures are below freezing. Dress warmly and be cautious of ice.",
          variant: "destructive"
        });
      } else if (currentWeather.weather[0].main.toLowerCase().includes('thunderstorm')) {
        toast({
          title: "Thunderstorm Alert",
          description: "Thunderstorms are expected. Stay indoors and avoid open areas.",
          variant: "warning"
        });
      }
    }
  }, [currentWeather]);

  if (isLoadingCurrent || isLoadingForecast) {
    return (
      <Card className="bg-background shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-4">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentError || forecastError) {
    return (
      <Card className="bg-background shadow-sm">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Unable to load weather data
          </h3>
          <p className="text-muted-foreground mb-4">
            {(currentError as Error)?.message || (forecastError as Error)?.message || "Please try again later."}
          </p>
          <Button 
            onClick={() => { refetchCurrent(); refetchForecast(); }} 
            variant="outline"
            className="mx-auto"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentWeather || !forecast) {
    return null;
  }

  return (
    <Card className="bg-background shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            {currentWeather.name}, {currentWeather.sys.country}
          </CardTitle>
          <Badge variant="outline">
            {format(fromUnixTime(currentWeather.dt), 'PPp')}
          </Badge>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <CardContent className="pt-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                {getWeatherIcon(currentWeather.weather[0].main, 12)}
                <span className="text-sm text-muted-foreground mt-1 capitalize">
                  {currentWeather.weather[0].description}
                </span>
              </div>

              <div>
                <p className="text-4xl font-bold text-primary">
                  {Math.round(currentWeather.main.temp)}°C
                </p>
                <p className="text-sm text-muted-foreground">
                  Feels like {Math.round(currentWeather.main.feels_like)}°C
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">
                    <Thermometer className="h-3 w-3 mr-1" />
                    {Math.round(currentWeather.main.temp_min)}° / {Math.round(currentWeather.main.temp_max)}°
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-sm font-medium">{currentWeather.main.humidity}%</span>
                <span className="text-xs text-muted-foreground">Humidity</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                <Wind className="h-5 w-5 text-slate-500 mb-1" />
                <span className="text-sm font-medium">{Math.round(currentWeather.wind.speed * 3.6)} km/h</span>
                <span className="text-xs text-muted-foreground">Wind</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                <Sun className="h-5 w-5 text-yellow-500 mb-1" />
                <span className="text-sm font-medium">
                  {format(fromUnixTime(currentWeather.sys.sunset), 'h:mm a')}
                </span>
                <span className="text-xs text-muted-foreground">Sunset</span>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="forecast">
          <CardContent className="pt-4">
            <div className="space-y-4">
              {dailyForecast.slice(0, 5).map((day, index) => (
                <div key={day.date} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                  >
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(day.dominantWeather, 5)}
                      <div>
                        <p className="font-medium">{day.formattedDate}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {day.items[0].weather[0].description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">{Math.round(day.avgTemp)}°C</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(day.minTemp)}° / {Math.round(day.maxTemp)}°
                        </p>
                      </div>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${expandedDay === index ? 'rotate-180' : ''}`} 
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedDay === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t">
                          {day.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(item.dt_txt), 'h a')}
                              </p>
                              {getWeatherIcon(item.weather[0].main, 4)}
                              <p className="text-sm font-medium mt-1">
                                {Math.round(item.main.temp)}°
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(item.wind.speed * 3.6)} km/h
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="pt-0 pb-3">
        <p className="text-xs text-muted-foreground w-full text-center">
          Weather data provided by OpenWeather
        </p>
      </CardFooter>
    </Card>
  );
}