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

  // Enhanced events API endpoint with date range and personalization
  apiRouter.get("/api/events/:city", async (req, res) => {
    const { city } = req.params;
    const { from, to, interests } = req.query;

    // Parse date range
    const startDate = from ? parseISO(from as string) : new Date();
    const endDate = to ? parseISO(to as string) : addMonths(startDate, 12);

    try {
      // Initialize events array
      let events = [];

      // Mock data for development - will be replaced with real scraping
      const eventTypes = ["festival", "concert", "exhibition", "sports", "food"];
      const eventPrefixes = ["Annual", "International", "Local", "Traditional"];

      // Generate events for the date range
      let currentDate = startDate;
      while (currentDate <= endDate) {
        const numEvents = Math.floor(Math.random() * 3) + 2; // 2-4 events per month

        for (let j = 0; j < numEvents; j++) {
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const prefix = eventPrefixes[Math.floor(Math.random() * eventPrefixes.length)];

          // Add more variety to event descriptions
          const descriptions = [
            `Experience the amazing ${eventType} scene in ${city}!`,
            `Don't miss this incredible ${eventType} event in ${city}!`,
            `Join locals and tourists at this popular ${city} ${eventType}!`,
            `A must-visit ${eventType} celebration in the heart of ${city}!`
          ];

          events.push({
            id: events.length + 1,
            name: `${prefix} ${city} ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
            date: format(currentDate, "yyyy-MM-dd"),
            type: eventType,
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            highlight: Math.random() > 0.7, // 30% chance of being a highlight event
            source: "Local Events Calendar", // Placeholder for real source
            url: `https://example.com/events/${city.toLowerCase()}` // Placeholder for real URL
          });
        }

        currentDate = addMonths(currentDate, 1);
      }

      // Sort events by date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Filter events by date range if specified
      if (from || to) {
        events = events.filter(event => {
          const eventDate = parseISO(event.date);
          return isWithinInterval(eventDate, { start: startDate, end: endDate });
        });
      }

      // If interests are specified, prioritize matching events
      if (interests) {
        const userInterests = (interests as string).split(',');
        events = events.map(event => ({
          ...event,
          highlight: userInterests.includes(event.type) || event.highlight
        }));
      }

      res.json(events);
    } catch (error) {
      console.error("Error generating events:", error);
      res.status(500).json({ error: "Failed to generate events" });
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