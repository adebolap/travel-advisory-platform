// Airport data for dropdown selection
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const majorAirports: Airport[] = [
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China' },
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
  { code: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'United States' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'CAN', name: 'Guangzhou Baiyun International', city: 'Guangzhou', country: 'China' },
  { code: 'ICN', name: 'Seoul Incheon International', city: 'Seoul', country: 'South Korea' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India' },
  { code: 'BOM', name: 'Chhatrapati Shivaji International', city: 'Mumbai', country: 'India' },
  { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia' },
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
  { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'United Kingdom' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy' },
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States' },
  { code: 'BCN', name: 'Barcelona–El Prat', city: 'Barcelona', country: 'Spain' },
  { code: 'LAS', name: 'McCarran International', city: 'Las Vegas', country: 'United States' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China' },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium' },
  { code: 'GRU', name: 'São Paulo–Guarulhos International', city: 'São Paulo', country: 'Brazil' },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { code: 'LIS', name: 'Lisbon Airport', city: 'Lisbon', country: 'Portugal' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { code: 'SVO', name: 'Sheremetyevo International', city: 'Moscow', country: 'Russia' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria' },
  { code: 'OSL', name: 'Oslo Airport, Gardermoen', city: 'Oslo', country: 'Norway' },
];

// Function to search airports
export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase();
  
  return majorAirports.filter(airport => 
    airport.code.toLowerCase().includes(normalizedQuery) ||
    airport.name.toLowerCase().includes(normalizedQuery) ||
    airport.city.toLowerCase().includes(normalizedQuery) ||
    airport.country.toLowerCase().includes(normalizedQuery)
  ).slice(0, 10); // Limit to 10 results
}

// Function to get airport by code
export function getAirportByCode(code: string): Airport | undefined {
  return majorAirports.find(airport => airport.code === code);
}

// Function to get airport by city name
export function getAirportByCity(cityName: string): Airport | undefined {
  return majorAirports.find(airport => 
    airport.city.toLowerCase() === cityName.toLowerCase()
  );
}