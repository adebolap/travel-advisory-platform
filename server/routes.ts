import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchPreferenceSchema } from "@shared/schema";
import { addMonths, format, isWithinInterval, parseISO } from "date-fns";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Google Places API endpoint for attractions
  apiRouter.get("/api/attractions/:city", async (req, res) => {
    const { city } = req.params;

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    try {
      console.log(`Fetching attractions for ${city} from Google Places API...`);

      // First, get the geocode for the city
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

      const geocodeResponse = await axios.get(geocodeUrl);
      console.log('Geocode response:', geocodeResponse.data);

      if (geocodeResponse.data.status === 'REQUEST_DENIED') {
        console.error('API Key error:', geocodeResponse.data.error_message);
        return res.status(500).json({ 
          error: "Google API key error",
          details: geocodeResponse.data.error_message 
        });
      }

      if (!geocodeResponse.data.results?.[0]?.geometry?.location) {
        return res.status(404).json({ error: "City not found" });
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      // Define place types to search for
      const placeTypes = [
        'tourist_attraction',
        'museum',
        'art_gallery',
        'park',
        'amusement_park',
        'church',
        'mosque',
        'temple',
        'zoo',
        'aquarium',
        'restaurant',
        'shopping_mall'
      ];

      // Make parallel requests for each place type
      const attractionsPromises = placeTypes.map(type => {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50000&type=${type}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=en`;
        return axios.get(searchUrl)
          .then(response => {
            if (response.data.status === 'REQUEST_DENIED') {
              throw new Error(response.data.error_message || 'Places API request denied');
            }
            return response;
          });
      });

      console.log('Making API requests for place types:', placeTypes);
      const responses = await Promise.all(attractionsPromises);

      // Combine and deduplicate attractions
      const seenPlaceIds = new Set();
      const attractions = responses.flatMap(response =>
        (response.data.results || [])
          .filter((place: any) => !seenPlaceIds.has(place.place_id))
          .map((place: any) => {
            seenPlaceIds.add(place.place_id);
            return {
              id: place.place_id,
              name: place.name,
              rating: place.rating,
              userRatingsTotal: place.user_ratings_total,
              location: place.vicinity,
              types: place.types,
              photo: place.photos?.[0]?.photo_reference,
              openNow: place.opening_hours?.open_now,
              geometry: place.geometry.location
            };
          })
      );

      console.log(`Found ${attractions.length} unique attractions in ${city}`);
      if (attractions.length === 0) {
        console.log('No attractions found. API responses:', responses.map(r => r.data));
      }

      res.json(attractions);
    } catch (error: any) {
      console.error("Google Places API error:", error.response?.data || error.message);
      console.error("Full error details:", error);

      if (error.response?.status === 404) {
        res.json([]); // Return empty array if no events found
      } else {
        res.status(500).json({
          error: "Failed to fetch attractions",
          details: error.response?.data?.message || error.message
        });
      }
    }
  });

  // Weather API endpoint
  apiRouter.get("/api/weather/:city", async (req, res) => {
    const { city } = req.params;
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ error: "Weather API key not configured" });
    }

    try {
      console.log(`Fetching weather data for city: ${city}`);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`
      );
      console.log(`Weather data received:`, response.data);
      res.json(response.data);
    } catch (error: any) {
      console.error("Weather API error:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        res.status(404).json({ error: "City not found" });
      } else {
        res.status(500).json({ error: "Failed to fetch weather data" });
      }
    }
  });

  // 5-day forecast endpoint
  apiRouter.get("/api/forecast/:city", async (req, res) => {
    const { city } = req.params;
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ error: "Weather API key not configured" });
    }

    try {
      console.log(`Fetching 5-day forecast for city: ${city}`);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`
      );
      console.log(`Forecast data received for ${city}`);
      res.json(response.data);
    } catch (error: any) {
      console.error("Forecast API error:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        res.status(404).json({ error: "City not found" });
      } else {
        res.status(500).json({ error: "Failed to fetch forecast data" });
      }
    }
  });

  // Enhanced events API endpoint with Ticketmaster integration
  apiRouter.get("/api/events/:city", async (req, res) => {
    const { city } = req.params;
    const { from, to, category } = req.query;

    if (!process.env.TICKETMASTER_API_KEY) {
      return res.status(500).json({ error: "Ticketmaster API key not configured" });
    }

    try {
      // Format dates for Ticketmaster API
      const startDate = from ? `${format(parseISO(from as string), "yyyy-MM-dd")}T00:00:00Z` : undefined;
      const endDate = to ? `${format(parseISO(to as string), "yyyy-MM-dd")}T23:59:59Z` : undefined;

      // Build Ticketmaster API query with better parameters
      const params = new URLSearchParams({
        apikey: process.env.TICKETMASTER_API_KEY,
        keyword: city, // Using keyword for better search results
        size: "100", // Get more events
        sort: "date,asc",
        locale: "*", // Include all locales
        ...(startDate && { startDateTime: startDate }),
        ...(endDate && { endDateTime: endDate }),
        ...(category && { classificationName: category as string }),
      });

      console.log(`Fetching events for ${city} from Ticketmaster API...`);
      const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;
      console.log(`API URL: ${apiUrl}`);

      const response = await axios.get(apiUrl);

      console.log(`Ticketmaster API response status: ${response.status}`);
      console.log(`Response data:`, JSON.stringify(response.data, null, 2));

      // Transform Ticketmaster events to our format, handling the _embedded structure
      const events = response.data._embedded?.events?.map((event: any) => ({
        id: event.id,
        name: event.name,
        date: event.dates.start.dateTime || event.dates.start.localDate,
        type: event.classifications?.[0]?.segment?.name || "Other",
        description: event.description || event.info || `${event.name} in ${city}`,
        highlight: event.pleaseNote ? true : false,
        source: "Ticketmaster",
        url: event.url,
        location: event._embedded?.venues?.[0]?.name,
        category: event.classifications?.[0]?.segment?.name?.toLowerCase(),
        price: event.priceRanges
          ? `$${event.priceRanges[0].min}-$${event.priceRanges[0].max}`
          : "Price TBA",
        culturalSignificance: event.pleaseNote || null,
      })) || [];

      console.log(`Transformed events count: ${events.length}`);
      if (events.length === 0) {
        console.log('No events found in response data:', response.data);
      }

      res.json(events);
    } catch (error: any) {
      console.error("Ticketmaster API error:", error.response?.data || error.message);
      console.error("Full error details:", error);

      if (error.response?.status === 404) {
        res.json([]); // Return empty array if no events found
      } else {
        res.status(500).json({
          error: "Failed to fetch events",
          details: error.response?.data?.message || error.message
        });
      }
    }
  });

  // Save search preferences
  apiRouter.post("/api/preferences", async (req, res) => {
    try {
      const data = searchPreferenceSchema.parse(req.body);
      const preference = await storage.createSearchPreference(data);
      res.json(preference);
    } catch (error) {
      res.status(400).json({ error: "Invalid preference data" });
    }
  });

  // Get user preferences
  apiRouter.get("/api/preferences/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const preferences = await storage.getSearchPreferences(userId);
    res.json(preferences);
  });

  // Mount API routes before the catchall route
  app.use("/", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}