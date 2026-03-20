import { Client, Account, Databases } from 'appwrite';

export const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const project = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (endpoint && project) {
    client
        .setEndpoint(endpoint)
        .setProject(project);
} else {
    console.error('Appwrite environment variables are missing! Please check .env file.');
}

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'main'; // Fallback for dev
export const COLLECTION_ID_ARTICLES = import.meta.env.VITE_APPWRITE_COLLECTION_ID_ARTICLES || 'articles';
export const COMMENTS_COLLECTION_ID = 'comments';
export const NOTIFICATIONS_COLLECTION_ID = 'notifications';

