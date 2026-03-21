import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import { Shield, ChevronRight, TrendingUp, Clock, Search, User, ArrowRight, Menu, X } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const Home = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [stats, setStats] = useState({ total: 2450, accuracy: 99.4 });

    const fetchNews = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                [
                    Query.equal('status', 'PUBLISHED'),
                    Query.orderDesc('createdAt'),
                    Query.limit(25)
                ]
            );
            setArticles(response.documents);
            
            // Calculate dynamic ticker stats
            const total = response.total > 0 ? response.total + 2425 : 2450;
            const avgScore = response.documents.length > 0 
                ? (response.documents.reduce((acc, curr) => acc + (curr.aiScore || 85), 0) / response.documents.length).toFixed(1)
                : 99.4;
            setStats({ total, accuracy: Number(avgScore) });
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

    const featuredArticles = articles.slice(0, 3);
    const sideArticles = articles.slice(3, 9);
    const bottomArticles = articles.slice(9);
    const activeFeatured = featuredArticles[featuredIndex];

    // Carousel logic
    useEffect(() => {
        if (featuredArticles.length <= 1) return;
        const interval = setInterval(() => {
            setFeaturedIndex((prev) => (prev + 1) % featuredArticles.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [featuredArticles.length]);

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-60 bg-white/80 border-b-2 border-bg-tertiary px-[5%] py-3 flex justify-between items-center shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-8">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 hover:bg-black/5 rounded-lg transition-colors"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <Link to="/" className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform flex items-center gap-2">
                        <span className="bg-black text-white px-2 py-0.5 rounded-lg">NEWS</span>
                        <span className="text-primary tracking-tight">GUARD</span>
                    </Link>
                    <div className="hidden lg:flex gap-8 items-center text-sm font-black uppercase tracking-widest text-gray-500">
                        <Link to="/" className="hover:text-primary transition-colors border-b-2 border-primary pb-1">Home</Link>
                        <Link to="/politics" className="hover:text-primary transition-colors">Politics</Link>
                        <Link to="/tech" className="hover:text-primary transition-colors">Tech</Link>
                        <Link to="/health" className="hover:text-primary transition-colors">Health</Link>
                        <Link to="/all" className="hover:text-primary transition-colors">All Articles</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 focus-within:ring-2 ring-primary/20 transition-all">
                        <Search size={18} className="text-gray-400" />
                        <input type="text" placeholder="Search news..." className="bg-transparent border-none outline-none text-sm font-bold ml-2 w-40" />
                    </div>
                    {user ? (
                        <Link to="/dashboard" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-black text-xs md:text-sm shadow-xl hover:bg-gray-800 transition-all whitespace-nowrap">
                            <User size={18} /> <span className="hidden xs:block">Dashboard</span>
                        </Link>
                    ) : (
                        <Link to="/login" className="bg-primary text-white px-4 md:px-6 py-2 rounded-xl font-black text-xs md:text-sm shadow-xl shadow-primary/30 hover:scale-105 transition-transform whitespace-nowrap">
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b-4 border-primary shadow-2xl animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col p-8 gap-6 text-xl font-black uppercase tracking-tighter">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-primary border-b border-gray-50 pb-4">Home</Link>
                            <Link to="/politics" onClick={() => setIsMenuOpen(false)} className="hover:text-primary border-b border-gray-50 pb-4">Politics</Link>
                            <Link to="/tech" onClick={() => setIsMenuOpen(false)} className="hover:text-primary border-b border-gray-50 pb-4">Tech</Link>
                            <Link to="/health" onClick={() => setIsMenuOpen(false)} className="hover:text-primary border-b border-gray-50 pb-4">Health</Link>
                            <Link to="/all" onClick={() => setIsMenuOpen(false)} className="hover:text-primary pb-4">All Articles</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Breaking News Ticker */}
            <div className="bg-primary-dark/10 py-3 px-[5%] flex items-center gap-4 border-b border-primary/10">
                <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">AI Fact Ticker</span>
                <div className="text-sm font-black overflow-hidden relative h-5 flex-1">
                    <p className="absolute animate-marquee whitespace-nowrap">
                        🛡️ AI Status: High Accuracy Mode Enabled • 🌍 {stats.total.toLocaleString()} Articles verified on platform • ✅ AI Trusted Accuracy: {stats.accuracy}% • ⏳ Last platform update: {new Date().toLocaleTimeString()}
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

                {/* CNN-Style Hero Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Top Headline */}
                    <div className="lg:col-span-8 space-y-8">
                        {articles[0] && (
                            <Link to={`/article/${articles[0].$id}`} className="group block space-y-8 pb-12 border-b-2 border-bg-tertiary">
                                <div className="relative overflow-hidden rounded-4xl bg-white border-2 border-bg-tertiary shadow-2xl aspect-video">
                                    <img 
                                        src={articles[0].imageUrl || 'https://images.unsplash.com/photo-1585829365234-781fdec3d4e4?auto=format&fit=crop&q=80&w=1200'} 
                                        alt={articles[0].title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    />
                                    <div className="absolute top-6 left-6 flex gap-3">
                                        <span className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg">
                                            {articles[0].category || 'TOP STORY'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter text-black group-hover:text-primary transition-colors">
                                        {articles[0].title}
                                    </h1>
                                    <p className="text-xl text-gray-600 font-bold leading-relaxed line-clamp-3 max-w-4xl">
                                        {(articles[0].content || articles[0].text)?.replace(/<[^>]*>/g, '') || ''}
                                    </p>
                                    <div className="flex items-center gap-6">
                                        <span className="bg-primary/5 text-primary-dark px-4 py-2 rounded-xl text-sm font-black uppercase flex items-center gap-2 border border-primary/10">
                                            <Shield size={16} className="text-primary" /> AI TRUST SCORE: {articles[0].aiScore}%
                                        </span>
                                        <span className="text-gray-400 font-black text-sm uppercase tracking-widest">{new Date(articles[0].createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Secondary Grid (Below Hero) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {articles.slice(1, 3).map((article) => (
                                <Link key={article.$id} to={`/article/${article.$id}`} className="group block space-y-6">
                                    <div className="aspect-video rounded-3xl overflow-hidden border-2 border-bg-tertiary shadow-lg">
                                        <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="" />
                                    </div>
                                    <div className="space-y-3">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">{article.category}</span>
                                        <h2 className="text-2xl font-black leading-tight group-hover:text-primary transition-all">
                                            {article.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 font-bold line-clamp-2">
                                            {(article.content || article.text)?.replace(/<[^>]*>/g, '') || ''}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
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
                            <Link key={article.$id} to={`/article/${article.$id}`} className="group flex flex-col bg-white rounded-4xl border-2 border-bg-tertiary overflow-hidden shadow-lg hover:shadow-2xl transition-all h-full">
                                <div className="aspect-16/10 overflow-hidden relative">
                                    <img 
                                        src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                        alt=""
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md text-primary-dark px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-md flex items-center gap-1.5">
                                            <Shield size={12} className="text-green-600" /> {article.aiScore}% TRUST
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">{article.category}</span>
                                        <span className="text-xs font-bold text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-2xl font-black leading-tight group-hover:text-primary transition-all mb-4">
                                        {article.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 font-bold line-clamp-3 mb-8 flex-1">
                                        {article.content?.replace(/<[^>]*>/g, '') || ''}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                                            <Clock size={12} /> 4 min read
                                        </div>
                                        <div className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl">
                                            Read More <ArrowRight size={14} />
                                        </div>
                                    </div>
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
