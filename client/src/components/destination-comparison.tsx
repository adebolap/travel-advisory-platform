import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X, Plus, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from '@/lib/queryClient';
import CitySearch from "@/components/city-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PriceData {
  flightPrice: number;
  flightCurrency: string;
  hotelTotal: number;
  hotelPerNight: number;
  hotelCurrency: string;
  totalEstimate: number;
  totalCurrency: string;
}

interface WeatherData {
  temperature: string;
  condition: string;
  seasonalNotes: string;
}

interface DestinationData {
  city: string;
  prices: PriceData;
  weather?: WeatherData;
  crowdLevel?: string;
  events?: number;
  attractions?: number;
  bestTimeToVisit?: string[];
}

interface DestinationComparisonProps {
  originCity?: string;
  dateRange?: DateRange;
  initialDestinations?: string[];
}

export default function DestinationComparison({ 
  originCity = "London", 
  dateRange, 
  initialDestinations = [] 
}: DestinationComparisonProps) {
  const [destinations, setDestinations] = useState<string[]>(initialDestinations.length > 0 ? initialDestinations : []);
  const [isAddingCity, setIsAddingCity] = useState(initialDestinations.length === 0);
  const maxDestinations = 4;

  // Season calculation
  const getSeasonFromDate = () => {
    if (!dateRange?.from) return "summer"; // Default
    
    const month = dateRange.from.getMonth();
    
    if (month >= 11 || month <= 1) return "winter";
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    return "fall";
  };
  
  const season = getSeasonFromDate();

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Query for destination data
  const { data: destinationsData, isLoading } = useQuery({
    queryKey: ['/api/destinations/compare', destinations, originCity, dateRange, season],
    queryFn: async () => {
      if (destinations.length === 0) return [];
      
      // Create query params
      const params = new URLSearchParams();
      destinations.forEach(city => params.append('destinations', city));
      params.append('origin', originCity);
      params.append('season', season);
      
      if (dateRange?.from) {
        params.append('startDate', dateRange.from.toISOString().split('T')[0]);
      }
      
      if (dateRange?.to) {
        params.append('endDate', dateRange.to.toISOString().split('T')[0]);
      }
      
      const response = await fetch(`/api/destinations/compare?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      
      return await response.json();
    },
    enabled: destinations.length > 0,
  });

  // Add a destination
  const handleAddDestination = (city: string) => {
    if (destinations.length < maxDestinations && !destinations.includes(city)) {
      setDestinations([...destinations, city]);
      setIsAddingCity(false);
    }
  };

  // Remove a destination
  const handleRemoveDestination = (city: string) => {
    setDestinations(destinations.filter(d => d !== city));
  };

  // Swap destinations (useful for comparing just 2)
  const handleSwapDestinations = () => {
    if (destinations.length === 2) {
      setDestinations([destinations[1], destinations[0]]);
    }
  };

  const resetComparison = () => {
    setDestinations([]);
    setIsAddingCity(true);
  };

  if (isAddingCity && destinations.length < maxDestinations) {
    return (
      <Card className="relative">
        <CardHeader>
          <CardTitle>Compare Destinations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {destinations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {destinations.map(city => (
                  <div key={city} className="flex items-center bg-primary-100 rounded-full px-3 py-1">
                    <span className="text-sm font-medium">{city}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 ml-1 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveDestination(city)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {destinations.length === 0 
                  ? 'Select destinations to compare'
                  : `Add another destination (${destinations.length}/${maxDestinations})`}
              </h3>
              <CitySearch onCitySelect={handleAddDestination} />
            </div>

            <div className="flex justify-between mt-4">
              {destinations.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingCity(false)}
                >
                  View Comparison
                </Button>
              )}
              
              {destinations.length > 1 && (
                <Button 
                  variant="ghost"
                  onClick={resetComparison}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Destination Comparison</CardTitle>
        <div className="flex gap-2">
          {destinations.length === 2 && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1"
              onClick={handleSwapDestinations}
            >
              <ArrowRightLeft className="h-4 w-4" /> Swap
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => setIsAddingCity(true)}
          >
            <Plus className="h-4 w-4" /> 
            {destinations.length < maxDestinations ? "Add Destination" : "Edit"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading comparison data...</span>
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="weather">Weather</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {destinationsData?.map((destination: DestinationData) => (
                  <div 
                    key={destination.city} 
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="bg-primary/10 p-3 font-medium text-center">
                      {destination.city}
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total cost estimate:</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(destination.prices.totalEstimate, destination.prices.totalCurrency)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Best time to visit:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {destination.bestTimeToVisit?.map(time => (
                            <span 
                              key={time} 
                              className={cn(
                                "px-2 py-0.5 text-xs rounded-full",
                                time.toLowerCase() === season.toLowerCase() 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted"
                              )}
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Crowds:</p>
                        <p className={cn(
                          "text-sm font-medium",
                          destination.crowdLevel?.toLowerCase().includes('high') ? "text-amber-500" : 
                          destination.crowdLevel?.toLowerCase().includes('low') ? "text-green-500" : 
                          "text-blue-500"
                        )}>
                          {destination.crowdLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="costs">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Destination</th>
                      <th className="text-right py-2 px-4">Flight Cost</th>
                      <th className="text-right py-2 px-4">Hotel (Total)</th>
                      <th className="text-right py-2 px-4">Hotel (Per Night)</th>
                      <th className="text-right py-2 px-4">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {destinationsData?.map((destination: DestinationData) => (
                      <tr key={destination.city} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{destination.city}</td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(destination.prices.flightPrice, destination.prices.flightCurrency)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(destination.prices.hotelTotal, destination.prices.hotelCurrency)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(destination.prices.hotelPerNight, destination.prices.hotelCurrency)}
                        </td>
                        <td className="text-right py-3 px-4 font-bold">
                          {formatCurrency(destination.prices.totalEstimate, destination.prices.totalCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="activities">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Destination</th>
                      <th className="text-right py-2 px-4">Events</th>
                      <th className="text-right py-2 px-4">Attractions</th>
                      <th className="text-right py-2 px-4">Crowd Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {destinationsData?.map((destination: DestinationData) => (
                      <tr key={destination.city} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{destination.city}</td>
                        <td className="text-right py-3 px-4">
                          {destination.events || 'N/A'}
                        </td>
                        <td className="text-right py-3 px-4">
                          {destination.attractions || 'N/A'}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            destination.crowdLevel?.toLowerCase().includes('high') ? "bg-amber-100 text-amber-700" : 
                            destination.crowdLevel?.toLowerCase().includes('low') ? "bg-green-100 text-green-700" : 
                            "bg-blue-100 text-blue-700"
                          )}>
                            {destination.crowdLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="weather">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {destinationsData?.map((destination: DestinationData) => (
                  <div 
                    key={destination.city} 
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="bg-primary/10 p-3 font-medium text-center">
                      {destination.city}
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {destination.weather ? (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Temperature:</p>
                            <p className="font-medium">{destination.weather.temperature}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Conditions:</p>
                            <p className="font-medium">{destination.weather.condition}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Seasonal Notes:</p>
                            <p className="text-sm">{destination.weather.seasonalNotes}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground italic">Weather data not available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}