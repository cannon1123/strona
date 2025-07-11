import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import { insertMovieSchema, insertPremiumCodeSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const AD_RATE = 0.15; // 0.15 zł per ad view

// Admin middleware - allows tomaszjasi35@gmail.com or users with admin status
const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.claims.sub;
  const user = await storage.getUser(userId);
  
  if (!user || (user.email !== "tomaszjasi35@gmail.com" && !user.isAdmin)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if premium expired
      if (user?.isPremium && user.premiumExpiresAt && new Date() > user.premiumExpiresAt) {
        await storage.updateUserPremiumStatus(userId, false);
        const updatedUser = await storage.getUser(userId);
        res.json(updatedUser);
      } else {
        res.json(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Movie routes
  app.get('/api/movies', async (req, res) => {
    try {
      const { category } = req.query;
      const movies = await storage.getAllMovies();
      
      if (category && category !== 'wszystkie') {
        const filteredMovies = movies.filter(movie => movie.category === category);
        res.json(filteredMovies);
      } else {
        res.json(movies);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.post('/api/movies', isAdmin, async (req, res) => {
    try {
      const movieData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(movieData);
      res.json(movie);
    } catch (error: any) {
      console.error("Error creating movie:", error);
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const movie = await storage.getMovieById(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  // 2FA routes
  app.post("/api/auth/2fa/setup", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA already enabled" });
      }

      const secret = speakeasy.generateSecret({
        name: `StreamHub (${user.email})`,
        issuer: "StreamHub"
      });

      await storage.updateUser2FA(userId, secret.base32, false);

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      });
    } catch (error: any) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });

  app.post("/api/auth/2fa/verify", isAuthenticated, async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA not set up" });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid 2FA token" });
      }

      await storage.updateUser2FA(userId, user.twoFactorSecret, true);

      res.json({ message: "2FA enabled successfully" });
    } catch (error: any) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });

  app.post("/api/auth/2fa/disable", isAuthenticated, async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA not enabled" });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid 2FA token" });
      }

      await storage.updateUser2FA(userId, "", false);

      res.json({ message: "2FA disabled successfully" });
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  // Admin routes (restricted to tomaszjasi35@gmail.com)
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const [userCount, premiumUserCount, movieCount, adRevenue] = await Promise.all([
        storage.getUserCount(),
        storage.getPremiumUserCount(),
        storage.getMovieCount(),
        storage.getAdRevenue(),
      ]);

      res.json({
        users: userCount,
        premiumUsers: premiumUserCount,
        movies: movieCount,
        revenue: {
          ads: parseFloat(adRevenue.total),
          adsThisMonth: parseFloat(adRevenue.thisMonth),
        },
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post('/api/admin/movies', isAdmin, async (req: any, res) => {
    try {
      const movieData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(movieData);
      res.json(movie);
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  app.put('/api/admin/movies/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertMovieSchema.partial().parse(req.body);
      const movie = await storage.updateMovie(id, updates);
      res.json(movie);
    } catch (error) {
      console.error("Error updating movie:", error);
      res.status(500).json({ message: "Failed to update movie" });
    }
  });

  app.delete('/api/admin/movies/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMovie(id);
      res.json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ message: "Failed to delete movie" });
    }
  });

  // Profile settings routes
  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = z.object({
        displayName: z.string().max(50).optional(),
        bio: z.string().max(500).optional(),
        theme: z.enum(["dark", "light", "blue", "purple", "red"]).optional(),
        accentColor: z.enum(["blue", "purple", "red", "green", "yellow"]).optional(),
      }).parse(req.body);

      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/profile/change-email", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { newEmail } = z.object({
        newEmail: z.string().email(),
      }).parse(req.body);

      // Check if email is already taken
      const existingUser = await storage.getUserByEmailAddress(newEmail);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email już jest używany" });
      }

      const token = nanoid(32);
      await storage.initiateEmailChange(userId, newEmail, token);

      // Here you would send an email with the verification link
      // For now, we'll just return the token for testing
      res.json({ 
        message: "Email weryfikacyjny został wysłany",
        verificationToken: token // Remove this in production
      });
    } catch (error: any) {
      console.error("Error initiating email change:", error);
      res.status(500).json({ message: "Failed to initiate email change" });
    }
  });

  app.post("/api/profile/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const user = await storage.confirmEmailChange(token);
      
      if (!user) {
        return res.status(400).json({ message: "Nieprawidłowy lub wygasły token" });
      }

      res.json({ message: "Email został pomyślnie zmieniony" });
    } catch (error: any) {
      console.error("Error verifying email change:", error);
      res.status(500).json({ message: "Failed to verify email change" });
    }
  });

  // Premium code routes
  app.post('/api/admin/premium-codes', isAdmin, async (req: any, res) => {
    try {
      const { durationDays, quantity } = z.object({
        durationDays: z.number().min(1),
        quantity: z.number().min(1).max(100),
      }).parse(req.body);

      const codes = [];
      for (let i = 0; i < quantity; i++) {
        const code = Math.random().toString(36).substring(2, 15).toUpperCase();
        const premiumCode = await storage.createPremiumCode({
          code,
          durationDays,
          usesLeft: 1,
        });
        codes.push(premiumCode);
      }

      res.json(codes);
    } catch (error) {
      console.error("Error creating premium codes:", error);
      res.status(500).json({ message: "Failed to create premium codes" });
    }
  });

  app.get('/api/admin/premium-codes', isAdmin, async (req: any, res) => {
    try {
      const codes = await storage.getAllPremiumCodes();
      res.json(codes);
    } catch (error) {
      console.error("Error fetching premium codes:", error);
      res.status(500).json({ message: "Failed to fetch premium codes" });
    }
  });

  app.post('/api/premium-codes/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = z.object({ code: z.string() }).parse(req.body);
      const userId = req.user.claims.sub;

      // Special admin code
      if (code.toUpperCase() === "C4NN0N") {
        // Set admin privileges and permanent premium
        await storage.setUserAdminStatus(userId, true);
        await storage.updateUserPremiumStatus(userId, true, new Date(2099, 11, 31)); // Set to year 2099
        
        return res.json({ 
          message: "Kod specjalny aktywowany! Otrzymałeś uprawnienia administratora.",
          expiresAt: new Date(2099, 11, 31)
        });
      }

      const premiumCode = await storage.getPremiumCodeByCode(code);
      if (!premiumCode || premiumCode.usesLeft <= 0) {
        return res.status(400).json({ message: "Nieprawidłowy lub wygasły kod" });
      }

      await storage.usePremiumCode(code, userId);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + premiumCode.durationDays);
      
      await storage.updateUserPremiumStatus(userId, true, expiresAt);
      
      res.json({ message: "Kod premium został wykorzystany pomyślnie", expiresAt });
    } catch (error) {
      console.error("Error redeeming premium code:", error);
      res.status(500).json({ message: "Failed to redeem premium code" });
    }
  });

  // Ad tracking
  app.post('/api/ads/view', isAuthenticated, async (req: any, res) => {
    try {
      const { movieId } = z.object({ movieId: z.number() }).parse(req.body);
      const userId = req.user.claims.sub;

      await storage.recordAdView({
        userId,
        movieId,
        revenue: AD_RATE.toString(),
      });

      res.json({ message: "Ad view recorded" });
    } catch (error) {
      console.error("Error recording ad view:", error);
      res.status(500).json({ message: "Failed to record ad view" });
    }
  });

  // Movie streaming
  app.post('/api/movies/:id/watch', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const movie = await storage.getMovieById(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      const user = await storage.getUser(userId);
      
      // Check if user has premium access for premium movies
      if (movie.isPremium && !user?.isPremium) {
        return res.status(403).json({ message: "Premium subscription required" });
      }

      await storage.incrementMovieViews(id);
      
      res.json({
        movie,
        requiresAds: !user?.isPremium,
        adsCount: !user?.isPremium ? 2 : 0,
      });
    } catch (error) {
      console.error("Error starting movie:", error);
      res.status(500).json({ message: "Failed to start movie" });
    }
  });

  // Analytics for admin
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [userCount, premiumUserCount, movieCount, adRevenue] = await Promise.all([
        storage.getUserCount(),
        storage.getPremiumUserCount(),
        storage.getMovieCount(),
        storage.getAdRevenue(),
      ]);

      res.json({
        userCount,
        premiumUserCount,
        movieCount,
        adRevenue,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = subscription.latest_invoice as any;
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: invoice?.payment_intent?.client_secret,
        });
      }

      if (!user.email) {
        return res.status(400).json({ message: "User email required" });
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      });

      // Create a product first
      const product = await stripe.products.create({
        name: 'StreamHub Premium',
        description: 'Premium subscription for ad-free streaming and 4K quality',
      });

      // Create a price
      const price = await stripe.prices.create({
        currency: 'pln',
        unit_amount: 1999, // 19.99 PLN
        recurring: {
          interval: 'month',
        },
        product: product.id,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: price.id,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      const invoice = subscription.latest_invoice as any;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Webhook for Stripe events
  app.post('/api/stripe-webhook', async (req, res) => {
    try {
      const event = req.body;

      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            
            // Find user by email and update premium status
            const users = await storage.getAllMovies(); // This would need a getUserByEmail method
            // For now, we'll update based on stripe customer ID
            // This would need proper implementation
          }
          break;
        
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object;
          // Remove premium access when subscription is cancelled
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling Stripe webhook:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
