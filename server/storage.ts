import { users, searchPreferences, type User, type InsertUser, type SearchPreference, type InsertSearchPreference } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { travelQuizResponses, type TravelQuizResponse, type InsertTravelQuizResponse } from "@shared/schema";
import { trips, type Trip, type InsertTrip } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSearchPreference(pref: InsertSearchPreference): Promise<SearchPreference>;
  getSearchPreferences(userId: number): Promise<SearchPreference[]>;
  sessionStore: session.Store;
  createTravelQuizResponse(response: InsertTravelQuizResponse): Promise<TravelQuizResponse>;
  updateUserPreferences(userId: number, preferences: Partial<User>): Promise<User>;
  updateSubscriptionStatus(userId: number, isSubscribed: boolean, endDate?: Date): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  getUserTrips(userId: number): Promise<Trip[]>;
  getTripById(tripId: number): Promise<Trip | undefined>;
  updateTrip(tripId: number, trip: Partial<Trip>): Promise<Trip>;
  deleteTrip(tripId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private preferences: Map<number, SearchPreference>;
  private quizResponses: Map<number, TravelQuizResponse>;
  private currentUserId: number;
  private currentPrefId: number;
  private currentQuizId: number;
  private trips: Map<number, Trip>;
  private currentTripId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.preferences = new Map();
    this.quizResponses = new Map();
    this.currentUserId = 1;
    this.currentPrefId = 1;
    this.currentQuizId = 1;
    this.trips = new Map();
    this.currentTripId = 1;
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
      languagesSpoken: null,
      isSubscribed: false,
      isPremium: false,
      subscriptionEndDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
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

  async createTravelQuizResponse(response: InsertTravelQuizResponse): Promise<TravelQuizResponse> {
    const id = this.currentQuizId++;
    const quizResponse: TravelQuizResponse = {
      id,
      userId: response.userId,
      quizDate: new Date(),
      responses: response.responses,
      recommendedDestinations: response.recommendedDestinations || [],
      recommendedActivities: response.recommendedActivities || []
    };
    this.quizResponses.set(id, quizResponse);
    return quizResponse;
  }

  async updateUserPreferences(userId: number, preferences: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, ...preferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateSubscriptionStatus(userId: number, isSubscribed: boolean, endDate?: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { 
      ...user, 
      isSubscribed,
      isPremium: isSubscribed, // Set premium status based on subscription 
      subscriptionEndDate: endDate || null 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { 
      ...user, 
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = this.currentTripId++;
    const trip: Trip = {
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...insertTrip,
    };
    this.trips.set(id, trip);
    return trip;
  }

  async getUserTrips(userId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(
      (trip) => trip.userId === userId
    );
  }

  async getTripById(tripId: number): Promise<Trip | undefined> {
    return this.trips.get(tripId);
  }

  async updateTrip(tripId: number, updates: Partial<Trip>): Promise<Trip> {
    const existingTrip = await this.getTripById(tripId);
    if (!existingTrip) {
      throw new Error('Trip not found');
    }
    const updatedTrip = {
      ...existingTrip,
      ...updates,
      updatedAt: new Date()
    };
    this.trips.set(tripId, updatedTrip);
    return updatedTrip;
  }

  async deleteTrip(tripId: number): Promise<void> {
    this.trips.delete(tripId);
  }
}

export const storage = new MemStorage();