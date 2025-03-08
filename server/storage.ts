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
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
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
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async createSearchPreference(pref: InsertSearchPreference): Promise<SearchPreference> {
    const preference: SearchPreference = {
      id: this.currentPrefId++,
      ...pref,
      createdAt: new Date(),
    };
    this.preferences.set(preference.id, preference);
    return preference;
  }

  async getSearchPreferences(userId: number): Promise<SearchPreference[]> {
    return Array.from(this.preferences.values()).filter(pref => pref.userId === userId);
  }

  async createTravelQuizResponse(response: InsertTravelQuizResponse): Promise<TravelQuizResponse> {
    const quizResponse: TravelQuizResponse = {
      id: this.currentQuizId++,
      ...response,
      quizDate: new Date(),
    };
    this.quizResponses.set(quizResponse.id, quizResponse);
    return quizResponse;
  }

  async updateUserPreferences(userId: number, preferences: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, ...preferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateSubscriptionStatus(userId: number, isSubscribed: boolean, endDate?: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, isSubscribed, subscriptionEndDate: endDate || null };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();
