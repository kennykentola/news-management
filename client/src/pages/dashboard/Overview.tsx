import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { Query } from 'appwrite';
import {
    Zap, ShieldCheck, FileText, CheckCircle2,
    Clock, ArrowRight, PenTool, Eye, Cpu, Users,
    Bookmark, Plus, Settings, TrendingUp, Sparkles,
    Ghost
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
    const [savedArticles, setSavedArticles] = useState<any[]>([]);
    const [recommendedArticles, setRecommendedArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const role = user?.role || 'READER';
                
                // Fetch basic recent articles for everyone
                const recentRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [
                    Query.equal('status', 'PUBLISHED'),
                    Query.orderDesc('createdAt'),
                    Query.limit(5)
                ]);
                setRecentArticles(recentRes.documents);

                if (role === 'READER') {
                    // Fetch Saved Articles
                    if (user?.savedArticles && user.savedArticles.length > 0) {
                        try {
                            const savedRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [
                                Query.equal('$id', user.savedArticles.slice(0, 10))
                            ]);
                            setSavedArticles(savedRes.documents);
                        } catch (err) {
                            console.warn("Saved articles fetch failed", err);
                        }
                    }

                    // Fetch Recommendations based on interests
                    try {
                        const metadata = await databases.listDocuments(DATABASE_ID, 'users_metadata', [
                            Query.equal('email', user?.email || '')
                        ]);
                        
                        let queries = [Query.equal('status', 'PUBLISHED'), Query.limit(3)];
                        
                        if (metadata.total > 0 && metadata.documents[0].interests) {
                            const interests = metadata.documents[0].interests.split(',').filter(Boolean);
                            if (interests.length > 0) {
                                queries.push(Query.equal('category', interests));
                            }
                        }

                        const recommendedRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, queries);
                        setRecommendedArticles(recommendedRes.documents);
                    } catch (err) {
                        console.warn("Recommendations fetch failed", err);
                    }
                } else {
                    // Staff Stats
                    const [totalRes, fakeRes, publishedRes, pendingRes] = await Promise.all([
                        databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.limit(1)]),
                        databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.equal('status', 'FLAGGED'), Query.limit(1)]),
                        databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.equal('status', 'PUBLISHED'), Query.limit(1)]),
                        databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.equal('status', 'PENDING'), Query.limit(1)])
                    ]);

                    const total = totalRes.total;
                    const fakeCount = fakeRes.total;
                    const publishedCount = publishedRes.total;
                    const pendingCount = pendingRes.total;
                    const totalAnalyzed = publishedCount + fakeCount;
                    const realPerc = totalAnalyzed > 0 ? Math.round((publishedCount / totalAnalyzed) * 100) : 100;
                    const fakePerc = totalAnalyzed > 0 ? Math.round((fakeCount / totalAnalyzed) * 100) : 0;

                    setStats({ totalSubmitted: total, fakeDetected: fakeCount, published: publishedCount, pending: pendingCount, realPercent: realPerc, fakePercent: fakePerc });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const role = user?.role || 'READER';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Zap className="text-primary animate-pulse" size={48} />
            <p className="font-black text-text-secondary tracking-widest uppercase text-sm">Initializing NewsHub...</p>
        </div>
    );

    // ==========================================
    // READER DASHBOARD (CNN/BBC STYLE)
    // ==========================================
    if (role === 'READER') {
        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex items-end justify-between border-b-2 border-bg-tertiary pb-8">
                    <div className="space-y-1">
                        <p className="text-xs font-black text-primary uppercase tracking-[0.3em] font-mono">{greeting}</p>
                        <h2 className="text-5xl font-black text-text-primary tracking-tighter leading-none">
                            My <span className="text-primary">News</span>
                        </h2>
                        <p className="text-text-secondary font-bold pl-1">{user?.name}'s curated intelligence hub.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left & Middle Column (Main Content) */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Saved Articles */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black text-text-primary flex items-center gap-3 tracking-tighter">
                                    <Bookmark className="text-primary" /> Saved for Later
                                </h3>
                                <div className="h-0.5 flex-1 bg-bg-tertiary mx-6 hidden sm:block"></div>
                                <span className="text-xs font-black text-text-secondary uppercase">{savedArticles.length} STORIES</span>
                            </div>
                            
                            {savedArticles.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {savedArticles.map(article => (
                                        <Link key={article.$id} to={`/article/${article.$id}`} className="group no-underline bg-bg-secondary rounded-3xl border-2 border-bg-tertiary overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                            <div className="aspect-video overflow-hidden">
                                                <img 
                                                    src={article.imageUrl} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                                    alt="" 
                                                />
                                            </div>
                                            <div className="p-6">
                                                <h4 className="font-black text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-tight">{article.title}</h4>
                                                <p className="text-xs text-text-secondary font-bold mt-2">{article.category} · {new Date(article.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-bg-secondary p-12 rounded-[2.5rem] border-2 border-dashed border-bg-tertiary text-center space-y-4">
                                    <div className="w-16 h-16 bg-bg-tertiary rounded-2xl flex items-center justify-center mx-auto text-text-secondary">
                                        <Ghost size={32} />
                                    </div>
                                    <p className="text-text-secondary font-bold">You haven't saved any stories yet.</p>
                                    <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
                                        Explore News <ArrowRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Recent Discoveries */}
                        <section>
                            <h3 className="text-2xl font-black text-text-primary flex items-center gap-3 tracking-tighter mb-8">
                                <Sparkles className="text-amber-500" /> Discover Daily
                            </h3>
                            <div className="space-y-4">
                                {recentArticles.map(article => (
                                    <Link key={article.$id} to={`/article/${article.$id}`} className="flex gap-6 p-6 bg-bg-secondary rounded-[2rem] border-2 border-bg-tertiary hover:border-primary/30 transition-all no-underline group shadow-sm">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-bg-tertiary">
                                            <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-black text-text-primary group-hover:text-primary transition-colors line-clamp-1">{article.title}</h4>
                                            <p className="text-sm text-text-secondary font-bold mt-1 line-clamp-2 leading-snug">{article.content?.replace(/<[^>]*>/g, '').slice(0, 100)}...</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Sidebar Extras) */}
                    <div className="space-y-10">
                        {/* Quick Stats */}
                        <div className="bg-bg-secondary p-8 rounded-[2.5rem] border-2 border-bg-tertiary shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Zap size={80} className="text-primary" />
                            </div>
                            <h4 className="font-black text-text-primary text-lg mb-6">Platform Activity</h4>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-text-secondary uppercase">Interests Path</span>
                                    <span className="text-sm font-black text-primary">Political Intelligence</span>
                                </div>
                                <div className="h-1 w-full bg-bg-tertiary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[65%]"></div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-bg-tertiary">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-text-primary">{user.savedArticles?.length || 0}</p>
                                        <p className="text-[10px] font-black text-text-secondary uppercase">Saved</p>
                                    </div>
                                    <div className="w-px h-8 bg-bg-tertiary"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-text-primary">12</p>
                                        <p className="text-[10px] font-black text-text-secondary uppercase">Read</p>
                                    </div>
                                    <div className="w-px h-8 bg-bg-tertiary"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-text-primary">85%</p>
                                        <p className="text-[10px] font-black text-text-secondary uppercase">Accuracy</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reader Actions */}
                        <div className="space-y-3">
                            <Link to="/profile" className="flex items-center gap-4 p-5 bg-bg-secondary rounded-2xl border-2 border-bg-tertiary hover:bg-bg-tertiary/20 transition-all no-underline group shadow-lg">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <Settings size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-text-primary text-sm group-hover:text-primary transition-colors">Personalize Hub</p>
                                    <p className="text-[10px] text-text-secondary font-bold">Manage topics and interests</p>
                                </div>
                            </Link>
                            <Link to="/" className="flex items-center gap-4 p-5 bg-bg-secondary rounded-2xl border-2 border-bg-tertiary hover:bg-bg-tertiary/20 transition-all no-underline group shadow-lg">
                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-text-primary text-sm group-hover:text-amber-500 transition-colors">Trending Topics</p>
                                    <p className="text-[10px] text-text-secondary font-bold">Deep dive into global scale news</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // STAFF DASHBOARD (EDITORIAL HUB)
    // ==========================================
    const quickActions: { label: string; to: string; icon: any; description: string; color: string }[] = [];
    if (role === 'WRITER' || role === 'ADMIN') quickActions.push({ label: 'Submit Article', to: '/dashboard/submit', icon: PenTool, description: 'Write and submit a new news piece', color: 'bg-primary' });
    if (role === 'EDITOR' || role === 'ADMIN') quickActions.push({ label: 'Review Queue', to: '/dashboard/review', icon: Eye, description: `${stats.pending} dispatches awaiting editorial review`, color: 'bg-amber-500' });
    if (role === 'ADMIN') quickActions.push({ label: 'AI Control', to: '/dashboard/ai-control', icon: Cpu, description: 'Manage AI sync and intelligence engine', color: 'bg-purple-500' });
    if (role === 'ADMIN') quickActions.push({ label: 'User Management', to: '/dashboard/admin/users', icon: Users, description: 'Manage editorial staff and contributors', color: 'bg-cyan-500' });
    quickActions.push({ label: 'My Articles', to: '/dashboard/my-articles', icon: FileText, description: 'View and manage your submissions', color: 'bg-bg-tertiary text-text-primary' });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Staff Welcome Header (Keep what i built previously but ensure it's robust) */}
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

            {/* Quick Actions (Keep as in previous session) */}
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
            
            {/* Recent Dispatches for Staff omitted for brevity but should be there in full file */}
            {recentArticles.length > 0 && (
                <div>
                     <h3 className="text-xl font-black text-text-primary tracking-tight mb-4">Recent Dispatches</h3>
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
