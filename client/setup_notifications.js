import { Client, Databases, Permission, Role } from 'node-appwrite';

// Config
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '697c7f9c00327290c59b';
const API_KEY = process.argv[2];

if (!API_KEY) {
    console.error('Please provide your Appwrite API Key as an argument.');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'main';
const NOTIFICATIONS_COLLECTION_ID = 'notifications';

async function init() {
    try {
        console.log('Checking Collection "notifications"...');
        try {
            await databases.getCollection(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID);
            console.log('Collection "notifications" already exists.');
        } catch (e) {
            console.log('Creating Collection "notifications"...');
            await databases.createCollection(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, 'Notifications');
        }

        console.log('Ensuring Attributes...');
        const attributes = [
            { key: 'userId', type: 'string', size: 100, required: true },
            { key: 'title', type: 'string', size: 200, required: true },
            { key: 'message', type: 'string', size: 1000, required: true },
            { key: 'type', type: 'string', size: 50, required: true }, // info, warning, success, error
            { key: 'isRead', type: 'boolean', required: true },
            { key: 'createdAt', type: 'datetime', required: true }
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, attr.key, attr.size, attr.required);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, attr.key, attr.required);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, attr.key, attr.required);
                }
                console.log(`Attribute "${attr.key}" created.`);
            } catch (error) {
                console.log(`Attribute "${attr.key}" issue: ${error.message}`);
            }
            // Small delay to prevent rate limits
            await new Promise(r => setTimeout(r, 500));
        }

        console.log('Updating Permissions...');
        await databases.updateCollection(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION_ID,
            'Notifications',
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );
        console.log('Permissions updated.');

        console.log('Done!');

    } catch (error) {
        console.error('Error:', error);
    }
}

init();
