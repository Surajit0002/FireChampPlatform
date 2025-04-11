import { users, tournaments, tournamentParticipants, transactions, leaderboardEntries, referrals, teams, teamMembers, teamInvites, teamLeaderboard, chatRooms, chatMessages, forumTopics, forumReplies, marketplaceItems, marketplaceOrders } from "@shared/schema";
import type { 
  User, InsertUser, 
  Tournament, InsertTournament, 
  TournamentParticipant, InsertTournamentParticipant, 
  Transaction, InsertTransaction, 
  LeaderboardEntry, InsertLeaderboardEntry, 
  Referral, InsertReferral,
  Team, InsertTeam,
  TeamMember, InsertTeamMember,
  TeamInvite, InsertTeamInvite,
  TeamLeaderboardEntry,
  ChatRoom, InsertChatRoom,
  ChatMessage, InsertChatMessage,
  ForumTopic, InsertForumTopic,
  ForumReply, InsertForumReply,
  MarketplaceItem, InsertMarketplaceItem,
  MarketplaceOrder
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import appwriteService from "./appwrite";
import { ID, Query } from "appwrite";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Tournament operations
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, tournamentData: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: number): Promise<boolean>;
  
  // Tournament Participants operations
  getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]>;
  getTournamentParticipant(tournamentId: number, userId: number): Promise<TournamentParticipant | undefined>;
  joinTournament(participant: InsertTournamentParticipant): Promise<TournamentParticipant>;
  updateTournamentParticipant(id: number, participantData: Partial<TournamentParticipant>): Promise<TournamentParticipant | undefined>;
  withdrawFromTournament(tournamentId: number, userId: number): Promise<boolean>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Leaderboard operations
  getLeaderboard(period: string): Promise<LeaderboardEntry[]>;
  updateLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferrals(referrerId: number): Promise<Referral[]>;
  updateReferralStatus(id: number, status: string, reward: number): Promise<Referral | undefined>;
  
  // Team Management operations
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  getUserTeam(userId: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, teamData: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  
  // Team Members operations
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  getTeamMember(teamId: number, userId: number): Promise<TeamMember | undefined>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, memberData: Partial<TeamMember>): Promise<TeamMember | undefined>;
  removeTeamMember(teamId: number, userId: number): Promise<boolean>;
  findTeamCoLeader(teamId: number): Promise<TeamMember | undefined>;
  isTeamMember(teamId: number, userId: number): Promise<boolean>;
  
  // Team Invites operations
  getTeamInvites(teamId: number): Promise<TeamInvite[]>;
  getUserInvites(userId: number): Promise<TeamInvite[]>;
  getTeamInvite(teamId: number, userId: number): Promise<TeamInvite | undefined>;
  getTeamInviteById(id: number): Promise<TeamInvite | undefined>;
  createTeamInvite(invite: InsertTeamInvite): Promise<TeamInvite>;
  updateTeamInvite(id: number, inviteData: Partial<TeamInvite>): Promise<TeamInvite | undefined>;
  
  // Team Leaderboard operations
  getTeamLeaderboard(period: string): Promise<TeamLeaderboardEntry[]>;
  updateTeamLeaderboardEntry(teamId: number, data: Partial<TeamLeaderboardEntry>): Promise<TeamLeaderboardEntry>;
  
  // Chat System operations
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getChatMessages(roomId: number, limit?: number, offset?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Marketplace operations
  getMarketplaceItems(): Promise<MarketplaceItem[]>;
  getMarketplaceItem(id: number): Promise<MarketplaceItem | undefined>;
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  updateMarketplaceItem(id: number, itemData: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tournaments: Map<number, Tournament>;
  private tournamentParticipants: Map<number, TournamentParticipant>;
  private transactions: Map<number, Transaction>;
  private leaderboardEntries: Map<number, LeaderboardEntry>;
  private referrals: Map<number, Referral>;
  private teams: Map<number, Team>;
  private teamMembers: Map<number, TeamMember>;
  private teamInvites: Map<number, TeamInvite>;
  private teamLeaderboardEntries: Map<number, any>; // Using any for TeamLeaderboardEntry type
  private chatRooms: Map<number, ChatRoom>;
  private chatMessages: Map<number, ChatMessage>;
  private marketplaceItems: Map<number, MarketplaceItem>;
  private marketplaceOrders: Map<number, any>; // Using any for MarketplaceOrder type
  
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentTournamentId: number;
  currentParticipantId: number;
  currentTransactionId: number;
  currentLeaderboardEntryId: number;
  currentReferralId: number;
  currentTeamId: number;
  currentTeamMemberId: number;
  currentTeamInviteId: number;
  currentTeamLeaderboardEntryId: number;
  currentChatRoomId: number;
  currentChatMessageId: number;
  currentMarketplaceItemId: number;
  currentMarketplaceOrderId: number;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.tournamentParticipants = new Map();
    this.transactions = new Map();
    this.leaderboardEntries = new Map();
    this.referrals = new Map();
    
    this.currentUserId = 1;
    this.currentTournamentId = 1;
    this.currentParticipantId = 1;
    this.currentTransactionId = 1;
    this.currentLeaderboardEntryId = 1;
    this.currentReferralId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Create demo tournament data
    this.createDemoTournaments();
    this.createDemoLeaderboard();
  }
  
  private createDemoTournaments() {
    const now = new Date();
    
    // Upcoming tournaments
    this.createTournament({
      name: "FireStorm Solo Championship",
      description: "Compete in this high-stakes solo battle to win big prizes. Show your skills and claim the crown!",
      startTime: new Date(now.getTime() + 3600000 * 5), // 5 hours from now
      entryFee: 50,
      prizePool: 5000,
      perKillReward: 20,
      maxPlayers: 100,
      mode: "solo",
      map: "Bermuda",
      status: "upcoming",
      rules: "1. Check-in 15 minutes before start time. 2. No teaming. 3. Screenshot your results.",
      image: "",
      roomId: "57821",
      roomPassword: "fire123"
    });
    
    this.createTournament({
      name: "Desert Duos Showdown",
      description: "Find a partner and dominate the Kalahari desert in this duo tournament with special weapon drops.",
      startTime: new Date(now.getTime() + 3600000 * 10), // 10 hours from now
      entryFee: 75,
      prizePool: 7500,
      perKillReward: 25,
      maxPlayers: 50,
      mode: "duo",
      map: "Kalahari",
      status: "upcoming",
      rules: "1. Team registration required. 2. Fair play rules enforced. 3. Streamers must have delay.",
      image: "",
      roomId: "43789",
      roomPassword: "duos789"
    });
    
    this.createTournament({
      name: "Squad Survival Series",
      description: "Rally your squad for an intense battle against the best teams. Coordinate, communicate, conquer!",
      startTime: new Date(now.getTime() + 3600000 * 24), // 24 hours from now
      entryFee: 100,
      prizePool: 10000,
      perKillReward: 30,
      maxPlayers: 48,
      mode: "squad",
      map: "Purgatory",
      status: "upcoming",
      rules: "1. All 4 squad members must register. 2. Squad leader responsible for team. 3. Point system: placement + kills.",
      image: "",
      roomId: "92481",
      roomPassword: "squad456"
    });
    
    // Ongoing tournaments
    this.createTournament({
      name: "Midnight Mayhem",
      description: "The ultimate night-mode tournament where only the strongest survive. Limited visibility, maximum excitement!",
      startTime: new Date(now.getTime() - 3600000 * 1), // 1 hour ago
      entryFee: 60,
      prizePool: 6000,
      perKillReward: 25,
      maxPlayers: 100,
      mode: "solo",
      map: "Bermuda",
      status: "ongoing",
      rules: "1. Night mode active. 2. Extra points for headshots. 3. No vehicle usage in final circle.",
      image: "",
      roomId: "67421",
      roomPassword: "night888"
    });
    
    this.createTournament({
      name: "Alpine Winter Challenge",
      description: "Battle in the freezing mountains with unique winter gameplay mechanics and rare loot.",
      startTime: new Date(now.getTime() - 3600000 * 2), // 2 hours ago
      entryFee: 80,
      prizePool: 8000,
      perKillReward: 30,
      maxPlayers: 60,
      mode: "squad",
      map: "Alpine",
      status: "ongoing",
      rules: "1. Special winter rules apply. 2. Limited healing items. 3. Final zone is smaller than usual.",
      image: "",
      roomId: "13579",
      roomPassword: "snow246"
    });
    
    // Completed tournaments
    this.createTournament({
      name: "Free Fire Pro League - Week 3",
      description: "The third week of our professional league featuring the best players. Spectate or compete!",
      startTime: new Date(now.getTime() - 3600000 * 24 * 2), // 2 days ago
      entryFee: 120,
      prizePool: 15000,
      perKillReward: 40,
      maxPlayers: 100,
      mode: "solo",
      map: "Bermuda",
      status: "completed",
      rules: "1. Professional players only. 2. Streaming mandatory. 3. Ranking based on kill points + placement.",
      image: "",
      roomId: "98765",
      roomPassword: "pro321"
    });
    
    this.createTournament({
      name: "Weekend Warrior Cup",
      description: "The perfect weekend tournament for casual and competitive players alike. Everyone has a chance!",
      startTime: new Date(now.getTime() - 3600000 * 24 * 5), // 5 days ago
      entryFee: 50,
      prizePool: 5000,
      perKillReward: 20,
      maxPlayers: 80,
      mode: "duo",
      map: "Kalahari",
      status: "completed",
      rules: "1. Fair play enforced. 2. No smurfing. 3. Report suspicious behavior immediately.",
      image: "",
      roomId: "24680",
      roomPassword: "weekend123"
    });
    
    // Free tournament
    this.createTournament({
      name: "Newbie Friendly Faceoff",
      description: "Perfect for beginners! Free entry, learn competitive play, and still win prizes. All are welcome!",
      startTime: new Date(now.getTime() + 3600000 * 15), // 15 hours from now
      entryFee: 0,
      prizePool: 1000,
      perKillReward: 10,
      maxPlayers: 120,
      mode: "solo",
      map: "Bermuda",
      status: "upcoming",
      rules: "1. New players priority. 2. Coaching available before match. 3. Good sportsmanship required.",
      image: "",
      roomId: "11223",
      roomPassword: "newbie456"
    });
  }
  
  private createDemoLeaderboard() {
    const periods = ["daily", "weekly", "monthly", "all-time"];
    
    // Create 20 leaderboard entries for each period
    periods.forEach(period => {
      for (let i = 1; i <= 20; i++) {
        this.updateLeaderboardEntry({
          userId: i,
          kills: Math.floor(Math.random() * 50) + 10,
          wins: Math.floor(Math.random() * 10) + 1,
          earnings: (Math.floor(Math.random() * 500) + 100) * 10,
          tournamentCount: Math.floor(Math.random() * 20) + 5,
          period
        });
      }
    });
  }

  // User operations
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
    const referralCode = this.generateReferralCode();
    const user: User = { ...insertUser, id, balance: 0, coins: 100, referralCode, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }
  
  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }
  
  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const id = this.currentTournamentId++;
    const newTournament: Tournament = { ...tournament, id, createdAt: new Date() };
    this.tournaments.set(id, newTournament);
    return newTournament;
  }
  
  async updateTournament(id: number, tournamentData: Partial<Tournament>): Promise<Tournament | undefined> {
    const existingTournament = this.tournaments.get(id);
    if (!existingTournament) return undefined;
    
    const updatedTournament = { ...existingTournament, ...tournamentData };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }
  
  async deleteTournament(id: number): Promise<boolean> {
    return this.tournaments.delete(id);
  }
  
  // Tournament Participants operations
  async getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]> {
    return Array.from(this.tournamentParticipants.values())
      .filter(participant => participant.tournamentId === tournamentId);
  }
  
  async getTournamentParticipant(tournamentId: number, userId: number): Promise<TournamentParticipant | undefined> {
    return Array.from(this.tournamentParticipants.values())
      .find(participant => participant.tournamentId === tournamentId && participant.userId === userId);
  }
  
  async joinTournament(participant: InsertTournamentParticipant): Promise<TournamentParticipant> {
    const id = this.currentParticipantId++;
    const newParticipant: TournamentParticipant = { 
      ...participant, 
      id, 
      kills: 0, 
      rank: null,
      status: 'registered', 
      joinedAt: new Date() 
    };
    this.tournamentParticipants.set(id, newParticipant);
    return newParticipant;
  }
  
  async updateTournamentParticipant(id: number, participantData: Partial<TournamentParticipant>): Promise<TournamentParticipant | undefined> {
    const existingParticipant = this.tournamentParticipants.get(id);
    if (!existingParticipant) return undefined;
    
    const updatedParticipant = { ...existingParticipant, ...participantData };
    this.tournamentParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }
  
  async withdrawFromTournament(tournamentId: number, userId: number): Promise<boolean> {
    const participant = Array.from(this.tournamentParticipants.values())
      .find(p => p.tournamentId === tournamentId && p.userId === userId);
    
    if (!participant) return false;
    return this.tournamentParticipants.delete(participant.id);
  }
  
  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = { ...transaction, id, createdAt: new Date() };
    this.transactions.set(id, newTransaction);
    
    // Update user balance
    if (transaction.status === 'completed') {
      const user = this.users.get(transaction.userId);
      if (user) {
        // Different types of transactions affect the balance differently
        if (transaction.type === 'deposit' || transaction.type === 'tournament_win' || transaction.type === 'referral') {
          user.balance += transaction.amount;
        } else if (transaction.type === 'withdrawal' || transaction.type === 'tournament_entry') {
          user.balance -= transaction.amount;
        }
        
        this.users.set(user.id, user);
      }
    }
    
    return newTransaction;
  }
  
  // Leaderboard operations
  async getLeaderboard(period: string): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboardEntries.values())
      .filter(entry => entry.period === period)
      .sort((a, b) => b.kills - a.kills || b.wins - a.wins);
  }
  
  async updateLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    // Check if entry already exists
    const existingEntry = Array.from(this.leaderboardEntries.values())
      .find(e => e.userId === entry.userId && e.period === entry.period);
    
    if (existingEntry) {
      const updatedEntry = { 
        ...existingEntry, 
        kills: entry.kills || existingEntry.kills,
        wins: entry.wins || existingEntry.wins,
        earnings: entry.earnings || existingEntry.earnings,
        tournamentCount: entry.tournamentCount || existingEntry.tournamentCount,
        updatedAt: new Date()
      };
      this.leaderboardEntries.set(existingEntry.id, updatedEntry);
      return updatedEntry;
    }
    
    // Create new entry
    const id = this.currentLeaderboardEntryId++;
    const newEntry: LeaderboardEntry = { ...entry, id, updatedAt: new Date() };
    this.leaderboardEntries.set(id, newEntry);
    return newEntry;
  }
  
  // Referral operations
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const id = this.currentReferralId++;
    const newReferral: Referral = { ...referral, id, createdAt: new Date() };
    this.referrals.set(id, newReferral);
    return newReferral;
  }
  
  async getReferrals(referrerId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(referral => referral.referrerId === referrerId);
  }
  
  async updateReferralStatus(id: number, status: string, reward: number): Promise<Referral | undefined> {
    const existingReferral = this.referrals.get(id);
    if (!existingReferral) return undefined;
    
    const updatedReferral = { ...existingReferral, status, reward };
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }
  
  // Helper methods
  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

export class AppwriteStorage implements IStorage {
  sessionStore: any; // Need to define the session store type

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Create demo data only if configured
    if (process.env.CREATE_DEMO_DATA === 'true') {
      this.createDemoData();
    }
  }

  private async createDemoData() {
    try {
      console.log("Creating demo data in Appwrite...");
      // We'll implement the demo data creation later
      await this.createDemoTournaments();
      await this.createDemoLeaderboard();
      console.log("Demo data created successfully!");
    } catch (error) {
      console.error("Error creating demo data:", error);
    }
  }

  private async createDemoTournaments() {
    const now = new Date();
    
    // Tournament data similar to MemStorage demo data
    const tournamentData = [
      {
        name: "FireStorm Solo Championship",
        description: "Compete in this high-stakes solo battle to win big prizes. Show your skills and claim the crown!",
        startTime: new Date(now.getTime() + 3600000 * 5), // 5 hours from now
        entryFee: 50,
        prizePool: 5000,
        perKillReward: 20,
        maxPlayers: 100,
        mode: "solo",
        map: "Bermuda",
        status: "upcoming",
        rules: "1. Check-in 15 minutes before start time. 2. No teaming. 3. Screenshot your results.",
        image: "",
        roomId: "57821",
        roomPassword: "fire123"
      },
      {
        name: "Desert Duos Showdown",
        description: "Find a partner and dominate the Kalahari desert in this duo tournament with special weapon drops.",
        startTime: new Date(now.getTime() + 3600000 * 10), // 10 hours from now
        entryFee: 75,
        prizePool: 7500,
        perKillReward: 25,
        maxPlayers: 50,
        mode: "duo",
        map: "Kalahari",
        status: "upcoming",
        rules: "1. Team registration required. 2. Fair play rules enforced. 3. Streamers must have delay.",
        image: "",
        roomId: "43789",
        roomPassword: "duos789"
      },
      // Add more tournaments here...
    ];

    for (const tournament of tournamentData) {
      await this.createTournament(tournament);
    }
  }

  private async createDemoLeaderboard() {
    const periods = ["daily", "weekly", "monthly", "all-time"];
    
    // Create 20 leaderboard entries for each period
    for (const period of periods) {
      for (let i = 1; i <= 20; i++) {
        await this.updateLeaderboardEntry({
          userId: i,
          kills: Math.floor(Math.random() * 50) + 10,
          wins: Math.floor(Math.random() * 10) + 1,
          earnings: (Math.floor(Math.random() * 500) + 100) * 10,
          tournamentCount: Math.floor(Math.random() * 20) + 5,
          period
        });
      }
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await appwriteService.findDocumentByAttribute(
        appwriteService.collections.users,
        'id',
        id
      );
      return user ? user as User : undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await appwriteService.findDocumentByAttribute(
        appwriteService.collections.users,
        'username',
        username
      );
      return user ? user as User : undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Generate a unique ID for the user
      const id = Date.now();
      const referralCode = this.generateReferralCode();
      
      const userData = {
        ...insertUser,
        id,
        balance: 0,
        coins: 100,
        referralCode,
        createdAt: new Date()
      };
      
      const createdUser = await appwriteService.createDocument(
        appwriteService.collections.users,
        userData
      );
      
      return createdUser as unknown as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      // First, get the user document ID
      const user = await this.getUser(id);
      if (!user || !user.$id) return undefined;
      
      const updatedUser = await appwriteService.updateDocument(
        appwriteService.collections.users,
        user.$id,
        userData
      );
      
      return updatedUser as unknown as User;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }
  
  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    try {
      const response = await appwriteService.listDocuments(
        appwriteService.collections.tournaments
      );
      
      return response.documents as unknown as Tournament[];
    } catch (error) {
      console.error("Error getting tournaments:", error);
      return [];
    }
  }
  
  async getTournament(id: number): Promise<Tournament | undefined> {
    try {
      const tournament = await appwriteService.findDocumentByAttribute(
        appwriteService.collections.tournaments,
        'id',
        id
      );
      
      return tournament ? tournament as unknown as Tournament : undefined;
    } catch (error) {
      console.error("Error getting tournament:", error);
      return undefined;
    }
  }
  
  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    try {
      // Generate a unique ID for the tournament
      const id = Date.now();
      
      const tournamentData = {
        ...tournament,
        id,
        createdAt: new Date()
      };
      
      const createdTournament = await appwriteService.createDocument(
        appwriteService.collections.tournaments,
        tournamentData
      );
      
      return createdTournament as unknown as Tournament;
    } catch (error) {
      console.error("Error creating tournament:", error);
      throw error;
    }
  }
  
  async updateTournament(id: number, tournamentData: Partial<Tournament>): Promise<Tournament | undefined> {
    try {
      // First, get the tournament document ID
      const tournament = await this.getTournament(id);
      if (!tournament || !tournament.$id) return undefined;
      
      const updatedTournament = await appwriteService.updateDocument(
        appwriteService.collections.tournaments,
        tournament.$id,
        tournamentData
      );
      
      return updatedTournament as unknown as Tournament;
    } catch (error) {
      console.error("Error updating tournament:", error);
      return undefined;
    }
  }
  
  async deleteTournament(id: number): Promise<boolean> {
    try {
      // First, get the tournament document ID
      const tournament = await this.getTournament(id);
      if (!tournament || !tournament.$id) return false;
      
      await appwriteService.deleteDocument(
        appwriteService.collections.tournaments,
        tournament.$id
      );
      
      return true;
    } catch (error) {
      console.error("Error deleting tournament:", error);
      return false;
    }
  }
  
  // Tournament Participants operations
  async getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]> {
    try {
      const response = await appwriteService.advancedSearch(
        appwriteService.collections.tournamentParticipants,
        [Query.equal('tournamentId', tournamentId)]
      );
      
      return response.documents as unknown as TournamentParticipant[];
    } catch (error) {
      console.error("Error getting tournament participants:", error);
      return [];
    }
  }
  
  async getTournamentParticipant(tournamentId: number, userId: number): Promise<TournamentParticipant | undefined> {
    try {
      const response = await appwriteService.advancedSearch(
        appwriteService.collections.tournamentParticipants,
        [
          Query.equal('tournamentId', tournamentId),
          Query.equal('userId', userId)
        ]
      );
      
      return response.documents.length > 0 
        ? response.documents[0] as unknown as TournamentParticipant 
        : undefined;
    } catch (error) {
      console.error("Error getting tournament participant:", error);
      return undefined;
    }
  }
  
  async joinTournament(participant: InsertTournamentParticipant): Promise<TournamentParticipant> {
    try {
      // Generate a unique ID for the participant
      const id = Date.now();
      
      const participantData = {
        ...participant,
        id,
        kills: 0,
        rank: null,
        status: 'registered',
        joinedAt: new Date()
      };
      
      const createdParticipant = await appwriteService.createDocument(
        appwriteService.collections.tournamentParticipants,
        participantData
      );
      
      return createdParticipant as unknown as TournamentParticipant;
    } catch (error) {
      console.error("Error joining tournament:", error);
      throw error;
    }
  }
  
  async updateTournamentParticipant(id: number, participantData: Partial<TournamentParticipant>): Promise<TournamentParticipant | undefined> {
    try {
      // First, find the participant document by its ID
      const participant = await appwriteService.findDocumentByAttribute(
        appwriteService.collections.tournamentParticipants,
        'id',
        id
      );
      
      if (!participant || !participant.$id) return undefined;
      
      const updatedParticipant = await appwriteService.updateDocument(
        appwriteService.collections.tournamentParticipants,
        participant.$id,
        participantData
      );
      
      return updatedParticipant as unknown as TournamentParticipant;
    } catch (error) {
      console.error("Error updating tournament participant:", error);
      return undefined;
    }
  }
  
  async withdrawFromTournament(tournamentId: number, userId: number): Promise<boolean> {
    try {
      // Find the participant
      const participant = await this.getTournamentParticipant(tournamentId, userId);
      if (!participant || !participant.$id) return false;
      
      // Delete the participant document
      await appwriteService.deleteDocument(
        appwriteService.collections.tournamentParticipants,
        participant.$id
      );
      
      return true;
    } catch (error) {
      console.error("Error withdrawing from tournament:", error);
      return false;
    }
  }
  
  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    try {
      const response = await appwriteService.advancedSearch(
        appwriteService.collections.transactions,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      );
      
      return response.documents as unknown as Transaction[];
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    try {
      // Generate a unique ID for the transaction
      const id = Date.now();
      
      const transactionData = {
        ...transaction,
        id,
        createdAt: new Date()
      };
      
      const createdTransaction = await appwriteService.createDocument(
        appwriteService.collections.transactions,
        transactionData
      );
      
      // Update user balance if transaction is completed
      if (transaction.status === 'completed') {
        const user = await this.getUser(transaction.userId);
        if (user) {
          let newBalance = user.balance || 0;
          
          // Different types of transactions affect the balance differently
          if (transaction.type === 'deposit' || transaction.type === 'tournament_win' || transaction.type === 'referral') {
            newBalance += transaction.amount;
          } else if (transaction.type === 'withdrawal' || transaction.type === 'tournament_entry') {
            newBalance -= transaction.amount;
          }
          
          await this.updateUser(user.id, { balance: newBalance });
        }
      }
      
      return createdTransaction as unknown as Transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }
  
  // Leaderboard operations
  async getLeaderboard(period: string): Promise<LeaderboardEntry[]> {
    try {
      const response = await appwriteService.advancedSearch(
        appwriteService.collections.leaderboardEntries,
        [Query.equal('period', period)]
      );
      
      // Sort by kills and wins
      const entries = response.documents as unknown as LeaderboardEntry[];
      return entries.sort((a, b) => {
        const killsDiff = (b.kills || 0) - (a.kills || 0);
        if (killsDiff !== 0) return killsDiff;
        return (b.wins || 0) - (a.wins || 0);
      });
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return [];
    }
  }
  
  async updateLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    try {
      // Check if entry already exists
      const response = await appwriteService.advancedSearch(
        appwriteService.collections.leaderboardEntries,
        [
          Query.equal('userId', entry.userId),
          Query.equal('period', entry.period)
        ]
      );
      
      if (response.documents.length > 0) {
        // Update existing entry
        const existingEntry = response.documents[0];
        const updatedData = {
          kills: entry.kills !== undefined ? entry.kills : existingEntry.kills,
          wins: entry.wins !== undefined ? entry.wins : existingEntry.wins,
          earnings: entry.earnings !== undefined ? entry.earnings : existingEntry.earnings,
          tournamentCount: entry.tournamentCount !== undefined ? entry.tournamentCount : existingEntry.tournamentCount,
          updatedAt: new Date()
        };
        
        const updatedEntry = await appwriteService.updateDocument(
          appwriteService.collections.leaderboardEntries,
          existingEntry.$id,
          updatedData
        );
        
        return updatedEntry as unknown as LeaderboardEntry;
      } else {
        // Create new entry
        const id = Date.now();
        
        const newEntryData = {
          ...entry,
          id,
          updatedAt: new Date()
        };
        
        const createdEntry = await appwriteService.createDocument(
          appwriteService.collections.leaderboardEntries,
          newEntryData
        );
        
        return createdEntry as unknown as LeaderboardEntry;
      }
    } catch (error) {
      console.error("Error updating leaderboard entry:", error);
      throw error;
    }
  }
  
  // Referral operations
  async createReferral(referral: InsertReferral): Promise<Referral> {
    try {
      // Generate a unique ID for the referral
      const id = Date.now();
      
      const referralData = {
        ...referral,
        id,
        status: referral.status || 'pending',
        reward: referral.reward || 0,
        createdAt: new Date()
      };
      
      const createdReferral = await appwriteService.createDocument(
        appwriteService.collections.referrals,
        referralData
      );
      
      return createdReferral as unknown as Referral;
    } catch (error) {
      console.error("Error creating referral:", error);
      throw error;
    }
  }
  
  async getReferrals(referrerId: number): Promise<Referral[]> {
    try {
      const response = await appwriteService.advancedSearch(
        appwriteService.collections.referrals,
        [Query.equal('referrerId', referrerId)]
      );
      
      return response.documents as unknown as Referral[];
    } catch (error) {
      console.error("Error getting referrals:", error);
      return [];
    }
  }
  
  async updateReferralStatus(id: number, status: string, reward: number): Promise<Referral | undefined> {
    try {
      // Find the referral document by its ID
      const referral = await appwriteService.findDocumentByAttribute(
        appwriteService.collections.referrals,
        'id',
        id
      );
      
      if (!referral || !referral.$id) return undefined;
      
      const updatedReferral = await appwriteService.updateDocument(
        appwriteService.collections.referrals,
        referral.$id,
        { status, reward }
      );
      
      return updatedReferral as unknown as Referral;
    } catch (error) {
      console.error("Error updating referral status:", error);
      return undefined;
    }
  }
  
  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

// Use Appwrite storage for production, MemStorage for local development
export const storage = process.env.USE_APPWRITE === 'true' 
  ? new AppwriteStorage() 
  : new MemStorage();
