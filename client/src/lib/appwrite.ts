import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

// Source of Truth: .env (with fallbacks to verified human-readable IDs)
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '697c7f9c00327290c59b';

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Environment-driven Resource Configuration (Using Verified Human-Readable IDs)
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'main';
export const COLLECTION_ID_ARTICLES = import.meta.env.VITE_APPWRITE_COLLECTION_ID_ARTICLES || 'articles';
export const COLLECTION_ID_USERS_METADATA = import.meta.env.VITE_APPWRITE_COLLECTION_ID_USERS_METADATA || 'users_metadata';
export const COMMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID_COMMENTS || 'comments';
export const RATINGS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID_RATINGS || 'ratings';
export const NOTIFICATIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID_NOTIFICATIONS || 'notifications';
export const AUDIT_LOGS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID_AUDIT_LOGS || 'audit_logs';
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'article_images';
export const BUCKET_ID_IMAGES = BUCKET_ID; // Restore legacy export for component compatibility

export { client };
