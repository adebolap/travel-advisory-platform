import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format, differenceInDays } from 'date-fns';
import axios from 'axios';
import { Loader2, Plane, HotelIcon, TrendingUp, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    if (!dateRange?.from) return;
    
    setIsLoadingFlights(true);
    setError(null);
    
    try {
      const departureDate = formatApiDate(dateRange.from);
      const returnDate = dateRange.to ? formatApiDate(dateRange.to) : '';
      
      const response = await axios.get('/api/flights/price', {
        params: {
          origin: originCity,
          destination: city,
          departureDate,
          returnDate,
          adults
        }
      });
      
      setFlightOffers(response.data);
    } catch (error: any) {
      console.error('Error fetching flight prices:', error);
      setError(error.response?.data?.message || 'Failed to fetch flight prices');
      setFlightOffers([]);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  // Fetch actual hotel prices based on date range
  const fetchHotelPrices = async () => {
    if (!dateRange?.from) return;
    
    setIsLoadingHotels(true);
    setError(null);
    
    try {
      const checkInDate = formatApiDate(dateRange.from);
      const checkOutDate = dateRange.to ? formatApiDate(dateRange.to) : '';
      
      const response = await axios.get('/api/hotels/price', {
        params: {
          cityCode: city,
          checkInDate,
          checkOutDate,
          adults,
          radius: 10
        }
      });
      
      setHotelOffers(response.data);
    } catch (error: any) {
      console.error('Error fetching hotel prices:', error);
      setError(error.response?.data?.message || 'Failed to fetch hotel prices');
      setHotelOffers([]);
    } finally {
      setIsLoadingHotels(false);
    }
  };

  // Fetch average seasonal prices
  const fetchAveragePrices = async () => {
    setIsLoadingAverages(true);
    setError(null);
    
    try {
      // Fetch average flight prices for all seasons
      const seasons = ['winter', 'spring', 'summer', 'fall'];
      const flightPromises = seasons.map(season => 
        axios.get('/api/flights/average', {
          params: {
            origin: originCity,
            destination: city,
            season
          }
        })
      );
      
      // Fetch average hotel prices for all seasons
      const hotelPromises = seasons.map(season => 
        axios.get('/api/hotels/average', {
          params: {
            cityCode: city,
            season,
            nights: dateRange?.to && dateRange?.from ? 
              differenceInDays(dateRange.to, dateRange.from) : 3
          }
        })
      );
      
      const flightResponses = await Promise.all(flightPromises);
      const hotelResponses = await Promise.all(hotelPromises);
      
      // Process flight price responses
      const flightPrices: Record<string, AveragePrice> = {};
      seasons.forEach((season, index) => {
        flightPrices[season] = flightResponses[index].data;
      });
      
      // Process hotel price responses
      const hotelPrices: Record<string, AveragePrice> = {};
      seasons.forEach((season, index) => {
        hotelPrices[season] = hotelResponses[index].data;
      });
      
      setAverageFlightPrices(flightPrices);
      setAverageHotelPrices(hotelPrices);
    } catch (error: any) {
      console.error('Error fetching average prices:', error);
      setError(error.response?.data?.message || 'Failed to fetch average seasonal prices');
    } finally {
      setIsLoadingAverages(false);
    }
  };

  // Initial load
  useEffect(() => {
    setSelectedSeason(getCurrentSeason());
  }, []);

  // Fetch data when city, date range, or adults changes
  useEffect(() => {
    if (city && originCity) {
      fetchAveragePrices();
      
      if (dateRange?.from) {
        if (activeTab === 'flights') {
          fetchFlightPrices();
        } else {
          fetchHotelPrices();
        }
      }
    }
  }, [city, originCity, dateRange, adults]);

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
                    {originCity} to {city} 
                    on {formatDisplayDate(formatApiDate(dateRange.from))}
                    {dateRange.to && ` - ${formatDisplayDate(formatApiDate(dateRange.to))}`}
                  </>
                ) : (
                  `Average seasonal flight prices from ${originCity} to ${city}`
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
                    Hotels in {city} 
                    for {formatDisplayDate(formatApiDate(dateRange.from))}
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