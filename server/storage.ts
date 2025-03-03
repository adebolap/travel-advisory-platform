import { users, searchPreferences, type User, type InsertUser, type SearchPreference, type InsertSearchPreference } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSearchPreference(pref: InsertSearchPreference): Promise<SearchPreference>;
  getSearchPreferences(userId: number): Promise<SearchPreference[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private preferences: Map<number, SearchPreference>;
  private currentUserId: number;
  private currentPrefId: number;

  constructor() {
    this.users = new Map();
    this.preferences = new Map();
    this.currentUserId = 1;
    this.currentPrefId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSearchPreference(pref: InsertSearchPreference): Promise<SearchPreference> {
    const id = this.currentPrefId++;
    const createdAt = new Date();
    const preference: SearchPreference = { ...pref, id, createdAt };
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
