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
                className="relative p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 z-50 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                    title="Mark all as read"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    onClick={clearNotifications}
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                                    title="Clear all"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                <div>
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-500/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                <div>
                                                    <h4 className={`text-sm font-medium mb-1 ${!notif.read ? 'text-white' : 'text-slate-400'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <span className="text-[10px] text-slate-600 mt-2 block">
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
