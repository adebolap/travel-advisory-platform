import { 
  users, 
  searchPreferences, 
  type User, 
  type InsertUser, 
  type SearchPreference, 
  type InsertSearchPreference, 
  travelQuizResponses, 
  type TravelQuizResponse, 
  type InsertTravelQuizResponse
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSearchPreference(pref: InsertSearchPreference): Promise<SearchPreference>;
  getSearchPreferences(userId: number): Promise<SearchPreference[]>;
  createTravelQuizResponse(response: InsertTravelQuizResponse): Promise<TravelQuizResponse>;
  updateUserPreferences(userId: number, preferences: Partial<User>): Promise<User>;
  updateSubscriptionStatus(userId: number, isSubscribed: boolean, endDate?: Date): Promise<User>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private preferences = new Map<number, SearchPreference>();
  private quizResponses = new Map<number, TravelQuizResponse>();
  private currentUserId = 1;
  private currentPrefId = 1;
  private currentQuizId = 1;
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ 
      checkPeriod: 86400000, // Prune expired entries every 24h
      stale: false // Don't serve stale sessions
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.email?.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    // Validate unique username and email
    const existingUsername = await this.getUserByUsername(user.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    if (user.email) {
      const existingEmail = await this.getUserByEmail(user.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    const newUser: User = {
      id: this.currentUserId++,
      ...user,
      lastQuizDate: null,
      preferredDestinations: null,
      travelBudget: null,
      preferredSeason: null,
      travelWithKids: null,
      foodPreferences: null,
      accessibilityNeeds: null,
      languagesSpoken: null,
      isSubscribed: false,
      subscriptionEndDate: null,
      createdAt: new Date(), // Add creation timestamp
      updatedAt: new Date(), // Add update timestamp
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }

    // If updating username or email, check for uniqueness
    if (updates.username && updates.username !== user.username) {
      const existingUsername = await this.getUserByUsername(updates.username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }
    }

    if (updates.email && updates.email !== user.email) {
      const existingEmail = await this.getUserByEmail(updates.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // ... rest of the methods remain the same ...
}

export const storage = new MemStorage();