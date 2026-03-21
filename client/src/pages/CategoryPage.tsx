import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../lib/appwrite';
import { Query } from 'appwrite';
import { Shield, ChevronRight, Clock, User } from 'lucide-react';

const CategoryPage = () => {
    const { category } = useParams<{ category: string }>();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const currentCategory = category || 'all';
                console.log('Fetching articles for category:', currentCategory);
                const queries = [
                    Query.equal('status', 'PUBLISHED'),
                    Query.orderDesc('createdAt'),
                    Query.limit(20)
                ];
                
                if (currentCategory !== 'all') {
                    // Capitalize the first letter for category matching
                    const capCategory = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
                    queries.push(Query.equal('category', capCategory));
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white pb-20">
            {/* Minimal Header */}
            <nav className="border-b-2 border-bg-tertiary px-[5%] py-3 flex justify-between items-center shadow-lg bg-white/80 sticky top-0 z-50 backdrop-blur-md">
                <Link to="/" className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-0.5 rounded-lg">NEWS</span>
                    <span className="text-primary">GUARD</span>
                </Link>
                <div className="flex gap-8 items-center text-sm font-black uppercase tracking-widest text-gray-400">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <Link to="/politics" className={`${category === 'politics' ? 'text-primary' : 'hover:text-primary'} transition-colors`}>Politics</Link>
                    <Link to="/tech" className={`${category === 'tech' ? 'text-primary' : 'hover:text-primary'} transition-colors`}>Tech</Link>
                    <Link to="/health" className={`${category === 'health' ? 'text-primary' : 'hover:text-primary'} transition-colors`}>Health</Link>
                </div>
            </nav>

            <main className="px-[5%] py-12 max-w-[1400px] mx-auto">
                <header className="mb-16">
                    <h1 className="text-6xl font-black tracking-tighter uppercase">
                        {category && category !== 'all' ? `${category} News` : 'All Verified Articles'}
                    </h1>
                    <p className="text-xl text-gray-500 font-bold mt-4">Exploring the truth through AI-validated journalism.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {articles.length > 0 ? (
                        articles.map(article => (
                            <Link key={article.$id} to={`/article/${article.$id}`} className="group block space-y-6">
                                <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative">
                                    <img 
                                        src={article.imageUrl || 'https://images.unsplash.com/photo-1585829365234-781fdec3d4e4?auto=format&fit=crop&q=80&w=800'} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                        alt=""
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md text-primary-dark px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg border border-white/50 flex items-center gap-1.5">
                                            <Shield size={12} /> {article.aiScore}% TRUST
                                        </span>
                                    </div>
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
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs uppercase">
                                            {article.authorName?.charAt(0)}
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-widest">{article.authorName}</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-100 rounded-4xl">
                            <p className="text-2xl font-black text-gray-300">No articles available in this category yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CategoryPage;
