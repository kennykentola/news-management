import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { 
    Zap, 
    ShieldCheck, 
    FileWarning, 
    Trophy, 
    BarChart, 
    Activity,
    CheckCircle2,
    Clock,
    UserCircle
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const StatCard = ({ label, value, color, icon: Icon, trend }: { label: string, value: string | number, color: string, icon: any, trend?: string }) => (
    <div className="bg-white p-8 rounded-4xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl transition-colors" style={{ backgroundColor: `${color}15`, color: color }}>
                <Icon size={28} />
            </div>
            {trend && (
                <span className="text-xs font-black px-3 py-1 bg-primary/10 text-primary-dark rounded-full">
                    {trend}
                </span>
            )}
        </div>
        <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-4xl font-black text-black tracking-tighter">{value}</div>
    </div>
);

const RoleAnalytics = ({ role, stats }: { role: string, stats: any }) => {
    if (role === 'WRITER') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="bg-white p-8 rounded-4xl border-2 border-bg-tertiary shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Trophy className="text-amber-500" />
                        <h4 className="text-xl font-black text-black tracking-tight">Your Achievements</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <span className="font-bold">Accuracy Achievement</span>
                            <span className={`${stats.realPercent > 80 ? 'bg-primary' : 'bg-gray-400'} text-white px-3 py-1 rounded-lg text-xs font-black`}>
                                {stats.realPercent > 80 ? 'GOLD' : 'SILVER'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <span className="font-bold">Content Velocity</span>
                            <span className={`${stats.totalSubmitted > 50 ? 'bg-black' : 'bg-primary'} text-white px-3 py-1 rounded-lg text-xs font-black`}>
                                {stats.totalSubmitted > 50 ? 'PRO' : 'RISING'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-4xl border-2 border-bg-tertiary shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart className="text-primary" />
                        <h4 className="text-xl font-black text-black tracking-tight">Personal Impact</h4>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <p className="text-xs font-black text-gray-400 uppercase mb-2 text-center">Avg. AI Score</p>
                            <p className="text-4xl font-black text-black text-center">{stats.realPercent}%</p>
                        </div>
                        <div className="w-[2px] h-12 bg-gray-100"></div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-gray-400 uppercase mb-2 text-center">Published</p>
                            <p className="text-4xl font-black text-black text-center">{stats.published}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (role === 'EDITOR') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="bg-white p-8 rounded-4xl border-2 border-bg-tertiary shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-primary" />
                        <h4 className="text-xl font-black text-black tracking-tight">Editorial Workflow</h4>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase mb-1">Queue Total</p>
                            <p className="text-4xl font-black text-black">{stats.totalSubmitted - stats.published}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-gray-400 uppercase mb-1">Pass Rate</p>
                            <p className="text-2xl font-black text-black">{stats.realPercent}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-4xl border-2 border-bg-tertiary shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="text-primary-dark" />
                        <h4 className="text-xl font-black text-black tracking-tight">Verification Mix</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-primary" style={{ width: `${stats.realPercent}%` }}></div>
                            <div className="h-full bg-danger" style={{ width: `${stats.fakePercent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-black">
                            <span className="text-primary">{stats.realPercent}% VERIFIED</span>
                            <span className="text-danger">{stats.fakePercent}% FLAGGED</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

const Overview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSubmitted: 0,
        fakeDetected: 0,
        published: 0,
        realPercent: 0,
        fakePercent: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const totalRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [Query.limit(1)]);
                const total = totalRes.total;

                const fakeRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [
                    Query.equal('aiLabel', 'FAKE'),
                    Query.limit(1)
                ]);
                const fakeCount = fakeRes.total;

                const publishedRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [
                    Query.equal('status', 'PUBLISHED'),
                    Query.limit(1)
                ]);
                const publishedCount = publishedRes.total;

                const realRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [
                    Query.equal('aiLabel', 'REAL'),
                    Query.limit(1)
                ]);
                const realCount = realRes.total;

                const totalAnalyzed = realCount + fakeCount;
                const realPerc = totalAnalyzed > 0 ? Math.round((realCount / totalAnalyzed) * 100) : 0;
                const fakePerc = totalAnalyzed > 0 ? Math.round((fakeCount / totalAnalyzed) * 100) : 0;

                setStats({
                    totalSubmitted: total,
                    fakeDetected: fakeCount,
                    published: publishedCount,
                    realPercent: realPerc,
                    fakePercent: fakePerc
                });

            } catch (error) {
                console.error("Failed to fetch stats:", error);
                // No more hardcoded fake data!
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Zap className="text-primary animate-pulse" size={48} />
            <p className="font-black text-black tracking-widest uppercase text-sm">Synchronizing Metrics...</p>
        </div>
    );

    if (loading) return <LoadingScreen message="Syncing with truth database..." />;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <header>
                <div className="flex items-center gap-4 mb-4">
                    <UserCircle className="text-primary" size={32} />
                    <h2 className="text-4xl font-black text-black tracking-tighter capitalize">
                        Welcome, {user?.name.split(' ')[0]}
                    </h2>
                </div>
                <p className="text-gray-500 font-bold max-w-2xl text-lg">
                    System status: <span className="text-primary font-black">All systems operational.</span> Your platform metrics are synced and ready for review.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard 
                    label="Active Submissions" 
                    value={stats.totalSubmitted} 
                    color="#25D366" 
                    icon={FileWarning} 
                />
                <StatCard 
                    label="Fake News Neutralized" 
                    value={stats.fakeDetected} 
                    color="#ef4444" 
                    icon={ShieldCheck} 
                    trend={stats.fakeDetected > 0 ? "Potential threats flagged" : "Zero false positives"}
                />
                <StatCard 
                    label="Content Published" 
                    value={stats.published} 
                    color="#000000" 
                    icon={CheckCircle2} 
                />
            </div>

            <div className="bg-white p-10 rounded-5xl border-2 border-bg-tertiary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap size={200} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-black tracking-tight mb-2">AI Trust Index</h3>
                            <p className="text-gray-500 font-bold">Real-time verification breakdown of the entire platform.</p>
                        </div>
                        <div className="bg-primary/10 text-primary-dark px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 border border-primary/20">
                            <Activity size={16} /> {stats.realPercent}% Dynamic Accuracy
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="h-10 w-full bg-gray-50 rounded-2xl overflow-hidden flex border-2 border-gray-100 p-1">
                            <div 
                                className="h-full bg-primary rounded-xl transition-all duration-1000 ease-out shadow-lg" 
                                style={{ width: `${stats.realPercent}%` }}
                            ></div>
                            <div 
                                className="h-full bg-danger rounded-xl transition-all duration-1000 ease-out ml-1" 
                                style={{ width: `${stats.fakePercent}%` }}
                            ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 text-sm pt-4">
                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/40"></div>
                                    <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Verified Content</span>
                                </div>
                                <div className="text-3xl font-black text-black">{stats.realPercent}%</div>
                                <p className="text-xs font-bold text-gray-500 mt-2">Passed AI detection and editorial standards.</p>
                            </div>
                            <div className="bg-danger/5 p-6 rounded-3xl border border-danger/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-danger shadow-lg shadow-danger/40"></div>
                                    <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Flagged Content</span>
                                </div>
                                <div className="text-3xl font-black text-black">{stats.fakePercent}%</div>
                                <p className="text-xs font-bold text-gray-500 mt-2">Blocked for misinformation or potential bias.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RoleAnalytics role={user?.role || ''} stats={stats} />
        </div>
    );
};

export default Overview;
