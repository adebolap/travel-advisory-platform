import { pgTable, text, serial, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const searchPreferences = pgTable("search_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  city: text("city").notNull(),
  interests: text("interests").array().notNull(),
  budget: integer("budget"),
  preferredSeason: text("preferred_season"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const searchPreferenceSchema = createInsertSchema(searchPreferences).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SearchPreference = typeof searchPreferences.$inferSelect;
export type InsertSearchPreference = z.infer<typeof searchPreferenceSchema>;
