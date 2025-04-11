#!/bin/bash

# This script runs the seed-appwrite-cjs.js script to populate the Appwrite database with demo data
echo "Running Appwrite database seeding script..."
node scripts/seed-appwrite-cjs.js

echo "To use Appwrite in your application, set USE_APPWRITE=true in your .env file"