import {
  users,
  movies,
  premiumCodes,
  adViews,
  type User,
  type UpsertUser,
  type Movie,
  type InsertMovie,
  type PremiumCode,
  type InsertPremiumCode,
  type AdView,
  type InsertAdView,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, isNull, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPremiumStatus(id: string, isPremium: boolean, expiresAt?: Date): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User>;
  updateUser2FA(id: string, secret: string, enabled: boolean): Promise<User>;
  setUserAdminStatus(id: string, isAdmin: boolean): Promise<User>;
  updateUserProfile(id: string, updates: {
    displayName?: string;
    bio?: string;
    theme?: string;
    accentColor?: string;
  }): Promise<User>;
  initiateEmailChange(id: string, newEmail: string, token: string): Promise<User>;
  confirmEmailChange(token: string): Promise<User | null>;
  getUserByEmailToken(token: string): Promise<User | undefined>;
  getUserByEmailAddress(email: string): Promise<User | undefined>;
  
  // Movie operations
  getAllMovies(): Promise<Movie[]>;
  getMovieById(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, updates: Partial<InsertMovie>): Promise<Movie>;
  deleteMovie(id: number): Promise<void>;
  incrementMovieViews(id: number): Promise<void>;
  
  // Premium code operations
  createPremiumCode(code: InsertPremiumCode): Promise<PremiumCode>;
  getPremiumCodeByCode(code: string): Promise<PremiumCode | undefined>;
  usePremiumCode(code: string, userId: string): Promise<PremiumCode>;
  getAllPremiumCodes(): Promise<PremiumCode[]>;
  
  // Ad operations
  recordAdView(adView: InsertAdView): Promise<AdView>;
  getAdRevenue(): Promise<{ total: string; thisMonth: string }>;
  
  // Analytics
  getUserCount(): Promise<number>;
  getPremiumUserCount(): Promise<number>;
  getMovieCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPremiumStatus(id: string, isPremium: boolean, expiresAt?: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isPremium,
        premiumExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUser2FA(id: string, secret: string, enabled: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorEnabled: enabled,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async setUserAdminStatus(id: string, isAdmin: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isAdmin: isAdmin,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: {
    displayName?: string;
    bio?: string;
    theme?: string;
    accentColor?: string;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async initiateEmailChange(id: string, newEmail: string, token: string): Promise<User> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours to verify

    const [user] = await db
      .update(users)
      .set({
        pendingEmail: newEmail,
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async confirmEmailChange(token: string): Promise<User | null> {
    const user = await this.getUserByEmailToken(token);
    if (!user || !user.emailVerificationExpires || new Date() > user.emailVerificationExpires) {
      return null;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        email: user.pendingEmail,
        pendingEmail: null,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    return updatedUser;
  }

  async getUserByEmailToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));
    return user;
  }

  async getUserByEmailAddress(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  // Movie operations
  async getAllMovies(): Promise<Movie[]> {
    return await db.select().from(movies).where(eq(movies.isActive, true)).orderBy(desc(movies.createdAt));
  }

  async getMovieById(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(and(eq(movies.id, id), eq(movies.isActive, true)));
    return movie;
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [newMovie] = await db.insert(movies).values(movie).returning();
    return newMovie;
  }

  async updateMovie(id: number, updates: Partial<InsertMovie>): Promise<Movie> {
    const [movie] = await db
      .update(movies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(movies.id, id))
      .returning();
    return movie;
  }

  async deleteMovie(id: number): Promise<void> {
    await db.update(movies).set({ isActive: false }).where(eq(movies.id, id));
  }

  async incrementMovieViews(id: number): Promise<void> {
    await db
      .update(movies)
      .set({ viewCount: sql`${movies.viewCount} + 1` })
      .where(eq(movies.id, id));
  }

  // Premium code operations
  async createPremiumCode(code: InsertPremiumCode): Promise<PremiumCode> {
    const [newCode] = await db.insert(premiumCodes).values(code).returning();
    return newCode;
  }

  async getPremiumCodeByCode(code: string): Promise<PremiumCode | undefined> {
    const [premiumCode] = await db
      .select()
      .from(premiumCodes)
      .where(and(eq(premiumCodes.code, code), eq(premiumCodes.isActive, true)));
    return premiumCode;
  }

  async usePremiumCode(code: string, userId: string): Promise<PremiumCode> {
    const [usedCode] = await db
      .update(premiumCodes)
      .set({
        usesLeft: sql`${premiumCodes.usesLeft} - 1`,
        usedAt: new Date(),
        usedBy: userId,
        isActive: sql`CASE WHEN ${premiumCodes.usesLeft} - 1 <= 0 THEN false ELSE true END`,
      })
      .where(eq(premiumCodes.code, code))
      .returning();
    return usedCode;
  }

  async getAllPremiumCodes(): Promise<PremiumCode[]> {
    return await db.select().from(premiumCodes).orderBy(desc(premiumCodes.createdAt));
  }

  // Ad operations
  async recordAdView(adView: InsertAdView): Promise<AdView> {
    const [newAdView] = await db.insert(adViews).values(adView).returning();
    return newAdView;
  }

  async getAdRevenue(): Promise<{ total: string; thisMonth: string }> {
    const totalResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${adViews.revenue}), 0)` })
      .from(adViews);

    const thisMonthResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${adViews.revenue}), 0)` })
      .from(adViews)
      .where(gte(adViews.viewedAt, sql`DATE_TRUNC('month', CURRENT_DATE)`));

    return {
      total: totalResult[0]?.total || "0",
      thisMonth: thisMonthResult[0]?.total || "0",
    };
  }

  // Analytics
  async getUserCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);
    return result[0]?.count || 0;
  }

  async getPremiumUserCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(and(
        eq(users.isPremium, true),
        or(isNull(users.premiumExpiresAt), gte(users.premiumExpiresAt, new Date()))
      ));
    return result[0]?.count || 0;
  }

  async getMovieCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(movies)
      .where(eq(movies.isActive, true));
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
