import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { Trash2, AlertTriangle, Eye, ShieldCheck, CheckSquare, Square, RefreshCcw, CheckCircle } from 'lucide-react';
import { normalizePlainText } from '../../lib/content';

const RejectedNews = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchRejectedArticles = async () => {
        setLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                [Query.equal('status', 'REJECTED'), Query.orderDesc('createdAt')]
            );
            setArticles(response.documents);
        } catch (error) {
            console.error('Failed to fetch rejected articles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRejectedArticles();
    }, []);

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === articles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(articles.map(a => a.$id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${selectedIds.size} article(s)? This action cannot be undone.`);
        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            for (const id of selectedIds) {
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, id);
            }
            setArticles(articles.filter(a => !selectedIds.has(a.$id)));
            setSelectedIds(new Set());
            alert('Selected articles deleted successfully.');
        } catch (error) {
            console.error('Failed to delete articles', error);
            alert('Failed to delete some articles.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRestore = async (id: string) => {
        const confirmRestore = window.confirm('Are you sure you want to restore and publish this article?');
        if (!confirmRestore) return;
        
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, id, {
                status: 'PUBLISHED'
            });
            setArticles(articles.filter(a => a.$id !== id));
            alert('Article successfully restored to Published status.');
        } catch (error) {
            console.error('Failed to restore article', error);
            alert('Failed to restore article.');
        }
    };

    const handleClearAll = async () => {
        if (articles.length === 0) return;
        const confirmClear = window.confirm('Are you absolutely sure you want to permanently delete ALL rejected articles? This action cannot be undone.');
        if (!confirmClear) return;

        setIsDeleting(true);
        try {
            for (const article of articles) {
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, article.$id);
            }
            setArticles([]);
            setSelectedIds(new Set());
            alert('All rejected articles cleared successfully.');
        } catch (error) {
            console.error('Failed to clear articles', error);
            alert('Failed to clear some articles.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-danger border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-text-primary tracking-widest uppercase text-sm">Loading Trash Bin...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Trash2 className="text-danger" size={32} />
                        <h2 className="text-4xl font-black text-text-primary tracking-tighter">Rejected News</h2>
                    </div>
                    <p className="text-text-secondary font-bold mt-2">Manage and permanently delete flagged and rejected articles.</p>
                </div>
                
                {articles.length > 0 && (
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleDeleteSelected}
                            disabled={selectedIds.size === 0 || isDeleting}
                            className={`px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-md
                                ${selectedIds.size > 0 && !isDeleting ? 'bg-danger text-white hover:bg-red-600 shadow-danger/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                            {isDeleting ? <RefreshCcw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete Selected ({selectedIds.size})
                        </button>
                        
                        <button 
                            onClick={handleClearAll}
                            disabled={isDeleting}
                            className="px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 border-2 border-danger text-danger hover:bg-danger/10 transition-all disabled:opacity-50"
                        >
                            <AlertTriangle size={16} />
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {articles.length === 0 ? (
                <div className="bg-bg-secondary p-20 rounded-4xl border-2 border-dashed border-bg-tertiary text-center">
                    <div className="w-20 h-20 bg-bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="text-text-secondary/30" size={40} />
                    </div>
                    <p className="text-text-secondary/50 font-black text-xl tracking-tight uppercase">Trash is empty.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between px-6 py-4 bg-bg-secondary rounded-2xl border border-bg-tertiary">
                        <button onClick={toggleSelectAll} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-black uppercase text-xs tracking-wider">
                            {selectedIds.size === articles.length ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                            Select All
                        </button>
                        <span className="text-text-secondary font-bold text-xs">{articles.length} Article(s) Total</span>
                    </div>

                    <div className="grid gap-6">
                        {articles.map(article => (
                            <div key={article.$id} 
                                className={`bg-bg-secondary p-6 rounded-3xl border-2 shadow-lg transition-all flex flex-col md:flex-row gap-6 items-start
                                    ${selectedIds.has(article.$id) ? 'border-danger/50 shadow-danger/10' : 'border-bg-tertiary hover:border-text-secondary/30'}
                                `}
                            >
                                <button onClick={() => toggleSelect(article.$id)} className="mt-2 md:mt-1 cursor-pointer">
                                    {selectedIds.has(article.$id) ? <CheckSquare size={24} className="text-danger" /> : <Square size={24} className="text-text-secondary/50" />}
                                </button>
                                
                                <div className="flex-1 space-y-4 w-full">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-text-primary tracking-tight leading-tight">
                                                {article.title}
                                            </h3>
                                            <p className="text-xs font-bold text-text-secondary mt-1">
                                                By {article.authorName} • {new Date(article.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="px-3 py-1 rounded-lg bg-danger/10 text-danger border border-danger/20 text-[10px] font-black uppercase flex items-center gap-1 whitespace-nowrap">
                                            <AlertTriangle size={12} /> REJECTED
                                        </div>
                                    </div>
                                    
                                    {article.editorFeedback && (
                                        <div className="bg-bg-primary p-4 rounded-2xl border-l-4 border-amber-500 text-sm">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Editor Feedback</p>
                                            <p className="font-bold text-text-primary">{article.editorFeedback}</p>
                                        </div>
                                    )}

                                    <p className="text-text-secondary font-medium leading-relaxed text-sm">
                                        {normalizePlainText(article.content || '').substring(0, 200)}...
                                    </p>

                                    <div className="flex justify-end gap-3 pt-2 border-t border-bg-tertiary">
                                        <button onClick={() => handleRestore(article.$id)} className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border-2 border-primary text-primary rounded-xl text-xs font-black hover:bg-primary/10 transition-all shadow-sm">
                                            <CheckCircle size={16} /> Restore & Publish
                                        </button>
                                        <Link to={`/article/${article.$id}`} className="flex items-center gap-2 px-4 py-2 bg-bg-primary border border-bg-tertiary rounded-xl text-text-primary text-xs font-black hover:bg-primary hover:text-white transition-all shadow-sm">
                                            <Eye size={16} /> Read / Reconfirm
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RejectedNews;
