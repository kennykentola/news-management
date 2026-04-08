import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { Query } from 'appwrite';
import {
    Zap, ShieldCheck, FileText, CheckCircle2,
    Clock, ArrowRight, PenTool, Eye, Cpu, Users
} from 'lucide-react';

const Overview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSubmitted: 0,
        fakeDetected: 0,
        published: 0,
        pending: 0,
        realPercent: 0,
        fakePercent: 0
    });
    const [recentArticles, setRecentArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [totalRes, fakeRes, publishedRes, pendingRes, recentRes] = await Promise.all([
                    databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.limit(1)]),
                    databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.equal('status', 'FLAGGED'), Query.limit(1)]),
                    databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.equal('status', 'PUBLISHED'), Query.limit(1)]),
                    databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.equal('status', 'PENDING'), Query.limit(1)]),
                    databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.orderDesc('createdAt'), Query.limit(5)])
                ]);

                const total = totalRes.total;
                const fakeCount = fakeRes.total;
                const publishedCount = publishedRes.total;
                const pendingCount = pendingRes.total;
                const totalAnalyzed = publishedCount + fakeCount;
                const realPerc = totalAnalyzed > 0 ? Math.round((publishedCount / totalAnalyzed) * 100) : 100;
                const fakePerc = totalAnalyzed > 0 ? Math.round((fakeCount / totalAnalyzed) * 100) : 0;

                setStats({ totalSubmitted: total, fakeDetected: fakeCount, published: publishedCount, pending: pendingCount, realPercent: realPerc, fakePercent: fakePerc });
                setRecentArticles(recentRes.documents);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const role = user?.role || 'READER';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    // Role-based quick actions
    const quickActions: { label: string; to: string; icon: any; description: string; color: string }[] = [];
    if (role === 'WRITER' || role === 'ADMIN') quickActions.push({ label: 'Submit Article', to: '/dashboard/submit', icon: PenTool, description: 'Write and submit a new news piece', color: 'bg-primary' });
    if (role === 'EDITOR' || role === 'ADMIN') quickActions.push({ label: 'Review Queue', to: '/dashboard/review', icon: Eye, description: `${stats.pending} dispatches awaiting editorial review`, color: 'bg-amber-500' });
    if (role === 'ADMIN') quickActions.push({ label: 'AI Control', to: '/dashboard/ai-control', icon: Cpu, description: 'Manage AI sync and intelligence engine', color: 'bg-purple-500' });
    if (role === 'ADMIN') quickActions.push({ label: 'User Management', to: '/dashboard/admin/users', icon: Users, description: 'Manage editorial staff and contributors', color: 'bg-cyan-500' });
    quickActions.push({ label: 'My Articles', to: '/dashboard/my-articles', icon: FileText, description: 'View and manage your submissions', color: 'bg-bg-tertiary text-text-primary' });

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Zap className="text-primary animate-pulse" size={48} />
            <p className="font-black text-text-secondary tracking-widest uppercase text-sm">Initializing Editorial Hub...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-1">{greeting}</p>
                    <h2 className="text-4xl font-black text-text-primary tracking-tighter">
                        {user?.name?.split(' ')[0]}'s <span className="text-primary">Hub</span>
                    </h2>
                    <p className="text-text-secondary font-bold mt-1">
                        {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20 text-xs font-black uppercase tracking-widest">
                    <ShieldCheck size={14} /> {role} · NewsGuard
                </div>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Dispatches', value: stats.totalSubmitted, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Published Live', value: stats.published, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Accuracy Rate', value: `${stats.realPercent}%`, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-bg-secondary p-6 rounded-3xl border-2 border-bg-tertiary shadow-lg hover:shadow-xl transition-all">
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                            <Icon size={20} className={color} />
                        </div>
                        <div className="text-3xl font-black text-text-primary tracking-tighter">{value}</div>
                        <div className="text-xs font-black text-text-secondary uppercase tracking-widest mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xl font-black text-text-primary tracking-tight mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map(({ label, to, icon: Icon, description, color }) => (
                        <Link
                            key={to}
                            to={to}
                            className="group bg-bg-secondary p-6 rounded-3xl border-2 border-bg-tertiary hover:border-primary/40 shadow-lg hover:shadow-xl transition-all no-underline"
                        >
                            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <Icon size={22} className="text-white" />
                            </div>
                            <p className="font-black text-text-primary text-lg">{label}</p>
                            <p className="text-xs text-text-secondary font-bold mt-1 leading-relaxed">{description}</p>
                            <div className="flex items-center gap-1 text-primary text-xs font-black mt-4 uppercase tracking-widest">
                                Go <ArrowRight size={12} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Dispatches */}
            {recentArticles.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-black text-text-primary tracking-tight">Recent Dispatches</h3>
                        <Link to="/dashboard/my-articles" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:translate-x-1 transition-all no-underline">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentArticles.map(article => (
                            <Link
                                key={article.$id}
                                to={`/article/${article.$id}`}
                                className="flex items-center gap-4 p-4 bg-bg-secondary rounded-2xl border-2 border-bg-tertiary hover:border-primary/30 transition-all no-underline group"
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-bg-tertiary">
                                    <img
                                        src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=200'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        alt=""
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-text-primary text-sm line-clamp-1 group-hover:text-primary transition-colors">{article.title}</p>
                                    <p className="text-xs text-text-secondary font-bold mt-1">{article.authorName} · {new Date(article.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex-shrink-0 ${
                                    article.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' :
                                    article.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-danger/10 text-danger'
                                }`}>{article.status}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;
