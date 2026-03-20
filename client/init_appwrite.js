import { Client, Databases, Permission, Role, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./ai_service/.env') });

// Config
const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '697c7f9c00327290c59b';
const API_KEY = process.env.APPWRITE_API_KEY;

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'main';
const ARTICLES_COLLECTION_ID = 'articles';
const COMMENTS_COLLECTION_ID = 'comments';
const NOTIFICATIONS_COLLECTION_ID = 'notifications';
const USERS_METADATA_COLLECTION_ID = 'users_metadata';

async function createAttribute(collectionId, attr) {
    try {
        if (attr.type === 'string') {
            await databases.createStringAttribute(DATABASE_ID, collectionId, attr.key, attr.size, attr.required, attr.default);
        } else if (attr.type === 'double') {
            await databases.createFloatAttribute(DATABASE_ID, collectionId, attr.key, attr.required);
        } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(DATABASE_ID, collectionId, attr.key, attr.required);
        } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(DATABASE_ID, collectionId, attr.key, attr.required);
        }
        console.log(`Attribute "${attr.key}" created in "${collectionId}".`);
    } catch (error) {
        console.log(`Attribute "${attr.key}" in "${collectionId}" already exists or failed: ${error.message}`);
    }
    await new Promise(r => setTimeout(r, 600));
}

async function init() {
    try {
        console.log('Checking Database...');
        try {
            await databases.get(DATABASE_ID);
        } catch (e) {
            console.log('Creating Database "main"...');
            await databases.create(DATABASE_ID, 'Main Database');
        }

        const collections = [
            { id: ARTICLES_COLLECTION_ID, name: 'Articles' },
            { id: COMMENTS_COLLECTION_ID, name: 'Comments' },
            { id: NOTIFICATIONS_COLLECTION_ID, name: 'Notifications' },
            { id: USERS_METADATA_COLLECTION_ID, name: 'Users Metadata' }
        ];

        for (const col of collections) {
            try {
                await databases.getCollection(DATABASE_ID, col.id);
                console.log(`Collection "${col.id}" already exists.`);
            } catch (e) {
                console.log(`Creating Collection "${col.id}"...`);
                await databases.createCollection(DATABASE_ID, col.id, col.name, [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]);
            }
        }

        // Increase size for content in articles - Need to delete and recreate if exists
        console.log('Updating Article content size...');
        try {
            await databases.deleteAttribute(DATABASE_ID, ARTICLES_COLLECTION_ID, 'content');
            console.log('Old content attribute deleted.');
            await new Promise(r => setTimeout(r, 2000)); // Wait for deletion to propagate
        } catch (e) {}

        const articleAttrs = [
            { key: 'title', type: 'string', size: 500, required: true },
            { key: 'content', type: 'string', size: 25000, required: true },
            { key: 'authorName', type: 'string', size: 200, required: true },
            { key: 'authorId', type: 'string', size: 100, required: true },
            { key: 'status', type: 'string', size: 50, required: true },
            { key: 'aiLabel', type: 'string', size: 50, required: false },
            { key: 'aiScore', type: 'double', required: false },
            { key: 'createdAt', type: 'datetime', required: false },
            { key: 'category', type: 'string', size: 50, required: false },
            { key: 'imageUrl', type: 'string', size: 2000, required: false },
            { key: 'sourceUrl', type: 'string', size: 1000, required: false },
            { key: 'editorFeedback', type: 'string', size: 5000, required: false }
        ];

        const notificationAttrs = [
            { key: 'userId', type: 'string', size: 100, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'message', type: 'string', size: 1000, required: true },
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'isRead', type: 'boolean', required: true, default: false },
            { key: 'createdAt', type: 'datetime', required: false }
        ];

        const userMetadataAttrs = [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'role', type: 'string', size: 50, required: true },
            { key: 'createdAt', type: 'datetime', required: false }
        ];

        console.log('Syncing Article Attributes...');
        for (const attr of articleAttrs) await createAttribute(ARTICLES_COLLECTION_ID, attr);

        console.log('Syncing Notification Attributes...');
        for (const attr of notificationAttrs) await createAttribute(NOTIFICATIONS_COLLECTION_ID, attr);

        console.log('Syncing User Metadata Attributes...');
        for (const attr of userMetadataAttrs) await createAttribute(USERS_METADATA_COLLECTION_ID, attr);

        console.log('Setup Complete!');
    } catch (error) {
        console.error('Error initializing Appwrite:', error);
    }
}

init();

