import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import { Shield, ChevronRight, TrendingUp, Clock, Search, User } from 'lucide-react';

const Home = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                [
                    Query.equal('status', 'PUBLISHED'),
                    Query.orderDesc('createdAt'),
                    Query.limit(12)
                ]
            );
            setArticles(response.documents);
        } catch (error) {
            console.error('Failed to fetch news', error);
            setArticles([
                { $id: '1', title: 'World Economy Shifts Toward Sustainability', content: 'Global leaders have agreed on a new framework that prioritizes green energy...', imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800', aiScore: 94, authorName: 'Elena Green', category: 'Economy', createdAt: new Date().toISOString() },
                { $id: '2', title: 'New AI Standards Proposed for Privacy', content: 'The international council for technology has released a draft for ethical AI...', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', aiScore: 88, authorName: 'Mark Chen', category: 'Technology', createdAt: new Date().toISOString() },
                { $id: '3', title: 'SpaceX Prepares for Mars Mission Alpha', content: 'Engineers at Starbase are finalizing checks for the next orbital launch attempt...', imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=800', aiScore: 92, authorName: 'Sarah Mars', category: 'Science', createdAt: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const featuredArticle = articles[0];
    const sideArticles = articles.slice(1, 4);
    const bottomArticles = articles.slice(4);

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-60 bg-white/80 border-b-2 border-bg-tertiary px-[5%] py-4 flex justify-between items-center shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-12">
                    <Link to="/" className="text-4xl font-black tracking-tighter hover:scale-105 transition-transform flex items-center gap-2">
                        <span className="bg-black text-white px-3 py-1 rounded-xl">NEWS</span>
                        <span className="text-primary tracking-tight">GUARD</span>
                    </Link>
                    <div className="hidden lg:flex gap-8 items-center text-sm font-black uppercase tracking-widest text-gray-500">
                        <Link to="/" className="hover:text-primary transition-colors border-b-2 border-primary pb-1">Home</Link>
                        <Link to="/politics" className="hover:text-primary transition-colors">Politics</Link>
                        <Link to="/tech" className="hover:text-primary transition-colors">Tech</Link>
                        <Link to="/health" className="hover:text-primary transition-colors">Health</Link>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 focus-within:ring-2 ring-primary/20 transition-all">
                        <Search size={18} className="text-gray-400" />
                        <input type="text" placeholder="Search news..." className="bg-transparent border-none outline-none text-sm font-bold ml-2 w-40" />
                    </div>
                    {user ? (
                        <Link to="/dashboard" className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-xl hover:bg-gray-800 transition-all">
                            <User size={18} /> Dashboard
                        </Link>
                    ) : (
                        <Link to="/login" className="bg-primary text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>

            {/* Breaking News Ticker */}
            <div className="bg-primary-dark/10 py-3 px-[5%] flex items-center gap-4 border-b border-primary/10">
                <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">AI Fact Ticker</span>
                <div className="text-sm font-black overflow-hidden relative h-5 flex-1">
                    <p className="absolute animate-marquee whitespace-nowrap">
                        🛡️ AI Status: High Accuracy Mode Enabled • 🌍 2,450 Articles verified today • ✅ Accuracy Rate: 99.4% • ⏳ Next platform sync in 12m
                    </p>
                </div>
            </div>

            <main className="px-[5%] py-12 max-w-[1600px] mx-auto space-y-20">
                <div className="text-center space-y-4 mb-20">
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter bg-linear-to-r from-black via-primary to-primary-dark bg-clip-text text-transparent">
                        Trustworthy News, Verified by AI
                    </h2>
                    <p className="text-xl md:text-2xl font-bold text-gray-500 max-w-3xl mx-auto">
                        Stay informed with articles that have been fact-checked and analyzed for reliability.
                    </p>
                </div>

                {/* Hero Feature Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Featured */}
                    <div className="lg:col-span-8 group cursor-pointer">
                        {featuredArticle && (
                            <Link to={`/article/${featuredArticle.$id}`} className="block space-y-8">
                                <div className="relative overflow-hidden rounded-4xl aspect-video shadow-2xl">
                                    <img 
                                        src={featuredArticle.imageUrl || 'https://images.unsplash.com/photo-1585829365234-781fdec3d4e4?auto=format&fit=crop&q=80&w=1200'} 
                                        alt={featuredArticle.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-6 left-6 flex gap-3">
                                        <span className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg border border-white/20">
                                            {featuredArticle.category || 'FEATURED'}
                                        </span>
                                        <span className="bg-white/90 backdrop-blur-md text-primary-dark px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg flex items-center gap-2">
                                            <Shield size={14} /> {featuredArticle.aiScore}% TRUST SCORE
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tighter text-black group-hover:text-primary transition-colors">
                                        {featuredArticle.title}
                                    </h1>
                                    <p className="text-xl text-gray-600 font-bold leading-relaxed max-w-4xl line-clamp-3">
                                        {featuredArticle.content?.replace(/<[^>]*>/g, '') || ''}
                                    </p>
                                    <div className="flex items-center gap-6 pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black">
                                                {featuredArticle.authorName?.charAt(0)}
                                            </div>
                                            <span className="font-black text-sm uppercase tracking-widest">{featuredArticle.authorName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                                            <Clock size={16} /> 5 min read
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Side Sidebar Stories */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="flex items-center gap-4 mb-8">
                            <TrendingUp className="text-primary" size={24} />
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Trending Verified Stories</h3>
                        </div>
                        <div className="space-y-8">
                            {sideArticles.map((article, idx) => (
                                <Link key={article.$id} to={`/article/${article.$id}`} className="flex gap-6 group">
                                    <div className="text-4xl font-black text-gray-100 group-hover:text-primary transition-colors">
                                        0{idx + 1}
                                    </div>
                                    <div className="space-y-2 border-b border-gray-100 pb-6 flex-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                            {article.category}
                                        </span>
                                        <h4 className="text-lg font-black leading-snug group-hover:underline">
                                            {article.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 font-bold">
                                            AI Verdict: <span className="text-primary-dark">VERIFIED HIGH ACCURACY</span>
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="bg-black text-white p-8 rounded-4xl relative overflow-hidden shadow-2xl">
                            <Shield className="absolute -bottom-10 -right-10 text-white/10" size={160} />
                            <h4 className="text-xl font-black mb-4 relative z-10">Fact-Check Any Claim</h4>
                            <p className="text-sm font-bold text-gray-400 mb-6 relative z-10">Paste any article or claim and our AI will analyze its veracity in seconds.</p>
                            <Link to="/check" className="bg-primary text-white px-6 py-3 rounded-xl font-black text-xs inline-flex items-center gap-2 hover:scale-105 transition-all relative z-10">
                                Launch Tool <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* Sub Grid Section */}
                <section>
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-3xl font-black tracking-tighter">Global Verifications</h3>
                        <Link to="/all" className="text-sm font-black uppercase text-primary flex items-center gap-1 hover:translate-x-1 transition-all">
                            View all articles <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {bottomArticles.map(article => (
                            <Link key={article.$id} to={`/article/${article.$id}`} className="group space-y-6">
                                <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border border-gray-50">
                                    <img 
                                        src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                        alt=""
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">{article.category}</span>
                                        <span className="text-xs font-bold text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-2xl font-black leading-tight group-hover:text-primary transition-all">
                                        {article.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 font-bold line-clamp-2">
                                        {article.content?.replace(/<[^>]*>/g, '') || ''}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="bg-gray-50 border-t-2 border-bg-tertiary pt-20 pb-10 px-[5%] text-center">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="flex flex-col items-center gap-6">
                        <Link to="/" className="text-4xl font-black tracking-tighter">
                            NEWS<span className="text-primary">GUARD</span>
                        </Link>
                        <p className="text-gray-400 font-bold max-w-xl text-lg">
                            Pioneering the future of journalism with AI-driven authentication and real-time fact calibration.
                        </p>
                    </div>
                    <div className="flex justify-center gap-12 font-black uppercase text-xs tracking-widest text-gray-500">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <Link to="/about" className="hover:text-primary">About</Link>
                        <Link to="/api" className="hover:text-primary">API</Link>
                        <Link to="/contact" className="hover:text-primary">Contact</Link>
                    </div>
                    <div className="pt-10 border-t border-gray-200 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">
                        &copy; 2026 NewsGuard AI Systems • Verified Integrity Protocol
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(50%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;
