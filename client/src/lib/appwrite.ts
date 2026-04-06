import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

// Source of Truth: .env (with fallbacks to current active project)
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '697c7f9c00327290c59b';

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Environment-driven Resource Configuration
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '679c803200155a02239e';
export const COLLECTION_ID_ARTICLES = import.meta.env.VITE_APPWRITE_COLLECTION_ID_ARTICLES || '679c81a2003c4f923b7e';
export const COMMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID_COMMENTS || '67c7e9740003cb0657df';
export const COLLECTION_ID_USERS_METADATA = import.meta.env.VITE_APPWRITE_COLLECTION_ID_USERS_METADATA || '67c8052100234c89437b';
export const BUCKET_ID_IMAGES = import.meta.env.VITE_APPWRITE_BUCKET_ID || '67e80f7d002e11894a73';

export { client };
export const NOTIFICATIONS_COLLECTION_ID = 'notifications';
