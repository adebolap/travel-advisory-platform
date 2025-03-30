import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchPreferenceSchema } from "@shared/schema";
import { addMonths, format, isWithinInterval, parseISO } from "date-fns";
import axios from "axios";
import { createCheckoutSession } from "./payment";
import Stripe from 'stripe';
import { generateChatbotResponse, chatRequestSchema } from "./chatbot";
import { getFlightOffers, getHotelOffers, getAverageFlightPrice, getAverageHotelPrice, FlightPricing, HotelPricing } from "./amadeus";

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'missing_stripe_key', { 
  apiVersion: '2023-10-16' as any // Type assertion needed due to API version mismatch
});

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Add city search endpoint
  apiRouter.get("/api/cities/search", async (req, res) => {
    const { query } = req.query;

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Search query is required" });
    }

    try {
      console.log(`Searching for cities matching: ${query}`);

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input: query,
            types: '(cities)',
            key: process.env.GOOGLE_PLACES_API_KEY,
          }
        }
      );

      if (response.data.status === 'REQUEST_DENIED') {
        console.error('API Key error:', response.data.error_message);
        return res.status(500).json({ 
          error: "Google API key error",
          details: response.data.error_message 
        });
      }

      const cities = response.data.predictions.map((prediction: any) => ({
        id: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        description: prediction.description,
        country: prediction.structured_formatting.secondary_text,
      }));

      console.log(`Found ${cities.length} cities matching "${query}"`);
      res.json(cities);
    } catch (error: any) {
      console.error("City search error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to search cities",
        details: error.response?.data?.message || error.message
      });
    }
  });

  // Get detailed city information
  apiRouter.get("/api/cities/:placeId", async (req, res) => {
    const { placeId } = req.params;

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    try {
      console.log(`Fetching details for place ID: ${placeId}`);

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            key: process.env.GOOGLE_PLACES_API_KEY,
            fields: 'name,formatted_address,geometry,photos,place_id,types,url'
          }
        }
      );

      if (response.data.status === 'REQUEST_DENIED') {
        console.error('API Key error:', response.data.error_message);
        return res.status(500).json({ 
          error: "Google API key error",
          details: response.data.error_message 
        });
      }

      const place = response.data.result;
      const cityDetails = {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coordinates: place.geometry.location,
        photos: place.photos?.map((photo: any) => ({
          reference: photo.photo_reference,
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
        })) || [],
        types: place.types,
        googleMapsUrl: place.url
      };

      console.log(`Retrieved details for ${cityDetails.name}`);
      res.json(cityDetails);
    } catch (error: any) {
      console.error("City details error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to fetch city details",
        details: error.response?.data?.message || error.message
      });
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

    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }

    try {
      // We already have the raw buffer body from express.raw middleware
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        
        if (!userId) {
          console.error('Missing userId in session metadata');
          return res.status(400).send('Missing userId in session metadata');
        }

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
    } catch (err: any) {
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
      attractions.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

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

  // General events API endpoint for all events
  apiRouter.get("/api/events", async (req, res) => {
    const { city, startDateTime, endDateTime } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: "City parameter is required" });
    }

    if (!process.env.TICKETMASTER_API_KEY) {
      return res.status(500).json({ error: "Ticketmaster API key not configured" });
    }

    try {
      // Get events for the specified date range or default to current month
      const today = new Date();
      const defaultStartDateTime = format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'");
      const defaultEndDateTime = format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd'T'HH:mm:ss'Z'");

      console.log(`Fetching events for ${city} from ${startDateTime || defaultStartDateTime} to ${endDateTime || defaultEndDateTime}`);

      const response = await axios.get(
        'https://app.ticketmaster.com/discovery/v2/events.json',
        {
          params: {
            apikey: process.env.TICKETMASTER_API_KEY,
            city: city,
            startDateTime: startDateTime || defaultStartDateTime,
            endDateTime: endDateTime || defaultEndDateTime,
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

  // City-specific events API endpoint with Ticketmaster integration
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
  
  // Travel chatbot endpoint
  apiRouter.post("/api/chatbot", async (req, res) => {
    try {
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        console.error('Missing OPENAI_API_KEY environment variable');
        return res.status(503).json({
          error: "AI service unavailable",
          details: "API configuration issue"
        });
      }
      
      // Check authentication and premium status
      if (req.isAuthenticated()) {
        const user = req.user;
        if (!user.isPremium) {
          console.log(`User ${user.id} attempted to use chatbot without premium subscription`);
          return res.status(403).json({ 
            error: "Premium feature",
            details: "This feature requires a premium subscription",
            upgrade: true
          });
        }
      } else {
        console.log('Unauthenticated user attempted to use chatbot');
        return res.status(401).json({ 
          error: "Authentication required",
          details: "Please log in to use this feature",
          login: true
        });
      }
      
      // Validate request data
      const chatRequest = chatRequestSchema.parse(req.body);
      console.log("Chatbot request received:", {
        userId: req.user.id,
        messageCount: chatRequest.messages.length,
        city: chatRequest.city || "Not specified",
        hasInterests: chatRequest.interests && chatRequest.interests.length > 0
      });
      
      // Generate a response from the AI
      const response = await generateChatbotResponse(chatRequest);
      console.log(`Generated chatbot response for user ${req.user.id}`);
      res.json(response);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      
      // Check for Zod validation errors
      if (error.errors) {
        return res.status(400).json({
          error: "Invalid request format",
          details: error.errors
        });
      }
      
      // Handle OpenAI API errors
      if (error.response) {
        console.error(`OpenAI API error (${error.response.status}):`, error.response.data);
        return res.status(502).json({
          error: "AI service error",
          details: "Error communicating with AI service",
          retry: true
        });
      }
      
      // Generic error fallback
      res.status(500).json({ 
        error: "Failed to process chatbot request", 
        details: error.message
      });
    }
  });

  // Trip management routes
  apiRouter.post("/api/trips", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const tripData = {
        ...req.body,
        userId: req.user.id
      };
      const trip = await storage.createTrip(tripData);
      res.status(201).json(trip);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's trips (authenticated)
  apiRouter.get("/api/trips", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const trips = await storage.getUserTrips(req.user.id);
      res.json(trips);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get public/featured trips (no auth required)
  apiRouter.get("/api/public-trips", async (req, res) => {
    try {
      const publicTrips = await storage.getPublicTrips();
      res.json(publicTrips);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific trip by ID
  apiRouter.get("/api/trips/:tripId", async (req, res) => {
    try {
      const trip = await storage.getTripById(parseInt(req.params.tripId));
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // Check if the trip is public or belongs to the authenticated user
      const isPublic = trip.isShared === true;
      const belongsToUser = req.isAuthenticated() && trip.userId === req.user.id;
      
      if (!isPublic && !belongsToUser) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(trip);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.patch("/api/trips/:tripId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const trip = await storage.getTripById(parseInt(req.params.tripId));
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedTrip = await storage.updateTrip(parseInt(req.params.tripId), req.body);
      res.json(updatedTrip);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Toggle trip sharing status
  apiRouter.post("/api/trips/:tripId/toggle-share", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const tripId = parseInt(req.params.tripId);
      const trip = await storage.getTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Toggle the isShared status
      const isShared = trip.isShared !== true;
      const updatedTrip = await storage.updateTrip(tripId, { isShared });
      
      res.json({
        success: true,
        isShared,
        message: isShared ? "Trip is now shared publicly" : "Trip is now private"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.delete("/api/trips/:tripId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const trip = await storage.getTripById(parseInt(req.params.tripId));
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteTrip(parseInt(req.params.tripId));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Amadeus Flight Price API endpoint
  apiRouter.get("/api/flights/price", async (req, res) => {
    const { origin, destination, departureDate, returnDate, adults } = req.query;
    
    console.log("AMADEUS API: Flight price request received with params:", { 
      origin, destination, departureDate, returnDate, adults 
    });
    
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      console.error("AMADEUS API: Missing API credentials");
      return res.status(500).json({ error: "Amadeus API credentials not configured" });
    }
    
    if (!origin || !destination || !departureDate) {
      console.error("AMADEUS API: Missing required parameters");
      return res.status(400).json({ 
        error: "Missing required parameters",
        message: "origin, destination, and departureDate are required" 
      });
    }
    
    try {
      console.log(`AMADEUS API: Fetching flight prices from ${origin} to ${destination}`);
      const flightOffers = await getFlightOffers(
        String(origin),
        String(destination),
        String(departureDate),
        returnDate ? String(returnDate) : undefined,
        adults ? Number(adults) : 1
      );
      
      console.log(`AMADEUS API: Found ${flightOffers.length} flight offers`);
      res.json(flightOffers);
    } catch (error: any) {
      console.error("AMADEUS API: Flight pricing error:", error.message);
      res.status(500).json({ 
        error: "Failed to fetch flight prices",
        message: error.message 
      });
    }
  });
  
  // Amadeus Hotel Price API endpoint
  apiRouter.get("/api/hotels/price", async (req, res) => {
    const { cityCode, checkInDate, checkOutDate, adults, radius } = req.query;
    
    console.log("AMADEUS API: Hotel price request received with params:", { 
      cityCode, checkInDate, checkOutDate, adults, radius 
    });
    
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      console.error("AMADEUS API: Missing API credentials");
      return res.status(500).json({ error: "Amadeus API credentials not configured" });
    }
    
    if (!cityCode || !checkInDate || !checkOutDate) {
      console.error("AMADEUS API: Missing required parameters");
      return res.status(400).json({ 
        error: "Missing required parameters",
        message: "cityCode, checkInDate, and checkOutDate are required" 
      });
    }
    
    try {
      console.log(`AMADEUS API: Fetching hotel prices in ${cityCode}`);
      const hotelOffers = await getHotelOffers(
        String(cityCode),
        String(checkInDate),
        String(checkOutDate),
        adults ? Number(adults) : 1,
        radius ? Number(radius) : 5
      );
      
      console.log(`AMADEUS API: Found ${hotelOffers.length} hotel offers`);
      res.json(hotelOffers);
    } catch (error: any) {
      console.error("AMADEUS API: Hotel pricing error:", error.message);
      res.status(500).json({ 
        error: "Failed to fetch hotel prices",
        message: error.message 
      });
    }
  });
  
  // Average Seasonal Flight Price API endpoint
  apiRouter.get("/api/flights/average", async (req, res) => {
    const { origin, destination, season } = req.query;
    
    console.log("AMADEUS API: Average flight price request received with params:", { 
      origin, destination, season 
    });
    
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      console.error("AMADEUS API: Missing API credentials");
      return res.status(500).json({ error: "Amadeus API credentials not configured" });
    }
    
    if (!origin || !destination || !season) {
      console.error("AMADEUS API: Missing required parameters for average flight price");
      return res.status(400).json({ 
        error: "Missing required parameters",
        message: "origin, destination, and season are required" 
      });
    }
    
    try {
      console.log(`AMADEUS API: Fetching average flight prices from ${origin} to ${destination} for ${season} season`);
      const averagePrice = await getAverageFlightPrice(
        String(origin),
        String(destination),
        String(season)
      );
      
      console.log("AMADEUS API: Average flight price result:", averagePrice);
      res.json(averagePrice);
    } catch (error: any) {
      console.error("AMADEUS API: Average flight pricing error:", error.message);
      res.status(500).json({ 
        error: "Failed to fetch average flight prices",
        message: error.message 
      });
    }
  });
  
  // Average Seasonal Hotel Price API endpoint
  apiRouter.get("/api/hotels/average", async (req, res) => {
    const { cityCode, season, nights } = req.query;
    
    console.log("AMADEUS API: Average hotel price request received with params:", { 
      cityCode, season, nights 
    });
    
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      console.error("AMADEUS API: Missing API credentials");
      return res.status(500).json({ error: "Amadeus API credentials not configured" });
    }
    
    if (!cityCode || !season) {
      console.error("AMADEUS API: Missing required parameters for average hotel price");
      return res.status(400).json({ 
        error: "Missing required parameters",
        message: "cityCode and season are required" 
      });
    }
    
    try {
      console.log(`AMADEUS API: Fetching average hotel prices in ${cityCode} for ${season} season`);
      const averagePrice = await getAverageHotelPrice(
        String(cityCode),
        String(season),
        nights ? Number(nights) : 3
      );
      
      console.log("AMADEUS API: Average hotel price result:", averagePrice);
      res.json(averagePrice);
    } catch (error: any) {
      console.error("AMADEUS API: Average hotel pricing error:", error.message);
      res.status(500).json({ 
        error: "Failed to fetch average hotel prices",
        message: error.message 
      });
    }
  });
  
  // Destination comparison endpoint
  apiRouter.get("/api/destinations/compare", async (req, res) => {
    const { destinations, origin, season, startDate, endDate } = req.query;
    
    console.log("Destination comparison request received with params:", { 
      destinations, origin, season, startDate, endDate 
    });
    
    if (!destinations || !origin) {
      return res.status(400).json({ 
        error: "Missing required parameters",
        message: "destinations and origin are required" 
      });
    }
    
    // Convert destinations to array if it's a string or an array
    const destinationsList = Array.isArray(destinations) ? destinations : [destinations];
    const originCity = String(origin);
    const seasonStr = String(season || 'summer');
    
    try {
      // Process each destination to gather comparison data
      const comparisonPromises = destinationsList.map(async (city) => {
        const cityStr = String(city);
        console.log(`Processing comparison data for ${cityStr}`);
        
        // Get flight price data
        const flightPrices = await getAverageFlightPrice(originCity, cityStr, seasonStr);
        
        // Get hotel price data (3 nights by default)
        const nights = 3; // Default to 3 nights if no date range provided
        const hotelPrices = await getAverageHotelPrice(cityStr, seasonStr, nights);
        
        // Calculate crowd levels based on season
        const crowdLevelMap: Record<string, Record<string, string>> = {
          'Paris': {
            'summer': 'High - Tourist Season',
            'winter': 'Moderate',
            'spring': 'Moderate to High',
            'fall': 'Moderate'
          },
          'London': {
            'summer': 'High',
            'winter': 'Moderate - Holiday Season',
            'spring': 'Moderate',
            'fall': 'Low to Moderate'
          },
          'New York': {
            'summer': 'High',
            'winter': 'High - Holiday Season',
            'spring': 'Moderate',
            'fall': 'Moderate to High'
          },
          'Tokyo': {
            'summer': 'Moderate',
            'winter': 'Low',
            'spring': 'High - Cherry Blossom',
            'fall': 'Moderate - Autumn Colors'
          },
          'Rome': {
            'summer': 'Peak - Very High',
            'winter': 'Low',
            'spring': 'Moderate to High',
            'fall': 'Moderate'
          }
        };
        
        // Determine best time to visit
        const bestTimesMap: Record<string, string[]> = {
          'Paris': ['Spring', 'Fall'],
          'London': ['Spring', 'Summer'],
          'New York': ['Spring', 'Fall'],
          'Tokyo': ['Spring', 'Fall'],
          'Rome': ['Spring', 'Fall'],
          'Barcelona': ['Spring', 'Fall'],
          'Dubai': ['Winter', 'Spring'],
          'Singapore': ['Spring', 'Winter'],
          'Sydney': ['Spring', 'Fall'],
          'Amsterdam': ['Spring', 'Summer'],
          'Berlin': ['Summer', 'Spring'],
          'Prague': ['Spring', 'Early Fall'],
          'Vienna': ['Spring', 'Fall'],
          'Lisbon': ['Spring', 'Fall'],
          'Bangkok': ['Winter', 'Spring'],
          'Hong Kong': ['Fall', 'Winter'],
          'Cairo': ['Winter', 'Spring'],
          'Cape Town': ['Spring', 'Fall'],
          'Rio de Janeiro': ['Fall', 'Winter'],
          'Dublin': ['Summer', 'Spring'],
          'Budapest': ['Spring', 'Fall'],
          'Athens': ['Spring', 'Fall'],
          'Marrakech': ['Spring', 'Fall'],
          'Istanbul': ['Spring', 'Fall'],
          'Bali': ['Spring', 'Fall'],
          'Seoul': ['Spring', 'Fall'],
          'Doha': ['Winter', 'Spring']
        };
        
        // Default values for cities not in the map
        const defaultBestTime = ['Spring', 'Fall'];
        const defaultCrowdLevel: Record<string, string> = {
          'summer': 'High - Peak Season',
          'winter': 'Low to Moderate',
          'spring': 'Moderate',
          'fall': 'Moderate'
        };
        
        const crowdLevel = 
          crowdLevelMap[cityStr]?.[seasonStr.toLowerCase()] || 
          defaultCrowdLevel[seasonStr.toLowerCase()] || 
          'Moderate';
          
        const bestTimeToVisit = bestTimesMap[cityStr] || defaultBestTime;
        
        // Weather data based on season
        const weatherMap: Record<string, Record<string, any>> = {
          'summer': {
            temperature: 'Warm to Hot',
            condition: 'Generally sunny and clear',
            seasonalNotes: 'Peak tourist season with longer days and more outdoor events.'
          },
          'winter': {
            temperature: 'Cold to Cool',
            condition: 'Variable, possible snow in northern cities',
            seasonalNotes: 'Low season in many destinations except for winter sports areas and holiday markets.'
          },
          'spring': {
            temperature: 'Mild to Warm',
            condition: 'Variable with occasional rain',
            seasonalNotes: 'Flowers blooming, fewer tourists, and pleasant temperatures.'
          },
          'fall': {
            temperature: 'Mild to Cool',
            condition: 'Variable with beautiful foliage',
            seasonalNotes: 'Shoulder season with fewer crowds and moderate temperatures.'
          }
        };
        
        // Adjust for city-specific weather patterns
        const weatherSpecialCases: Record<string, any> = {
          'Dubai': {
            'summer': {
              temperature: 'Very Hot',
              condition: 'Extremely hot and humid',
              seasonalNotes: 'Indoor activities recommended due to extreme heat (40°C+).'
            },
            'winter': {
              temperature: 'Warm and Pleasant',
              condition: 'Sunny and mild',
              seasonalNotes: 'Perfect weather for outdoor activities and beach time.'
            }
          },
          'Singapore': {
            'summer': {
              temperature: 'Hot and Humid',
              condition: 'Tropical with afternoon showers',
              seasonalNotes: 'Consistent year-round with high humidity.'
            }
          },
          'London': {
            'summer': {
              temperature: 'Mild to Warm',
              condition: 'Variable with possible rain',
              seasonalNotes: 'Longer daylight hours and numerous festivals.'
            }
          },
          'Doha': {
            'summer': {
              temperature: 'Extremely Hot',
              condition: 'Hot and dry',
              seasonalNotes: 'Very high temperatures, indoor activities recommended.'
            },
            'winter': {
              temperature: 'Warm and Pleasant',
              condition: 'Sunny and comfortable',
              seasonalNotes: 'Ideal conditions for exploring the city and outdoor activities.'
            }
          }
        };
        
        // Get weather data, prioritizing city-specific information
        const weather = 
          weatherSpecialCases[cityStr]?.[seasonStr.toLowerCase()] || 
          weatherMap[seasonStr.toLowerCase()];
        
        // Combine all data
        // Calculate total estimate (flight + hotel)
        const totalEstimate = flightPrices.price + hotelPrices.price;
        // Use the flight currency for the total (usually EUR or the origin country currency)
        const totalCurrency = flightPrices.currency;
        
        return {
          city: cityStr,
          prices: {
            flightPrice: flightPrices.price,
            flightCurrency: flightPrices.currency,
            hotelTotal: hotelPrices.price,
            hotelPerNight: hotelPrices.perNight,
            hotelCurrency: hotelPrices.currency,
            totalEstimate,
            totalCurrency
          },
          weather,
          crowdLevel,
          events: 12, // Placeholder for future actual event counts
          attractions: 25, // Placeholder for future actual attraction counts
          bestTimeToVisit
        };
      });
      
      // Wait for all comparison data to be processed
      const comparisonResults = await Promise.all(comparisonPromises);
      
      console.log(`Completed comparison data for ${destinationsList.length} destinations`);
      res.json(comparisonResults);
    } catch (error: any) {
      console.error("Destination comparison error:", error.message);
      res.status(500).json({ 
        error: "Failed to compare destinations",
        message: error.message 
      });
    }
  });

  app.use("/", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}