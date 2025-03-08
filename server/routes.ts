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

  // Google Places API endpoint for attractions
  apiRouter.get("/api/attractions/:city", async (req, res) => {
    const { city } = req.params;

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    try {
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

      if (response.data.status === 'REQUEST_DENIED') {
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

      attractions.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      res.json(attractions);
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to fetch attractions",
        details: error.response?.data?.message || error.message
      });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
