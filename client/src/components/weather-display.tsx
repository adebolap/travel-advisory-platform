import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sun, Cloud, CloudRain, Wind, Droplets, AlertTriangle, 
  Snowflake, CloudLightning, Thermometer, ChevronDown 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
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
  };
  name: string;
  sys: {
    country: string;
  };
  wind: {
    speed: number;
  };
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
}

interface WeatherDisplayProps {
  city: string;
  onWeatherUpdate?: (weather: string) => void;
}

export default function WeatherDisplay({ city, onWeatherUpdate }: WeatherDisplayProps) {
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("current");
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Current weather query
  const { 
    data: weather, 
    isLoading: isLoadingWeather, 
    error: weatherError,
    refetch: refetchWeather 
  } = useQuery<WeatherData>({
    queryKey: ['/api/weather', city],
    queryFn: async () => {
      const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch weather data' }));
        throw new Error(errorData.message || errorData.details || 'Failed to fetch weather data');
      }
      const data = await response.json();
      setLastUpdate(new Date());
      return data;
    },
    enabled: Boolean(city),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Forecast query
  const { 
    data: forecast,
    isLoading: isLoadingForecast,
    error: forecastError
  } = useQuery<ForecastData>({
    queryKey: ['/api/forecast', city],
    queryFn: async () => {
      const response = await fetch(`/api/forecast/${encodeURIComponent(city)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch forecast data' }));
        throw new Error(errorData.message || errorData.details || 'Failed to fetch forecast data');
      }
      return response.json();
    },
    enabled: Boolean(city),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (weather) {
      const temp = weather.main.temp;
      // Show weather alerts
      if (temp >= 35) {
        toast({
          title: "Extreme Heat Warning",
          description: "Very hot conditions expected. Stay hydrated.",
          variant: "destructive",
        });
      } else if (temp <= 0) {
        toast({
          title: "Freezing Alert",
          description: "Freezing temperatures expected. Stay warm.",
          variant: "destructive",
        });
      }

      // Update parent component with weather category
      if (onWeatherUpdate) {
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

  // Group forecast by day
  const dailyForecast = forecast?.list.reduce<Record<string, typeof forecast.list[0][]>>((acc, item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  if (isLoadingWeather || isLoadingForecast) {
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

  if (weatherError || forecastError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium mb-2">Unable to load weather data</p>
          <p className="text-sm text-muted-foreground mb-4">
            {weatherError instanceof Error ? weatherError.message : 'Please try again later'}
          </p>
          <Button 
            onClick={() => refetchWeather()}
            variant="outline"
            className="mx-auto"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weather || !forecast) {
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="forecast">4-Day Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
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
          </TabsContent>

          <TabsContent value="forecast">
            <div className="space-y-4">
              {dailyForecast && Object.entries(dailyForecast).slice(0, 4).map(([date, items], index) => {
                const avgTemp = Math.round(items.reduce((sum, item) => sum + item.main.temp, 0) / items.length);
                const minTemp = Math.round(Math.min(...items.map(item => item.main.temp_min)));
                const maxTemp = Math.round(Math.max(...items.map(item => item.main.temp_max)));

                return (
                  <div 
                    key={date}
                    className="border-b last:border-b-0 pb-3"
                    onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                  >
                    <div className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        {getWeatherIcon(items[0].weather[0].main)}
                        <div>
                          <p className="font-medium">{format(addDays(new Date(), index), 'EEEE, MMM d')}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {items[0].weather[0].description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-medium">{avgTemp}°C</p>
                          <p className="text-xs text-muted-foreground">
                            {minTemp}° / {maxTemp}°
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
                            {items.slice(0, 4).map((item, i) => (
                              <div key={i} className="flex flex-col items-center text-center">
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(item.dt_txt), 'HH:mm')}
                                </p>
                                {getWeatherIcon(item.weather[0].main)}
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
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Last updated: {format(lastUpdate, 'HH:mm')}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => refetchWeather()}
          >
            Refresh
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}