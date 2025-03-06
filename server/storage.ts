import { users, searchPreferences, type User, type InsertUser, type SearchPreference, type InsertSearchPreference } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSearchPreference(pref: InsertSearchPreference): Promise<SearchPreference>;
  getSearchPreferences(userId: number): Promise<SearchPreference[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private preferences: Map<number, SearchPreference>;
  private currentUserId: number;
  private currentPrefId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.preferences = new Map();
    this.currentUserId = 1;
    this.currentPrefId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      travelStyle: insertUser.travelStyle || null,
      preferredActivities: insertUser.preferredActivities || null,
      lastQuizDate: null,
      preferredDestinations: null,
      travelBudget: null,
      preferredSeason: null,
      travelWithKids: null,
      foodPreferences: null,
      accessibilityNeeds: null,
      languagesSpoken: null
    };
    this.users.set(id, user);
    return user;
  }

  async createSearchPreference(pref: InsertSearchPreference): Promise<SearchPreference> {
    const id = this.currentPrefId++;
    const createdAt = new Date();
    const preference: SearchPreference = {
      id,
      userId: pref.userId,
      city: pref.city,
      interests: pref.interests,
      budget: pref.budget || null,
      preferredSeason: pref.preferredSeason || null,
      travelStyle: pref.travelStyle || null,
      createdAt,
      minDuration: pref.minDuration || null,
      maxDuration: pref.maxDuration || null,
      accommodation: pref.accommodation || null,
      travelWithKids: pref.travelWithKids || null
    };
    this.preferences.set(id, preference);
    return preference;
  }

  async getSearchPreferences(userId: number): Promise<SearchPreference[]> {
    return Array.from(this.preferences.values()).filter(
      (pref) => pref.userId === userId
    );
  }
}

export const storage = new MemStorage();