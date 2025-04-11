import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  gameUid: text("game_uid"),
  avatar: text("avatar"),
  balance: real("balance").default(0).notNull(),
  coins: integer("coins").default(0).notNull(),
  referralCode: text("referral_code"),
  referredBy: integer("referred_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Tournaments Table
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  entryFee: real("entry_fee").default(0).notNull(),
  prizePool: real("prize_pool").notNull(),
  perKillReward: real("per_kill_reward").default(0),
  maxPlayers: integer("max_players").notNull(),
  mode: text("mode").notNull(), // Solo, Duo, Squad
  map: text("map").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, ongoing, completed
  rules: text("rules"),
  image: text("image"),
  roomId: text("room_id"),
  roomPassword: text("room_password"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Tournament Participants
export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  kills: integer("kills").default(0),
  rank: integer("rank"),
  status: text("status").default("registered").notNull(), // registered, played, won
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

// Transactions Table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, tournament_entry, tournament_win, referral
  status: text("status").notNull(), // pending, completed, failed
  reference: text("reference"), // Reference to tournament or referral
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Leaderboard
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  kills: integer("kills").default(0),
  wins: integer("wins").default(0),
  earnings: real("earnings").default(0),
  tournamentCount: integer("tournament_count").default(0),
  period: text("period").notNull(), // daily, weekly, monthly, all-time
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Referrals
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredId: integer("referred_id").references(() => users.id).notNull(),
  status: text("status").default("pending").notNull(), // pending, completed
  reward: real("reward").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  gameUid: true,
  avatar: true
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true, 
  createdAt: true
});

export const insertTournamentParticipantSchema = createInsertSchema(tournamentParticipants).omit({
  id: true, 
  joinedAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true, 
  createdAt: true
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true, 
  updatedAt: true
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true, 
  createdAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

export type InsertTournamentParticipant = z.infer<typeof insertTournamentParticipantSchema>;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginData = z.infer<typeof loginSchema>;
