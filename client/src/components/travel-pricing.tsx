import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format, differenceInDays } from 'date-fns';
import axios from 'axios';
import { Loader2, Plane, HotelIcon, TrendingUp, Calendar, Users, MapPin, Clock, DollarSign, CalendarClock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Types for flight offers
interface FlightPricing {
  price: string;
  currency: string;
  departureDate: string;
  returnDate: string;
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
  airline?: string;
  duration?: string;
}

// Types for hotel offers
interface HotelPricing {
  hotelName: string;
  price: string;
  currency: string;
  checkInDate: string;
  checkOutDate: string;
  ratingCategory: string;
  address?: string;
  amenities?: string[];
  thumbnailUrl?: string;
}

// Types for average prices
interface AveragePrice {
  price: number;
  currency: string;
  perNight?: number;
}

interface Season {
  name: string;
  months: number[];
}

interface TravelPricingProps {
  city: string;
  originCity?: string;
  dateRange?: DateRange;
  className?: string;
}

export default function TravelPricing({ city, originCity = 'New York', dateRange, className = '' }: TravelPricingProps) {
  const [flightOffers, setFlightOffers] = useState<FlightPricing[]>([]);
  const [hotelOffers, setHotelOffers] = useState<HotelPricing[]>([]);
  const [averageFlightPrices, setAverageFlightPrices] = useState<Record<string, AveragePrice>>({});
  const [averageHotelPrices, setAverageHotelPrices] = useState<Record<string, AveragePrice>>({});
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [isLoadingAverages, setIsLoadingAverages] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('summer');
  const [adults, setAdults] = useState(1);
  const [activeTab, setActiveTab] = useState('flights');
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Define seasons
  const seasons: Season[] = [
    { name: 'Winter', months: [0, 1, 11] }, // Jan, Feb, Dec
    { name: 'Spring', months: [2, 3, 4] },  // Mar, Apr, May
    { name: 'Summer', months: [5, 6, 7] },  // Jun, Jul, Aug
    { name: 'Fall', months: [8, 9, 10] }    // Sep, Oct, Nov
  ];

  // Calculate current season
  const getCurrentSeason = (): string => {
    const currentMonth = new Date().getMonth();
    const season = seasons.find(s => s.months.includes(currentMonth));
    return season ? season.name.toLowerCase() : 'summer';
  };

  // Format date for API
  const formatApiDate = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch actual flight prices based on date range
  const fetchFlightPrices = async () => {
    if (!dateRange?.from) {
      console.log('TravelPricing: fetchFlightPrices - No date range selected');
      return;
    }
    
    console.log('TravelPricing: fetchFlightPrices called');
    setIsLoadingFlights(true);
    setError(null);
    
    try {
      const departureDate = formatApiDate(dateRange.from);
      const returnDate = dateRange.to ? formatApiDate(dateRange.to) : '';
      const actualOrigin = userLocation || originCity;
      
      console.log(`TravelPricing: Fetching flight prices with params:`, {
        origin: actualOrigin,
        destination: city,
        departureDate,
        returnDate,
        adults
      });
      
      const response = await axios.get('/api/flights/price', {
        params: {
          origin: actualOrigin,
          destination: city,
          departureDate,
          returnDate,
          adults
        }
      });
      
      console.log(`TravelPricing: Flight offers response:`, response.data);
      setFlightOffers(response.data);
    } catch (error: any) {
      console.error('TravelPricing: Error fetching flight prices:', error);
      console.error('TravelPricing: Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to fetch flight prices');
      setFlightOffers([]);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  // Fetch actual hotel prices based on date range
  const fetchHotelPrices = async () => {
    if (!dateRange?.from) {
      console.log('TravelPricing: fetchHotelPrices - No date range selected');
      return;
    }
    
    console.log('TravelPricing: fetchHotelPrices called');
    setIsLoadingHotels(true);
    setError(null);
    
    try {
      const checkInDate = formatApiDate(dateRange.from);
      const checkOutDate = dateRange.to ? formatApiDate(dateRange.to) : '';
      
      console.log(`TravelPricing: Fetching hotel prices with params:`, {
        cityCode: city,
        checkInDate,
        checkOutDate,
        adults,
        radius: 10
      });
      
      const response = await axios.get('/api/hotels/price', {
        params: {
          cityCode: city,
          checkInDate,
          checkOutDate,
          adults,
          radius: 10
        }
      });
      
      console.log(`TravelPricing: Hotel offers response:`, response.data);
      setHotelOffers(response.data);
    } catch (error: any) {
      console.error('TravelPricing: Error fetching hotel prices:', error);
      console.error('TravelPricing: Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to fetch hotel prices');
      setHotelOffers([]);
    } finally {
      setIsLoadingHotels(false);
    }
  };

  // Fetch average seasonal prices
  const fetchAveragePrices = async () => {
    console.log('TravelPricing: fetchAveragePrices called');
    setIsLoadingAverages(true);
    setError(null);
    
    try {
      // Fetch average flight prices for all seasons
      const seasons = ['winter', 'spring', 'summer', 'fall'];
      const actualOrigin = userLocation || originCity;
      console.log(`TravelPricing: Fetching average prices for ${city} from ${actualOrigin} for seasons:`, seasons);
      
      const flightPromises = seasons.map(season => {
        console.log(`TravelPricing: Creating flight price request for ${season} season`);
        return axios.get('/api/flights/average', {
          params: {
            origin: actualOrigin,
            destination: city,
            season
          }
        }).catch(err => {
          console.error(`TravelPricing: Error fetching flight prices for ${season} season:`, err.message);
          throw err;
        });
      });
      
      // Fetch average hotel prices for all seasons
      const nights = dateRange?.to && dateRange?.from ? 
        differenceInDays(dateRange.to, dateRange.from) : 3;
      console.log(`TravelPricing: Using ${nights} nights for hotel price calculations`);
      
      const hotelPromises = seasons.map(season => {
        console.log(`TravelPricing: Creating hotel price request for ${season} season`);
        return axios.get('/api/hotels/average', {
          params: {
            cityCode: city,
            season,
            nights
          }
        }).catch(err => {
          console.error(`TravelPricing: Error fetching hotel prices for ${season} season:`, err.message);
          throw err;
        });
      });
      
      console.log('TravelPricing: Awaiting all price promises...');
      const flightResponses = await Promise.all(flightPromises);
      const hotelResponses = await Promise.all(hotelPromises);
      console.log('TravelPricing: Received all price responses');
      
      // Process flight price responses
      const flightPrices: Record<string, AveragePrice> = {};
      seasons.forEach((season, index) => {
        console.log(`TravelPricing: Processing flight price for ${season}:`, flightResponses[index].data);
        flightPrices[season] = flightResponses[index].data;
      });
      
      // Process hotel price responses
      const hotelPrices: Record<string, AveragePrice> = {};
      seasons.forEach((season, index) => {
        console.log(`TravelPricing: Processing hotel price for ${season}:`, hotelResponses[index].data);
        hotelPrices[season] = hotelResponses[index].data;
      });
      
      console.log('TravelPricing: Setting state with average prices');
      setAverageFlightPrices(flightPrices);
      setAverageHotelPrices(hotelPrices);
    } catch (error: any) {
      console.error('TravelPricing: Error fetching average prices:', error);
      setError(error.response?.data?.message || 'Failed to fetch average seasonal prices');
    } finally {
      setIsLoadingAverages(false);
    }
  };

  // Get user's location
  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get city name from coordinates
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
            );
            
            if (response.data.results && response.data.results.length > 0) {
              // Find city component in the address components
              const addressComponents = response.data.results[0].address_components;
              const cityComponent = addressComponents.find(
                (component: any) => 
                  component.types.includes('locality') || 
                  component.types.includes('administrative_area_level_1')
              );
              
              if (cityComponent) {
                setUserLocation(cityComponent.long_name);
                console.log(`TravelPricing: User's location detected: ${cityComponent.long_name}`);
              }
            }
          } catch (error) {
            console.error('TravelPricing: Error getting location name:', error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error('TravelPricing: Geolocation error:', error);
          setIsLocating(false);
        }
      );
    } else {
      console.error('TravelPricing: Geolocation not supported by browser');
      setIsLocating(false);
    }
  };

  // Initial load
  useEffect(() => {
    setSelectedSeason(getCurrentSeason());
    getUserLocation(); // Get user's location on initial load
  }, []);

  // Fetch data when city, date range, or adults changes
  useEffect(() => {
    // Use user's current location if available
    const actualOrigin = userLocation || originCity;
    
    if (city && actualOrigin) {
      console.log(`TravelPricing: Fetching data for ${city} from ${actualOrigin}`);
      fetchAveragePrices();
      
      if (dateRange?.from) {
        console.log(`TravelPricing: Date range selected: ${formatApiDate(dateRange.from)} - ${dateRange.to ? formatApiDate(dateRange.to) : 'N/A'}`);
        if (activeTab === 'flights') {
          console.log('TravelPricing: Fetching flight prices');
          fetchFlightPrices();
        } else {
          console.log('TravelPricing: Fetching hotel prices');
          fetchHotelPrices();
        }
      } else {
        console.log('TravelPricing: No date range selected');
      }
    } else {
      console.log('TravelPricing: Missing city or origin city');
    }
  }, [city, originCity, userLocation, dateRange, adults]);

  // Fetch appropriate data when tab changes
  useEffect(() => {
    if (activeTab === 'flights') {
      fetchFlightPrices();
    } else {
      fetchHotelPrices();
    }
  }, [activeTab]);

  // Format price
  const formatPrice = (price: string | number, currency: string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };
  
  // Determine best time to travel based on price data
  const getBestTimeToTravel = () => {
    if (Object.keys(averageFlightPrices).length === 0) {
      return null;
    }
    
    // Find the season with the lowest flight price
    let bestSeason = '';
    let lowestPrice = Infinity;
    let currency = '';
    
    Object.entries(averageFlightPrices).forEach(([season, data]) => {
      if (data.price > 0 && data.price < lowestPrice) {
        lowestPrice = data.price;
        bestSeason = season;
        currency = data.currency;
      }
    });
    
    if (bestSeason) {
      // Get months for this season
      const seasonObj = seasons.find(s => s.name.toLowerCase() === bestSeason);
      if (seasonObj) {
        const monthNames = seasonObj.months.map(monthIndex => {
          const date = new Date();
          date.setMonth(monthIndex);
          return format(date, 'MMMM');
        });
        
        return {
          season: bestSeason,
          price: lowestPrice,
          currency,
          months: monthNames,
          percentageSavings: calculateSavings(bestSeason, lowestPrice)
        };
      }
    }
    
    return null;
  };
  
  // Calculate savings percentage compared to average of other seasons
  const calculateSavings = (bestSeason: string, lowestPrice: number) => {
    let totalOtherSeasons = 0;
    let countOtherSeasons = 0;
    
    Object.entries(averageFlightPrices).forEach(([season, data]) => {
      if (season !== bestSeason && data.price > 0) {
        totalOtherSeasons += data.price;
        countOtherSeasons++;
      }
    });
    
    if (countOtherSeasons === 0) return 0;
    
    const avgOtherSeasons = totalOtherSeasons / countOtherSeasons;
    return Math.round(((avgOtherSeasons - lowestPrice) / avgOtherSeasons) * 100);
  };

  return (
    <div className={`travel-pricing ${className}`}>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="flights">
              <Plane className="mr-2 h-4 w-4" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="hotels">
              <HotelIcon className="mr-2 h-4 w-4" />
              Hotels
            </TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Select value={adults.toString()} onValueChange={(value) => setAdults(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Travelers" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Adult' : 'Adults'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-[130px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map(season => (
                  <SelectItem key={season.name} value={season.name.toLowerCase()}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={getUserLocation} 
                  disabled={isLocating}
                  className="flex-shrink-0"
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {userLocation 
                  ? `Using your location: ${userLocation}` 
                  : "Use your current location"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <CardTitle>Flight Pricing</CardTitle>
              <CardDescription>
                {dateRange?.from ? (
                  <>
                    {userLocation || originCity} to {city} 
                    on {formatDisplayDate(formatApiDate(dateRange.from))}
                    {dateRange.to && ` - ${formatDisplayDate(formatApiDate(dateRange.to))}`}
                  </>
                ) : (
                  `Average seasonal flight prices from ${userLocation || originCity} to ${city}`
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Average Seasonal Prices Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Average Seasonal Prices
                </h3>
                
                {isLoadingAverages ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(averageFlightPrices).map(([season, data]) => (
                      <div 
                        key={season}
                        className={`p-3 rounded-md flex flex-col items-center text-center 
                          ${selectedSeason === season ? 'bg-primary/10 border border-primary/30' : 'bg-muted'}
                        `}
                      >
                        <span className="font-medium capitalize">{season}</span>
                        <span className="text-xl font-bold">
                          {data.price > 0 ? 
                            formatPrice(data.price, data.currency) : 
                            'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Best Time to Travel Section */}
              {!isLoadingAverages && !dateRange?.from && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Best Time to Travel
                  </h3>
                  
                  {(() => {
                    const bestTime = getBestTimeToTravel();
                    
                    if (!bestTime) {
                      return (
                        <div className="text-center py-4 border rounded-md">
                          Not enough price data to determine best travel time
                        </div>
                      );
                    }
                    
                    return (
                      <Alert className="bg-primary/5 border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary font-medium">
                          Best time to visit {city}
                        </AlertTitle>
                        <AlertDescription className="text-sm mt-2">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">
                                <strong>{bestTime.season}</strong> ({bestTime.months.join(', ')})
                              </span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                Average price: <strong>{formatPrice(bestTime.price, bestTime.currency)}</strong>
                              </span>
                            </div>
                            
                            {bestTime.percentageSavings > 0 && (
                              <div className="flex items-center">
                                <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-green-600">
                                  Save up to <strong>{bestTime.percentageSavings}%</strong> compared to other seasons
                                </span>
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  })()}
                </div>
              )}
              
              {/* Real-time Flight Offers */}
              {dateRange?.from && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Available Flights</h3>
                  
                  {isLoadingFlights ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : flightOffers.length > 0 ? (
                    <div className="space-y-4">
                      {flightOffers.slice(0, 5).map((offer, index) => (
                        <div key={index} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-lg">
                                {formatPrice(offer.price, offer.currency)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {offer.airline || 'Various Airlines'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {offer.origin} → {offer.destination}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDisplayDate(offer.departureDate)}
                                {offer.returnDate && ` - ${formatDisplayDate(offer.returnDate)}`}
                              </div>
                            </div>
                          </div>
                          
                          {offer.duration && (
                            <div className="mt-2 text-sm">
                              <Badge variant="outline">{offer.duration}</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border rounded-md">
                      No flight offers available for the selected dates
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="text-sm text-muted-foreground">
              Prices may vary based on availability and time of booking
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Pricing</CardTitle>
              <CardDescription>
                {dateRange?.from ? (
                  <>
                    Hotels in {city} for {formatDisplayDate(formatApiDate(dateRange.from))}
                    {dateRange.to && ` - ${formatDisplayDate(formatApiDate(dateRange.to))}`}
                    {dateRange.to && dateRange.from && 
                      ` (${differenceInDays(dateRange.to, dateRange.from)} nights)`}
                  </>
                ) : (
                  `Average seasonal hotel prices in ${city}`
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Average Seasonal Hotel Prices */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Average Seasonal Prices (Per Night)
                </h3>
                
                {isLoadingAverages ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(averageHotelPrices).map(([season, data]) => (
                      <div 
                        key={season}
                        className={`p-3 rounded-md flex flex-col items-center text-center 
                          ${selectedSeason === season ? 'bg-primary/10 border border-primary/30' : 'bg-muted'}
                        `}
                      >
                        <span className="font-medium capitalize">{season}</span>
                        <span className="text-xl font-bold">
                          {data.perNight && data.perNight > 0 ? 
                            formatPrice(data.perNight, data.currency) : 
                            'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Best Time to Stay Section */}
              {!isLoadingAverages && !dateRange?.from && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Best Time for Accommodation
                  </h3>
                  
                  {Object.values(averageHotelPrices).some(data => data.perNight && data.perNight > 0) ? (
                    (() => {
                      // Find the season with the lowest hotel price
                      let bestSeason = '';
                      let lowestPrice = Infinity;
                      let currency = '';
                      
                      Object.entries(averageHotelPrices).forEach(([season, data]) => {
                        if (data.perNight && data.perNight > 0 && data.perNight < lowestPrice) {
                          lowestPrice = data.perNight;
                          bestSeason = season;
                          currency = data.currency;
                        }
                      });
                      
                      // Get months for this season
                      const seasonObj = seasons.find(s => s.name.toLowerCase() === bestSeason);
                      if (!seasonObj) return null;
                      
                      const monthNames = seasonObj.months.map(monthIndex => {
                        const date = new Date();
                        date.setMonth(monthIndex);
                        return format(date, 'MMMM');
                      });
                      
                      // Calculate savings compared to average of other seasons
                      let totalOtherSeasons = 0;
                      let countOtherSeasons = 0;
                      
                      Object.entries(averageHotelPrices).forEach(([season, data]) => {
                        if (season !== bestSeason && data.perNight && data.perNight > 0) {
                          totalOtherSeasons += data.perNight;
                          countOtherSeasons++;
                        }
                      });
                      
                      const avgOtherSeasons = countOtherSeasons > 0 ? totalOtherSeasons / countOtherSeasons : 0;
                      const percentageSavings = avgOtherSeasons > 0 ? 
                        Math.round(((avgOtherSeasons - lowestPrice) / avgOtherSeasons) * 100) : 0;
                      
                      return (
                        <Alert className="bg-primary/5 border-primary/20">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <AlertTitle className="text-primary font-medium">
                            Best time for accommodation in {city}
                          </AlertTitle>
                          <AlertDescription className="text-sm mt-2">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="capitalize">
                                  <strong>{bestSeason}</strong> ({monthNames.join(', ')})
                                </span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>
                                  Average nightly rate: <strong>{formatPrice(lowestPrice, currency)}</strong>
                                </span>
                              </div>
                              {percentageSavings > 0 && (
                                <div className="flex items-center">
                                  <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                                  <span className="text-green-600">
                                    Save up to <strong>{percentageSavings}%</strong> compared to other seasons
                                  </span>
                                </div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      );
                    })() || (
                      <div className="text-center py-4 border rounded-md">
                        Not enough price data to determine best time for accommodation
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4 border rounded-md">
                      Not enough price data to determine best time for accommodation
                    </div>
                  )}
                </div>
              )}
              
              {/* Real-time Hotel Offers */}
              {dateRange?.from && dateRange.to && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Available Hotels</h3>
                  
                  {isLoadingHotels ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : hotelOffers.length > 0 ? (
                    <div className="space-y-4">
                      {hotelOffers.slice(0, 5).map((hotel, index) => (
                        <div key={index} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-bold">{hotel.hotelName}</div>
                              <div className="text-sm text-muted-foreground">
                                {hotel.ratingCategory} • {hotel.address}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatPrice(hotel.price, hotel.currency)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total for {differenceInDays(new Date(hotel.checkOutDate), new Date(hotel.checkInDate))} nights
                              </div>
                            </div>
                          </div>
                          
                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {hotel.amenities.map((amenity, i) => (
                                <Badge key={i} variant="outline">{amenity}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border rounded-md">
                      No hotel offers available for the selected dates
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="text-sm text-muted-foreground">
              Hotel prices are for a {adults === 1 ? 'single room' : `room with ${adults} guests`} and may vary based on availability
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}