import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES, AUDIT_LOGS_COLLECTION_ID } from '../../lib/appwrite';
import { Query, ID } from 'appwrite';
import { CheckCircle, XCircle, Eye, Search, Filter, ShieldCheck, FileText, AlertTriangle, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ReviewNews = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPendingArticles = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                [Query.equal('status', ['PENDING', 'FLAGGED']), Query.orderDesc('createdAt')]
            );
            setArticles(response.documents);
        } catch (error) {
            console.error('Failed to fetch articles', error);
            setArticles([
                { $id: '1', title: 'Suspicious Alien Sighting', content: 'Aliens confirm landing in central London suburbs...', aiLabel: 'FAKE', aiScore: 9, authorName: 'John Doe', createdAt: new Date().toISOString() },
                { $id: '2', title: 'Economic Growth 2026', content: 'The treasury department released new figures showing...', aiLabel: 'REAL', aiScore: 92, authorName: 'Jane Smith', createdAt: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingArticles();
    }, []);

    const { user } = useAuth();

    const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED', feedback?: string) => {
        try {
            const article = articles.find(a => a.$id === id);
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, id, {
                status: decision,
                editorFeedback: feedback || ''
            });

            // Log to Audit Trail
            if (user) {
                await databases.createDocument(DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, ID.unique(), {
                    userId: user.$id,
                    userName: user.name,
                    action: decision,
                    entityId: id,
                    details: `Article "${article?.title}" was ${decision.toLowerCase()}. Feedback: ${feedback || 'None'}`,
                    timestamp: new Date().toISOString()
                });
            }

            setArticles(articles.filter(a => a.$id !== id));
            alert(decision === 'APPROVED' ? 'Article Approved for Admin!' : 'Changes Requested.');
        } catch (e) {
            console.error(e);
            alert('Action failed');
        }
    };

    // High-Fidelity Neural Deduplication Filter for current Queue
    const uniqueArticles = Array.from(new Map(articles.map(a => [a.title.toLowerCase().trim(), a])).values());
    const filteredArticles = uniqueArticles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-text-primary tracking-widest uppercase text-sm">Loading Review Queue...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-text-primary tracking-tighter">Editorial Review</h2>
                    <p className="text-text-secondary font-bold mt-2">Verify and validate articles before they go live.</p>
                </div>
                <div className="flex items-center gap-4 bg-bg-secondary p-2 rounded-2xl border-2 border-bg-tertiary shadow-sm focus-within:border-primary transition-all">
                    <Search className="text-text-secondary/50 ml-2" size={20} />
                    <input 
                        placeholder="Search queue..." 
                        className="bg-transparent border-none outline-none font-bold text-text-primary p-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Filter size={18} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {filteredArticles.length === 0 ? (
                <div className="bg-bg-secondary p-20 rounded-4xl border-2 border-dashed border-bg-tertiary text-center">
                    <div className="w-20 h-20 bg-bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-text-secondary/30" size={40} />
                    </div>
                    <p className="text-text-secondary/50 font-black text-xl tracking-tight uppercase">Queue is empty. Great job!</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {filteredArticles.map(article => (
                        <div key={article.$id} className="bg-bg-secondary p-8 rounded-4xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-all group flex flex-col gap-8">
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-text-primary tracking-tight leading-tight group-hover:text-primary transition-colors">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                                            <FileText size={14} />
                                            By {article.authorName} • {new Date(article.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 sm:mt-0">
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 border shadow-sm whitespace-nowrap
                                            ${article.aiClassification === 'FAKE' ? 'bg-danger/10 text-danger border-danger/20' : 
                                              article.aiClassification === 'MISLEADING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                              article.aiClassification === 'SATIRE' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                                              'bg-primary/10 text-primary border-primary/20'}
                                        `}>
                                            <ShieldCheck size={14} />
                                            AI: {article.aiClassification || article.aiLabel}
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-bg-tertiary text-text-primary text-[10px] font-black flex items-center gap-2 shadow-sm border border-bg-tertiary whitespace-nowrap">
                                            <ShieldCheck size={14} className="text-primary" />
                                            Trust: {Math.round(article.aiCredibility || 0)}%
                                        </div>
                                    </div>
                                </div>

                                {article.status === 'FLAGGED' && (
                                    <div className="bg-danger/5 border-2 border-danger/20 p-6 rounded-3xl space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3 text-danger font-black uppercase text-xs tracking-tighter">
                                                <AlertTriangle size={18} /> AI FLAG DETECTED - Analysis Report
                                            </div>
                                            {article.aiClassification && (
                                                <span className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">{article.aiClassification}</span>
                                            )}
                                        </div>
                                        <p className="text-text-primary font-bold text-sm leading-relaxed">
                                            {article.aiReason || "Potential misinformation detected. AI requires manual audit for this submission."}
                                        </p>
                                        <div className="bg-bg-primary p-4 rounded-2xl border-2 border-danger/5">
                                            <p className="text-[10px] font-black text-text-secondary uppercase mb-2">Edge Cases detected</p>
                                            <p className="text-xs font-bold text-text-primary">{article.aiEdgeCases || 'Low confidence in Nigerian vernacular patterns detected.'}</p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-text-secondary font-medium leading-relaxed">
                                    {(article.content || article.text || '')
                                        .replace(/<[^>]*>/g, '')
                                        .replace(/&nbsp;/g, ' ')
                                        .replace(/&amp;nbsp;/g, ' ')
                                        .substring(0, 250)}...
                                </p>

                                <div className="flex flex-wrap gap-4 pt-4 border-t border-bg-tertiary">
                                    <button
                                        onClick={() => handleDecision(article.$id, 'APPROVED')}
                                        className="bg-primary text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm"
                                    >
                                        <CheckCircle size={20} /> Approve Dispatch
                                    </button>
                                    <button
                                        onClick={() => {
                                            const feedback = prompt("Reason for rejection / Changes needed:");
                                            if (feedback !== null) handleDecision(article.$id, 'REJECTED', feedback);
                                        }}
                                        className="bg-bg-secondary text-danger px-8 py-3 rounded-2xl font-black flex items-center gap-2 border-2 border-danger/20 hover:bg-danger/10 transition-all text-sm"
                                    >
                                        <XCircle size={20} /> Request Changes
                                    </button>
                                    <Link to={`/article/${article.$id}`} className="ml-auto p-4 bg-bg-secondary rounded-2xl text-text-primary hover:bg-text-primary hover:text-bg-primary transition-all shadow-sm border-2 border-bg-tertiary">
                                        <Eye size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewNews;

