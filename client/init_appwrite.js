import { Client, Databases, Users, Permission, Role, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('../ai_service/.env') });

// Config
const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '697c7f9c00327290c59b';
const API_KEY = process.env.APPWRITE_API_KEY;

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const usersService = new Users(client);

const DATABASE_ID = 'main';
const ARTICLES_COLLECTION_ID = 'articles';
const COMMENTS_COLLECTION_ID = 'comments';
const RATINGS_COLLECTION_ID = 'ratings';
const NOTIFICATIONS_COLLECTION_ID = 'notifications';
const USERS_METADATA_COLLECTION_ID = 'users_metadata';
const AUDIT_LOGS_COLLECTION_ID = 'audit_logs';
const VIEWS_COLLECTION_ID = 'article_views';

async function createAttribute(collectionId, attr) {
    try {
        if (attr.type === 'string') {
            await databases.createStringAttribute(DATABASE_ID, collectionId, attr.key, attr.size, attr.required, attr.default);
        } else if (attr.type === 'double') {
            await databases.createFloatAttribute(DATABASE_ID, collectionId, attr.key, attr.required);
        } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(DATABASE_ID, collectionId, attr.key, attr.required, attr.min, attr.max, attr.default);
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
            { id: RATINGS_COLLECTION_ID, name: 'Ratings' },
            { id: NOTIFICATIONS_COLLECTION_ID, name: 'Notifications' },
            { id: USERS_METADATA_COLLECTION_ID, name: 'Users Metadata' },
            { id: AUDIT_LOGS_COLLECTION_ID, name: 'Audit Logs' },
            { id: VIEWS_COLLECTION_ID, name: 'Article Views' }
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

        // Attribute synchronization
        console.log('Ensuring schema integrity...');

        const articleAttrs = [
            { key: 'title', type: 'string', size: 500, required: true },
            { key: 'content', type: 'string', size: 50000, required: true },
            { key: 'authorName', type: 'string', size: 200, required: true },
            { key: 'authorId', type: 'string', size: 100, required: true },
            { key: 'status', type: 'string', size: 50, required: true },
            { key: 'aiLabel', type: 'string', size: 50, required: false },
            { key: 'aiScore', type: 'double', required: false },
            { key: 'createdAt', type: 'datetime', required: false },
            { key: 'category', type: 'string', size: 50, required: false },
            { key: 'imageUrl', type: 'string', size: 1000, required: false },
            { key: 'sourceUrl', type: 'string', size: 500, required: false },
            { key: 'editorFeedback', type: 'string', size: 2000, required: false },
            { key: 'aiReason', type: 'string', size: 5000, required: false },
            { key: 'aiCredibility', type: 'double', required: false },
            { key: 'aiClassification', type: 'string', size: 50, required: false },
            { key: 'aiEdgeCases', type: 'string', size: 2000, required: false },
            { key: 'viewsCount', type: 'integer', required: false, default: 0 },
            { key: 'sharesCount', type: 'integer', required: false, default: 0 }
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
            { key: 'interests', type: 'string', size: 2000, required: false },
            { key: 'createdAt', type: 'datetime', required: false }
        ];

        const commentAttrs = [
            { key: 'articleId', type: 'string', size: 100, required: true },
            { key: 'userId', type: 'string', size: 100, required: true },
            { key: 'authorName', type: 'string', size: 200, required: true },
            { key: 'content', type: 'string', size: 5000, required: true },
            { key: 'createdAt', type: 'datetime', required: false }
        ];

        const ratingAttrs = [
            { key: 'articleId', type: 'string', size: 100, required: true },
            { key: 'userId', type: 'string', size: 100, required: true },
            { key: 'rating', type: 'integer', required: true, min: 1, max: 5 },
            { key: 'createdAt', type: 'datetime', required: false }
        ];

        const auditLogAttrs = [
            { key: 'userId', type: 'string', size: 100, required: true },
            { key: 'userName', type: 'string', size: 200, required: true },
            { key: 'action', type: 'string', size: 100, required: true },
            { key: 'entityId', type: 'string', size: 100, required: false },
            { key: 'details', type: 'string', size: 2000, required: false },
            { key: 'timestamp', type: 'datetime', required: false }
        ];

        const viewAttrs = [
            { key: 'articleId', type: 'string', size: 100, required: true },
            { key: 'timestamp', type: 'datetime', required: true }
        ];

        console.log('Syncing Article Attributes...');
        for (const attr of articleAttrs) await createAttribute(ARTICLES_COLLECTION_ID, attr);

        console.log('Syncing Notification Attributes...');
        for (const attr of notificationAttrs) await createAttribute(NOTIFICATIONS_COLLECTION_ID, attr);

        console.log('Syncing User Metadata Attributes...');
        for (const attr of userMetadataAttrs) await createAttribute(USERS_METADATA_COLLECTION_ID, attr);

        console.log('Syncing Comment Attributes...');
        for (const attr of commentAttrs) await createAttribute(COMMENTS_COLLECTION_ID, attr);

        console.log('Syncing Rating Attributes...');
        for (const attr of ratingAttrs) await createAttribute(RATINGS_COLLECTION_ID, attr);

        console.log('Syncing Audit Log Attributes...');
        for (const attr of auditLogAttrs) await createAttribute(AUDIT_LOGS_COLLECTION_ID, attr);

        console.log('Syncing View Tracking Attributes...');
        for (const attr of viewAttrs) await createAttribute(VIEWS_COLLECTION_ID, attr);

        // --- NEW: Sync Existing Auth Users to Metadata ---
        console.log('Syncing Auth Users to Database Metadata...');
        try {
            const authUsers = await usersService.list();
            console.log(`Found ${authUsers.total} users in Auth service.`);

            for (const user of authUsers.users) {
                // Check if meta exists
                const existing = await databases.listDocuments(DATABASE_ID, USERS_METADATA_COLLECTION_ID, [
                    Query.equal('email', user.email)
                ]);

                if (existing.total === 0) {
                    console.log(`Creating metadata for ${user.email}...`);
                    await databases.createDocument(DATABASE_ID, USERS_METADATA_COLLECTION_ID, ID.unique(), {
                        name: user.name || 'User',
                        email: user.email,
                        role: (user.email.includes('admin') || user.email.includes('kenny')) ? 'ADMIN' : 'READER',
                        createdAt: user.$createdAt
                    });
                } else {
                    console.log(`Metadata for ${user.email} already exists.`);
                }
            }
        } catch (syncErr) {
            console.log('User sync failed (might be missing indices):', syncErr.message);
        }
    } catch (error) {
        console.error('Error initializing Appwrite:', error);
    }
}

init();

