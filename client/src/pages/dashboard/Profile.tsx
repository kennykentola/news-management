import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage, BUCKET_ID_IMAGES } from '../../lib/appwrite';
import { ID } from 'appwrite';
import { 
    User, Mail, Shield, Hash, CheckCircle, 
    ShieldCheck, Camera, Edit3, Save, X, 
    Lock, Key, AlertCircle, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateName, updatePassword, updateAvatar } = useAuth();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    // Helper to get Appwrite Preview URL with High-Fidelity Parameters
    const getAvatarUrl = (fileId: string) => {
        try {
            // Optimized for 400x400 with high quality and focus on center
            return storage.getFilePreview(
                BUCKET_ID_IMAGES, 
                fileId, 
                400, 400, 
                'center', 
                100
            ).toString();
        } catch (e) {
            return null;
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadedFile = await storage.createFile(BUCKET_ID_IMAGES, ID.unique(), file);
            await updateAvatar(uploadedFile.$id);
            toast.success('Digital Identity Synchronized');
        } catch (error: any) {
            toast.error(error.message || 'Identity Sync Failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim() || newName === user.name) {
            setIsEditingName(false);
            return;
        }

        try {
            await updateName(newName);
            toast.success('Identity Record Updated');
            setIsEditingName(false);
        } catch (error: any) {
            toast.error(error.message || 'Metadata Update Failed');
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error('Credential Mismatch Detected');
            return;
        }

        try {
            await updatePassword(passwords.new, passwords.current);
            toast.success('Security Protocol Updated');
            setIsUpdatingPassword(false);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            toast.error(error.message || 'Credential Sync Failed');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-text-primary tracking-tighter">My Profile HUB</h2>
                    <p className="text-text-secondary font-bold mt-2">Personalize your identity and manage security protocols.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary-dark dark:text-primary rounded-full border border-primary/20 text-xs font-black uppercase tracking-widest">
                    <ShieldCheck size={14} /> Account Verified
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-bg-secondary p-8 rounded-[2.5rem] border-2 border-bg-tertiary shadow-2xl flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-primary text-white flex items-center justify-center font-black text-6xl shadow-2xl shadow-primary/30 overflow-hidden border-4 border-bg-secondary">
                                {user.avatarId ? (
                                    <img 
                                        src={getAvatarUrl(user.avatarId)!} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback to initials if image fails to load
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerText = user.name.charAt(0);
                                        }}
                                    />
                                ) : (
                                    user.name.charAt(0)
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 p-4 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all group-hover:rotate-6"
                            >
                                <Camera size={20} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleAvatarUpload}
                            />
                        </div>
                        
                        <div className="mt-8 space-y-2">
                            <h3 className="text-2xl font-black text-text-primary tracking-tight">{user.name}</h3>
                            <span className="inline-block px-3 py-1 bg-bg-tertiary text-text-secondary rounded-lg text-[10px] font-black uppercase tracking-widest border border-bg-tertiary/50">
                                {user.role} Contributor
                            </span>
                        </div>
                    </div>

                    <div className="bg-bg-secondary p-8 rounded-[2.5rem] border-2 border-bg-tertiary shadow-2xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-bg-primary rounded-xl flex items-center justify-center border border-bg-tertiary/50">
                                <Mail size={18} className="text-primary" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Email Address</p>
                                <p className="text-sm font-bold text-text-primary truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-bg-primary rounded-xl flex items-center justify-center border border-bg-tertiary/50">
                                <Hash size={18} className="text-primary" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">System ID</p>
                                <p className="text-xs font-mono font-bold text-text-primary truncate">{user.$id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Identity Management */}
                    <div className="bg-bg-secondary rounded-[2.5rem] border-2 border-bg-tertiary shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-8 border-b-2 border-bg-tertiary/50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <User size={24} />
                                </div>
                                <h3 className="text-xl font-black text-text-primary tracking-tight">Identity Management</h3>
                            </div>
                            {!isEditingName ? (
                                <button 
                                    onClick={() => setIsEditingName(true)}
                                    className="p-3 bg-bg-primary hover:bg-bg-tertiary rounded-xl transition-colors border border-bg-tertiary/50 text-text-secondary"
                                >
                                    <Edit3 size={18} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleUpdateName}
                                        className="p-3 bg-primary text-white rounded-xl shadow-lg border-2 border-primary-dark"
                                    >
                                        <Save size={18} />
                                    </button>
                                    <button 
                                        onClick={() => { setIsEditingName(false); setNewName(user.name); }}
                                        className="p-3 bg-danger/10 text-danger rounded-xl border border-danger/20"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-10">
                            {isEditingName ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-secondary/50 tracking-widest">Full Display Name</label>
                                    <input 
                                        type="text" 
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full p-6 bg-bg-primary border-2 border-primary/20 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-text-primary font-black text-xl"
                                        placeholder="Enter your full name"
                                        autoFocus
                                    />
                                    <p className="text-[10px] font-bold text-text-secondary italic">This is how your name will appear on published articles and comments.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <p className="text-4xl font-black text-text-primary tracking-tighter">{user.name}</p>
                                    <p className="text-text-secondary font-bold">Primary contributor identity across the NewsGuard network.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security Management */}
                    <div className="bg-bg-secondary rounded-[2.5rem] border-2 border-bg-tertiary shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="p-8 border-b-2 border-bg-tertiary/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-danger/10 rounded-2xl text-danger">
                                    <Lock size={24} />
                                </div>
                                <h3 className="text-xl font-black text-text-primary tracking-tight">Security & Credentials</h3>
                            </div>
                        </div>
                        <div className="p-10 space-y-10">
                            {!isUpdatingPassword ? (
                                <div className="flex flex-col md:flex-row justify-between items-center bg-bg-primary p-8 rounded-3xl border-2 border-bg-tertiary gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-bg-tertiary rounded-2xl flex items-center justify-center border border-bg-tertiary/50">
                                            <Key size={30} className="text-text-secondary" />
                                        </div>
                                        <div>
                                            <p className="font-black text-text-primary text-xl">Account Password</p>
                                            <p className="text-sm font-bold text-text-secondary italic flex items-center gap-2">
                                                <AlertCircle size={14} /> Last updated recently
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsUpdatingPassword(true)}
                                        className="px-8 py-4 bg-bg-tertiary hover:bg-bg-tertiary/70 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-bg-tertiary"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdatePassword} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase text-text-secondary/50 tracking-widest">Current Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                                className="w-full p-4 bg-bg-primary border-2 border-bg-tertiary rounded-xl focus:border-primary transition-all text-text-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-text-secondary/50 tracking-widest">New Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                                className="w-full p-4 bg-bg-primary border-2 border-bg-tertiary rounded-xl focus:border-primary transition-all text-text-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-text-secondary/50 tracking-widest">Confirm New Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                                className="w-full p-4 bg-bg-primary border-2 border-bg-tertiary rounded-xl focus:border-primary transition-all text-text-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="submit"
                                            className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Save New Credentials
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setIsUpdatingPassword(false)}
                                            className="px-10 py-5 bg-bg-tertiary text-text-secondary rounded-2xl font-black uppercase tracking-widest border border-bg-tertiary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-3xl flex items-start gap-4">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary flex items-center justify-center">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-text-primary text-xl tracking-tight">Two-Factor Reliability Active</p>
                                    <p className="text-sm text-text-secondary font-bold leading-relaxed max-w-xl">
                                        Your account is synchronization with the NewsGuard Neural Network. Every credential change is logged and audited to prevent unauthorized access.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
