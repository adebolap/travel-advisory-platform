import Amadeus from 'amadeus';

// Initialize the Amadeus client
if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
  throw new Error('Missing required Amadeus API credentials: AMADEUS_API_KEY and AMADEUS_API_SECRET');
}

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
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
    
    // Handle case when city names are provided instead of codes
    if (!originCode) {
      console.log(`No IATA code found for origin: ${originCity}, attempting to use as-is`);
      originCode = originCity.length === 3 ? originCity : 'BRU'; // Default to Brussels if not a code
    }
    
    if (!destinationCode) {
      console.log(`No IATA code found for destination: ${destinationCity}, attempting to use as-is`);
      destinationCode = destinationCity.length === 3 ? destinationCity : 'JFK'; // Default to New York if not a code
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
      
      return {
        price: price.total,
        currency: price.currency,
        departureDate: firstSegment.departure.at,
        returnDate: returnDate || '',
        origin: firstSegment.departure.iataCode,
        destination: firstSegment.arrival.iataCode,
        originCity: originCity,
        destinationCity: destinationCity,
        airline: firstSegment.carrierCode,
        duration: offer.itineraries[0].duration
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
    // Convert city name to code if needed
    let city = cityToAirport[cityCode] || null;
    
    // Handle case when city name is provided instead of code
    if (!city) {
      console.log(`No IATA code found for city: ${cityCode}, attempting to use as-is`);
      city = cityCode.length === 3 ? cityCode : 'NYC'; // Default to New York if not a code
    }
    
    console.log(`Using IATA code for hotel search: ${city}`);
    
    // First, search for hotels by city
    const hotelListResponse = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: city,
      radius,
      radiusUnit: 'KM'
    });
    
    // Get the hotel IDs
    const hotelIds = hotelListResponse.data.slice(0, 10).map((hotel: any) => hotel.hotelId);
    
    // Then get offers for these hotels
    const response = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(','),
      adults,
      checkInDate,
      checkOutDate,
      roomQuantity: 1,
      priceRange: '50-500' // Set a reasonable price range
    });
    
    // Map the response to our interface
    return response.data.map((hotel: any) => {
      const offer = hotel.offers[0]; // Get the first offer
      const price = offer.price;
      
      return {
        hotelName: hotel.hotel.name,
        price: price.total,
        currency: price.currency,
        checkInDate,
        checkOutDate,
        ratingCategory: `${hotel.hotel.rating || 3}-star`,
        address: hotel.hotel.address ? 
          `${hotel.hotel.address.lines.join(', ')}, ${hotel.hotel.address.cityName}` : 
          undefined,
        amenities: offer.room?.typeEstimated?.bedType ? [offer.room.typeEstimated.bedType] : undefined,
        thumbnailUrl: hotel.hotel.media ? 
          hotel.hotel.media[0]?.uri : 
          undefined
      };
    });
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
    // Define sample dates for each season (use current year)
    const currentYear = new Date().getFullYear();
    let checkInDate: string;
    
    switch(season.toLowerCase()) {
      case 'winter':
        checkInDate = `${currentYear}-01-15`;
        break;
      case 'spring':
        checkInDate = `${currentYear}-04-15`;
        break;
      case 'summer':
        checkInDate = `${currentYear}-07-15`;
        break;
      case 'fall':
      case 'autumn':
        checkInDate = `${currentYear}-10-15`;
        break;
      default:
        checkInDate = `${currentYear}-07-15`; // Default to summer
    }
    
    // Calculate checkout date based on number of nights
    const checkInDateObj = new Date(checkInDate);
    const checkOutDateObj = new Date(checkInDateObj);
    checkOutDateObj.setDate(checkOutDateObj.getDate() + nights);
    const checkOutDate = checkOutDateObj.toISOString().split('T')[0];
    
    // Use a future date at least 1 month from now
    const today = new Date();
    if (checkInDateObj < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      // If the check-in date is less than 1 month away, use next year
      checkInDate = checkInDate.replace(String(currentYear), String(currentYear + 1));
      checkOutDate.replace(String(currentYear), String(currentYear + 1));
    }
    
    // Get hotel offers for the sample dates
    const hotelOffers = await getHotelOffers(
      cityCode,
      checkInDate,
      checkOutDate,
      1,
      10,
      ['3'] // 3-star hotels
    );
    
    if (hotelOffers.length === 0) {
      throw new Error('No hotel offers found');
    }
    
    // Calculate average price
    const totalPrice = hotelOffers.reduce((sum, offer) => sum + parseFloat(offer.price), 0);
    const avgPrice = totalPrice / hotelOffers.length;
    const perNight = avgPrice / nights;
    
    return {
      price: Math.round(avgPrice * 100) / 100, // Round to 2 decimal places
      perNight: Math.round(perNight * 100) / 100,
      currency: hotelOffers[0].currency
    };
  } catch (error) {
    console.error('Error getting average hotel price:', error);
    return {
      price: 0,
      perNight: 0,
      currency: 'USD'
    };
  }
}