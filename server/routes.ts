import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchPreferenceSchema } from "@shared/schema";
import { addMonths, format, isWithinInterval, parseISO } from "date-fns";
import axios from "axios";
import { createCheckoutSession } from "./payment";
import Stripe from 'stripe';
import geoip from 'geoip-lite';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-08-16' });

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // User location endpoint
  apiRouter.get("/api/user-location", (req, res) => {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const geo = geoip.lookup(ip as string);

      if (!geo) {
        return res.json({ continent: null });
      }

      const continentMap: Record<string, string> = {
        'EU': 'Europe 🇪🇺',
        'AS': 'Asia 🌏',
        'NA': 'Americas 🌎',
        'SA': 'Americas 🌎',
        'OC': 'Oceania 🏝️',
        'AF': 'Africa 🌍'
      };

      res.json({ 
        continent: continentMap[geo.continent] || null,
        country: geo.country
      });
    } catch (error) {
      console.error('Error detecting location:', error);
      res.json({ continent: null });
    }
  });


  // Create Stripe checkout session
  apiRouter.post("/api/create-checkout-session", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { currency } = req.body;
      const session = await createCheckoutSession(currency, req.user.id);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Handle Stripe webhook
  apiRouter.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;

        // Set subscription end date to 1 year from now
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

        await storage.updateSubscriptionStatus(
          parseInt(userId),
          true,
          subscriptionEndDate
        );
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook Error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Google Places API endpoint for attractions
  apiRouter.get("/api/attractions/:city", async (req, res) => {
    const { city } = req.params;

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    try {
      console.log(`Fetching attractions for ${city} from Google Places API...`);

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query: `top attractions in ${city}`,
            key: process.env.GOOGLE_PLACES_API_KEY,
            language: 'en'
          }
        }
      );

      console.log('Places API response status:', response.status);

      if (response.data.status === 'REQUEST_DENIED') {
        console.error('API Key error:', response.data.error_message);
        return res.status(500).json({ 
          error: "Google API key error",
          details: response.data.error_message 
        });
      }

      const attractions = response.data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        location: place.formatted_address,
        rating: place.rating,
        types: place.types,
        photo: place.photos ? 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
          : null,
        openNow: place.opening_hours?.open_now,
        geometry: place.geometry.location
      }));

      console.log(`Found ${attractions.length} attractions in ${city}`);

      // Sort attractions by rating
      attractions.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      res.json(attractions);
    } catch (error: any) {
      console.error("Google Places API error:", error.response?.data || error.message);
      console.error("Full error details:", error);

      if (error.response?.status === 404) {
        res.json([]); // Return empty array if no attractions found
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

    if (!process.env.TICKETMASTER_API_KEY) {
      return res.status(500).json({ error: "Ticketmaster API key not configured" });
    }

    try {
      // Get current month's date range
      const today = new Date();
      const startOfMonth = format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'");
      const endOfMonth = format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd'T'HH:mm:ss'Z'");

      console.log(`Fetching events for ${city} for current month`);

      const response = await axios.get(
        'https://app.ticketmaster.com/discovery/v2/events.json',
        {
          params: {
            apikey: process.env.TICKETMASTER_API_KEY,
            city: city,
            startDateTime: startOfMonth,
            endDateTime: endOfMonth,
            size: 20,
            sort: 'date,asc'
          }
        }
      );

      if (!response.data._embedded?.events) {
        console.log('No events found for', city);
        return res.json([]);
      }

      const events = response.data._embedded.events.map((event: any) => ({
        id: event.id,
        name: event.name,
        url: event.url,
        date: event.dates.start.localDate,
        image: event.images?.[0]?.url,
        venue: event._embedded?.venues?.[0]?.name,
        location: event._embedded?.venues?.[0]?.city?.name,
        price: event.priceRanges
          ? `${event.priceRanges[0].min}-${event.priceRanges[0].max} ${event.priceRanges[0].currency}`
          : 'Price TBA',
        category: event.classifications?.[0]?.segment?.name || 'Other',
        description: event.info || `${event.name} at ${event._embedded?.venues?.[0]?.name}`
      }));

      console.log(`Found ${events.length} events in ${city}`);
      res.json(events);

    } catch (error: any) {
      console.error('Error fetching events:', error.response?.data || error.message);

      if (error.response?.status === 404) {
        res.json([]); // Return empty array if no events found
      } else {
        res.status(500).json({ 
          error: 'Failed to fetch events',
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

  app.use("/", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}