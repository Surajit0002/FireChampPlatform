import { Client, Databases, ID, Query } from 'appwrite';

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

// Helper functions for common operations
export const appwriteService = {
  // Generic document creation with ID generation
  async createDocument(collectionId: string, data: any) {
    try {
      return await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error(`Error creating document in ${collectionId}:`, error);
      throw error;
    }
  },

  // Generic document retrieval by ID
  async getDocument(collectionId: string, documentId: string) {
    try {
      return await databases.getDocument(
        databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error(`Error getting document from ${collectionId}:`, error);
      return null;
    }
  },

  // Generic document update
  async updateDocument(collectionId: string, documentId: string, data: any) {
    try {
      return await databases.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data
      );
    } catch (error) {
      console.error(`Error updating document in ${collectionId}:`, error);
      throw error;
    }
  },

  // Generic document deletion
  async deleteDocument(collectionId: string, documentId: string) {
    try {
      return await databases.deleteDocument(
        databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error(`Error deleting document from ${collectionId}:`, error);
      throw error;
    }
  },

  // Generic list documents with optional queries
  async listDocuments(collectionId: string, queries: any[] = []) {
    try {
      return await databases.listDocuments(
        databaseId,
        collectionId,
        queries
      );
    } catch (error) {
      console.error(`Error listing documents from ${collectionId}:`, error);
      return { documents: [] };
    }
  },

  // Find document by a specific attribute
  async findDocumentByAttribute(collectionId: string, attribute: string, value: any) {
    try {
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal(attribute, value)]
      );
      
      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
      console.error(`Error finding document by attribute in ${collectionId}:`, error);
      return null;
    }
  },

  // Specialized search with multiple conditions
  async advancedSearch(collectionId: string, conditions: Array<any>) {
    try {
      return await databases.listDocuments(
        databaseId,
        collectionId,
        conditions
      );
    } catch (error) {
      console.error(`Error performing advanced search in ${collectionId}:`, error);
      return { documents: [] };
    }
  },

  // Get collection references for easier access
  collections
};

export default appwriteService;