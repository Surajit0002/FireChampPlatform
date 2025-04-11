import { pgTable, text, serial, integer, boolean, timestamp, real, json, uniqueIndex } from "drizzle-orm/pg-core";
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
  teamId: integer("team_id").references(() => teams.id), // User's current team
  level: integer("level").default(1), // User level for XP system
  experience: integer("experience").default(0), // Experience points
  lastLogin: timestamp("last_login"), // Track user activity
  isStreamer: boolean("is_streamer").default(false), // Streamer role flag
  isOrganizer: boolean("is_organizer").default(false), // Tournament organizer flag
  preferredLanguage: text("preferred_language").default("en"), // Multi-language support
  bio: text("bio"), // User biography
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
  organizerId: integer("organizer_id").references(() => users.id), // Tournament Host
  streamUrl: text("stream_url"), // Live streaming URL
  allowTeams: boolean("allow_teams").default(false), // Team participation flag
  featured: boolean("featured").default(false), // Featured tournament for promotion
  registrationEnd: timestamp("registration_end"), // Registration end time
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Tournament Participants
export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  teamId: integer("team_id").references(() => teams.id), // For team registration
  kills: integer("kills").default(0),
  rank: integer("rank"),
  status: text("status").default("registered").notNull(), // registered, playing, eliminated, completed
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

// Transactions Table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, tournament_entry, tournament_win, referral, marketplace, transfer
  status: text("status").notNull(), // pending, completed, failed
  reference: text("reference"), // Reference to tournament or referral
  details: json("details"),
  recipientId: integer("recipient_id").references(() => users.id), // For wallet-to-wallet transfers
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

// ============== NEW SCHEMA TABLES FOR ADVANCED FEATURES ==============

// Team Management System
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tag: text("tag").notNull(), // Short team tag like "FZ", "NRG"
  logo: text("logo"), // Team logo
  banner: text("banner"), // Team banner image
  description: text("description"),
  leaderId: integer("leader_id").references(() => users.id).notNull(),
  maxMembers: integer("max_members").default(4),
  isVerified: boolean("is_verified").default(false),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => {
  return {
    nameIdx: uniqueIndex("team_name_idx").on(table.name),
    tagIdx: uniqueIndex("team_tag_idx").on(table.tag)
  }
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").default("member"), // leader, co-leader, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  status: text("status").default("active"), // active, inactive, banned
});

export const teamInvites = pgTable("team_invites", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  invitedBy: integer("invited_by").references(() => users.id).notNull(),
  status: text("status").default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const teamLeaderboard = pgTable("team_leaderboard", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  kills: integer("kills").default(0),
  wins: integer("wins").default(0),
  earnings: real("earnings").default(0),
  tournamentCount: integer("tournament_count").default(0),
  period: text("period").notNull(), // weekly, monthly, all-time
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Chat System
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: text("name"),
  type: text("type").notNull(), // global, tournament, team, direct
  relatedId: integer("related_id"), // tournamentId, teamId, etc.
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => chatRooms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  attachment: text("attachment"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Community Forum
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => forumCategories.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  viewCount: integer("view_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => forumTopics.id).notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Marketplace System
export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // skins, emotes, passes, diamonds
  price: real("price").notNull(),
  image: text("image"),
  status: text("status").default("available"), // available, sold, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at")
});

export const marketplaceOrders = pgTable("marketplace_orders", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => marketplaceItems.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  price: real("price").notNull(),
  status: text("status").default("pending"), // pending, completed, cancelled, disputed
  transactionId: integer("transaction_id").references(() => transactions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at")
});

// User Activity & Stats
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalTournaments: integer("total_tournaments").default(0),
  totalMatches: integer("total_matches").default(0),
  totalKills: integer("total_kills").default(0),
  highestKills: integer("highest_kills").default(0),
  winRate: real("win_rate").default(0),
  kdRatio: real("kd_ratio").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementType: text("achievement_type").notNull(), // tournament_win, kill_streak, etc.
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull()
});

// Tournament AI Analysis System
export const playerAnalysis = pgTable("player_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  strengths: json("strengths"),
  weaknesses: json("weaknesses"),
  recommendations: json("recommendations"),
  predictedRank: text("predicted_rank"),
  analysisDate: timestamp("analysis_date").defaultNow().notNull()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  gameUid: true,
  avatar: true,
  preferredLanguage: true,
  bio: true
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

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  level: true,
  experience: true,
  isVerified: true
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true
});

export const insertTeamInviteSchema = createInsertSchema(teamInvites).omit({
  id: true,
  createdAt: true
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  createdAt: true,
  upvotes: true,
  downvotes: true,
  viewCount: true,
  lastReplyAt: true,
  isPinned: true,
  isLocked: true
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  upvotes: true,
  downvotes: true
});

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({
  id: true,
  createdAt: true,
  status: true
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

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertTeamInvite = z.infer<typeof insertTeamInviteSchema>;
export type TeamInvite = typeof teamInvites.$inferSelect;

export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;

export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginData = z.infer<typeof loginSchema>;
