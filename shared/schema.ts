import { pgTable, text, serial, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Extended schemas for input validation
export const insertUserSchema = createInsertSchema(users)
  .extend({
    travelStyle: z.enum(travelStyleEnum).optional(),
    preferredActivities: z.array(z.string()).optional(),
    preferredDestinations: z.array(z.string()).optional(),
    foodPreferences: z.array(z.string()).optional(),
    accessibilityNeeds: z.array(z.string()).optional(),
    languagesSpoken: z.array(z.string()).optional(),
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

// Travel quiz question types
export interface TravelQuizQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale';
  options?: string[];
  category: 'preferences' | 'style' | 'budget' | 'accessibility';
}