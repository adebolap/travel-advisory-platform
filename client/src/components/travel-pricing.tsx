import React, { useState, useEffect, useCallback } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

export default function TravelPricing({ city, originCity = '', dateRange, className = '' }: TravelPricingProps) {
  const [flightOffers, setFlightOffers] = useState<FlightPricing[]>([]);
  const [filteredFlightOffers, setFilteredFlightOffers] = useState<FlightPricing[]>([]);
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
  
  // Flight filter options
  const [showDirectFlightsOnly, setShowDirectFlightsOnly] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

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
  
  // Apply filters to flight offers
  const applyFlightFilters = useCallback(() => {
    console.log('TravelPricing: Applying flight filters');
    
    if (!flightOffers.length) {
      setFilteredFlightOffers([]);
      return;
    }
    
    let filtered = [...flightOffers];
    
    // Filter direct flights only (based on duration format, direct flights usually have PT2H30M format)
    if (showDirectFlightsOnly) {
      console.log('TravelPricing: Filtering for direct flights only');
      filtered = filtered.filter(offer => 
        !offer.duration?.includes('~') && !offer.duration?.includes('T0D')
      );
    }
    
    // Filter by airline if selected
    if (selectedAirline) {
      console.log(`TravelPricing: Filtering for airline: ${selectedAirline}`);
      filtered = filtered.filter(offer => offer.airline === selectedAirline);
    }
    
    // Filter by price range if set
    if (priceRange) {
      console.log(`TravelPricing: Filtering for price range: ${priceRange[0]}-${priceRange[1]}`);
      filtered = filtered.filter(offer => {
        const price = parseFloat(offer.price);
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }
    
    console.log(`TravelPricing: Filtered from ${flightOffers.length} to ${filtered.length} flights`);
    setFilteredFlightOffers(filtered);
  }, [flightOffers, showDirectFlightsOnly, selectedAirline, priceRange]);

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
  
  // Apply filters when flight offers or filter settings change
  useEffect(() => {
    applyFlightFilters();
  }, [flightOffers, showDirectFlightsOnly, selectedAirline, priceRange, applyFlightFilters]);

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
        
        // Calculate savings compared to average of other seasons
        let totalOtherSeasons = 0;
        let countOtherSeasons = 0;
        
        Object.entries(averageFlightPrices).forEach(([season, data]) => {
          if (season !== bestSeason && data.price > 0) {
            totalOtherSeasons += data.price;
            countOtherSeasons++;
          }
        });
        
        const avgOtherSeasons = countOtherSeasons > 0 ? totalOtherSeasons / countOtherSeasons : 0;
        const percentageSavings = avgOtherSeasons > 0 ? 
          Math.round(((avgOtherSeasons - lowestPrice) / avgOtherSeasons) * 100) : 0;
        
        return {
          season: bestSeason,
          price: lowestPrice,
          currency,
          months: monthNames,
          percentageSavings
        };
      }
    }
    
    return null;
  };

  return (
    <div className={className}>
      <Tabs defaultValue="flights" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flights">
            <Plane className="h-4 w-4 mr-2" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels">
            <HotelIcon className="h-4 w-4 mr-2" />
            Hotels
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="flights">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Plane className="mr-2 h-5 w-5 text-primary" />
                Flight Pricing
              </CardTitle>
              <CardDescription>
                {dateRange?.from ? (
                  <>
                    <span className="font-medium">{userLocation || originCity}</span> to <span className="font-medium">{city}</span> 
                    <span className="ml-1">
                      {formatDisplayDate(formatApiDate(dateRange.from))}
                      {dateRange.to && ` – ${formatDisplayDate(formatApiDate(dateRange.to))}`}
                    </span>
                  </>
                ) : (
                  <>
                    Seasonal pricing from <span className="font-medium">{userLocation || originCity}</span> to <span className="font-medium">{city}</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Average Seasonal Prices Section */}
              {!dateRange?.from && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                      Average Pricing by Season
                    </h3>
                    <div className="w-32">
                      <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger className="h-8 text-xs">
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
                    </div>
                  </div>
                  
                  {isLoadingAverages ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
                          <span className="font-medium capitalize text-sm">{season}</span>
                          <span className="text-lg font-bold mt-1">
                            {data.price > 0 ? 
                              formatPrice(data.price, data.currency) : 
                              'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Best Time to Travel Section */}
              {!isLoadingAverages && !dateRange?.from && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4 text-primary" />
                    Best Time to Visit
                  </h3>
                  
                  {(() => {
                    const bestTime = getBestTimeToTravel();
                    
                    if (!bestTime) {
                      return (
                        <div className="text-center py-3 text-sm text-muted-foreground border rounded-md">
                          Insufficient data to determine optimal travel time
                        </div>
                      );
                    }
                    
                    return (
                      <Alert className="bg-primary/5 border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary font-medium">
                          Best value for {city}
                        </AlertTitle>
                        <AlertDescription className="text-sm mt-1">
                          <div className="flex flex-col space-y-1.5">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">
                                <strong>{bestTime.season}</strong> ({bestTime.months.join(', ')})
                              </span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                Average fare: <strong>{formatPrice(bestTime.price, bestTime.currency)}</strong>
                              </span>
                            </div>
                            
                            {bestTime.percentageSavings > 0 && (
                              <div className="flex items-center">
                                <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-green-600">
                                  <strong>{bestTime.percentageSavings}% savings</strong> compared to other seasons
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
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        Available Flights <span className="text-xs text-muted-foreground ml-2">{filteredFlightOffers.length} found</span>
                      </h3>
                    </div>
                    
                    {/* Filter Controls - Responsive Layout */}
                    {flightOffers.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center mt-2">
                        <div className="flex items-center space-x-1.5 mr-1">
                          <input 
                            type="checkbox" 
                            id="directFlights" 
                            checked={showDirectFlightsOnly}
                            onChange={(e) => setShowDirectFlightsOnly(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="directFlights" className="text-xs whitespace-nowrap">Non-stop only</label>
                        </div>
                        
                        {/* Airline Select */}
                        <div className="flex items-center">
                          <Select value={selectedAirline || "all"} onValueChange={(value) => setSelectedAirline(value === "all" ? null : value)}>
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue placeholder="Airline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Airlines</SelectItem>
                              {Array.from(new Set(flightOffers.map(offer => offer.airline).filter(Boolean)))
                                .sort()
                                .map(airline => (
                                  <SelectItem key={airline} value={airline as string}>
                                    {airline}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Price Range Slider - Show only when we have offers */}
                        {flightOffers.length > 0 && (
                          <div className="flex-col space-y-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                  <DollarSign className="mr-1 h-3 w-3" />
                                  Price
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="space-y-4">
                                  <h4 className="font-medium text-sm">Price Range Filter</h4>
                                  
                                  <div className="space-y-2">
                                    {(() => {
                                      // Calculate min and max prices from available offers
                                      const prices = flightOffers.map(offer => parseFloat(offer.price));
                                      const minPrice = Math.floor(Math.min(...prices));
                                      const maxPrice = Math.ceil(Math.max(...prices));
                                      const initialRange = priceRange || [minPrice, maxPrice];
                                      
                                      return (
                                        <>
                                          <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{formatPrice(initialRange[0], flightOffers[0]?.currency || 'USD')}</span>
                                            <span>{formatPrice(initialRange[1], flightOffers[0]?.currency || 'USD')}</span>
                                          </div>
                                          <Slider
                                            defaultValue={initialRange}
                                            min={minPrice}
                                            max={maxPrice}
                                            step={10}
                                            onValueChange={(value) => setPriceRange(value as [number, number])}
                                            className="my-4"
                                          />
                                          <div className="flex justify-between">
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              onClick={() => setPriceRange([minPrice, maxPrice])}
                                            >
                                              Reset
                                            </Button>
                                            <Button 
                                              variant="default" 
                                              size="sm" 
                                              onClick={() => {
                                                // Close popover logic would go here if needed
                                              }}
                                            >
                                              Apply
                                            </Button>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Filter Badges */}
                  {(showDirectFlightsOnly || selectedAirline || priceRange) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {showDirectFlightsOnly && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs py-1">
                          Non-stop flights
                          <button onClick={() => setShowDirectFlightsOnly(false)} className="ml-1 h-3 w-3 rounded-full">
                            ×
                          </button>
                        </Badge>
                      )}
                      
                      {selectedAirline && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs py-1">
                          Airline: {selectedAirline}
                          <button onClick={() => setSelectedAirline(null)} className="ml-1 h-3 w-3 rounded-full">
                            ×
                          </button>
                        </Badge>
                      )}
                      
                      {priceRange && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs py-1">
                          Price: {`${formatPrice(priceRange[0], flightOffers[0]?.currency || 'USD')} – ${formatPrice(priceRange[1], flightOffers[0]?.currency || 'USD')}`}
                          <button onClick={() => setPriceRange(null)} className="ml-1 h-3 w-3 rounded-full">
                            ×
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {isLoadingFlights ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredFlightOffers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredFlightOffers.slice(0, 5).map((offer, index) => (
                        <div key={index} className="border rounded-md p-3 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-lg">
                                {formatPrice(offer.price, offer.currency)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {offer.airline || 'Various Airlines'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {offer.origin} → {offer.destination}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {formatDisplayDate(offer.departureDate)}
                                {offer.returnDate && ` – ${formatDisplayDate(offer.returnDate)}`}
                              </div>
                            </div>
                          </div>
                          
                          {offer.duration && (
                            <div className="mt-2 text-xs">
                              <Badge variant="secondary" className="font-normal">
                                {offer.stops !== undefined && offer.stops === 0
                                  ? 'Non-stop · ' + offer.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm')
                                  : (!offer.duration?.includes('~') && !offer.duration?.includes('T0D')
                                    ? 'Non-stop · ' 
                                    : (offer.stops === 1 
                                      ? '1 stop · ' 
                                      : `${offer.stops || 'Multiple'} stops · `)) + 
                                    (offer.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm border rounded-md">
                      No flights found matching your filters
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="text-xs text-muted-foreground border-t pt-3">
              Fares shown include taxes and may change based on availability. Additional baggage fees may apply.
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="hotels">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <HotelIcon className="mr-2 h-5 w-5 text-primary" />
                Accommodation
              </CardTitle>
              <CardDescription>
                {dateRange?.from ? (
                  <>
                    <span className="font-medium">{city}</span>
                    <span className="ml-1">
                      {formatDisplayDate(formatApiDate(dateRange.from))}
                      {dateRange.to && ` – ${formatDisplayDate(formatApiDate(dateRange.to))}`}
                      {dateRange.to && dateRange.from && 
                        ` • ${differenceInDays(dateRange.to, dateRange.from)} ${differenceInDays(dateRange.to, dateRange.from) === 1 ? 'night' : 'nights'}`}
                    </span>
                  </>
                ) : (
                  <>
                    Seasonal hotel rates in <span className="font-medium">{city}</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Average Seasonal Hotel Prices */}
              {!dateRange?.from && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                      Average Nightly Rates
                    </h3>
                    <div className="w-32">
                      <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger className="h-8 text-xs">
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
                    </div>
                  </div>
                  
                  {isLoadingAverages ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
                          <span className="font-medium capitalize text-sm">{season}</span>
                          <span className="text-lg font-bold mt-1">
                            {data.perNight && data.perNight > 0 ? 
                              formatPrice(data.perNight, data.currency) : 
                              'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Best Time to Stay Section */}
              {!isLoadingAverages && !dateRange?.from && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4 text-primary" />
                    Best Value Season
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
                            Best hotel rates in {city}
                          </AlertTitle>
                          <AlertDescription className="text-sm mt-1">
                            <div className="flex flex-col space-y-1.5">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="capitalize">
                                  <strong>{bestSeason}</strong> ({monthNames.join(', ')})
                                </span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>
                                  Average per night: <strong>{formatPrice(lowestPrice, currency)}</strong>
                                </span>
                              </div>
                              {percentageSavings > 0 && (
                                <div className="flex items-center">
                                  <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                                  <span className="text-green-600">
                                    <strong>{percentageSavings}% savings</strong> compared to other seasons
                                  </span>
                                </div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      );
                    })() || (
                      <div className="text-center py-3 text-sm text-muted-foreground border rounded-md">
                        Insufficient data to determine optimal booking period
                      </div>
                    )
                  ) : (
                    <div className="text-center py-3 text-sm text-muted-foreground border rounded-md">
                      Insufficient data to determine optimal booking period
                    </div>
                  )}
                </div>
              )}
              
              {/* Real-time Hotel Offers */}
              {dateRange?.from && dateRange.to && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <HotelIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    Available Properties <span className="text-xs text-muted-foreground ml-2">{hotelOffers.length} found</span>
                  </h3>
                  
                  {isLoadingHotels ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : hotelOffers.length > 0 ? (
                    <div className="space-y-3">
                      {hotelOffers.slice(0, 5).map((hotel, index) => (
                        <div key={index} className="border rounded-md p-3 hover:shadow-md transition-shadow">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-bold">{hotel.hotelName}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {hotel.ratingCategory} • {hotel.address}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatPrice(hotel.price, hotel.currency)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {differenceInDays(new Date(hotel.checkOutDate), new Date(hotel.checkInDate))} {differenceInDays(new Date(hotel.checkOutDate), new Date(hotel.checkInDate)) === 1 ? 'night' : 'nights'} total
                              </div>
                            </div>
                          </div>
                          
                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {hotel.amenities.slice(0, 3).map((amenity, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{amenity}</Badge>
                              ))}
                              {hotel.amenities.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{hotel.amenities.length - 3} more</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm border rounded-md">
                      No accommodations available for the selected dates
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="text-xs text-muted-foreground border-t pt-3">
              Rates shown are for {adults === 1 ? 'single occupancy' : `${adults} guests`}. Prices include taxes and may vary based on availability and room type.
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}