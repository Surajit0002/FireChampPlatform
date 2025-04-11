import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertTournamentParticipantSchema, insertTransactionSchema, insertLeaderboardEntrySchema, insertReferralSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get all tournaments
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  // Get tournament by ID
  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  });

  // Get tournament participants
  app.get("/api/tournaments/:id/participants", async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const participants = await storage.getTournamentParticipants(tournamentId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  // Join tournament
  app.post("/api/tournaments/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to join tournaments" });
    }

    try {
      const tournamentId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if tournament exists
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      
      // Check if user is already registered
      const existingParticipant = await storage.getTournamentParticipant(tournamentId, userId);
      if (existingParticipant) {
        return res.status(400).json({ error: "You are already registered for this tournament" });
      }
      
      // Check if tournament is full
      const participants = await storage.getTournamentParticipants(tournamentId);
      if (participants.length >= tournament.maxPlayers) {
        return res.status(400).json({ error: "Tournament is full" });
      }
      
      // Check if user has enough balance
      if (req.user!.balance < tournament.entryFee) {
        return res.status(400).json({ error: "Insufficient balance to join tournament" });
      }
      
      // Create transaction for tournament entry
      const transaction = await storage.createTransaction({
        userId,
        amount: tournament.entryFee,
        type: "tournament_entry",
        status: "completed",
        reference: tournamentId.toString(),
        details: { tournamentName: tournament.name }
      });
      
      // Register user for tournament
      const participant = await storage.joinTournament({
        tournamentId,
        userId,
        status: "registered"
      });
      
      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to join tournament" });
    }
  });

  // Withdraw from tournament
  app.post("/api/tournaments/:id/withdraw", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to withdraw from tournaments" });
    }

    try {
      const tournamentId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user is registered
      const participant = await storage.getTournamentParticipant(tournamentId, userId);
      if (!participant) {
        return res.status(400).json({ error: "You are not registered for this tournament" });
      }
      
      // Check if tournament has already started
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      
      if (tournament.status !== "upcoming") {
        return res.status(400).json({ error: "Cannot withdraw from a tournament that has already started" });
      }
      
      // Refund entry fee
      await storage.createTransaction({
        userId,
        amount: tournament.entryFee,
        type: "deposit",
        status: "completed",
        reference: tournamentId.toString(),
        details: { reason: "Tournament withdrawal refund" }
      });
      
      // Remove user from tournament
      const success = await storage.withdrawFromTournament(tournamentId, userId);
      
      if (success) {
        res.status(200).json({ message: "Successfully withdrawn from tournament" });
      } else {
        res.status(500).json({ error: "Failed to withdraw from tournament" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to withdraw from tournament" });
    }
  });

  // Get user wallet and transactions
  app.get("/api/wallet", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to view your wallet" });
    }

    try {
      const userId = req.user!.id;
      const transactions = await storage.getTransactions(userId);
      
      res.json({
        balance: req.user!.balance,
        coins: req.user!.coins,
        transactions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet information" });
    }
  });

  // Add money to wallet
  app.post("/api/wallet/deposit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to add money" });
    }

    const schema = z.object({
      amount: z.number().positive("Amount must be positive")
    });

    try {
      const { amount } = schema.parse(req.body);
      const userId = req.user!.id;
      
      // In a real implementation, this would involve a payment gateway
      // For now, we'll simulate a successful payment
      const transaction = await storage.createTransaction({
        userId,
        amount,
        type: "deposit",
        status: "completed",
        reference: "payment_reference",
        details: { method: "UPI" }
      });
      
      // Update user's balance
      const updatedUser = await storage.updateUser(userId, {
        balance: req.user!.balance + amount
      });
      
      res.status(201).json({
        transaction,
        newBalance: updatedUser!.balance
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to add money" });
    }
  });

  // Withdraw money from wallet
  app.post("/api/wallet/withdraw", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to withdraw money" });
    }

    const schema = z.object({
      amount: z.number().positive("Amount must be positive")
    });

    try {
      const { amount } = schema.parse(req.body);
      const userId = req.user!.id;
      
      if (req.user!.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance for withdrawal" });
      }
      
      // In a real implementation, this would involve a payment processor
      // For now, we'll simulate a pending withdrawal
      const transaction = await storage.createTransaction({
        userId,
        amount,
        type: "withdrawal",
        status: "pending",
        reference: "withdrawal_reference",
        details: { method: "UPI" }
      });
      
      // Don't update balance yet since withdrawal is pending
      
      res.status(201).json({
        transaction,
        message: "Withdrawal request submitted and is pending approval"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard/:period", async (req, res) => {
    try {
      const period = req.params.period || "weekly";
      if (!["daily", "weekly", "monthly", "all-time"].includes(period)) {
        return res.status(400).json({ error: "Invalid period" });
      }
      
      const leaderboard = await storage.getLeaderboard(period);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get referrals
  app.get("/api/referrals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to view your referrals" });
    }

    try {
      const referrerId = req.user!.id;
      const referrals = await storage.getReferrals(referrerId);
      
      res.json({
        referralCode: req.user!.referralCode,
        referrals
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  // Apply referral code
  app.post("/api/referrals/apply", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to apply a referral code" });
    }

    const schema = z.object({
      referralCode: z.string().min(1, "Referral code is required")
    });

    try {
      const { referralCode } = schema.parse(req.body);
      const userId = req.user!.id;
      
      // Check if user has already used a referral code
      if (req.user!.referredBy) {
        return res.status(400).json({ error: "You have already used a referral code" });
      }
      
      // Find user with this referral code
      const referrer = Array.from((storage as any).users.values()).find(
        (user: any) => user.referralCode === referralCode
      );
      
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      
      if (referrer.id === userId) {
        return res.status(400).json({ error: "You cannot use your own referral code" });
      }
      
      // Update user with referrer ID
      await storage.updateUser(userId, {
        referredBy: referrer.id
      });
      
      // Create referral record
      const referral = await storage.createReferral({
        referrerId: referrer.id,
        referredId: userId,
        status: "completed",
        reward: 50 // 50 rupees reward
      });
      
      // Add reward to referrer
      await storage.createTransaction({
        userId: referrer.id,
        amount: 50,
        type: "referral",
        status: "completed",
        reference: referral.id.toString(),
        details: { referredUser: userId }
      });
      
      res.status(201).json({
        message: "Referral code applied successfully",
        referral
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to apply referral code" });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
