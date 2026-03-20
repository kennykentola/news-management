import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { databases, DATABASE_ID, NOTIFICATIONS_COLLECTION_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from './AuthContext';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    timestamp: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string, type?: NotificationType) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth(); // We need user ID to fetch their notifications

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                NOTIFICATIONS_COLLECTION_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.orderDesc('createdAt')
                ]
            );
            setNotifications(response.documents.map(doc => ({
                id: doc.$id,
                title: doc.title,
                message: doc.message,
                type: doc.type as NotificationType,
                read: doc.isRead,
                timestamp: new Date(doc.createdAt)
            })));
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Could set up a realtime subscription here later
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = async (title: string, message: string, type: NotificationType = 'info') => {
        // Optimistic update
        const tempId = Math.random().toString(36).substr(2, 9);
        const newNotif: Notification = {
            id: tempId,
            title,
            message,
            type,
            read: false,
            timestamp: new Date()
        };
        setNotifications(prev => [newNotif, ...prev]);

        // Save to DB if user is logged in
        if (user) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    NOTIFICATIONS_COLLECTION_ID,
                    ID.unique(),
                    {
                        userId: user.$id,
                        title,
                        message,
                        type,
                        isRead: false,
                        createdAt: new Date().toISOString()
                    }
                );
            } catch (e) {
                console.error("Failed to save notification", e);
            }
        }
    };

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await databases.updateDocument(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, id, {
                isRead: true
            });
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        // Create promises for all unread notifs
        const unread = notifications.filter(n => !n.read);
        await Promise.all(unread.map(n =>
            databases.updateDocument(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, n.id, { isRead: true }).catch(console.error)
        ));
    };

    const clearNotifications = async () => {
        const oldNotifs = [...notifications];
        setNotifications([]);
        // Delete from DB? Or just mark read? Usually clear means remove.
        await Promise.all(oldNotifs.map(n =>
            databases.deleteDocument(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, n.id).catch(console.error)
        ));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
