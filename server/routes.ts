import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchPreferenceSchema } from "@shared/schema";
import { addMonths, format, isWithinInterval, parseISO } from "date-fns";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

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

      // Build Ticketmaster API query
      const params = new URLSearchParams({
        apikey: process.env.TICKETMASTER_API_KEY,
        city: city,
        sort: "date,asc",
        ...(startDate && { startDateTime: startDate }),
        ...(endDate && { endDateTime: endDate }),
        ...(category && { classificationName: category as string }),
      });

      console.log(`Fetching events for ${city} from Ticketmaster`);
      const response = await axios.get(
        `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`
      );

      // Transform Ticketmaster events to our format
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

      res.json(events);
    } catch (error: any) {
      console.error("Ticketmaster API error:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        res.json([]); // Return empty array if no events found
      } else {
        res.status(500).json({ error: "Failed to fetch events" });
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

  app.use("/", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}