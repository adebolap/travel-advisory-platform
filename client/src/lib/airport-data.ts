// Airport data structure
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  continent: string;
}

// List of major airports worldwide
export const majorAirports: Airport[] = [
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States", continent: "North America" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", continent: "North America" },
  { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States", continent: "North America" },
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", continent: "North America" },
  { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", continent: "Europe" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", continent: "Europe" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", continent: "Europe" },
  { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", continent: "Europe" },
  { code: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain", continent: "Europe" },
  { code: "BCN", name: "Barcelona–El Prat Airport", city: "Barcelona", country: "Spain", continent: "Europe" },
  { code: "FCO", name: "Leonardo da Vinci International Airport", city: "Rome", country: "Italy", continent: "Europe" },
  { code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", continent: "Asia" },
  { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", continent: "Asia" },
  { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", continent: "Asia" },
  { code: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", continent: "Asia" },
  { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China", continent: "Asia" },
  { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", continent: "Asia" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", continent: "Asia" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", continent: "Asia" },
  { code: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", continent: "Asia" },
  { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", continent: "Oceania" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", continent: "Oceania" },
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", continent: "Oceania" },
  { code: "GRU", name: "São Paulo–Guarulhos International Airport", city: "São Paulo", country: "Brazil", continent: "South America" },
  { code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", continent: "South America" },
  { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", continent: "South America" },
  { code: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico", continent: "North America" },
  { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", continent: "North America" },
  { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", continent: "North America" },
  { code: "JNB", name: "O. R. Tambo International Airport", city: "Johannesburg", country: "South Africa", continent: "Africa" },
  { code: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt", continent: "Africa" },
  { code: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa", continent: "Africa" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", continent: "Asia" },
  { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", continent: "Asia" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", continent: "Europe" },
  { code: "DME", name: "Moscow Domodedovo Airport", city: "Moscow", country: "Russia", continent: "Europe" },
  { code: "SVO", name: "Sheremetyevo International Airport", city: "Moscow", country: "Russia", continent: "Europe" },
  { code: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium", continent: "Europe" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", continent: "Europe" },
  { code: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", continent: "Europe" }
];

// Helper function to get airport by code
export function getAirportByCode(code: string): Airport | undefined {
  return majorAirports.find(airport => airport.code === code);
}

// Helper function to get airport by city name
export function getAirportByCity(city: string): Airport | undefined {
  const lowercaseCity = city.toLowerCase().trim();
  return majorAirports.find(airport => 
    airport.city.toLowerCase().includes(lowercaseCity) || 
    lowercaseCity.includes(airport.city.toLowerCase())
  );
}

// Helper function to search airports by query (searches code, name, city, and country)
export function searchAirports(query: string): Airport[] {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const lowercaseQuery = query.toLowerCase().trim();
  
  return majorAirports.filter(airport => 
    airport.code.toLowerCase().includes(lowercaseQuery) ||
    airport.name.toLowerCase().includes(lowercaseQuery) ||
    airport.city.toLowerCase().includes(lowercaseQuery) ||
    airport.country.toLowerCase().includes(lowercaseQuery)
  );
}