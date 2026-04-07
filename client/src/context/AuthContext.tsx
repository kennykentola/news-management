import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, databases } from '../lib/appwrite';
import { ID, Models, OAuthProvider, Query } from 'appwrite';

// Define roles
export type Role = 'WRITER' | 'EDITOR' | 'ADMIN' | 'READER';

interface UserData {
    $id: string;
    name: string;
    email: string;
    role: Role;
    avatarId?: string;
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
    loginWithGoogle: () => Promise<void>;
    updateName: (name: string) => Promise<void>;
    updatePassword: (password: string, oldPassword?: string) => Promise<void>;
    updateAvatar: (avatarId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to fetch user role from DB - Assumes a 'users' collection exists
    // For MVP, we might simple use prefs or checking a collection
    // IMPORTANT: Created via Appwrite Console: Database 'main', Collection 'users'
    const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'main';
    const METADATA_COLLECTION_ID = 'users_metadata';

    const checkAuth = async () => {
        try {
            const session = await account.get();
            // Fetch custom user data (role)
            // If collection doesn't exist yet, this might fail, so we fallback to Reader
            // Or we try/catch specifically the DB call

            // Default to READER
            let role: Role = 'READER';

            // 1. Check Database (Source of Truth) - Prioritize this to reflect Admin changes
            try {
                const metaDocs = await databases.listDocuments(
                    DATABASE_ID,
                    METADATA_COLLECTION_ID,
                    [Query.equal('email', session.email)]
                );
                
                if (metaDocs.total > 0) {
                    role = metaDocs.documents[0].role as Role;
                    
                    // Sync back to prefs if they differ (ensures fast path stays correct for next time)
                    if (session.prefs?.role !== role) {
                        try {
                            await account.updatePrefs({ role });
                        } catch (prefErr) {
                            console.warn("Could not sync role to prefs:", prefErr);
                        }
                    }
                } else {
                    // Fallback to Preferences if metadata document is missing
                    if (session.prefs && session.prefs.role) {
                        role = session.prefs.role;
                    }
                    
                    // AUTO-REPAIR: Create missing metadata for existing user using best-known role
                    console.log("Metadata missing for user. Repairing...");
                    await databases.createDocument(
                        DATABASE_ID,
                        METADATA_COLLECTION_ID,
                        ID.unique(),
                        {
                            name: session.name,
                            email: session.email,
                            role: role,
                            createdAt: new Date().toISOString()
                        }
                    );
                }
            } catch (metaErr) {
                console.error("Meta fetch failed, falling back to prefs:", metaErr);
                if (session.prefs && session.prefs.role) {
                    role = session.prefs.role;
                }
            }

            setUser({
                $id: session.$id,
                name: session.name,
                email: session.email,
                role: role,
                avatarId: session.prefs?.avatarId
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
            
            // 2. Create Metadata Document for Admin Management
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    METADATA_COLLECTION_ID,
                    ID.unique(),
                    {
                        name,
                        email,
                        role,
                        createdAt: new Date().toISOString()
                    }
                );
            } catch (dbErr) {
                console.error("Metadata creation failed:", dbErr);
            }

            // 3. Save Role to Preferences so it persists locally
            await account.updatePrefs({ role });

        } catch (e) {
            console.error(e);
        }

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

    const loginWithGoogle = async () => {
        try {
            // Failure and Success URLs - redirect back to home/dashboard
            // Using window.location.origin to handle localhost vs production automatically
            await account.createOAuth2Session(
                OAuthProvider.Google,
                `${window.location.origin}/`, // Success
                `${window.location.origin}/login` // Failure
            );
        } catch (error) {
            console.error("Google Login Failed:", error);
            throw error;
        }
    };

    const updateName = async (name: string) => {
        await account.updateName(name);
        await checkAuth();
    };

    const updatePassword = async (password: string, oldPassword?: string) => {
        await account.updatePassword(password, oldPassword);
    };

    const updateAvatar = async (avatarId: string) => {
        const session = await account.get();
        await account.updatePrefs({ ...session.prefs, avatarId });
        await checkAuth();
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
            updateVerification,
            loginWithGoogle,
            updateName,
            updatePassword,
            updateAvatar
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
