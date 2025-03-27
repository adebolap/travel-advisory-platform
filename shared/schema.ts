import { pgTable, text, serial, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Add premium feature definitions
export const premiumFeatures = {
  currencyConversion: {
    basic: "💵 View prices in USD only",
    premium: "🌎 Convert prices to any currency with cute mascot guides"
  },
  weatherForecast: {
    basic: "🌤️ Current weather only",
    premium: "🌈 5-day detailed forecast with trend analysis"
  },
  eventSearch: {
    basic: "🎫 Basic event listings",
    premium: "✨ Advanced filtering and personalized event recommendations"
  },
  itineraryPlanning: {
    basic: "📝 Simple trip planning",
    premium: "🤖 AI-powered personalized itinerary generation"
  },
  attractions: {
    basic: "🏛️ View top attractions",
    premium: "🎯 Detailed attraction insights with crowd prediction"
  },
  aiChatbot: {
    premium: "🤖 AI-powered travel chatbot with personalized recommendations"
    // No basic version - this is a premium-only feature
  },
  support: {
    basic: "📧 Standard support",
    premium: "👑 Priority customer support"
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

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  city: text("city").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  title: text("title").notNull(),
  description: text("description"),
  events: json("events").notNull(), // Store selected events
  activities: text("activities").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isShared: boolean("is_shared").default(false),
});

// Add insert schema for trips
export const insertTripSchema = createInsertSchema(trips)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

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

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SearchPreference = typeof searchPreferences.$inferSelect;
export type InsertSearchPreference = z.infer<typeof searchPreferenceSchema>;
export type TravelQuizResponse = typeof travelQuizResponses.$inferSelect;
export type InsertTravelQuizResponse = z.infer<typeof travelQuizResponseSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

// Travel quiz question types
export interface TravelQuizQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale';
  options?: string[];
  category: 'preferences' | 'style' | 'budget' | 'accessibility';
}