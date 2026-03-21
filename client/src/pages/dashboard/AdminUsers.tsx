import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_USERS_METADATA, NOTIFICATIONS_COLLECTION_ID } from '../../lib/appwrite';
import { Query, ID } from 'appwrite';
import { Users, UserPlus, Shield, UserX, Search, RefreshCw, AlertCircle, Info, Edit2, Check, X } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [showSyncInfo, setShowSyncInfo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'WRITER' });
    const [repairing, setRepairing] = useState(false);
    
    const fetchUsers = async () => {
        setError(null);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_USERS_METADATA
            );
            setUsers(response.documents);
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            setError(error.message || 'Check Appwrite Attributes / Permissions');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleForceSync = async () => {
        setRepairing(true);
        try {
            // Force verify current admin metadata
            const profile = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_USERS_METADATA, [
                Query.equal('email', 'admin@news.com') // We can't easily get the user from here, but we can try to "discover"
            ]);
            // Re-fetch everything
            await fetchUsers();
            alert("Sync complete. If the list is still empty, please ensure you have 'Any' Read permissions in Appwrite collection settings.");
        } catch (err) {
            console.error(err);
        } finally {
            setRepairing(false);
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

    const updateRole = async (userId: string, newRole: string) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID_USERS_METADATA,
                userId,
                { role: newRole }
            );
            fetchUsers();
            alert(`User role updated to ${newRole}`);
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update user role.');
        }
    };

    const deleteUserMetadata = async (userId: string) => {
        if (!window.confirm("Are you sure you want to remove this user from the system?")) return;
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_ID_USERS_METADATA,
                userId
            );
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user metadata:', error);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
                        onClick={handleForceSync}
                        disabled={repairing}
                        className="bg-black text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={repairing ? 'animate-spin' : ''} />
                        Force Sync
                    </button>
                    <button 
                        onClick={() => setIsAddingUser(true)}
                        className="bg-primary text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <UserPlus size={20} /> Pre-Register User
                    </button>
                </div>
            </div>

            {isAddingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2rem] p-10 border-2 border-bg-tertiary shadow-2xl space-y-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-3xl font-black tracking-tighter">Invite Team Member</h3>
                            <button onClick={() => setIsAddingUser(false)} className="text-gray-400 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-gray-500 font-bold text-sm leading-relaxed">
                            Pre-registering a user sets their role in advance. When they sign up with the same email, they will automatically receive these permissions.
                        </p>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await databases.createDocument(
                                    DATABASE_ID,
                                    COLLECTION_ID_USERS_METADATA,
                                    ID.unique(),
                                    { ...newUser, createdAt: new Date().toISOString() }
                                );
                                alert("User pre-registered! They can now sign up to claim their role.");
                                setIsAddingUser(false);
                                fetchUsers();
                            } catch (err) {
                                alert("Failed to pre-register. Email might already be in list.");
                            }
                        }} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Full Name</label>
                                <input 
                                    type="text" required
                                    className="w-full p-4 rounded-xl border-2 border-bg-tertiary font-bold outline-none focus:border-primary"
                                    value={newUser.name}
                                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Email Address</label>
                                <input 
                                    type="email" required
                                    className="w-full p-4 rounded-xl border-2 border-bg-tertiary font-bold outline-none focus:border-primary"
                                    value={newUser.email}
                                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Assigned Role</label>
                                <select 
                                    className="w-full p-4 rounded-xl border-2 border-bg-tertiary font-bold outline-none cursor-pointer"
                                    value={newUser.role}
                                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                                >
                                    <option value="READER">READER</option>
                                    <option value="WRITER">WRITER</option>
                                    <option value="EDITOR">EDITOR</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                                Confirm & Invite
                            </button>
                        </form>
                    </div>
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

            {error && (
                <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] flex items-center gap-4 text-red-700 animate-in shake active">
                    <AlertCircle />
                    <div>
                        <p className="font-black text-xs uppercase tracking-widest">Database Sync Error</p>
                        <p className="font-bold">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border-2 border-bg-tertiary shadow-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
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
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-black text-xl tracking-tight">{user.name}</p>
                                        <p className="text-sm font-bold text-gray-400">{user.email}</p>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <select 
                                        value={user.role}
                                        onChange={(e) => updateRole(user.$id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm border outline-none cursor-pointer transition-all
                                            ${user.role === 'ADMIN' ? 'bg-black text-white border-black' : 
                                              user.role === 'EDITOR' ? 'bg-primary/10 text-primary-dark border-primary/20' : 
                                              user.role === 'WRITER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                              'bg-white text-black border-bg-tertiary'}
                                        `}
                                    >
                                        <option value="READER">READER</option>
                                        <option value="WRITER">WRITER</option>
                                        <option value="EDITOR">EDITOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </td>
                                <td className="p-8 text-sm font-black text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="p-8 text-right">
                                    <div className="flex justify-end gap-4">
                                        <button className="p-3 text-black hover:bg-black hover:text-white rounded-2xl transition-all shadow-sm border border-bg-tertiary" title="Edit Permissions">
                                            <Users size={20} />
                                        </button>
                                        <button 
                                            onClick={() => deleteUserMetadata(user.$id)}
                                            className="p-3 text-danger hover:bg-danger hover:text-white rounded-2xl transition-all shadow-sm border border-danger/20" 
                                            title="Delete Metadata"
                                        >
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
