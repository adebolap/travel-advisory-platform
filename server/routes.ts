import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import geoip from 'geoip-lite';

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Weather API endpoint
  apiRouter.get("/api/weather/:city", async (req, res) => {
    const { city } = req.params;
    const API_KEY = process.env.WEATHER_API_KEY;

    if (!city || !city.trim()) {
      return res.status(400).json({ 
        error: "City parameter is required",
        details: "Please provide a valid city name"
      });
    }

    if (!API_KEY) {
      return res.status(500).json({ 
        error: "API configuration error",
        details: "Weather API key not configured"
      });
    }

    try {
      const encodedCity = encodeURIComponent(city.trim());
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${API_KEY}&units=metric`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch weather data",
        details: error.response?.data?.message || error.message
      });
    }
  });

  // User location endpoint
  apiRouter.get("/api/user-location", (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const geo = geoip.lookup(ip as string);
      res.json({ continent: null }); 
    } catch (error) {
      console.error('Error detecting location:', error);
      res.json({ continent: null });
    }
  });


  // Events API endpoint
  apiRouter.get("/api/events", async (req, res) => {
    const { city } = req.query;
    const API_KEY = process.env.TICKETMASTER_API_KEY;

    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({ 
        error: "City parameter is required",
        details: "Please provide a valid city name"
      });
    }

    if (!API_KEY) {
      return res.status(500).json({ 
        error: "API configuration error",
        details: "Ticketmaster API key not configured"
      });
    }

    try {
      const encodedCity = encodeURIComponent(city.trim());
      const response = await axios.get(
        'https://app.ticketmaster.com/discovery/v2/events.json',
        {
          params: {
            apikey: API_KEY,
            keyword: encodedCity,
            sort: 'date,asc',
            size: '20',
            locale: '*'
          },
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.data._embedded?.events) {
        return res.json([]);
      }

      const events = response.data._embedded.events.map((event: any) => ({
        id: event.id,
        name: event.name,
        date: event.dates.start.dateTime || event.dates.start.localDate,
        venue: event._embedded?.venues?.[0]?.name || 'Venue TBA',
        location: event._embedded?.venues?.[0]?.address?.line1,
        category: event.classifications?.[0]?.segment?.name || 'Other',
        price: event.priceRanges ? 
          `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}` : 
          'Price TBA',
        url: event.url
      }));

      res.json(events);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch events",
        details: error.response?.data?.message || error.message
      });
    }
  });

  // Places/Attractions API endpoint
  apiRouter.get("/api/attractions", async (req, res) => {
    const { city } = req.query;
    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({ 
        error: "City parameter is required",
        details: "Please provide a valid city name"
      });
    }

    if (!API_KEY) {
      return res.status(500).json({ 
        error: "API configuration error",
        details: "Google Places API key not configured"
      });
    }

    try {
      const encodedCity = encodeURIComponent(city.trim());
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query: `tourist attractions in ${encodedCity}`,
            key: API_KEY,
            language: 'en',
            type: 'tourist_attraction'
          },
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.status === 'ZERO_RESULTS') {
        return res.json([]);
      }

      if (response.data.status !== 'OK') {
        throw new Error(response.data.error_message || `API returned status: ${response.data.status}`);
      }

      const attractions = response.data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        location: place.formatted_address,
        rating: place.rating || 0,
        types: place.types || [],
        photo: place.photos ? 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}` : 
          null,
        geometry: place.geometry?.location || null
      }));

      res.json(attractions);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch attractions",
        details: error.response?.data?.message || error.message
      });
    }
  });

  app.use(apiRouter);
  return createServer(app);
}