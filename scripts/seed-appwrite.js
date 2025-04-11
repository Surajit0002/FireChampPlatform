// This script seeds the Appwrite database with demo data
// Run with: npm run seed-appwrite
// Make sure to set USE_APPWRITE=true in .env file

require('dotenv').config();
const { Client, Databases, ID, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '');

// For server-side use, we need to set a key
if (process.env.APPWRITE_API_KEY) {
  // @ts-ignore - The Client type doesn't expose setKey in the TypeScript types
  client.setKey(process.env.APPWRITE_API_KEY);
}

// Initialize Databases service
const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID || '';

// Collection IDs
const collections = {
  users: process.env.APPWRITE_USERS_COLLECTION_ID || 'users',
  tournaments: process.env.APPWRITE_TOURNAMENTS_COLLECTION_ID || 'tournaments', 
  tournamentParticipants: process.env.APPWRITE_PARTICIPANTS_COLLECTION_ID || 'tournament_participants',
  transactions: process.env.APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',
  leaderboardEntries: process.env.APPWRITE_LEADERBOARD_COLLECTION_ID || 'leaderboard_entries',
  referrals: process.env.APPWRITE_REFERRALS_COLLECTION_ID || 'referrals'
};

// Helper to generate random referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Create tournaments
async function createDemoTournaments() {
  console.log("Creating demo tournaments...");
  const now = new Date();
  
  // Tournament data
  const tournamentData = [
    {
      id: 1,
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
      roomPassword: "fire123",
      createdAt: new Date()
    },
    {
      id: 2,
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
      roomPassword: "duos789",
      createdAt: new Date()
    },
    {
      id: 3,
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
      roomPassword: "squad456",
      createdAt: new Date()
    },
    {
      id: 4,
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
      roomPassword: "night888",
      createdAt: new Date()
    },
    {
      id: 5,
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
      roomPassword: "snow246",
      createdAt: new Date()
    },
    {
      id: 6,
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
      roomPassword: "pro321",
      createdAt: new Date()
    },
    {
      id: 7,
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
      roomPassword: "weekend123",
      createdAt: new Date()
    },
    {
      id: 8,
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
      roomPassword: "newbie456",
      createdAt: new Date()
    }
  ];

  // First clear any existing tournaments
  try {
    const existingTournaments = await databases.listDocuments(
      databaseId,
      collections.tournaments
    );
    
    for (const tournament of existingTournaments.documents) {
      await databases.deleteDocument(
        databaseId,
        collections.tournaments,
        tournament.$id
      );
    }
    
    console.log(`Cleared ${existingTournaments.documents.length} existing tournaments`);
  } catch (error) {
    console.error("Error clearing existing tournaments:", error);
  }
  
  // Create new tournament data
  for (const tournament of tournamentData) {
    try {
      await databases.createDocument(
        databaseId,
        collections.tournaments,
        ID.unique(),
        tournament
      );
    } catch (error) {
      console.error(`Error creating tournament ${tournament.name}:`, error);
    }
  }
  
  console.log(`Created ${tournamentData.length} tournaments`);
}

// Create demo leaderboard entries
async function createDemoLeaderboard() {
  console.log("Creating demo leaderboard entries...");
  const periods = ["daily", "weekly", "monthly", "all-time"];
  
  // First clear any existing leaderboard entries
  try {
    const existingEntries = await databases.listDocuments(
      databaseId,
      collections.leaderboardEntries
    );
    
    for (const entry of existingEntries.documents) {
      await databases.deleteDocument(
        databaseId,
        collections.leaderboardEntries,
        entry.$id
      );
    }
    
    console.log(`Cleared ${existingEntries.documents.length} existing leaderboard entries`);
  } catch (error) {
    console.error("Error clearing existing leaderboard entries:", error);
  }
  
  // Create new leaderboard entries
  let entriesCreated = 0;
  for (const period of periods) {
    for (let i = 1; i <= 20; i++) {
      try {
        await databases.createDocument(
          databaseId,
          collections.leaderboardEntries,
          ID.unique(),
          {
            id: entriesCreated + 1,
            userId: i,
            kills: Math.floor(Math.random() * 50) + 10,
            wins: Math.floor(Math.random() * 10) + 1,
            earnings: (Math.floor(Math.random() * 500) + 100) * 10,
            tournamentCount: Math.floor(Math.random() * 20) + 5,
            period,
            updatedAt: new Date()
          }
        );
        entriesCreated++;
      } catch (error) {
        console.error(`Error creating leaderboard entry for userId ${i} and period ${period}:`, error);
      }
    }
  }
  
  console.log(`Created ${entriesCreated} leaderboard entries`);
}

// Create demo users
async function createDemoUsers() {
  console.log("Creating demo users...");
  
  // Demo user data
  const userData = [
    {
      id: 1,
      username: "proGamer123",
      password: "$2b$10$xJT3fkv1ufx5H.KtCzHBYeEJ8NsB1ztwa.M6Eh3DBxm67Hz5AD/aS", // hashed "password123"
      email: "progamer@example.com",
      phone: "1234567890",
      gameUid: "123456789",
      avatar: null,
      balance: 1500,
      coins: 750,
      referralCode: generateReferralCode(),
      referredBy: null,
      createdAt: new Date()
    },
    {
      id: 2,
      username: "fireQueen",
      password: "$2b$10$xJT3fkv1ufx5H.KtCzHBYeEJ8NsB1ztwa.M6Eh3DBxm67Hz5AD/aS", // hashed "password123"
      email: "firequeen@example.com",
      phone: "9876543210",
      gameUid: "987654321",
      avatar: null,
      balance: 2200,
      coins: 1200,
      referralCode: generateReferralCode(),
      referredBy: null,
      createdAt: new Date()
    },
    {
      id: 3,
      username: "sniper_king",
      password: "$2b$10$xJT3fkv1ufx5H.KtCzHBYeEJ8NsB1ztwa.M6Eh3DBxm67Hz5AD/aS", // hashed "password123"
      email: "sniper@example.com",
      phone: "5556667777",
      gameUid: "555667777",
      avatar: null,
      balance: 800,
      coins: 350,
      referralCode: generateReferralCode(),
      referredBy: 1,
      createdAt: new Date()
    }
  ];

  // First clear any existing users
  try {
    const existingUsers = await databases.listDocuments(
      databaseId,
      collections.users
    );
    
    for (const user of existingUsers.documents) {
      await databases.deleteDocument(
        databaseId,
        collections.users,
        user.$id
      );
    }
    
    console.log(`Cleared ${existingUsers.documents.length} existing users`);
  } catch (error) {
    console.error("Error clearing existing users:", error);
  }
  
  // Create new users
  for (const user of userData) {
    try {
      await databases.createDocument(
        databaseId,
        collections.users,
        ID.unique(),
        user
      );
    } catch (error) {
      console.error(`Error creating user ${user.username}:`, error);
    }
  }
  
  console.log(`Created ${userData.length} users`);
}

// Create demo transactions
async function createDemoTransactions() {
  console.log("Creating demo transactions...");
  
  // Transaction data
  const transactionData = [
    {
      id: 1,
      userId: 1,
      amount: 500,
      type: "deposit",
      status: "completed",
      reference: "Deposit via PayPal",
      details: { paymentMethod: "PayPal", transactionId: "PP12345" },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5) // 5 days ago
    },
    {
      id: 2,
      userId: 1,
      amount: 50,
      type: "tournament_entry",
      status: "completed",
      reference: "Entry fee for Tournament #1",
      details: { tournamentId: 1 },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3) // 3 days ago
    },
    {
      id: 3,
      userId: 1,
      amount: 250,
      type: "tournament_win",
      status: "completed",
      reference: "Prize from Tournament #6",
      details: { tournamentId: 6, rank: 3 },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 1) // 1 day ago
    },
    {
      id: 4,
      userId: 2,
      amount: 1000,
      type: "deposit",
      status: "completed",
      reference: "Deposit via Credit Card",
      details: { paymentMethod: "Credit Card", last4: "4242" },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 10) // 10 days ago
    },
    {
      id: 5,
      userId: 2,
      amount: 75,
      type: "tournament_entry",
      status: "completed",
      reference: "Entry fee for Tournament #2",
      details: { tournamentId: 2 },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2) // 2 days ago
    },
    {
      id: 6,
      userId: 2,
      amount: 1500,
      type: "tournament_win",
      status: "completed",
      reference: "Prize from Tournament #7",
      details: { tournamentId: 7, rank: 1 },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 1) // 1 day ago
    },
    {
      id: 7,
      userId: 3,
      amount: 300,
      type: "deposit",
      status: "completed",
      reference: "Deposit via UPI",
      details: { paymentMethod: "UPI", upiId: "user@upi" },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 7) // 7 days ago
    },
    {
      id: 8,
      userId: 3,
      amount: 100,
      type: "referral",
      status: "completed",
      reference: "Referral Bonus",
      details: { referrerId: 1, referredId: 3 },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 6) // 6 days ago
    }
  ];

  // First clear any existing transactions
  try {
    const existingTransactions = await databases.listDocuments(
      databaseId,
      collections.transactions
    );
    
    for (const transaction of existingTransactions.documents) {
      await databases.deleteDocument(
        databaseId,
        collections.transactions,
        transaction.$id
      );
    }
    
    console.log(`Cleared ${existingTransactions.documents.length} existing transactions`);
  } catch (error) {
    console.error("Error clearing existing transactions:", error);
  }
  
  // Create new transactions
  for (const transaction of transactionData) {
    try {
      await databases.createDocument(
        databaseId,
        collections.transactions,
        ID.unique(),
        transaction
      );
    } catch (error) {
      console.error(`Error creating transaction:`, error);
    }
  }
  
  console.log(`Created ${transactionData.length} transactions`);
}

// Create demo tournament participants
async function createDemoParticipants() {
  console.log("Creating demo tournament participants...");
  
  // Participant data
  const participantData = [
    {
      id: 1,
      tournamentId: 1,
      userId: 1,
      kills: null,
      rank: null,
      status: "registered",
      joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3) // 3 days ago
    },
    {
      id: 2,
      tournamentId: 2,
      userId: 2,
      kills: null,
      rank: null,
      status: "registered",
      joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2) // 2 days ago
    },
    {
      id: 3,
      tournamentId: 6,
      userId: 1,
      kills: 12,
      rank: 3,
      status: "completed",
      joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5) // 5 days ago
    },
    {
      id: 4,
      tournamentId: 7,
      userId: 2,
      kills: 15,
      rank: 1,
      status: "completed",
      joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 7) // 7 days ago
    },
    {
      id: 5,
      tournamentId: 3,
      userId: 3,
      kills: null,
      rank: null,
      status: "registered",
      joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 1) // 1 day ago
    }
  ];

  // First clear any existing participants
  try {
    const existingParticipants = await databases.listDocuments(
      databaseId,
      collections.tournamentParticipants
    );
    
    for (const participant of existingParticipants.documents) {
      await databases.deleteDocument(
        databaseId,
        collections.tournamentParticipants,
        participant.$id
      );
    }
    
    console.log(`Cleared ${existingParticipants.documents.length} existing participants`);
  } catch (error) {
    console.error("Error clearing existing participants:", error);
  }
  
  // Create new participants
  for (const participant of participantData) {
    try {
      await databases.createDocument(
        databaseId,
        collections.tournamentParticipants,
        ID.unique(),
        participant
      );
    } catch (error) {
      console.error(`Error creating participant:`, error);
    }
  }
  
  console.log(`Created ${participantData.length} participants`);
}

// Create demo referrals
async function createDemoReferrals() {
  console.log("Creating demo referrals...");
  
  // Referral data
  const referralData = [
    {
      id: 1,
      referrerId: 1,
      referredId: 3,
      status: "completed",
      reward: 100,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 6) // 6 days ago
    }
  ];

  // First clear any existing referrals
  try {
    const existingReferrals = await databases.listDocuments(
      databaseId,
      collections.referrals
    );
    
    for (const referral of existingReferrals.documents) {
      await databases.deleteDocument(
        databaseId,
        collections.referrals,
        referral.$id
      );
    }
    
    console.log(`Cleared ${existingReferrals.documents.length} existing referrals`);
  } catch (error) {
    console.error("Error clearing existing referrals:", error);
  }
  
  // Create new referrals
  for (const referral of referralData) {
    try {
      await databases.createDocument(
        databaseId,
        collections.referrals,
        ID.unique(),
        referral
      );
    } catch (error) {
      console.error(`Error creating referral:`, error);
    }
  }
  
  console.log(`Created ${referralData.length} referrals`);
}

// Main function to seed all data
async function seedDatabase() {
  console.log("Starting database seeding...");
  
  // Create all the demo data in sequence
  try {
    await createDemoUsers();
    await createDemoTournaments();
    await createDemoLeaderboard();
    await createDemoTransactions();
    await createDemoParticipants();
    await createDemoReferrals();
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seeding process
seedDatabase().catch(console.error);