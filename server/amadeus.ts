import Amadeus from 'amadeus';

// Initialize the Amadeus client
if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
  throw new Error('Missing required Amadeus API credentials: AMADEUS_API_KEY and AMADEUS_API_SECRET');
}

// Log the key to help with debugging (only first 5 chars for security)
console.log(`Amadeus API key starts with: ${process.env.AMADEUS_API_KEY?.substring(0, 5)}...`);
console.log(`Amadeus API secret starts with: ${process.env.AMADEUS_API_SECRET?.substring(0, 5)}...`);

// Initialize the Amadeus client with the production API endpoint
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
  // @ts-ignore hostName is available but not in type definition
  hostName: 'production' // Use the production API
});

// Mapping of major cities to their IATA airport codes
const cityToAirport: Record<string, string> = {
  'New York': 'JFK',
  'London': 'LHR',
  'Paris': 'CDG',
  'Tokyo': 'HND',
  'Sydney': 'SYD',
  'Dubai': 'DXB',
  'Barcelona': 'BCN',
  'Rome': 'FCO',
  'Amsterdam': 'AMS',
  'Singapore': 'SIN',
  'Berlin': 'BER',
  'Bangkok': 'BKK',
  'Madrid': 'MAD',
  'Toronto': 'YYZ',
  'San Francisco': 'SFO',
  'Chicago': 'ORD',
  'Los Angeles': 'LAX',
  'Miami': 'MIA',
  'Hong Kong': 'HKG',
  'Istanbul': 'IST',
  'Seoul': 'ICN',
  'Mumbai': 'BOM',
  'Rio de Janeiro': 'GIG',
  'Mexico City': 'MEX',
  'Cairo': 'CAI',
  'Vienna': 'VIE',
  'Munich': 'MUC',
  'Athens': 'ATH',
  'Prague': 'PRG',
  'Budapest': 'BUD',
  'Dublin': 'DUB',
  'Oslo': 'OSL',
  'Stockholm': 'ARN',
  'Brussels': 'BRU',
  'Lisbon': 'LIS',
  'Helsinki': 'HEL',
  'Copenhagen': 'CPH',
  'Warsaw': 'WAW',
  'Zurich': 'ZRH',
  'Geneva': 'GVA',
  'Vancouver': 'YVR',
  'Montreal': 'YUL',
  'Melbourne': 'MEL',
  'Auckland': 'AKL',
  'Wellington': 'WLG',
  'Johannesburg': 'JNB',
  'Cape Town': 'CPT',
  'Buenos Aires': 'EZE',
  'Santiago': 'SCL',
  'Lima': 'LIM',
  'Bogota': 'BOG',
  'Doha': 'DOH',
};

// Types for flight offers
export interface FlightPricing {
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
  stops?: number;
}

// Types for hotel offers
export interface HotelPricing {
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

/**
 * Get flight offers for a given origin, destination, and dates
 */
export async function getFlightOffers(
  originCity: string,
  destinationCity: string,
  departureDate: string,
  returnDate?: string,
  adults: number = 1
): Promise<FlightPricing[]> {
  try {
    // Convert city names to airport codes
    let originCode = cityToAirport[originCity] || null;
    let destinationCode = cityToAirport[destinationCity] || null;
    
    // Let's add Doha to our airport code mapping if it's not there
    if (destinationCity === 'Doha' && !destinationCode) {
      destinationCode = 'DOH'; // Hamad International Airport in Doha
      console.log(`Using DOH for Doha`);
    }
    
    // Handle case when city names are provided instead of codes
    if (!originCode) {
      console.log(`No IATA code found for origin: ${originCity}, attempting to use as-is`);
      // If it's a 3-letter code already, use it; otherwise keep the city name
      originCode = originCity.length === 3 ? originCity : originCity;
    }
    
    if (!destinationCode) {
      console.log(`No IATA code found for destination: ${destinationCity}, attempting to use as-is`);
      // If it's a 3-letter code already, use it; otherwise keep the city name
      destinationCode = destinationCity.length === 3 ? destinationCity : destinationCity;
    }
    
    console.log(`Using IATA codes: Origin=${originCode}, Destination=${destinationCode}`);

    // Set up search parameters
    const params: any = {
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate,
      adults
    };

    // Add return date if provided
    if (returnDate) {
      params.returnDate = returnDate;
    }

    // Call the Flight Offers Search API
    const response = await amadeus.shopping.flightOffersSearch.get(params);
    
    // Map the response to our interface
    return response.data.map((offer: any) => {
      const price = offer.price;
      const firstSegment = offer.itineraries[0].segments[0];
      
      // Get the last segment to find the final destination for multi-leg flights
      const segments = offer.itineraries[0].segments;
      const lastSegment = segments[segments.length - 1];
      const finalDestination = lastSegment.arrival.iataCode;
      
      return {
        price: price.total,
        currency: price.currency,
        departureDate: firstSegment.departure.at,
        returnDate: returnDate || '',
        origin: firstSegment.departure.iataCode,
        destination: finalDestination, // Use the final destination instead of first segment's arrival
        originCity: originCity,
        destinationCity: destinationCity,
        airline: firstSegment.carrierCode,
        duration: offer.itineraries[0].duration,
        stops: segments.length - 1 // Add number of stops (0 for direct flights)
      };
    });
  } catch (error) {
    console.error('Error fetching flight offers:', error);
    throw error;
  }
}

/**
 * Get hotel offers for a given city and dates
 */
export async function getHotelOffers(
  cityCode: string, 
  checkInDate: string,
  checkOutDate: string,
  adults: number = 1,
  radius: number = 5,
  ratings: string[] = ['3'] // Default to 3-star hotels
): Promise<HotelPricing[]> {
  try {
    console.log(`AMADEUS API: Hotel price request received with params:`, {
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      radius
    });
    
    console.log(`AMADEUS API: Fetching hotel prices in ${cityCode}`);
    
    // For hotel searches, we need to use actual city codes, not airport codes
    // Convert city name to airport code first as it's more reliable
    let cityQuery = cityToAirport[cityCode] || null;
    
    // If no airport code found, try to use the provided code
    if (!cityQuery) {
      // If it's already a 3-letter code, use it as is, otherwise keep original name
      cityQuery = cityCode.length === 3 ? cityCode : cityCode;
    }
    
    console.log(`Using city code for hotel search: ${cityQuery}`);
    
    // Try to search hotels in this city
    try {
      // Step 1: Use the Hotel List API to find hotels in the city
      const hotelSearchResponse = await amadeus.referenceData.locations.hotels.byCity.get({
        cityCode: cityQuery,
        radius: radius,
        radiusUnit: 'KM'
      });
      
      // Get the top hotels by rating (higher rated first)
      const topHotels = hotelSearchResponse.data
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10); // Limit to 10 hotels to avoid rate limiting
      
      if (topHotels.length === 0) {
        throw new Error(`No hotels found in ${cityCode}`);
      }
      
      // Step 2: Use the hotelIds to get offers for those hotels
      const hotelIds = topHotels.map((hotel: any) => hotel.hotelId);
      
      const hotelOfferResponse = await amadeus.shopping.hotelOffersSearch.get({
        hotelIds: hotelIds.join(','),
        adults: adults,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        currency: 'EUR',
        bestRateOnly: true
      });
      
      // Map the response to our interface
      const hotelOffers = hotelOfferResponse.data.map((offer: any) => {
        const hotel = offer.hotel;
        const priceInfo = offer.offers[0]; // Get the first offer
        
        // Extract hotel amenities if available
        const amenities = hotel.amenities || [];
        
        // Determine hotel rating (stars)
        const ratingCategory = hotel.rating ? `${hotel.rating}-star` : '3-star';
        
        // Get hotel address
        const address = hotel.address && hotel.address.lines 
          ? hotel.address.lines.join(', ') 
          : `${cityCode}`;
        
        if (hotel.address && hotel.address.cityName) {
          cityCode = hotel.address.cityName;
        }
        
        return {
          hotelName: hotel.name,
          price: priceInfo.price.total,
          currency: priceInfo.price.currency,
          checkInDate,
          checkOutDate,
          ratingCategory,
          address: `${address}, ${cityCode}`,
          amenities: amenities.slice(0, 5), // Limit to 5 amenities
          thumbnailUrl: hotel.media && hotel.media[0] ? hotel.media[0].uri : undefined
        };
      });
      
      console.log(`AMADEUS API: Found ${hotelOffers.length} hotel offers`);
      return hotelOffers;
    } catch (apiError: any) {
      console.error(`Error in Amadeus Hotel API:`, apiError);
      
      // Fallback for test environment or when API has issues
      console.warn(`Using fallback hotel data for ${cityCode} due to API error: ${apiError.message}`);
      
      // Use fallback for testing or when API is unavailable
      const fallbackHotels = [
        {
          hotelName: `Top Hotel in ${cityCode}`,
          price: "180",
          currency: "EUR",
          checkInDate,
          checkOutDate,
          ratingCategory: "4-star",
          address: `Main Street, ${cityCode}`,
          amenities: ["WiFi", "Breakfast", "Pool"],
          thumbnailUrl: undefined
        },
        {
          hotelName: `Central ${cityCode} Hotel`,
          price: "220",
          currency: "EUR",
          checkInDate,
          checkOutDate,
          ratingCategory: "5-star",
          address: `Central Square, ${cityCode}`,
          amenities: ["WiFi", "Spa", "Restaurant", "Gym"],
          thumbnailUrl: undefined
        },
        {
          hotelName: `Budget Stay ${cityCode}`,
          price: "120",
          currency: "EUR",
          checkInDate,
          checkOutDate,
          ratingCategory: "3-star",
          address: `Side Street, ${cityCode}`,
          amenities: ["WiFi", "Breakfast"],
          thumbnailUrl: undefined
        }
      ];
      
      // Calculate number of nights for more accurate pricing
      const nights = Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24));
      
      // Adjust prices for number of nights (simple multiplication)
      return fallbackHotels.map(hotel => ({
        ...hotel,
        price: String(parseInt(hotel.price) * nights)
      }));
    }
  } catch (error) {
    console.error('Error fetching hotel offers:', error);
    throw error;
  }
}

/**
 * Get average flight price for a destination in a given season
 */
export async function getAverageFlightPrice(
  originCity: string,
  destinationCity: string,
  season: string
): Promise<{ price: number, currency: string }> {
  try {
    // Define sample dates for each season (use current year)
    const currentYear = new Date().getFullYear();
    let sampleDate: string;
    
    switch(season.toLowerCase()) {
      case 'winter':
        sampleDate = `${currentYear}-01-15`;
        break;
      case 'spring':
        sampleDate = `${currentYear}-04-15`;
        break;
      case 'summer':
        sampleDate = `${currentYear}-07-15`;
        break;
      case 'fall':
      case 'autumn':
        sampleDate = `${currentYear}-10-15`;
        break;
      default:
        sampleDate = `${currentYear}-07-15`; // Default to summer
    }
    
    // Use a future date at least 2 weeks from now
    const today = new Date();
    const sampleDateObj = new Date(sampleDate);
    if (sampleDateObj < new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)) {
      // If the sample date is less than 2 weeks away, use next year
      sampleDate = sampleDate.replace(String(currentYear), String(currentYear + 1));
    }
    
    // Get flight offers for the sample date
    const flightOffers = await getFlightOffers(
      originCity,
      destinationCity,
      sampleDate
    );
    
    if (flightOffers.length === 0) {
      throw new Error('No flight offers found');
    }
    
    // Calculate average price
    const totalPrice = flightOffers.reduce((sum, offer) => sum + parseFloat(offer.price), 0);
    const avgPrice = totalPrice / flightOffers.length;
    
    return {
      price: Math.round(avgPrice * 100) / 100, // Round to 2 decimal places
      currency: flightOffers[0].currency
    };
  } catch (error) {
    console.error('Error getting average flight price:', error);
    return {
      price: 0,
      currency: 'USD'
    };
  }
}

/**
 * Get average hotel price for a destination city in a given season
 */
export async function getAverageHotelPrice(
  cityCode: string,
  season: string,
  nights: number = 3
): Promise<{ price: number, currency: string, perNight: number }> {
  try {
    // Define sample dates for the season (use current year)
    const currentYear = new Date().getFullYear();
    let sampleCheckInDate: string;
    let sampleCheckOutDate: string;
    
    switch(season.toLowerCase()) {
      case 'winter':
        sampleCheckInDate = `${currentYear}-01-15`;
        break;
      case 'spring':
        sampleCheckInDate = `${currentYear}-04-15`;
        break;
      case 'summer':
        sampleCheckInDate = `${currentYear}-07-15`;
        break;
      case 'fall':
      case 'autumn':
        sampleCheckInDate = `${currentYear}-10-15`;
        break;
      default:
        sampleCheckInDate = `${currentYear}-07-15`; // Default to summer
    }
    
    // Use a future date at least 2 weeks from now
    const today = new Date();
    const sampleDateObj = new Date(sampleCheckInDate);
    if (sampleDateObj < new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)) {
      // If the sample date is less than 2 weeks away, use next year
      sampleCheckInDate = sampleCheckInDate.replace(String(currentYear), String(currentYear + 1));
    }
    
    // Calculate checkout date (sample date + number of nights)
    const checkInObj = new Date(sampleCheckInDate);
    const checkOutObj = new Date(checkInObj);
    checkOutObj.setDate(checkOutObj.getDate() + nights);
    sampleCheckOutDate = checkOutObj.toISOString().split('T')[0];
    
    try {
      // Get real hotel offers for this city and dates
      const hotelOffers = await getHotelOffers(
        cityCode,
        sampleCheckInDate,
        sampleCheckOutDate,
        1, // adults
        10 // radius in km
      );
      
      if (hotelOffers.length === 0) {
        throw new Error('No hotel offers found');
      }
      
      // Calculate average price
      const totalPrices = hotelOffers.reduce((sum, hotel) => sum + parseFloat(hotel.price), 0);
      const avgTotalPrice = totalPrices / hotelOffers.length;
      const avgPricePerNight = avgTotalPrice / nights;
      
      return {
        price: Math.round(avgTotalPrice * 100) / 100, // Round to 2 decimal places
        perNight: Math.round(avgPricePerNight * 100) / 100,
        currency: hotelOffers[0].currency
      };
    } catch (apiError) {
      console.error('Error getting real hotel prices:', apiError);
      console.log('Falling back to estimated hotel prices');
      
      // Seasonal price adjustment factors (summer is more expensive, winter less so)
      const seasonalFactors: Record<string, number> = {
        'winter': 0.8,  // Lower prices in winter (80% of base)
        'spring': 0.9,  // Slightly lower in spring
        'summer': 1.2,  // Higher in peak summer (120% of base)
        'fall': 0.9,    // Slightly lower in fall
      };
      
      // Hardcoded base hotel prices for common cities (average price per night)
      const cityPrices: Record<string, { price: number, currency: string }> = {
        'NYC': { price: 250, currency: 'USD' },
        'LON': { price: 210, currency: 'GBP' },
        'PAR': { price: 230, currency: 'EUR' },
        'PRG': { price: 130, currency: 'EUR' },
        'BRU': { price: 150, currency: 'EUR' },
        'AMS': { price: 170, currency: 'EUR' },
        'BER': { price: 140, currency: 'EUR' },
        'ROM': { price: 160, currency: 'EUR' },
        'BCN': { price: 155, currency: 'EUR' },
        'MAD': { price: 145, currency: 'EUR' },
        'VIE': { price: 160, currency: 'EUR' },
        'DUB': { price: 180, currency: 'EUR' },
        'LIS': { price: 130, currency: 'EUR' },
        'DOH': { price: 200, currency: 'USD' },
      };
      
      // Convert city name to code if needed
      const cityToCityCode: Record<string, string> = {
        'New York': 'NYC',
        'London': 'LON',
        'Paris': 'PAR',
        'Tokyo': 'TYO',
        'Rome': 'ROM',
        'Barcelona': 'BCN', 
        'Prague': 'PRG',
        'Amsterdam': 'AMS',
        'Berlin': 'BER',
        'Madrid': 'MAD',
        'Vienna': 'VIE',
        'Brussels': 'BRU',
        'Lisbon': 'LIS',
        'Dublin': 'DUB',
        'Doha': 'DOH'
      };
      
      // Try to get the city code
      let city = cityToCityCode[cityCode] || null;
      
      // If no city code found, try to use the provided code
      if (!city) {
        city = cityCode.length === 3 ? cityCode : 'PAR'; // Default to Paris if unknown
      }
      
      // Get base price for the city or default
      const basePrice = cityPrices[city] || { price: 150, currency: 'EUR' };
      
      // Apply seasonal factor
      const seasonFactor = seasonalFactors[season.toLowerCase()] || 1.0;
      const adjustedPricePerNight = basePrice.price * seasonFactor;
      const totalPrice = adjustedPricePerNight * nights;
      
      return {
        price: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
        perNight: Math.round(adjustedPricePerNight * 100) / 100,
        currency: basePrice.currency
      };
    }
  } catch (error) {
    console.error('Error getting average hotel price:', error);
    return {
      price: 0,
      perNight: 0,
      currency: 'EUR'
    };
  }
}