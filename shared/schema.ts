import { pgTable, text, serial, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Add premium feature definitions
export const premiumFeatures = {
  currencyConversion: {
    basic: "View prices in USD only",
    premium: "Convert prices to any currency with cute mascot guides"
  },
  weatherForecast: {
    basic: "Current weather only",
    premium: "5-day detailed forecast with trend analysis"
  },
  eventSearch: {
    basic: "Basic event listings",
    premium: "Advanced filtering and personalized event recommendations"
  },
  itineraryPlanning: {
    basic: "Simple trip planning",
    premium: "AI-powered personalized itinerary generation"
  },
  attractions: {
    basic: "View top attractions",
    premium: "Detailed attraction insights with crowd prediction"
  },
  support: {
    basic: "Standard support",
    premium: "Priority customer support"
  }
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  travelStyle: text("travel_style"), // e.g., "Adventure", "Luxury", "Budget"
  preferredActivities: text("preferred_activities").array(),
  // New fields for travel preferences
  lastQuizDate: timestamp("last_quiz_date"),
  preferredDestinations: text("preferred_destinations").array(),
  travelBudget: integer("travel_budget"),
  preferredSeason: text("preferred_season"),
  travelWithKids: boolean("travel_with_kids"),
  foodPreferences: text("food_preferences").array(),
  accessibilityNeeds: text("accessibility_needs").array(),
  languagesSpoken: text("languages_spoken").array(),
  isSubscribed: boolean("is_subscribed").default(false),
  subscriptionEndDate: timestamp("subscription_end_date"),
});

export const searchPreferences = pgTable("search_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  city: text("city").notNull(),
  interests: text("interests").array().notNull(),
  budget: integer("budget"),
  preferredSeason: text("preferred_season"),
  travelStyle: text("travel_style"),
  createdAt: timestamp("created_at").defaultNow(),
  // New fields for enhanced personalization
  minDuration: integer("min_duration"),
  maxDuration: integer("max_duration"),
  accommodation: text("accommodation_type"), // e.g., "hotel", "hostel", "apartment"
  travelWithKids: boolean("travel_with_kids"),
});

export const travelQuizResponses = pgTable("travel_quiz_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  quizDate: timestamp("quiz_date").defaultNow(),
  responses: json("responses").notNull(),
  recommendedDestinations: text("recommended_destinations").array(),
  recommendedActivities: text("recommended_activities").array(),
});

// Enums for better type safety
export const travelStyleEnum = [
  "Adventure",
  "Cultural",
  "Luxury",
  "Budget",
  "Family",
  "Solo",
  "Group",
] as const;

export const seasonEnum = [
  "Spring",
  "Summer",
  "Fall",
  "Winter",
  "Any",
] as const;

export const accommodationEnum = [
  "Hotel",
  "Hostel",
  "Apartment",
  "Resort",
  "BnB",
] as const;

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  country: text("country").notNull(),
  visitDate: timestamp("visit_date").notNull(),
  memories: text("memories"),
  rating: integer("rating").notNull(),
  isWishlist: boolean("is_wishlist").default(false),
  photos: text("photos").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const popularCities = [
  "Paris, France",
  "Tokyo, Japan",
  "New York City, USA",
  "London, UK",
  "Dubai, UAE",
  "Singapore",
  "Barcelona, Spain",
  "Rome, Italy",
  "Sydney, Australia",
  "Cape Town, South Africa",
  "Rio de Janeiro, Brazil",
  "Amsterdam, Netherlands",
  "Bangkok, Thailand",
  "Istanbul, Turkey",
  "Vancouver, Canada",
  "Seoul, South Korea",
  "Mumbai, India",
  "Cairo, Egypt",
  "Athens, Greece",
  "Marrakech, Morocco"
] as const;

// Extended schemas for input validation
export const insertUserSchema = createInsertSchema(users)
  .extend({
    travelStyle: z.enum(travelStyleEnum).optional(),
    preferredActivities: z.array(z.string()).optional(),
    preferredDestinations: z.array(z.string()).optional(),
    foodPreferences: z.array(z.string()).optional(),
    accessibilityNeeds: z.array(z.string()).optional(),
    languagesSpoken: z.array(z.string()).optional(),
    isSubscribed: z.boolean().optional(),
    subscriptionEndDate: z.date().optional()
  });

export const searchPreferenceSchema = createInsertSchema(searchPreferences)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    travelStyle: z.enum(travelStyleEnum).optional(),
    preferredSeason: z.enum(seasonEnum).optional(),
    accommodation: z.enum(accommodationEnum).optional(),
  });

export const travelQuizResponseSchema = createInsertSchema(travelQuizResponses)
  .omit({
    id: true,
    quizDate: true,
  });

export const insertCitySchema = createInsertSchema(cities)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    rating: z.number().min(1).max(5),
    photos: z.array(z.string()).optional(),
  });

// Add achievement-related constants
export const achievementTypes = {
  citiesVisited: {
    bronze: { count: 5, icon: "🌆", title: "City Explorer" },
    silver: { count: 10, icon: "🏙️", title: "Urban Adventurer" },
    gold: { count: 20, icon: "🌃", title: "Metropolis Master" }
  },
  countriesVisited: {
    bronze: { count: 3, icon: "🗺️", title: "Globe Trotter" },
    silver: { count: 5, icon: "🌍", title: "World Wanderer" },
    gold: { count: 10, icon: "🌎", title: "Planet Pioneer" }
  },
  plansCreated: {
    bronze: { count: 3, icon: "📝", title: "Trip Planner" },
    silver: { count: 5, icon: "📋", title: "Journey Master" },
    gold: { count: 10, icon: "📅", title: "Travel Strategist" }
  },
  ratings: {
    bronze: { count: 5, icon: "⭐", title: "Review Rookie" },
    silver: { count: 10, icon: "⭐⭐", title: "Feedback Pro" },
    gold: { count: 20, icon: "⭐⭐⭐", title: "Rating Legend" }
  }
} as const;

// Add achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  level: text("level").notNull(), // bronze, silver, gold
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").notNull().default(0),
});

// Add achievement types to the schema
export type AchievementType = keyof typeof achievementTypes;
export type AchievementLevel = keyof typeof achievementTypes.citiesVisited;

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SearchPreference = typeof searchPreferences.$inferSelect;
export type InsertSearchPreference = z.infer<typeof searchPreferenceSchema>;
export type TravelQuizResponse = typeof travelQuizResponses.$inferSelect;
export type InsertTravelQuizResponse = z.infer<typeof travelQuizResponseSchema>;
export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;

// Travel quiz question types
export interface TravelQuizQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale';
  options?: string[];
  category: 'preferences' | 'style' | 'budget' | 'accessibility';
}