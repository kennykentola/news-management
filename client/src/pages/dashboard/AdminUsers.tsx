import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, NOTIFICATIONS_COLLECTION_ID } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { Users, UserPlus, Shield, UserX, Search, RefreshCw, AlertCircle, Info } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [showSyncInfo, setShowSyncInfo] = useState(false);

    const fetchUsers = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                'users_metadata',
                [Query.orderDesc('createdAt')]
            );
            setUsers(response.documents);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([
                { $id: '1', name: 'John Editor', email: 'john@news.com', role: 'EDITOR', createdAt: new Date().toISOString() },
                { $id: '2', name: 'Sara Writer', email: 'sara@news.com', role: 'WRITER', createdAt: new Date().toISOString() },
                { $id: '3', name: 'Admin One', email: 'admin@news.com', role: 'ADMIN', createdAt: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        // Note: Client SDK cannot create collections. We'll show a helpful info box instead.
        setTimeout(() => {
            setSyncing(false);
            setShowSyncInfo(true);
        }, 1500);
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-black tracking-tighter">User Management</h2>
                    <p className="text-gray-500 font-bold mt-2">Oversee contributors and system permissions.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleSync}
                        className="bg-black text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-gray-800 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
                        Sync Schema
                    </button>
                    <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        <UserPlus size={20} /> Add User
                    </button>
                </div>
            </div>

            {showSyncInfo && (
                <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-4xl space-y-4 animate-in zoom-in duration-300">
                    <div className="flex items-center gap-3 text-amber-700 font-black">
                        <Info size={24} />
                        <h4 className="text-xl">Database Schema Instructions</h4>
                    </div>
                    <p className="text-amber-800 font-bold">
                        To resolve the 404 errors, please ensure the following collections exist in your Appwrite Dashboard (Main DB):
                    </p>
                    <ul className="list-disc ml-6 text-amber-900 font-bold space-y-2">
                        <li><strong>{NOTIFICATIONS_COLLECTION_ID}</strong>: (Attributes: userId, title, message, type, isRead, createdAt)</li>
                        <li><strong>users_metadata</strong>: (Attributes: name, email, role, createdAt)</li>
                    </ul>
                    <p className="text-xs text-amber-600 font-black uppercase tracking-widest mt-4">
                        * Attributes should be 'string' (except isRead which is 'boolean') and required.
                    </p>
                    <button onClick={() => setShowSyncInfo(false)} className="text-amber-700 underline font-black text-sm">Dismiss Instructions</button>
                </div>
            )}

            <div className="bg-white p-6 rounded-3xl border-2 border-bg-tertiary shadow-xl flex items-center gap-4 focus-within:border-primary transition-colors">
                <Search className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search users by name, role, or email..." 
                    className="flex-1 bg-transparent border-none outline-none font-bold text-xl text-black placeholder:text-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-4xl border-2 border-bg-tertiary shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b-2 border-bg-tertiary">
                            <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest">System Role</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest">Joined On</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.$id} className="border-b border-bg-tertiary hover:bg-gray-50 transition-colors">
                                <td className="p-8 flex items-center gap-4">
                                    <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-black text-xl tracking-tight">{user.name}</p>
                                        <p className="text-sm font-bold text-gray-400">{user.email}</p>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <span className={`px-5 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-2 w-fit border
                                        ${user.role === 'ADMIN' ? 'bg-black text-white border-black' : 
                                          user.role === 'EDITOR' ? 'bg-primary/10 text-primary-dark border-primary/20' : 
                                          'bg-white text-black border-bg-tertiary'}
                                    `}>
                                        <Shield size={14} /> {user.role}
                                    </span>
                                </td>
                                <td className="p-8 text-sm font-black text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="p-8 text-right">
                                    <div className="flex justify-end gap-4">
                                        <button className="p-3 text-black hover:bg-black hover:text-white rounded-2xl transition-all shadow-sm border border-bg-tertiary" title="Edit Permissions">
                                            <Users size={20} />
                                        </button>
                                        <button className="p-3 text-danger hover:bg-danger hover:text-white rounded-2xl transition-all shadow-sm border border-danger/20" title="Disable User">
                                            <UserX size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
