# Appwrite Integration Guide for FireChamp

This guide will help you set up and configure Appwrite as a database for your FireChamp Free Fire tournament platform.

## Prerequisites

- [Appwrite Account](https://appwrite.io/) (Free tier available)
- [Appwrite CLI](https://appwrite.io/docs/command-line) (Optional, for running setup scripts)
- Node.js and npm installed

## Step 1: Create an Appwrite Project

1. Sign up or log in to [Appwrite Cloud](https://cloud.appwrite.io/)
2. Create a new project named "FireChamp"
3. Go to "API Keys" in the left sidebar
4. Create a new API key with the following permissions:
   - Databases: All Access
5. Copy the API key for later use

## Step 2: Update Environment Variables

1. Open the `.env` file in your FireChamp project
2. Update the following variables with your Appwrite credentials:

```
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=firechamp

# Application Configuration
USE_APPWRITE=true
CREATE_DEMO_DATA=true
```

Replace `your-project-id` and `your-api-key` with your actual Appwrite project ID and API key.

## Step 3: Set Up Appwrite Database and Collections

You can create the database and collections in two ways:

### Option 1: Using the Setup Script (Recommended)

If you have the Appwrite CLI installed and configured:

1. Make the setup script executable:
   ```
   chmod +x scripts/setup-appwrite.sh
   ```

2. Run the setup script:
   ```
   ./scripts/setup-appwrite.sh
   ```

This script will create:
- A database named "FireChamp Database"
- All required collections with proper attributes and indexes
- Permissions for all collections

### Option 2: Manual Setup via Appwrite Console

If you prefer to set up manually:

1. Go to your Appwrite Console
2. Navigate to "Databases" and create a new database named "FireChamp"
3. Create the following collections with the correct attributes:

#### Users Collection
- `id` (Integer, required)
- `username` (String, required)
- `password` (String, required)
- `email` (String, nullable)
- `phone` (String, nullable)
- `gameUid` (String, nullable)
- `avatar` (String, nullable)
- `balance` (Integer, default: 0)
- `coins` (Integer, default: 100)
- `referralCode` (String, nullable)
- `referredBy` (Integer, nullable)
- `createdAt` (DateTime, required)

#### Tournaments Collection
- `id` (Integer, required)
- `name` (String, required)
- `description` (String, nullable)
- `mode` (String, required)
- `map` (String, required)
- `status` (String, required, default: "upcoming")
- `rules` (String, nullable)
- `image` (String, nullable)
- `roomId` (String, nullable)
- `roomPassword` (String, nullable)
- `startTime` (DateTime, required)
- `entryFee` (Integer, required)
- `prizePool` (Integer, required)
- `perKillReward` (Integer, nullable)
- `maxPlayers` (Integer, required)
- `createdAt` (DateTime, required)

#### Tournament Participants Collection
- `id` (Integer, required)
- `tournamentId` (Integer, required)
- `userId` (Integer, required)
- `kills` (Integer, nullable)
- `rank` (Integer, nullable)
- `status` (String, required, default: "registered")
- `joinedAt` (DateTime, required)

#### Transactions Collection
- `id` (Integer, required)
- `userId` (Integer, required)
- `amount` (Integer, required)
- `type` (String, required)
- `status` (String, required)
- `reference` (String, nullable)
- `details` (JSON, nullable)
- `createdAt` (DateTime, required)

#### Leaderboard Entries Collection
- `id` (Integer, required)
- `userId` (Integer, required)
- `kills` (Integer, nullable)
- `wins` (Integer, nullable)
- `earnings` (Integer, nullable)
- `tournamentCount` (Integer, nullable)
- `period` (String, required)
- `updatedAt` (DateTime, required)

#### Referrals Collection
- `id` (Integer, required)
- `referrerId` (Integer, required)
- `referredId` (Integer, required)
- `status` (String, required, default: "pending")
- `reward` (Integer, nullable)
- `createdAt` (DateTime, required)

## Step 4: Seed Demo Data (Optional)

To populate your database with demo data:

1. Make the seeding script executable:
   ```
   chmod +x scripts/run-seed-appwrite.sh
   ```

2. Run the seeding script:
   ```
   ./scripts/run-seed-appwrite.sh
   ```

This will create:
- 3 demo users with different balances and stats
- 8 tournaments in various states (upcoming, ongoing, completed)
- Leaderboard entries across different time periods
- Transaction history for the demo users
- Tournament participation records
- Referral relationships

## Step 5: Start Your Application

With Appwrite configured, start your application:

```
npm run dev
```

## Troubleshooting

### Connection Issues
- Verify that your Appwrite Project ID and API Key are correct
- Ensure you're using `https://cloud.appwrite.io/v1` as the endpoint for Appwrite Cloud

### Permission Errors
- Check that your API Key has the correct permissions (Database: All Access)
- Verify that the collections have the proper read/write permissions

### Database Errors
- If you encounter errors with schema mismatches, run the setup script again
- For data-related issues, you can clear and reseed by running the seed script

## Switching Between Appwrite and In-Memory Storage

You can easily switch between Appwrite and in-memory storage by changing the `USE_APPWRITE` variable in your `.env` file:

- For development with in-memory storage: `USE_APPWRITE=false`
- For production with Appwrite: `USE_APPWRITE=true`

The application will automatically use the appropriate storage implementation based on this setting.