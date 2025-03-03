import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchPreferenceSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Weather API endpoint
  apiRouter.get("/weather/:city", async (req, res) => {
    const { city } = req.params;
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Mock events API endpoint
  apiRouter.get("/events/:city", async (req, res) => {
    const { city } = req.params;
    // Mock event data
    const events = [
      { id: 1, name: "Summer Festival", date: "2024-07-15", type: "festival" },
      { id: 2, name: "Food Fair", date: "2024-08-20", type: "food" },
      { id: 3, name: "Cultural Week", date: "2024-09-10", type: "culture" },
    ];
    res.json(events);
  });

  // Save search preferences
  apiRouter.post("/preferences", async (req, res) => {
    try {
      const data = searchPreferenceSchema.parse(req.body);
      const preference = await storage.createSearchPreference(data);
      res.json(preference);
    } catch (error) {
      res.status(400).json({ error: "Invalid preference data" });
    }
  });

  // Get user preferences
  apiRouter.get("/preferences/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const preferences = await storage.getSearchPreferences(userId);
    res.json(preferences);
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
