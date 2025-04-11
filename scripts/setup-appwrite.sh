#!/bin/bash

# This script creates the necessary Appwrite database and collections for FireChamp
# You need to have the Appwrite CLI installed and configured with your API key

# Exit on error
set -e

# Load environment variables
source .env

echo "Setting up Appwrite database and collections for FireChamp..."

# Create database if it doesn't exist
echo "Creating database..."
appwrite databases create --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --name="FireChamp Database"

# Create users collection
echo "Creating users collection..."
appwrite databases createCollection \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" \
  --name="Users" \
  --permissions="collection"

# Create users attributes
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="username" --size=255 --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="password" --size=255 --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="email" --size=255 --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="phone" --size=20 --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="gameUid" --size=50 --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="avatar" --size=255 --required=false
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="id" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="balance" --required=true --default=0
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="coins" --required=true --default=100
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="referralCode" --size=20 --required=false
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="referredBy" --required=false
appwrite databases createDatetimeAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" --key="createdAt" --required=true

# Create index for username
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" \
  --key="username_index" \
  --type="key" \
  --attributes='["username"]' \
  --orders='["ASC"]'

# Create index for id
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_USERS_COLLECTION_ID:-users}" \
  --key="id_index" \
  --type="key" \
  --attributes='["id"]' \
  --orders='["ASC"]'

# Create tournaments collection
echo "Creating tournaments collection..."
appwrite databases createCollection \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" \
  --name="Tournaments" \
  --permissions="collection"

# Create tournaments attributes
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="id" --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="name" --size=255 --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="description" --size=1000 --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="mode" --size=10 --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="map" --size=50 --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="status" --size=20 --required=true --default="upcoming"
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="rules" --size=2000 --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="image" --size=255 --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="roomId" --size=50 --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="roomPassword" --size=50 --required=false
appwrite databases createDatetimeAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="startTime" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="entryFee" --required=true --default=0
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="prizePool" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="perKillReward" --required=false
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="maxPlayers" --required=true
appwrite databases createDatetimeAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" --key="createdAt" --required=true

# Create index for id
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" \
  --key="id_index" \
  --type="key" \
  --attributes='["id"]' \
  --orders='["ASC"]'

# Create index for status
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_TOURNAMENTS_COLLECTION_ID:-tournaments}" \
  --key="status_index" \
  --type="key" \
  --attributes='["status"]' \
  --orders='["ASC"]'

# Create tournament_participants collection
echo "Creating tournament participants collection..."
appwrite databases createCollection \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" \
  --name="Tournament Participants" \
  --permissions="collection"

# Create tournament_participants attributes
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" --key="id" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" --key="tournamentId" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" --key="userId" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" --key="kills" --required=false
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" --key="rank" --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" --key="status" --size=20 --required=true --default="registered"
appwrite databases createDatetimeAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" --key="joinedAt" --required=true

# Create index for tournamentId and userId
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" \
  --key="tournament_user_index" \
  --type="key" \
  --attributes='["tournamentId", "userId"]' \
  --orders='["ASC", "ASC"]'

# Create index for id
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_PARTICIPANTS_COLLECTION_ID:-tournament_participants}" \
  --key="id_index" \
  --type="key" \
  --attributes='["id"]' \
  --orders='["ASC"]'

# Create transactions collection
echo "Creating transactions collection..."
appwrite databases createCollection \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" \
  --name="Transactions" \
  --permissions="collection"

# Create transactions attributes
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" --key="id" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" --key="userId" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" --key="amount" --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" --key="type" --size=20 --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" --key="status" --size=20 --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" --key="reference" --size=255 --required=false
appwrite databases createJsonAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" --key="details" --required=false
appwrite databases createDatetimeAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" --key="createdAt" --required=true

# Create index for userId
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_TRANSACTIONS_COLLECTION_ID:-transactions}" \
  --key="user_index" \
  --type="key" \
  --attributes='["userId"]' \
  --orders='["ASC"]'

# Create leaderboard_entries collection
echo "Creating leaderboard entries collection..."
appwrite databases createCollection \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" \
  --name="Leaderboard Entries" \
  --permissions="collection"

# Create leaderboard_entries attributes
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" --key="id" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" --key="userId" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" --key="kills" --required=false
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" --key="wins" --required=false
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" --key="earnings" --required=false
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" --key="tournamentCount" --required=false
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" --key="period" --size=20 --required=true
appwrite databases createDatetimeAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" --key="updatedAt" --required=true

# Create index for userId and period
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" \
  --key="user_period_index" \
  --type="key" \
  --attributes='["userId", "period"]' \
  --orders='["ASC", "ASC"]'

# Create index for period
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_LEADERBOARD_COLLECTION_ID:-leaderboard_entries}" \
  --key="period_index" \
  --type="key" \
  --attributes='["period"]' \
  --orders='["ASC"]'

# Create referrals collection
echo "Creating referrals collection..."
appwrite databases createCollection \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" \
  --name="Referrals" \
  --permissions="collection"

# Create referrals attributes
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" --key="id" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" --key="referrerId" --required=true
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" --key="referredId" --required=true
appwrite databases createStringAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" --key="status" --size=20 --required=true --default="pending"
appwrite databases createIntegerAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" --key="reward" --required=false
appwrite databases createDatetimeAttribute --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" --key="createdAt" --required=true

# Create index for referrerId
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" \
  --key="referrer_index" \
  --type="key" \
  --attributes='["referrerId"]' \
  --orders='["ASC"]'

# Create index for id
appwrite databases createIndex \
  --databaseId="${APPWRITE_DATABASE_ID:-firechamp}" \
  --collectionId="${APPWRITE_REFERRALS_COLLECTION_ID:-referrals}" \
  --key="id_index" \
  --type="key" \
  --attributes='["id"]' \
  --orders='["ASC"]'

echo "Successfully set up Appwrite database and collections for FireChamp!"
echo "You can now set USE_APPWRITE=true in your .env file to use Appwrite as your database."