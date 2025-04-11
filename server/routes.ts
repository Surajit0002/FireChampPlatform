import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertTournamentParticipantSchema, 
  insertTransactionSchema, 
  insertLeaderboardEntrySchema, 
  insertReferralSchema,
  insertTeamSchema,
  insertTeamMemberSchema,
  insertTeamInviteSchema,
  insertChatMessageSchema,
  insertForumTopicSchema,
  insertForumReplySchema,
  insertMarketplaceItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get platform statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = {
        totalPrizePool: await storage.calculateTotalPrizePool(),
        activePlayers: await storage.countActivePlayers(),
        dailyTournaments: await storage.countDailyTournaments(),
        yesterdayPayout: await storage.calculateYesterdayPayout()
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

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

  // ================ TEAM MANAGEMENT SYSTEM API ================

  // Get all teams
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // Get team by ID
  app.get("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getTeam(id);

      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  // Get team members
  app.get("/api/teams/:id/members", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const members = await storage.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  // Create a new team
  app.post("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to create a team" });
    }

    try {
      const userId = req.user!.id;

      // Validate team data
      const teamData = insertTeamSchema.parse(req.body);

      // Check if user already has a team
      const userTeam = await storage.getUserTeam(userId);
      if (userTeam) {
        return res.status(400).json({ error: "You are already a member of a team" });
      }

      // Create the team
      const team = await storage.createTeam({
        ...teamData,
        leaderId: userId,
      });

      // Add user as team leader
      await storage.addTeamMember({
        teamId: team.id,
        userId,
        role: "leader"
      });

      // Update user's teamId
      await storage.updateUser(userId, {
        teamId: team.id
      });

      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  // Join team
  app.post("/api/teams/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to join a team" });
    }

    try {
      const teamId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if team exists
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if user already has a team
      if (req.user!.teamId) {
        return res.status(400).json({ error: "You are already a member of a team" });
      }

      // Check if team is full
      const members = await storage.getTeamMembers(teamId);
      if (members.length >= team.maxMembers) {
        return res.status(400).json({ error: "Team is full" });
      }

      // Add user to team
      await storage.addTeamMember({
        teamId,
        userId,
        role: "member"
      });

      // Update user's teamId
      await storage.updateUser(userId, {
        teamId
      });

      res.status(200).json({ message: "Successfully joined team" });
    } catch (error) {
      res.status(500).json({ error: "Failed to join team" });
    }
  });

  // Leave team
  app.post("/api/teams/:id/leave", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to leave a team" });
    }

    try {
      const teamId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if user is in this team
      if (req.user!.teamId !== teamId) {
        return res.status(400).json({ error: "You are not a member of this team" });
      }

      // Get member details
      const member = await storage.getTeamMember(teamId, userId);
      if (!member) {
        return res.status(404).json({ error: "Team membership not found" });
      }

      // Check if user is the leader
      if (member.role === "leader") {
        // Find a co-leader to promote
        const coLeader = await storage.findTeamCoLeader(teamId);

        if (coLeader) {
          // Promote co-leader to leader
          await storage.updateTeamMember(coLeader.id, {
            role: "leader"
          });

          // Update team leader
          await storage.updateTeam(teamId, {
            leaderId: coLeader.userId
          });
        } else {
          // If no co-leader, team will be disbanded
          // First, remove all members from team
          const members = await storage.getTeamMembers(teamId);
          for (const m of members) {
            if (m.userId !== userId) { // Skip leader as we'll handle them separately
              await storage.updateUser(m.userId, {
                teamId: null
              });
              await storage.removeTeamMember(teamId, m.userId);
            }
          }

          // Delete the team
          await storage.deleteTeam(teamId);
        }
      }

      // Remove user from team
      await storage.removeTeamMember(teamId, userId);

      // Update user's teamId
      await storage.updateUser(userId, {
        teamId: null
      });

      res.status(200).json({ message: "Successfully left team" });
    } catch (error) {
      res.status(500).json({ error: "Failed to leave team" });
    }
  });

  // Update team
  app.put("/api/teams/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to update a team" });
    }

    try {
      const teamId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if team exists
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if user is the leader
      if (team.leaderId !== userId) {
        return res.status(403).json({ error: "Only the team leader can update the team" });
      }

      // Validate update data
      const updateData = insertTeamSchema.partial().parse(req.body);

      // Update team
      const updatedTeam = await storage.updateTeam(teamId, updateData);

      res.json(updatedTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to update team" });
    }
  });

  // Change member role
  app.put("/api/teams/:id/members/:userId/role", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to change member roles" });
    }

    const schema = z.object({
      role: z.enum(["leader", "co-leader", "member"])
    });

    try {
      const { role } = schema.parse(req.body);
      const teamId = parseInt(req.params.id);
      const memberId = parseInt(req.params.userId);
      const currentUserId = req.user!.id;

      // Check if team exists
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if user is the leader
      if (team.leaderId !== currentUserId) {
        return res.status(403).json({ error: "Only the team leader can change member roles" });
      }

      // Check if member exists
      const member = await storage.getTeamMember(teamId, memberId);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }

      // Cannot change own role
      if (memberId === currentUserId) {
        return res.status(400).json({ error: "You cannot change your own role" });
      }

      // Update member role
      const updatedMember = await storage.updateTeamMember(member.id, {
        role
      });

      // If new role is leader, update team and demote current leader
      if (role === "leader") {
        // Update team leader
        await storage.updateTeam(teamId, {
          leaderId: memberId
        });

        // Find current leader's member record
        const leaderMember = await storage.getTeamMember(teamId, currentUserId);
        if (leaderMember) {
          // Demote current leader to co-leader
          await storage.updateTeamMember(leaderMember.id, {
            role: "co-leader"
          });
        }
      }

      res.json(updatedMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to change member role" });
    }
  });

  // Send team invite
  app.post("/api/teams/:id/invites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to send team invites" });
    }

    const schema = z.object({
      username: z.string().min(1, "Username is required")
    });

    try {
      const { username } = schema.parse(req.body);
      const teamId = parseInt(req.params.id);
      const currentUserId = req.user!.id;

      // Check if team exists
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if user is in this team
      const member = await storage.getTeamMember(teamId, currentUserId);
      if (!member) {
        return res.status(403).json({ error: "You must be a member of this team to send invites" });
      }

      // Only leaders and co-leaders can send invites
      if (member.role !== "leader" && member.role !== "co-leader") {
        return res.status(403).json({ error: "Only team leaders and co-leaders can send invites" });
      }

      // Check if team is full
      const members = await storage.getTeamMembers(teamId);
      if (members.length >= team.maxMembers) {
        return res.status(400).json({ error: "Team is full" });
      }

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already has a team
      if (user.teamId) {
        return res.status(400).json({ error: "User is already a member of a team" });
      }

      // Check if invite already exists
      const existingInvite = await storage.getTeamInvite(teamId, user.id);
      if (existingInvite) {
        return res.status(400).json({ error: "User has already been invited to this team" });
      }

      // Create team invite
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

      const invite = await storage.createTeamInvite({
        teamId,
        userId: user.id,
        invitedBy: currentUserId,
        expiresAt
      });

      res.status(201).json(invite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to send team invite" });
    }
  });

  // Get user's team invites
  app.get("/api/invites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to view your invites" });
    }

    try {
      const userId = req.user!.id;
      const invites = await storage.getUserInvites(userId);

      // Get team details for each invite
      const invitesWithTeamDetails = await Promise.all(
        invites.map(async (invite) => {
          const team = await storage.getTeam(invite.teamId);
          const inviter = await storage.getUser(invite.invitedBy);
          return {
            ...invite,
            team,
            inviter: inviter ? {
              id: inviter.id,
              username: inviter.username,
              avatar: inviter.avatar
            } : null
          };
        })
      );

      res.json(invitesWithTeamDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team invites" });
    }
  });

  // Respond to team invite
  app.post("/api/invites/:id/respond", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to respond to invites" });
    }

    const schema = z.object({
      accept: z.boolean()
    });

    try {
      const { accept } = schema.parse(req.body);
      const inviteId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Find the invite
      const invite = await storage.getTeamInviteById(inviteId);
      if (!invite) {
        return res.status(404).json({ error: "Invite not found" });
      }

      // Check if invite is for this user
      if (invite.userId !== userId) {
        return res.status(403).json({ error: "This invite is not for you" });
      }

      // Check if invite has expired
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        await storage.updateTeamInvite(inviteId, {
          status: "expired"
        });
        return res.status(400).json({ error: "Invite has expired" });
      }

      if (accept) {
        // Check if user already has a team
        if (req.user!.teamId) {
          return res.status(400).json({ error: "You are already a member of a team" });
        }

        // Check if team still exists
        const team = await storage.getTeam(invite.teamId);
        if (!team) {
          return res.status(404).json({ error: "Team no longer exists" });
        }

        // Check if team is full
        const members = await storage.getTeamMembers(invite.teamId);
        if (members.length >= team.maxMembers) {
          return res.status(400).json({ error: "Team is now full" });
        }

        // Accept invite
        await storage.updateTeamInvite(inviteId, {
          status: "accepted"
        });

        // Add user to team
        await storage.addTeamMember({
          teamId: invite.teamId,
          userId,
          role: "member"
        });

        // Update user's teamId
        await storage.updateUser(userId, {
          teamId: invite.teamId
        });

        res.json({ message: "Successfully joined team" });
      } else {
        // Decline invite
        await storage.updateTeamInvite(inviteId, {
          status: "declined"
        });

        res.json({ message: "Invite declined" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to respond to invite" });
    }
  });

  // Get team leaderboard
  app.get("/api/teams/leaderboard/:period", async (req, res) => {
    try {
      const period = req.params.period || "weekly";
      if (!["weekly", "monthly", "all-time"].includes(period)) {
        return res.status(400).json({ error: "Invalid period" });
      }

      const leaderboard = await storage.getTeamLeaderboard(period);

      // Get team details for each entry
      const leaderboardWithTeamDetails = await Promise.all(
        leaderboard.map(async (entry) => {
          const team = await storage.getTeam(entry.teamId);
          return {
            ...entry,
            team: team ? {
              id: team.id,
              name: team.name,
              tag: team.tag,
              logo: team.logo
            } : null
          };
        })
      );

      res.json(leaderboardWithTeamDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team leaderboard" });
    }
  });

  // ================ REAL-TIME CHAT SYSTEM API ================

  // Get chat rooms
  app.get("/api/chat/rooms", async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  // Get messages for a chat room
  app.get("/api/chat/rooms/:id/messages", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string || "50");
      const offset = parseInt(req.query.offset as string || "0");

      const messages = await storage.getChatMessages(roomId, limit, offset);

      // Get user details for each message
      const messagesWithUserDetails = await Promise.all(
        messages.map(async (message) => {
          const user = await storage.getUser(message.userId);
          return {
            ...message,
            user: user ? {
              id: user.id,
              username: user.username,
              avatar: user.avatar
            } : null
          };
        })
      );

      res.json(messagesWithUserDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  // Send a message to a chat room
  app.post("/api/chat/rooms/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must belogged in to send messages" });
    }

    try {
      const roomId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Validate message data
      const messageData = insertChatMessageSchema.parse(req.body);

      // Check if room exists
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      // If it's a team chat, check if user is in the team
      if (room.type === "team" && room.relatedId) {
        const isTeamMember = await storage.isTeamMember(room.relatedId, userId);
        if (!isTeamMember) {
          return res.status(403).json({ error: "You are not a member of this team" });
        }
      }

      // If it's a tournament chat, check if user is in the tournament
      if (room.type === "tournament" && room.relatedId) {
        const isParticipant = await storage.getTournamentParticipant(room.relatedId, userId);
        if (!isParticipant) {
          return res.status(403).json({ error: "You are not a participant in this tournament" });
        }
      }

      // Create message
      const message = await storage.createChatMessage({
        roomId,
        userId,
        message: messageData.message,
        attachment: messageData.attachment
      });

      // Get user details
      const user = await storage.getUser(userId);

      const messageWithUserDetails = {
        ...message,
        user: {
          id: user!.id,
          username: user!.username,
          avatar: user!.avatar
        }
      };

      res.status(201).json(messageWithUserDetails);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ================ MARKETPLACE SYSTEM API ================

  // Get marketplace items
  app.get("/api/marketplace", async (req, res) => {
    try {
      const category = req.query.category as string;
      const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;

      let items = await storage.getMarketplaceItems();

      // Apply filters
      if (category) {
        items = items.filter(item => item.category === category);
      }
      if (minPrice !== undefined) {
        items = items.filter(item => item.price >= minPrice);
      }
      if (maxPrice !== undefined) {
        items = items.filter(item => item.price <= maxPrice);
      }

      // Get seller details for each item
      const itemsWithSellerDetails = await Promise.all(
        items.map(async (item) => {
          const seller = await storage.getUser(item.sellerId);
          return {
            ...item,
            seller: seller ? {
              id: seller.id,
              username: seller.username,
              avatar: seller.avatar
            } : null
          };
        })
      );

      res.json(itemsWithSellerDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marketplace items" });
    }
  });

  // Get marketplace item by ID
  app.get("/api/marketplace/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getMarketplaceItem(id);

      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Get seller details
      const seller = await storage.getUser(item.sellerId);

      const itemWithSellerDetails = {
        ...item,
        seller: seller ? {
          id: seller.id,
          username: seller.username,
          avatar: seller.avatar
        } : null
      };

      res.json(itemWithSellerDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marketplace item" });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}