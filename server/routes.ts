import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchPreferenceSchema } from "@shared/schema";
import { format } from "date-fns";
import axios from "axios";
import { createCheckoutSession } from "./payment";
import Stripe from 'stripe';
import geoip from 'geoip-lite';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // User location endpoint
  apiRouter.get("/api/user-location", (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
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

  // Weather API endpoint
  apiRouter.get("/api/weather/:city", async (req, res) => {
    const { city } = req.params;
    const API_KEY = process.env.WEATHER_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Weather API key not configured" });
    }

    try {
      const encodedCity = encodeURIComponent(city.trim());
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${API_KEY}&units=metric`;

      const response = await axios.get(url);
      res.json(response.data);
    } catch (error: any) {
      console.error('Weather API error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch weather data",
        details: error.response?.data?.message || error.message
      });
    }
  });

  // Events API endpoint
  apiRouter.get("/api/events", async (req, res) => {
    const { city } = req.query;
    const API_KEY = process.env.TICKETMASTER_API_KEY;

    if (!city || typeof city !== 'string') {
      return res.status(400).json({ error: "City parameter is required" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "Ticketmaster API key not configured" });
    }

    try {
      const encodedCity = encodeURIComponent(city.trim());
      const url = 'https://app.ticketmaster.com/discovery/v2/events.json';

      const response = await axios.get(url, {
        params: {
          apikey: API_KEY,
          city: encodedCity,
          sort: 'date,asc',
          size: 20,
          locale: '*'
        },
        headers: {
          'Accept': 'application/json'
        }
      });

      // If no events found, return empty array
      if (!response.data._embedded?.events) {
        return res.json([]);
      }

      const events = response.data._embedded.events.map((event: any) => ({
        id: event.id,
        name: event.name,
        date: event.dates.start.dateTime,
        venue: event._embedded?.venues?.[0]?.name || 'Venue TBA',
        category: event.classifications?.[0]?.segment?.name || 'Other',
        price: event.priceRanges ? 
          `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}` : 
          'Price TBA',
        url: event.url,
        location: event._embedded?.venues?.[0]?.address?.line1
      }));

      res.json(events);
    } catch (error: any) {
      console.error('Events API error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch events",
        details: error.response?.data?.message || error.message
      });
    }
  });

  // Attractions API endpoint
  apiRouter.get("/api/attractions", async (req, res) => {
    const { city } = req.query;
    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

    if (!city || typeof city !== 'string') {
      return res.status(400).json({ error: "City parameter is required" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    try {
      const encodedCity = encodeURIComponent(city.trim());
      const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

      const response = await axios.get(url, {
        params: {
          query: `tourist attractions in ${encodedCity}`,
          key: API_KEY,
          language: 'en',
          type: 'tourist_attraction'
        },
        headers: {
          'Accept': 'application/json'
        }
      });

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
      console.error('Attractions API error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch attractions",
        details: error.response?.data?.message || error.message
      });
    }
  });

  // Use the API router
  app.use("/api", apiRouter);

  return createServer(app);
}