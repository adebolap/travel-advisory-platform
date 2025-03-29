import Amadeus from 'amadeus';

// Initialize the Amadeus client
if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
  throw new Error('Missing required Amadeus API credentials: AMADEUS_API_KEY and AMADEUS_API_SECRET');
}

// Log the key to help with debugging (only first 5 chars for security)
console.log(`Amadeus API key starts with: ${process.env.AMADEUS_API_KEY?.substring(0, 5)}...`);
console.log(`Amadeus API secret starts with: ${process.env.AMADEUS_API_SECRET?.substring(0, 5)}...`);

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
  // For production use: hostname: 'production'
  // For testing environment, leave hostname unspecified
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
    // For hotel searches, we need to use actual city codes, not airport codes
    // Define a mapping of common cities to their city codes (different from airport codes)
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
      'Dublin': 'DUB'
    };
    
    // Try to get the city code
    let city = cityToCityCode[cityCode] || null;
    
    // If no city code found, try to use the provided code
    if (!city) {
      console.log(`No city code found for city: ${cityCode}, attempting to use as-is`);
      city = cityCode.length === 3 ? cityCode : 'NYC'; // Default to New York if not a code
    }
    
    console.log(`Using city code for hotel search: ${city}`);
    
    // Hardcoded hotel data for our popular destinations
    // In a real app, you'd store this in a database or call a different API
    const dummyHotels = [
      {
        cityCode: 'NYC',
        hotels: [
          { name: 'Grand Central Hotel', price: 250, currency: 'USD', rating: 4, address: '123 Broadway, New York', amenities: ['WiFi', 'Pool', 'Spa'] },
          { name: 'Times Square Suites', price: 320, currency: 'USD', rating: 5, address: '456 5th Avenue, New York', amenities: ['Room Service', 'Gym', 'Restaurant'] },
          { name: 'Manhattan View', price: 180, currency: 'USD', rating: 3, address: '789 Park Ave, New York', amenities: ['WiFi', 'Continental Breakfast'] }
        ]
      },
      {
        cityCode: 'LON',
        hotels: [
          { name: 'Kensington Hotel', price: 210, currency: 'GBP', rating: 4, address: '12 Baker St, London', amenities: ['WiFi', 'Breakfast', 'Bar'] },
          { name: 'Westminster Suites', price: 280, currency: 'GBP', rating: 5, address: '34 Oxford St, London', amenities: ['Room Service', 'Spa', 'Restaurant'] },
          { name: 'Piccadilly Inn', price: 160, currency: 'GBP', rating: 3, address: '56 Bond St, London', amenities: ['WiFi', 'Continental Breakfast'] }
        ]
      },
      {
        cityCode: 'PAR',
        hotels: [
          { name: 'Seine View Hotel', price: 230, currency: 'EUR', rating: 4, address: '12 Champs-Élysées, Paris', amenities: ['WiFi', 'Breakfast', 'Bar'] },
          { name: 'Eiffel Luxury Suites', price: 350, currency: 'EUR', rating: 5, address: '34 Rue de Rivoli, Paris', amenities: ['Room Service', 'Spa', 'Restaurant'] },
          { name: 'Montmartre Boutique', price: 180, currency: 'EUR', rating: 3, address: '56 Boulevard de Clichy, Paris', amenities: ['WiFi', 'Continental Breakfast'] }
        ]
      },
      {
        cityCode: 'PRG',
        hotels: [
          { name: 'Old Town Square Hotel', price: 130, currency: 'EUR', rating: 4, address: '12 Wenceslas Square, Prague', amenities: ['WiFi', 'Breakfast', 'Bar'] },
          { name: 'Charles Bridge Suites', price: 180, currency: 'EUR', rating: 5, address: '34 Old Town Square, Prague', amenities: ['Room Service', 'Spa', 'Restaurant'] },
          { name: 'Prague Castle View', price: 110, currency: 'EUR', rating: 3, address: '56 Mala Strana, Prague', amenities: ['WiFi', 'Continental Breakfast'] }
        ]
      },
      {
        cityCode: 'BRU',
        hotels: [
          { name: 'Grand Place Hotel', price: 140, currency: 'EUR', rating: 4, address: '12 Grand Place, Brussels', amenities: ['WiFi', 'Breakfast', 'Bar'] },
          { name: 'EU Quarter Suites', price: 190, currency: 'EUR', rating: 5, address: '34 Rue de la Loi, Brussels', amenities: ['Room Service', 'Spa', 'Restaurant'] },
          { name: 'Atomium View', price: 120, currency: 'EUR', rating: 3, address: '56 Avenue Louise, Brussels', amenities: ['WiFi', 'Continental Breakfast'] }
        ]
      }
    ];
    
    // Find hotels for the requested city
    const cityHotels = dummyHotels.find(c => c.cityCode === city) || dummyHotels[0]; // Default to NYC
    
    // Apply a small random variation to prices (+/- 10%) to simulate different dates affecting prices
    const dateInfluence = Math.random() * 0.2 + 0.9; // 0.9 to 1.1
    
    // Map the response to our interface
    return cityHotels.hotels.map(hotel => {
      // Adjust price based on number of nights
      const nights = Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24));
      const adjustedPrice = Math.round(hotel.price * dateInfluence * nights);
      
      return {
        hotelName: hotel.name,
        price: String(adjustedPrice),
        currency: hotel.currency,
        checkInDate,
        checkOutDate,
        ratingCategory: `${hotel.rating}-star`,
        address: hotel.address,
        amenities: hotel.amenities,
        thumbnailUrl: undefined // No thumbnails in our dummy data
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
    // Seasonal price adjustment factors (summer is more expensive, winter less so)
    const seasonalFactors: Record<string, number> = {
      'winter': 0.8,  // Lower prices in winter (80% of base)
      'spring': 0.9,  // Slightly lower in spring
      'summer': 1.2,  // Higher in peak summer (120% of base)
      'fall': 0.9,    // Slightly lower in fall
    };
    
    // For hotel searches, we need to use actual city codes, not airport codes
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
      'Dublin': 'DUB'
    };
    
    // Try to get the city code
    let city = cityToCityCode[cityCode] || null;
    
    // If no city code found, try to use the provided code
    if (!city) {
      console.log(`No city code found for city: ${cityCode}, attempting to use as-is`);
      city = cityCode.length === 3 ? cityCode : 'NYC'; // Default to New York if not a code
    }
    
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
    };
    
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
  } catch (error) {
    console.error('Error getting average hotel price:', error);
    return {
      price: 0,
      perNight: 0,
      currency: 'USD'
    };
  }
}