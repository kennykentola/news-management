import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, databases } from '../lib/appwrite';
import { ID, Models } from 'appwrite';

// Define roles
export type Role = 'WRITER' | 'EDITOR' | 'ADMIN' | 'READER';

interface UserData {
    $id: string;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: UserData | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string, role?: Role) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    requestPasswordRecovery: (email: string) => Promise<void>;
    completePasswordRecovery: (userId: string, secret: string, password: string, passwordAgain: string) => Promise<void>;
    createVerification: () => Promise<void>;
    updateVerification: (userId: string, secret: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to fetch user role from DB - Assumes a 'users' collection exists
    // For MVP, we might simple use prefs or checking a collection
    // IMPORTANT: Created via Appwrite Console: Database 'main', Collection 'users'
    const DATABASE_ID = 'main'; // Placeholder
    const COLLECTION_ID = 'users'; // Placeholder

    const checkAuth = async () => {
        try {
            const session = await account.get();
            // Fetch custom user data (role)
            // If collection doesn't exist yet, this might fail, so we fallback to Reader
            // Or we try/catch specifically the DB call

            // Default to READER for standard users
            let role: Role = 'READER';

            // Check Preferences first
            if (session.prefs && session.prefs.role) {
                role = session.prefs.role;
            } else {
                // Fallback for initial demo without DB:
                // If email contains 'admin', role = ADMIN, etc.
                if (session.email.includes('admin')) role = 'ADMIN';
                else if (session.email.includes('editor')) role = 'EDITOR';
                else if (session.email.includes('writer')) role = 'WRITER';
            }

            setUser({
                $id: session.$id,
                name: session.name,
                email: session.email,
                role: role
            });

        } catch (e) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
        } catch (e: any) {
            // If session already exists, we can proceed
            if (e.code === 401 && e.type === 'user_session_already_active') {
                // Do nothing, just fetch user
            } else {
                // Try logging out and retrying - rare edge case but good for robustness
                try {
                    await account.deleteSession('current');
                    await account.createEmailPasswordSession(email, password);
                } catch (retryError) {
                    throw e; // Throw original error if retry fails
                }
            }
        }
        await checkAuth();
    };

    const signup = async (email: string, password: string, name: string, role: Role = 'READER') => {
        const newAccount = await account.create(ID.unique(), email, password, name);

        // Login to create session
        try {
            await account.createEmailPasswordSession(email, password);
        } catch (e) {
            // Should not happen on new account, but safer
            console.error(e);
        }

        // Save Role to Preferences so it persists
        await account.updatePrefs({ role });

        await checkAuth();
    };

    const logout = async () => {
        await account.deleteSession('current');
        setUser(null);
    };

    const requestPasswordRecovery = async (email: string) => {
        // Redirect to a reset page in the app, e.g., http://localhost:5173/reset-password
        // Important: Appwrite requires a valid URL that is whitelisted in the platform settings
        // For local dev, http://localhost:5173/reset-password is typical.
        await account.createRecovery(email, `${window.location.origin}/reset-password`);
    };

    const completePasswordRecovery = async (userId: string, secret: string, password: string, passwordAgain: string) => {
        await account.updateRecovery(userId, secret, password);
    };

    const createVerification = async () => {
        // Redirect to verify page, e.g., http://localhost:5173/verify-email
        await account.createVerification(`${window.location.origin}/verify-email`);
    };

    const updateVerification = async (userId: string, secret: string) => {
        await account.updateVerification(userId, secret);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            signup,
            logout,
            checkAuth,
            requestPasswordRecovery,
            completePasswordRecovery,
            createVerification,
            updateVerification
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
