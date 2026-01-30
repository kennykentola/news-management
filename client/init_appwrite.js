import { Client, Databases, Permission, Role, ID } from 'node-appwrite';

// Config
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1'; // Update if needed
const PROJECT_ID = '697c7f9c00327290c59b';
const API_KEY = process.argv[2]; // Pass as argument

if (!API_KEY) {
    console.error('Please provide your Appwrite API Key as an argument.');
    console.error('Usage: node init_appwrite.js <YOUR_API_KEY>');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'main';
const ARTICLES_COLLECTION_ID = 'articles';
const COMMENTS_COLLECTION_ID = 'comments';

async function init() {
    try {
        console.log('Checking Database...');
        try {
            await databases.get(DATABASE_ID);
            console.log('Database "main" already exists.');
        } catch (e) {
            console.log('Creating Database "main"...');
            await databases.create(DATABASE_ID, 'Main Database');
        }

        console.log('Checking Collection "articles"...');
        try {
            await databases.getCollection(DATABASE_ID, ARTICLES_COLLECTION_ID);
            console.log('Collection "articles" already exists.');
        } catch (e) {
            console.log('Creating Collection "articles"...');
            await databases.createCollection(DATABASE_ID, ARTICLES_COLLECTION_ID, 'Articles');
        }

        console.log('Checking Collection "comments"...');
        try {
            await databases.getCollection(DATABASE_ID, COMMENTS_COLLECTION_ID);
            console.log('Collection "comments" already exists.');
        } catch (e) {
            console.log('Creating Collection "comments"...');
            await databases.createCollection(DATABASE_ID, COMMENTS_COLLECTION_ID, 'Comments');
        }

        // Attributes
        console.log('Ensuring Attributes...');
        const attributes = [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 5000, required: true },
            { key: 'authorName', type: 'string', size: 100, required: true },
            { key: 'authorId', type: 'string', size: 100, required: true },
            { key: 'status', type: 'string', size: 50, required: true },
            { key: 'aiLabel', type: 'string', size: 50, required: false },
            { key: 'aiScore', type: 'double', required: false },
            { key: 'createdAt', type: 'datetime', required: false },
            // New Attributes for Gap Analysis
            { key: 'sourceUrl', type: 'string', size: 1000, required: false },
            { key: 'reportReason', type: 'string', size: 1000, required: false },
            { key: 'publishedAt', type: 'datetime', required: false },
            // Final Spec Alignment
            { key: 'category', type: 'string', size: 50, required: false }, // e.g. Politics, Tech
            { key: 'imageUrl', type: 'string', size: 1000, required: false }, // URL to image
            { key: 'editorFeedback', type: 'string', size: 2000, required: false } // Editor instructions
        ];

        // We can't easily check internal attribute existence without listing them, 
        // but creating duplicates usually throws 409 which is fine to ignore or handle.
        // For simplicity, we just try to create them.



        const commentAttributes = [
            { key: 'content', type: 'string', size: 1000, required: true },
            { key: 'articleId', type: 'string', size: 100, required: true },
            { key: 'authorName', type: 'string', size: 100, required: true },
            { key: 'createdAt', type: 'datetime', required: false }
        ];

        // Ensure Attributes for Articles
        console.log('Ensuring Article Attributes...');
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DATABASE_ID, ARTICLES_COLLECTION_ID, attr.key, attr.size, attr.required, attr.default);
                } else if (attr.type === 'double') {
                    await databases.createFloatAttribute(DATABASE_ID, ARTICLES_COLLECTION_ID, attr.key, attr.required);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(DATABASE_ID, ARTICLES_COLLECTION_ID, attr.key, attr.required);
                }
                console.log(`Attribute "${attr.key}" created.`);
            } catch (error) {
                console.log(`Attribute "${attr.key}" already exists or failed: ${error.message}`);
            }
            await new Promise(r => setTimeout(r, 500));
        }

        // Ensure Attributes for Comments
        console.log('Ensuring Comment Attributes...');
        for (const attr of commentAttributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, attr.key, attr.size, attr.required, attr.default);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, attr.key, attr.required);
                }
                console.log(`Attribute "${attr.key}" created.`);
            } catch (error) {
                console.log(`Attribute "${attr.key}" already exists or failed: ${error.message}`);
            }
            await new Promise(r => setTimeout(r, 500));
        }

        console.log('Updating Permissions...');
        try {
            await databases.updateCollection(
                DATABASE_ID,
                ARTICLES_COLLECTION_ID,
                'Articles',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('Articles permissions updated (Public Read).');

            await databases.updateCollection(
                DATABASE_ID,
                COMMENTS_COLLECTION_ID,
                'Comments',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('Comments permissions updated (Public Read).');
        } catch (e) {
            console.error('Error updating permissions (might need API Key with scope):', e.message);
        }

        console.log('Setup Complete!');
        console.log('-----------------------------------');
        console.log('Database ID:', DATABASE_ID);
        console.log('Collection ID:', ARTICLES_COLLECTION_ID);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Error initializing Appwrite:', error);
    }
}

init();
