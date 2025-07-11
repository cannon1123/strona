import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  isPremium: boolean("is_premium").default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  twoFactorSecret: varchar("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  // Profile customization
  theme: varchar("theme").default("dark"), // dark, light, blue, purple, red
  accentColor: varchar("accent_color").default("blue"), // blue, purple, red, green, yellow
  displayName: varchar("display_name"),
  bio: text("bio"),
  // Pending changes for email verification
  pendingEmail: varchar("pending_email"),
  emailVerificationToken: varchar("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Movies table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url"),
  videoUrl: varchar("video_url"),
  duration: integer("duration"), // in minutes
  year: integer("year"),
  genre: varchar("genre"),
  isPremium: boolean("is_premium").default(false),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Premium codes table
export const premiumCodes = pgTable("premium_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code").unique().notNull(),
  durationDays: integer("duration_days").notNull(),
  usesLeft: integer("uses_left").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
  usedBy: varchar("used_by"),
});

// Ad revenue tracking
export const adViews = pgTable("ad_views", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  movieId: integer("movie_id"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  adViews: many(adViews),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  adViews: many(adViews),
}));

export const adViewsRelations = relations(adViews, ({ one }) => ({
  user: one(users, {
    fields: [adViews.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [adViews.movieId],
    references: [movies.id],
  }),
}));

export const premiumCodesRelations = relations(premiumCodes, ({ one }) => ({
  usedByUser: one(users, {
    fields: [premiumCodes.usedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const insertPremiumCodeSchema = createInsertSchema(premiumCodes).omit({
  id: true,
  createdAt: true,
  usedAt: true,
  usedBy: true,
});

export const insertAdViewSchema = createInsertSchema(adViews).omit({
  id: true,
  viewedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type PremiumCode = typeof premiumCodes.$inferSelect;
export type InsertPremiumCode = z.infer<typeof insertPremiumCodeSchema>;
export type AdView = typeof adViews.$inferSelect;
export type InsertAdView = z.infer<typeof insertAdViewSchema>;
