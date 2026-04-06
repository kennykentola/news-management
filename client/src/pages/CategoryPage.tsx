import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../lib/appwrite';
import { Query } from 'appwrite';
import { Shield, ChevronRight, Clock, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CategoryPage = () => {
    const { category } = useParams<{ category: string }>();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isDarkMode, toggleDarkMode } = useTheme();

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const currentCategory = category || 'all';
                const queries = [
                    Query.equal('status', 'PUBLISHED'),
                    Query.orderDesc('createdAt'),
                    Query.limit(20)
                ];
                
                if (currentCategory !== 'all') {
                    // Normalization for tech -> Technology mapping
                    let categoryToFetch = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
                    if (categoryToFetch.toLowerCase() === 'tech' || categoryToFetch.toLowerCase() === 'technology') {
                        categoryToFetch = 'Technology';
                    }
                    
                    queries.push(Query.equal('category', categoryToFetch));
                }

                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_ARTICLES,
                    queries
                );
                setArticles(response.documents);
            } catch (error) {
                console.error('Failed to fetch articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [category]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-white pb-20 transition-colors">
            {/* Minimal Header */}
            <nav className="border-b-2 border-bg-tertiary px-[5%] py-3 flex justify-between items-center shadow-lg bg-bg-primary/80 sticky top-0 z-50 backdrop-blur-md transition-colors">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform flex items-center gap-2 text-text-primary no-underline">
                        <button 
                            onClick={(e) => { e.preventDefault(); setIsMenuOpen(!isMenuOpen); }}
                            className="md:hidden p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <span className="bg-text-primary text-bg-primary px-2 py-0.5 rounded-lg transition-colors">NEWS</span>
                        <span className="text-primary">GUARD</span>
                    </Link>
                </div>
                <div className="hidden md:flex gap-10 items-center text-sm font-black uppercase tracking-widest text-text-secondary">
                    <Link to="/" className="hover:text-primary transition-colors no-underline text-text-secondary">Home</Link>
                    <Link to="/category/Politics" className={`${category?.toLowerCase() === 'politics' ? 'text-primary' : 'hover:text-primary'} transition-colors no-underline`}>Politics</Link>
                    <Link to="/category/Technology" className={`${category?.toLowerCase() === 'technology' || category?.toLowerCase() === 'tech' ? 'text-primary' : 'hover:text-primary'} transition-colors no-underline`}>Tech</Link>
                    <Link to="/category/Health" className={`${category?.toLowerCase() === 'health' ? 'text-primary' : 'hover:text-primary'} transition-colors no-underline`}>Health</Link>
                    <button 
                        onClick={toggleDarkMode}
                        className="p-1.5 ml-4 bg-bg-secondary rounded-lg border border-bg-tertiary text-text-primary hover:scale-110 active:scale-95 transition-all shadow-sm"
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-bg-primary border-b-4 border-primary shadow-2xl animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col p-8 gap-6 text-xl font-black uppercase tracking-tighter">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-primary border-b border-bg-tertiary pb-4 no-underline text-text-primary">Home</Link>
                            <Link to="/category/Politics" onClick={() => setIsMenuOpen(false)} className={`${category?.toLowerCase() === 'politics' ? 'text-primary' : ''} hover:text-primary border-b border-bg-tertiary pb-4 no-underline`}>Politics</Link>
                            <Link to="/category/Technology" onClick={() => setIsMenuOpen(false)} className={`${category?.toLowerCase() === 'technology' || category?.toLowerCase() === 'tech' ? 'text-primary' : ''} hover:text-primary border-b border-bg-tertiary pb-4 no-underline`}>Tech</Link>
                            <Link to="/category/Health" onClick={() => setIsMenuOpen(false)} className={`${category?.toLowerCase() === 'health' ? 'text-primary' : ''} hover:text-primary pb-4 no-underline`}>Health</Link>
                        </div>
                    </div>
                )}
            </nav>

            <main className="px-[5%] py-12 max-w-[1400px] mx-auto">
                <header className="mb-16">
                    <h1 className="text-6xl font-black tracking-tighter uppercase text-text-primary">
                        {category && category !== 'all' ? `${category} News` : 'All Verified Articles'}
                    </h1>
                    <p className="text-xl text-text-secondary font-bold mt-4">Exploring the truth through AI-validated journalism.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {articles.length > 0 ? (
                        articles.map(article => (
                            <Link key={article.$id} to={`/article/${article.$id}`} className="group block space-y-6 no-underline text-text-primary">
                                <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border border-bg-tertiary relative transition-all group-hover:shadow-2xl">
                                    <img 
                                        src={article.imageUrl || 'https://images.unsplash.com/photo-1585829365234-781fdec3d4e4?auto=format&fit=crop&q=80&w=800'} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                        alt=""
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-bg-primary/90 backdrop-blur-md text-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg border border-bg-tertiary flex items-center gap-1.5 transition-colors">
                                            <Shield size={12} /> {article.aiScore}% TRUST
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">{article.category}</span>
                                        <span className="text-xs font-bold text-text-secondary">{new Date(article.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-2xl font-black leading-tight group-hover:text-primary transition-all">
                                        {article.title}
                                    </h4>
                                    <p className="text-sm text-text-secondary font-bold line-clamp-2">
                                        {article.content?.replace(/<[^>]*>/g, '') || ''}
                                    </p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-bg-tertiary">
                                        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center font-black text-xs uppercase text-text-primary">
                                            {article.authorName?.charAt(0)}
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-widest text-text-secondary">{article.authorName}</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border-4 border-dashed border-bg-tertiary rounded-4xl">
                            <p className="text-2xl font-black text-text-secondary/30">No articles available in this category yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CategoryPage;
