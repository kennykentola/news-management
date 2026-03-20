import { Bell, Check, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationCenter = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
            <button
                onClick={toggleOpen}
                className="relative p-2 text-text-secondary hover:text-primary hover:bg-bg-secondary rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 z-50 rounded-xl bg-bg-primary border border-bg-tertiary shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-bg-tertiary flex items-center justify-between bg-bg-secondary">
                            <h3 className="font-semibold text-text-primary">Notifications</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-primary"
                                    title="Mark all as read"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    onClick={clearNotifications}
                                    className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-danger"
                                    title="Clear all"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-text-secondary text-sm">
                                    No notifications
                                </div>
                            ) : (
                                <div>
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className={`p-4 border-b border-bg-tertiary hover:bg-bg-secondary/50 cursor-pointer transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                                                <div>
                                                    <h4 className={`text-sm font-medium mb-1 ${!notif.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <p className="text-xs text-text-secondary leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <span className="text-[10px] text-text-secondary/50 mt-2 block">
                                                        {new Date(notif.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>

    );
};

export default NotificationCenter;
