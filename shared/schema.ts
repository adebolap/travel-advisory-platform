import { pgTable, text, serial, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  travelStyle: text("travel_style"), // e.g., "Adventure", "Luxury", "Budget"
  preferredActivities: text("preferred_activities").array(),
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

// Extended schemas for better type safety
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

export const insertUserSchema = createInsertSchema(users).extend({
  travelStyle: z.enum(travelStyleEnum).optional(),
  preferredActivities: z.array(z.string()).optional(),
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

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SearchPreference = typeof searchPreferences.$inferSelect;
export type InsertSearchPreference = z.infer<typeof searchPreferenceSchema>;

// Types for recommendations
export interface TravelRecommendation {
  city: string;
  score: number;
  matchingInterests: string[];
  bestTimeToVisit: string;
  estimatedBudget: number;
  popularEvents: string[];
  weatherInfo: string;
  localTips: string[];
}