# FireChamp - Free Fire Tournament Platform

FireChamp is a dynamic platform for Free Fire gaming tournaments where gamers can join competitions, track their performance, and win rewards.

## Features

- User registration and authentication
- Tournament browsing and registration
- Tournament details with rules and prize pools
- Live tournament tracking
- Leaderboards with player rankings
- Wallet system for tournament entries and winnings
- Referral system to earn rewards

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: Express.js
- **Database**: Appwrite (or in-memory storage for development)

## Getting Started

### Prerequisites

- Node.js (v16+)
- Appwrite account (optional, for production)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your configuration:
   ```bash
   # Appwrite Configuration
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   APPWRITE_DATABASE_ID=your-database-id

   # Session Configuration
   SESSION_SECRET=your-session-secret

   # Collection IDs
   APPWRITE_USERS_COLLECTION_ID=users
   APPWRITE_TOURNAMENTS_COLLECTION_ID=tournaments
   APPWRITE_PARTICIPANTS_COLLECTION_ID=tournament_participants
   APPWRITE_TRANSACTIONS_COLLECTION_ID=transactions
   APPWRITE_LEADERBOARD_COLLECTION_ID=leaderboard_entries
   APPWRITE_REFERRALS_COLLECTION_ID=referrals

   # Application Configuration
   USE_APPWRITE=false  # Set to true to use Appwrite, false for in-memory
   CREATE_DEMO_DATA=true
   ```

### Using In-Memory Storage (Development)

For development and testing, the application uses an in-memory database by default. This is the quickest way to get started and doesn't require any external services.

To use in-memory storage:
1. Set `USE_APPWRITE=false` in your `.env` file
2. Run the application:
   ```bash
   npm run dev
   ```

### Using Appwrite (Production)

For production use, it's recommended to use Appwrite as the database provider.

#### Setting up Appwrite:

1. Create an Appwrite account at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project
3. Create an API key with all permissions
4. Update your `.env` file with your Appwrite credentials
5. Run the setup script to create collections and attributes:
   ```bash
   chmod +x scripts/setup-appwrite.sh
   ./scripts/setup-appwrite.sh
   ```
6. Seed the database with demo data:
   ```bash
   chmod +x scripts/run-seed-appwrite.sh
   ./scripts/run-seed-appwrite.sh
   ```
7. Set `USE_APPWRITE=true` in your `.env` file
8. Start the application:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following collections:

- **Users**: Store user accounts and profiles
- **Tournaments**: Store tournament details and rules
- **Tournament Participants**: Track users registered for tournaments
- **Transactions**: Track all financial transactions
- **Leaderboard Entries**: Store player rankings for different time periods
- **Referrals**: Track user referrals and rewards

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License