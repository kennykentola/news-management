import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Hash, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return null;

    const stats = [
        { label: 'Account Status', value: 'Verified', icon: <ShieldCheck className="text-primary" />, color: 'text-primary' },
        { label: 'Role Level', value: user.role, icon: <Shield className="text-primary-dark dark:text-primary" />, color: 'text-text-primary' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-text-primary tracking-tighter">My Profile HUB</h2>
                    <p className="text-text-secondary font-bold mt-2">Manage your system identity and security credentials.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-bg-secondary p-6 rounded-2xl border-2 border-bg-tertiary shadow-xl flex items-center gap-4 hover:scale-105 transition-transform">
                        <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shadow-inner border border-bg-tertiary/50">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{stat.label}</p>
                            <p className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-bg-secondary rounded-[2.5rem] border-2 border-bg-tertiary shadow-2xl overflow-hidden">
                <div className="bg-bg-tertiary/30 p-10 border-b-2 border-bg-tertiary/50">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-2xl shadow-primary/30">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-text-primary tracking-tighter">{user.name}</h3>
                            <span className="px-3 py-1 bg-primary/10 text-primary-dark dark:text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/20">
                                {user.role} Contributor
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-secondary/50 tracking-widest">
                                <Mail size={12} /> Email Address
                            </label>
                            <div className="p-4 bg-bg-primary border-2 border-bg-tertiary rounded-xl text-text-primary font-bold">
                                {user.email}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-secondary/50 tracking-widest">
                                <Hash size={12} /> System Identifier
                            </label>
                            <div className="p-4 bg-bg-primary border-2 border-bg-tertiary rounded-xl text-text-primary font-bold font-mono text-sm">
                                {user.$id}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-2xl flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary-dark dark:text-primary">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="font-black text-text-primary tracking-tight">Security Protocol Active</p>
                            <p className="text-xs text-text-secondary font-bold leading-relaxed">
                                Your account is synchronization with the NewsGuard Intelligence Hub. Multi-factor authentication is currently managed via your primary authentication provider.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
