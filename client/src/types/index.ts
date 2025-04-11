import { Tournament, TournamentParticipant, Transaction, LeaderboardEntry, Referral } from "@shared/schema";

export interface WalletData {
  balance: number;
  coins: number;
  transactions: Transaction[];
}

export interface LeaderboardUser {
  id: number;
  username: string;
  avatar?: string;
  kills: number;
  wins: number;
  earnings: number;
}

export interface TournamentFilter {
  mode?: 'solo' | 'duo' | 'squad' | 'all';
  status?: 'upcoming' | 'ongoing' | 'completed' | 'all';
  entryType?: 'free' | 'paid' | 'all';
  map?: string;
}

export interface ReferralData {
  referralCode: string;
  referrals: Referral[];
}
