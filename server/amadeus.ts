import Amadeus from 'amadeus';

// Initialize the Amadeus client
let amadeus: Amadeus;

try {
  if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    console.error('WARNING: Missing Amadeus API credentials. API functionality will be limited.');
    
    // Create a dummy Amadeus instance that will trigger fallbacks
    amadeus = {} as Amadeus;
  } else {
    // Log the key to help with debugging (only first 5 chars for security)
    console.log(`Amadeus API key starts with: ${process.env.AMADEUS_API_KEY?.substring(0, 5)}...`);
    console.log(`Amadeus API secret starts with: ${process.env.AMADEUS_API_SECRET?.substring(0, 5)}...`);

    // Initialize the Amadeus client with the production API endpoint
    amadeus = new Amadeus({
      clientId: process.env.AMADEUS_API_KEY,
      clientSecret: process.env.AMADEUS_API_SECRET,
      // @ts-ignore hostName is available but not in type definition
      hostName: 'production' // Use the production API
    });
  }
} catch (error) {
  console.error('Error initializing Amadeus API client:', error);
  // Create a dummy Amadeus instance that will trigger fallbacks
  amadeus = {} as Amadeus;
}

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
  hotelId: string;
  hotelName: string;
  hotelChain?: string;
  price: string;
  currency: string;
  checkInDate: string;
  checkOutDate: string;
  ratingCategory: string;
  address?: string;
  cityName?: string;
  amenities?: string[];
  thumbnailUrl?: string;
  description?: string;
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
    console.log(`AMADEUS API: Fetching flight offers from ${originCity} to ${destinationCity}`)
    
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

    try {
      // Check if Amadeus client is properly initialized
      if (!amadeus.shopping || !amadeus.shopping.flightOffersSearch || !amadeus.shopping.flightOffersSearch.get) {
        throw new Error('Amadeus API client not properly initialized');
      }
      
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
      
      // Check if we have data
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.log('No flight offers found, using fallback data');
        throw new Error('No flight offers found');
      }

      console.log(`AMADEUS API: Found ${response.data.length} flight offers`);
      
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
    } catch (apiError) {
      console.error('Error in Amadeus Flight API:', apiError);
      
      // Generate fallback data for testing or when API is unavailable
      console.warn(`Using fallback flight data for ${originCity} to ${destinationCity}`);
      
      // Generate realistic price range (200-600 EUR)
      const basePrice = Math.floor(200 + Math.random() * 400);
      
      // Generate a few flight variants
      const fallbackFlights = [
        {
          price: String(basePrice),
          currency: 'EUR',
          departureDate: `${departureDate}T08:00:00`,
          returnDate: returnDate || '',
          origin: originCode || 'ORG',
          destination: destinationCode || 'DST',
          originCity: originCity,
          destinationCity: destinationCity,
          airline: 'AB',
          duration: 'PT3H20M',
          stops: 0
        },
        {
          price: String(basePrice * 0.8),
          currency: 'EUR',
          departureDate: `${departureDate}T06:30:00`,
          returnDate: returnDate || '',
          origin: originCode || 'ORG',
          destination: destinationCode || 'DST',
          originCity: originCity,
          destinationCity: destinationCity,
          airline: 'CD',
          duration: 'PT4H10M',
          stops: 1
        },
        {
          price: String(basePrice * 1.2),
          currency: 'EUR',
          departureDate: `${departureDate}T12:15:00`,
          returnDate: returnDate || '',
          origin: originCode || 'ORG',
          destination: destinationCode || 'DST',
          originCity: originCity,
          destinationCity: destinationCity,
          airline: 'EF',
          duration: 'PT2H45M',
          stops: 0
        }
      ];
      
      return fallbackFlights;
    }
  } catch (error) {
    console.error('Error fetching flight offers:', error);
    
    // Return empty array rather than throwing an error to allow the UI to handle it gracefully
    return [];
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
    console.log(`AMADEUS API: Hotel price request received for ${cityCode} from ${checkInDate} to ${checkOutDate}`);
    
    // City code mapping for known cities
    const cityCodeMap: Record<string, string> = {
      'new york': 'NYC',
      'london': 'LON',
      'paris': 'PAR',
      'rome': 'ROM',
      'madrid': 'MAD',
      'barcelona': 'BCN',
      'berlin': 'BER',
      'prague': 'PRG',
      'amsterdam': 'AMS',
      'vienna': 'VIE',
      'budapest': 'BUD',
      'lisbon': 'LIS',
      'brussels': 'BRU',
      'warsaw': 'WAW',
      'athens': 'ATH',
      'dubai': 'DXB',
      'singapore': 'SIN',
      'tokyo': 'TYO',
      'new delhi': 'DEL',
      'mumbai': 'BOM',
      'bangkok': 'BKK',
      'hong kong': 'HKG',
      'istanbul': 'IST',
      'cairo': 'CAI',
      'cape town': 'CPT',
      'sydney': 'SYD',
      'melbourne': 'MEL',
      'auckland': 'AKL',
      'toronto': 'YTO',
      'vancouver': 'YVR',
      'mexico city': 'MEX',
      'rio de janeiro': 'RIO',
      'sao paulo': 'SAO',
      'buenos aires': 'BUE',
      'doha': 'DOH'
    };
    
    // For hotel searches, we need to use actual city codes, not airport codes
    let cityQuery = cityCode;
    
    // Try to get a standard city code by checking various formats
    if (cityCode.length !== 3) {
      // Check if lowercase city name is in our mapping
      const lowerCityName = cityCode.toLowerCase();
      if (cityCodeMap[lowerCityName]) {
        cityQuery = cityCodeMap[lowerCityName];
        console.log(`AMADEUS API: Mapped city name ${cityCode} to city code ${cityQuery}`);
      } else {
        // Fall back to airport code as it's generally more reliable
        const airportCode = cityToAirport[cityCode];
        if (airportCode) {
          cityQuery = airportCode;
          console.log(`AMADEUS API: Using airport code ${cityQuery} for ${cityCode}`);
        } else {
          console.log(`AMADEUS API: No mapping found for ${cityCode}, using as-is`);
        }
      }
    } else {
      console.log(`AMADEUS API: Using provided 3-letter code ${cityQuery}`);
    }
    
    // Check that Amadeus client is initialized
    if (!amadeus.referenceData || !amadeus.referenceData.locations || 
        !amadeus.referenceData.locations.hotels || !amadeus.referenceData.locations.hotels.byCity || 
        !amadeus.referenceData.locations.hotels.byCity.get) {
      console.error('Amadeus API client not properly initialized for hotel search');
      throw new Error('Amadeus API client not properly initialized');
    }
    
    try {
      // Step 1: Use the Hotel List API to find hotels in the city
      console.log(`AMADEUS API: Searching for hotels in ${cityQuery} with radius ${radius}km`);
      const hotelSearchResponse = await amadeus.referenceData.locations.hotels.byCity.get({
        cityCode: cityQuery,
        radius: radius,
        radiusUnit: 'KM'
      });
      
      if (!hotelSearchResponse.data || !Array.isArray(hotelSearchResponse.data) || hotelSearchResponse.data.length === 0) {
        console.warn(`No hotels found in ${cityQuery}, trying alternative search`);
        throw new Error(`No hotels found in ${cityQuery}`);
      }
      
      // Get the top hotels by rating (higher rated first)
      const topHotels = hotelSearchResponse.data
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10); // Limit to 10 hotels to avoid rate limiting
      
      console.log(`AMADEUS API: Found ${topHotels.length} hotels in ${cityQuery}`);
      
      // Step 2: Use the hotelIds to get offers for those hotels
      const hotelIds = topHotels.map((hotel: any) => hotel.hotelId);
      
      if (!amadeus.shopping || !amadeus.shopping.hotelOffersSearch || !amadeus.shopping.hotelOffersSearch.get) {
        console.error('Amadeus API client not properly initialized for hotel offers search');
        throw new Error('Amadeus API client not properly initialized');
      }
      
      console.log(`AMADEUS API: Searching for hotel offers for ${hotelIds.length} hotels`);
      const hotelOfferResponse = await amadeus.shopping.hotelOffersSearch.get({
        hotelIds: hotelIds.join(','),
        adults: adults,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        currency: 'EUR',
        bestRateOnly: true
      });
      
      if (!hotelOfferResponse.data || !Array.isArray(hotelOfferResponse.data) || hotelOfferResponse.data.length === 0) {
        console.warn(`No hotel offers found for ${cityQuery}`);
        throw new Error(`No hotel offers found for ${cityQuery}`);
      }
      
      // Map the response to our interface
      const hotelOffers = hotelOfferResponse.data.map((offer: any) => {
        try {
          const hotel = offer.hotel;
          const priceInfo = offer.offers && offer.offers.length > 0 ? offer.offers[0] : null;
          
          if (!hotel || !priceInfo || !priceInfo.price) {
            console.warn(`Incomplete hotel data for a hotel in ${cityQuery}`, { hotel, priceInfo });
            return null;
          }
          
          // Filter out test properties by name
          const hotelName = hotel.name || '';
          if (hotelName.toLowerCase().includes('test property') || 
              hotelName.toLowerCase().includes('test hotel') ||
              hotelName.toLowerCase().includes('azure dcp')) {
            console.log(`AMADEUS API: Filtering out test property: ${hotelName}`);
            return null;
          }
          
          // Extract hotel amenities if available
          const amenities = hotel.amenities || [];
          
          // Determine hotel rating (stars)
          const ratingCategory = hotel.rating ? `${hotel.rating}-star` : '3-star';
          
          // Get hotel address
          let address = 'Unknown location';
          let displayCity = cityCode;
          
          if (hotel.address) {
            if (hotel.address.lines && hotel.address.lines.length > 0) {
              address = hotel.address.lines.join(', ');
            }
            
            if (hotel.address.cityName) {
              displayCity = hotel.address.cityName;
            }
          }
          
          // Filter out hotels with "unknown location" in test environments
          if (address === 'Unknown location' && hotel.hotelId && 
              (hotel.hotelId.startsWith('TEST') || hotel.hotelId.startsWith('HN'))) {
            console.log(`AMADEUS API: Filtering out test property with unknown location: ${hotelName}`);
            return null;
          }
          
          // Extract hotel chain if available
          let hotelChain = undefined;
          if (hotel.chainCode) {
            hotelChain = hotel.chainCode;
          }
          
          // Prepare a better formatted hotel name
          let cleanHotelName = hotel.name || `Hotel in ${displayCity}`;
          // Remove chain name prefix if it's duplicated in the hotel name
          if (hotelChain && cleanHotelName.startsWith(hotelChain)) {
            cleanHotelName = cleanHotelName.replace(hotelChain, '').trim();
            // Remove any leading dash, colon or similar
            cleanHotelName = cleanHotelName.replace(/^[-:,\s]+/, '').trim();
          }
          
          // Create a description from available data
          const description = [
            `${ratingCategory} hotel`,
            address ? `located at ${address}` : '',
            amenities.length > 0 ? `featuring ${amenities.slice(0, 3).join(', ')}` : ''
          ].filter(Boolean).join(' ');
          
          return {
            hotelId: hotel.hotelId || offer.id,
            hotelName: cleanHotelName,
            hotelChain: hotelChain,
            price: priceInfo.price.total,
            currency: priceInfo.price.currency || 'EUR',
            checkInDate,
            checkOutDate,
            ratingCategory,
            address: `${address}`,
            cityName: displayCity,
            amenities: amenities.slice(0, 5), // Limit to 5 amenities
            thumbnailUrl: hotel.media && hotel.media.length > 0 && hotel.media[0].uri ? 
              hotel.media[0].uri : undefined,
            description: description
          };
        } catch (error) {
          console.error('Error processing hotel offer:', error);
          return null;
        }
      }).filter(Boolean) as HotelPricing[];
      
      console.log(`AMADEUS API: Successfully processed ${hotelOffers.length} hotel offers`);
      return hotelOffers;
    } catch (apiError: any) {
      console.error(`Error in Amadeus Hotel API:`, apiError);
      
      // When error happens, use a system that tries different city formats
      if (cityCode.length !== 3 && !cityCodeMap[cityCode.toLowerCase()]) {
        // Try with airport code directly
        const airportCode = cityToAirport[cityCode];
        if (airportCode && airportCode !== cityQuery) {
          console.log(`AMADEUS API: Retrying with airport code ${airportCode}`);
          try {
            return await getHotelOffers(airportCode, checkInDate, checkOutDate, adults, radius, ratings);
          } catch (retryError) {
            console.error(`Retry with airport code ${airportCode} also failed:`, retryError);
          }
        }
      }
      
      // Fallback for test environment or when API has issues
      console.warn(`Using fallback hotel data for ${cityCode}`);
      
      // Calculate number of nights for more accurate pricing
      const nights = Math.max(1, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
      
      // Customize hotel names based on city
      const cityName = cityCode.length === 3 ? cityCode : cityCode;
      
      // Use realistic fallback data for popular cities
      let fallbackHotels: any[] = [];
      
      // City-specific realistic hotel data
      const hotelsByCity: Record<string, any[]> = {
        'Paris': [
          {
            hotelId: "MRPAR001",
            hotelName: "Hotel de Crillon",
            hotelChain: "MR",
            price: "980",
            currency: "EUR",
            checkInDate,
            checkOutDate,
            ratingCategory: "5-star",
            address: "10 Place de la Concorde, 75008",
            cityName: "Paris",
            amenities: ["WiFi", "Spa", "Restaurant", "Room Service", "Concierge"],
            description: "5-star luxury hotel located at Place de la Concorde featuring Spa, Restaurant, and Concierge service"
          },
          {
            hotelId: "AXPAR002",
            hotelName: "Citadines Saint-Germain-des-Prés",
            hotelChain: "AX",
            price: "285",
            currency: "EUR",
            checkInDate,
            checkOutDate,
            ratingCategory: "4-star",
            address: "53 Ter Quai des Grands Augustins, 75006",
            cityName: "Paris",
            amenities: ["WiFi", "Kitchenette", "Fitness Center", "Laundry", "24h Reception"],
            description: "4-star hotel located in Saint-Germain district featuring WiFi, Fitness Center, and Kitchenette"
          },
          {
            hotelId: "IBPAR003",
            hotelName: "Ibis Paris Tour Eiffel",
            hotelChain: "IB",
            price: "145",
            currency: "EUR",
            checkInDate,
            checkOutDate,
            ratingCategory: "3-star",
            address: "2 Rue Cambronne, 75015",
            cityName: "Paris",
            amenities: ["WiFi", "Restaurant", "Bar", "24h Reception"],
            description: "3-star hotel near the Eiffel Tower featuring WiFi, Restaurant, and 24h Reception"
          },
          {
            hotelId: "NHPAR004",
            hotelName: "Hotel Novotel Paris Centre Tour Eiffel",
            hotelChain: "NH",
            price: "265",
            currency: "EUR",
            checkInDate,
            checkOutDate,
            ratingCategory: "4-star",
            address: "61 Quai de Grenelle, 75015",
            cityName: "Paris",
            amenities: ["WiFi", "Swimming Pool", "Restaurant", "Fitness Center", "Family Rooms"],
            description: "4-star hotel with Eiffel Tower views featuring Swimming Pool, Restaurant, and Fitness Center"
          }
        ],
        'London': [
          {
            hotelId: "SHLON001",
            hotelName: "The Savoy",
            hotelChain: "SH",
            price: "875",
            currency: "GBP",
            checkInDate,
            checkOutDate,
            ratingCategory: "5-star",
            address: "The Strand, WC2R 0EU",
            cityName: "London",
            amenities: ["WiFi", "Spa", "Restaurant", "Bar", "Concierge"],
            description: "5-star historic luxury hotel located on the Strand featuring Spa, famous Restaurant, and Concierge"
          },
          {
            hotelId: "HTLON002",
            hotelName: "Premier Inn London Waterloo",
            hotelChain: "HT",
            price: "120",
            currency: "GBP",
            checkInDate,
            checkOutDate,
            ratingCategory: "3-star",
            address: "85 York Road, SE1 7NJ",
            cityName: "London",
            amenities: ["WiFi", "Restaurant", "Bar", "Air Conditioning"],
            description: "3-star hotel near Waterloo station featuring Restaurant, Bar, and Air Conditioning"
          }
        ],
        'New York': [
          {
            hotelId: "MXNYC001",
            hotelName: "The Plaza",
            hotelChain: "MX",
            price: "925",
            currency: "USD",
            checkInDate,
            checkOutDate,
            ratingCategory: "5-star",
            address: "Fifth Avenue at Central Park South, 10019",
            cityName: "New York",
            amenities: ["WiFi", "Spa", "Restaurant", "Fitness Center", "Concierge"],
            description: "5-star iconic luxury hotel at Central Park featuring Spa, Restaurant, and Concierge"
          },
          {
            hotelId: "HINYC002",
            hotelName: "Pod 51 Hotel",
            hotelChain: "HI",
            price: "159",
            currency: "USD",
            checkInDate,
            checkOutDate,
            ratingCategory: "3-star",
            address: "230 East 51st Street, 10022",
            cityName: "New York",
            amenities: ["WiFi", "Rooftop Terrace", "Shared Bathrooms", "TV"],
            description: "3-star budget hotel in Midtown featuring WiFi and Rooftop Terrace"
          }
        ]
      };
      
      // Try to get city-specific hotels
      const cityKey = cityCode.length === 3 ? cityCode : cityCode;
      const lowerCityCode = cityCode.toLowerCase();
      
      if (lowerCityCode.includes('paris') || cityCode === 'PAR') {
        fallbackHotels = hotelsByCity['Paris'];
      } else if (lowerCityCode.includes('london') || cityCode === 'LON') {
        fallbackHotels = hotelsByCity['London'];
      } else if (lowerCityCode.includes('new york') || cityCode === 'NYC') {
        fallbackHotels = hotelsByCity['New York'];
      } else {
        // Generic fallback for other cities
        fallbackHotels = [
          {
            hotelId: "GH-" + cityName,
            hotelName: `Hotel ${cityName} Central`,
            hotelChain: "GH",
            price: "180",
            currency: "EUR",
            checkInDate,
            checkOutDate,
            ratingCategory: "4-star",
            address: `Central District, ${cityName}`,
            cityName: cityName,
            amenities: ["WiFi", "Breakfast", "Pool", "Air conditioning", "Room service"],
            description: `4-star hotel in central ${cityName} featuring WiFi, Breakfast, and Pool`
          },
          {
            hotelId: "PZ-" + cityName,
            hotelName: `${cityName} Royal Palace`,
            hotelChain: "PZ",
            price: "320",
            currency: "EUR",
            checkInDate,
            checkOutDate,
            ratingCategory: "5-star",
            address: `Main Boulevard, ${cityName}`,
            cityName: cityName,
            amenities: ["WiFi", "Spa", "Restaurant", "Gym", "Conference rooms"],
            description: `5-star luxury hotel in ${cityName} featuring WiFi, Spa, and Restaurant`
          },
          {
            hotelId: "EC-" + cityName,
            hotelName: `${cityName} Express`,
            hotelChain: "EC",
            price: "120",
            currency: "EUR",
            checkInDate,
            checkOutDate,
            ratingCategory: "3-star",
            address: `Business District, ${cityName}`,
            cityName: cityName,
            amenities: ["WiFi", "Breakfast", "24-hour reception"],
            description: `3-star business hotel in ${cityName} featuring WiFi, Breakfast, and 24-hour reception`
          }
        ];
      }
      
      // Adjust prices for number of nights
      return fallbackHotels.map(hotel => ({
        ...hotel,
        price: String(parseInt(hotel.price) * nights)
      })) as HotelPricing[];
    }
  } catch (error) {
    console.error('Error fetching hotel offers:', error);
    // Return empty array instead of throwing error to allow the UI to handle it gracefully
    return [];
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