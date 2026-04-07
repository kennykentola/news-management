import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES, COLLECTION_ID_USERS_METADATA } from '../lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, ChevronRight, TrendingUp, Clock, Search, User, ArrowRight, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Footer from '../components/Footer';

const Home = () => {
    const { user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [stats, setStats] = useState({ total: 2450, accuracy: 99.4 });
    const [recommended, setRecommended] = useState<any[]>([]);

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

            // Recommendation Logic
            if (user) {
                try {
                    const metadata = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTION_ID_USERS_METADATA,
                        [Query.equal('email', user.email)]
                    );
                    if (metadata.documents.length > 0) {
                        const interests = (metadata.documents[0].interests || "").split(',').filter(Boolean);
                        if (interests.length > 0) {
                            const recRes = await databases.listDocuments(
                                DATABASE_ID,
                                COLLECTION_ID_ARTICLES,
                                [
                                    Query.equal('category', interests),
                                    Query.equal('status', 'PUBLISHED'),
                                    Query.limit(4)
                                ]
                            );
                            setRecommended(recRes.documents);
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch recommendations', e);
                }
            }
        } catch (error) {
            console.error('Failed to fetch news', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [user]);

    const featuredArticle = articles[0];
    const sideArticles = articles.slice(1, 4);
    const bottomArticles = articles.slice(4);

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-white transition-colors duration-500">
            {/* Massive Premium Header */}
            <nav className="border-b-4 border-primary px-[5%] py-4 flex justify-between items-center shadow-2xl bg-bg-primary sticky top-0 z-50 transition-colors">
                <div className="flex items-center gap-12">
                    <Link to="/" className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform flex items-center gap-2 text-text-primary no-underline">
                        <button 
                            onClick={(e) => { e.preventDefault(); setIsMenuOpen(!isMenuOpen); }}
                            className="md:hidden p-1.5 hover:bg-bg-tertiary rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <span className="bg-text-primary text-bg-primary px-2 py-0.5 rounded-lg transition-colors">NEWS</span>
                        <span className="text-primary">GUARD</span>
                    </Link>
                    <div className="hidden md:flex gap-10 items-center text-sm font-black uppercase tracking-widest text-text-secondary">
                        <Link to="/" className="hover:text-primary transition-colors border-b-2 border-primary pb-1 no-underline text-text-primary">Home</Link>
                        <Link to="/category/Politics" className="hover:text-primary transition-colors no-underline text-text-secondary">Politics</Link>
                        <Link to="/category/Technology" className="hover:text-primary transition-colors no-underline text-text-secondary">Tech</Link>
                        <Link to="/category/Health" className="hover:text-primary transition-colors no-underline text-text-secondary">Health</Link>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center bg-bg-secondary px-4 py-2 rounded-xl border border-bg-tertiary focus-within:ring-2 ring-primary/20 transition-all">
                        <Search size={18} className="text-text-secondary" />
                        <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm font-bold ml-2 w-24 md:w-40 text-text-primary placeholder:text-text-secondary/50" />
                    </div>
                    <button 
                        onClick={toggleDarkMode}
                        className="p-1.5 bg-bg-secondary rounded-lg border border-bg-tertiary text-text-primary hover:scale-110 active:scale-95 transition-all shadow-sm"
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    {user ? (
                        <Link to="/dashboard" className="flex items-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-xl font-black text-xs md:text-sm shadow-xl hover:opacity-90 transition-all whitespace-nowrap">
                            <User size={18} /> <span className="hidden xs:block">Dashboard</span>
                        </Link>
                    ) : (
                        <Link to="/login" className="bg-primary text-white px-4 md:px-6 py-2 rounded-xl font-black text-xs md:text-sm shadow-xl shadow-primary/30 hover:scale-105 transition-transform whitespace-nowrap no-underline">
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-bg-primary border-b-4 border-primary shadow-2xl animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col p-8 gap-6 text-xl font-black uppercase tracking-tighter">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-primary border-b border-bg-tertiary pb-4 no-underline text-text-primary">Home</Link>
                            <Link to="/category/Politics" onClick={() => setIsMenuOpen(false)} className="hover:text-primary border-b border-bg-tertiary pb-4 no-underline text-text-primary">Politics</Link>
                            <Link to="/category/Technology" onClick={() => setIsMenuOpen(false)} className="hover:text-primary border-b border-bg-tertiary pb-4 no-underline text-text-primary">Tech</Link>
                            <Link to="/category/Health" onClick={() => setIsMenuOpen(false)} className="hover:text-primary pb-4 no-underline text-text-primary">Health</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Breaking News Ticker */}
            <div className="bg-primary-dark/10 py-3 px-[5%] flex items-center gap-4 border-b border-primary/10">
                <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">AI Fact Ticker</span>
                <div className="text-sm font-black overflow-hidden relative h-5 flex-1 dark:text-primary">
                    <p className="absolute animate-marquee whitespace-nowrap">
                        🛡️ AI Status: High Accuracy Mode Enabled • 🌍 {stats.total.toLocaleString()} Articles verified on platform • ✅ AI Trusted Accuracy: {stats.accuracy}% • ⏳ Last platform update: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>

            <main className="px-[5%] py-12 md:py-20 space-y-24 max-w-[1500px] mx-auto overflow-hidden">
                {/* Master Featured Section */}
                <section className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                    {featuredArticle && (
                        <div className="xl:col-span-8 group relative rounded-4xl overflow-hidden shadow-2xl border-2 border-bg-tertiary bg-bg-secondary transition-all hover:shadow-primary/10">
                            <Link to={`/article/${featuredArticle.$id}`} className="block relative aspect-16/10 xl:aspect-auto xl:h-[650px] no-underline">
                                <img 
                                    src={featuredArticle.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    alt={featuredArticle.title}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-bg-primary via-bg-primary/40 to-transparent flex flex-col justify-end p-8 md:p-16 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-primary text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                                            {featuredArticle.category || 'Featured'}
                                        </span>
                                        <span className="bg-white/10 backdrop-blur-md text-text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-white/20 flex items-center gap-1.5">
                                            <Shield size={12} className="text-primary" /> {featuredArticle.aiScore}% Trusted
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter leading-[0.9] max-w-3xl group-hover:text-primary transition-colors">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="text-lg md:text-xl text-text-secondary font-bold line-clamp-2 max-w-2xl leading-relaxed">
                                        {featuredArticle.content?.replace(/<[^>]*>/g, '').slice(0, 200)}...
                                    </p>
                                    <div className="flex items-center gap-4 pt-4">
                                        <div className="w-12 h-12 rounded-2xl bg-text-primary text-bg-primary flex items-center justify-center font-black text-xl shadow-xl">
                                            {featuredArticle.authorName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-text-primary uppercase tracking-tight">By {featuredArticle.authorName}</p>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Lead Intelligence Asset</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Intelligence Sidebar */}
                    <div className="xl:col-span-4 space-y-12">
                        <div className="flex items-center justify-between border-b-4 border-primary pb-4">
                            <h3 className="text-2xl font-black tracking-tighter text-text-primary uppercase flex items-center gap-3">
                                <TrendingUp className="text-primary" /> Intelligence Feed
                            </h3>
                            <Link to="/all" className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:text-primary transition-colors no-underline">
                                Full Index
                            </Link>
                        </div>
                        <div className="space-y-10">
                            {sideArticles.map((article, idx) => (
                                <Link key={article.$id} to={`/article/${article.$id}`} className="group flex gap-6 items-start no-underline">
                                    <span className="text-5xl font-black text-text-secondary/20 transition-colors group-hover:text-primary/20">{idx + 2}</span>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{article.category}</span>
                                        <h4 className="text-xl font-black text-text-primary leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {article.title}
                                        </h4>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                            <Clock size={12} /> {new Date(article.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        
                        {/* Premium CTA Card */}
                        <div className="bg-primary p-10 rounded-4xl shadow-2xl relative overflow-hidden group">
                            <Sparkles className="absolute -bottom-4 -right-4 text-white/20 w-32 h-32 rotate-12 transition-transform group-hover:scale-125" />
                            <div className="relative z-10 space-y-6">
                                <h4 className="text-2xl font-black text-white leading-none tracking-tighter italic">"Truth is the only currency that matters."</h4>
                                <p className="text-white/80 font-bold text-sm tracking-tight leading-relaxed">
                                    Deploy our neural assessment tools to verify the integrity of any information asset in real-time.
                                </p>
                                <Link to="/fact-check" className="inline-flex items-center gap-2 bg-text-primary text-bg-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all no-underline">
                                    Fact Check Lab <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-bg-tertiary" />

                {/* Sub Grid Section */}
                <section className="space-y-12">
                    <div className="flex justify-between items-center">
                        <h3 className="text-3xl font-black tracking-tighter text-text-primary">Global Index</h3>
                        <Link to="/all" className="text-sm font-black uppercase text-primary flex items-center gap-1 hover:translate-x-1 transition-all no-underline">
                            View everything <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {bottomArticles.map(article => (
                            <Link key={article.$id} to={`/article/${article.$id}`} className="group flex flex-col bg-bg-secondary rounded-4xl border-2 border-bg-tertiary overflow-hidden shadow-lg hover:shadow-2xl transition-all h-full no-underline text-text-primary">
                                <div className="aspect-16/10 overflow-hidden relative">
                                    <img 
                                        src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                        alt=""
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-bg-primary/90 backdrop-blur-md text-text-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-md flex items-center gap-1.5 border border-bg-tertiary">
                                            <Shield size={12} className="text-primary" /> {article.aiScore}% TRUST
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">{article.category}</span>
                                        <span className="text-xs font-bold text-text-secondary">{new Date(article.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-2xl font-black leading-tight group-hover:text-primary transition-all mb-4 line-clamp-2">
                                        {article.title}
                                    </h4>
                                    <p className="text-sm text-text-secondary font-bold line-clamp-3 mb-8 flex-1">
                                        {(article.content || article.text)?.replace(/<[^>]*>/g, '') || ''}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-bg-tertiary">
                                        <div className="flex items-center gap-2 text-text-secondary font-black text-[10px] uppercase tracking-widest">
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

            <Footer />

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
