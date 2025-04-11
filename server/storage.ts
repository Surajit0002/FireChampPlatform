import { users, tournaments, tournamentParticipants, transactions, leaderboardEntries, referrals } from "@shared/schema";
import type { User, InsertUser, Tournament, InsertTournament, TournamentParticipant, InsertTournamentParticipant, Transaction, InsertTransaction, LeaderboardEntry, InsertLeaderboardEntry, Referral, InsertReferral } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

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
  
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentTournamentId: number;
  currentParticipantId: number;
  currentTransactionId: number;
  currentLeaderboardEntryId: number;
  currentReferralId: number;

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

export const storage = new MemStorage();
