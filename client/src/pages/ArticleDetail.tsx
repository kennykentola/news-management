import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES, COMMENTS_COLLECTION_ID, COLLECTION_ID_USERS_METADATA } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingScreen from '../components/LoadingScreen';
import Footer from '../components/Footer';
import { Shield, Clock, User, Share2, MessageSquare, ArrowLeft, Globe, Zap, Cpu, Link as LinkIcon, XCircle, ExternalLink, Trash2, Sun, Moon } from 'lucide-react';

const ArticleDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [article, setArticle] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            try {
                const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, id);
                setArticle(doc);

                // Fetch Comments
                const commentsRes = await databases.listDocuments(
                    DATABASE_ID,
                    COMMENTS_COLLECTION_ID,
                    [
                        Query.equal('articleId', id),
                        Query.orderDesc('createdAt')
                    ]
                );
                setComments(commentsRes.documents);

                // Track interest if logged in
                if (user && doc.category) {
                    try {
                        const metadata = await databases.listDocuments(
                            DATABASE_ID,
                            COLLECTION_ID_USERS_METADATA,
                            [Query.equal('email', user.email)]
                        );
                        if (metadata.documents.length > 0) {
                            const meta = metadata.documents[0];
                            const currentInterests = (meta.interests || "").split(',').filter(Boolean);
                            if (!currentInterests.includes(doc.category)) {
                                const newInterests = [...currentInterests, doc.category].slice(-5).join(',');
                                await databases.updateDocument(DATABASE_ID, COLLECTION_ID_USERS_METADATA, meta.$id, {
                                    interests: newInterests
                                });
                            }
                        }
                    } catch (e) {
                        console.warn('Metadata interest update failed', e);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load article manuscript.');
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();

        // High-Fidelity Social Media Script Loader
        const scriptId = 'twitter-wjs';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            document.head.appendChild(script);
        } else {
            // Re-parse if script already exists (for client-side navigation)
            (window as any).twttr?.widgets?.load();
        }
    }, [id, user]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert('Please login to post a comment.');
        if (!newComment.trim()) return;

        try {
            const comment = await databases.createDocument(
                DATABASE_ID,
                COMMENTS_COLLECTION_ID,
                ID.unique(),
                {
                    content: newComment,
                    articleId: article.$id,
                    authorName: user.name,
                    createdAt: new Date().toISOString()
                }
            );
            setComments([comment, ...comments]);
            setNewComment('');
        } catch (e) {
            console.error(e);
            alert('Failed to post comment.');
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: article.title,
            text: 'Check out this verified article on NewsGuard AI!',
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Verification link copied to clipboard!');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <LoadingScreen message="Analyzing source authenticity..." />;
    if (error || !article) return (
        <div className="min-h-screen flex items-center justify-center p-20 text-center">
            <div className="space-y-6">
                <XCircle className="text-danger mx-auto" size={60} />
                <h2 className="text-3xl font-black text-black tracking-tight">{error || 'Article Missing from Index'}</h2>
                <Link to="/" className="text-primary font-black uppercase text-xs tracking-widest hover:underline">Return to Hub</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-white pb-32 transition-colors">
            <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b-2 border-bg-tertiary px-[5%] py-4 flex justify-between items-center shadow-lg transition-colors">
                <Link to="/" className="flex items-center gap-2 text-text-primary font-black uppercase text-xs tracking-widest hover:text-primary transition-all no-underline">
                    <ArrowLeft size={18} /> Back to Hub
                </Link>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={toggleDarkMode}
                        className="p-1.5 bg-bg-secondary rounded-lg border border-bg-tertiary text-text-primary hover:scale-110 active:scale-95 transition-all shadow-sm"
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    <button onClick={handleShare} className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                        <Share2 size={16} /> Share Truth
                    </button>
                    {user?.role === 'ADMIN' && (
                        <button 
                            onClick={async () => {
                                if(window.confirm("CRITICAL: Permanently delete this article from public archive?")) {
                                    try {
                                        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, article.$id);
                                        alert("Article Purged.");
                                        window.location.href = '/';
                                    } catch(e) {
                                        alert("Purge failed.");
                                    }
                                }
                            }}
                            className="p-3 bg-danger text-white rounded-xl shadow-lg shadow-danger/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                        >
                            <Trash2 size={16} /> Purge Article
                        </button>
                    )}
                </div>
            </nav>

            <article className="max-w-[1000px] mx-auto pt-20 px-[5%] space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <header className="space-y-8">
                    <div className="flex flex-wrap gap-4 items-center">
                        <span className="bg-primary/10 text-primary-dark dark:text-primary px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-2">
                             <Globe size={12} /> {article.category || 'General'}
                        </span>
                        <span className="text-text-secondary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={14} /> {new Date(article.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter leading-[0.95]">
                        {article.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-between gap-8 pt-8 border-t-2 border-bg-tertiary">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-text-primary text-bg-primary flex items-center justify-center font-black text-xl shadow-xl shadow-black/10 transition-colors">
                                {article.authorName?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-text-primary uppercase tracking-tight">By {article.authorName}</p>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Verified Intelligence Contributor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-bg-secondary p-4 rounded-2xl border-2 border-bg-tertiary shadow-xl">
                            <Shield className="text-primary" size={24} />
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">AI Reliability Score</p>
                                <p className="text-xl font-black text-primary">{article.aiScore}% Safe</p>
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* AI Verification Logic Block */}
                <section className="bg-bg-secondary p-8 md:p-10 rounded-4xl border-2 border-bg-tertiary shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className={`absolute top-0 right-0 p-10 opacity-5 ${article.aiLabel === 'FAKE' ? 'text-danger' : 'text-primary'}`}>
                        <Cpu size={180} />
                    </div>
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${article.aiLabel === 'FAKE' ? 'bg-danger' : 'bg-primary'}`}></div>
                                    <h3 className="text-2xl font-black text-text-primary tracking-tight uppercase">AI Verification Report</h3>
                                </div>
                                <p className="text-text-secondary font-bold">Analysis performed by NewsGuard Neural Engine v4.2</p>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className={`px-6 py-3 rounded-2xl border-2 font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all
                                    ${article.aiClassification === 'FAKE' || article.aiLabel === 'FAKE' ? 'bg-danger/10 text-danger border-danger/20 shadow-danger/10' : 'bg-primary/10 text-primary border-primary/20 shadow-primary/10'}
                                `}>
                                    {article.aiClassification === 'FAKE' || article.aiLabel === 'FAKE' ? <XCircle size={18} /> : <Zap size={18} />}
                                    Status: {article.aiClassification || article.aiLabel || 'Verified'}
                                </div>
                                <div className="px-6 py-3 rounded-2xl bg-text-primary text-bg-primary border-2 border-text-primary font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/20 transition-colors">
                                    <Shield size={18} className="text-primary" />
                                    Trust: {Math.round(article.aiCredibility || article.aiScore || 0)}%
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="bg-bg-primary p-8 rounded-3xl border-2 border-bg-tertiary space-y-4">
                                <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={14} className="text-primary" /> Credibility Assessment
                                </h4>
                                <p className="text-text-primary font-bold text-lg leading-relaxed">
                                    {article.aiReason || "This article has undergone deep neural analysis. No significant misinformation markers were detected that would compromise the integrity of this report."}
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-bg-secondary p-6 rounded-3xl border-2 border-bg-tertiary shadow-lg">
                                    <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Linguistic Edge Cases</h4>
                                    <p className="text-sm font-bold text-text-secondary/70 italic">
                                        "{article.aiEdgeCases || 'Analysis confirms high confidence in standard Nigerian English and vernacular patterns.'}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-2 opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    Nigerian Language Protocol {article.aiClassification === 'FAKE' ? 'Violation Detected' : 'Clear'}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {article.imageUrl && (
                    <div className="relative rounded-4xl overflow-hidden border-2 border-bg-tertiary shadow-2xl aspect-video group">
                         <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                )}

                <section 
                    className="article-content prose prose-2xl dark:prose-invert prose-black dark:prose-white max-w-none text-xl md:text-2xl font-medium leading-relaxed md:leading-[1.8] text-text-primary/90 space-y-8 prose-img:rounded-3xl prose-img:shadow-2xl"
                    dangerouslySetInnerHTML={{ 
                        __html: (article.content || article.text || article.body || '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&amp;/g, '&')
                        .replace(/<p><br><\/p>/g, '') // Remove empty quill lines
                    }}
                />

                {article.sourceUrl && (
                    <footer className="pt-20">
                        <div className="bg-bg-secondary dark:bg-black p-10 rounded-6xl space-y-8 shadow-2xl relative overflow-hidden border-2 border-bg-tertiary transition-colors">
                            <Globe size={180} className="absolute -bottom-20 -right-20 text-text-primary/5" />
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                    <LinkIcon size={14} /> Primary Source Data
                                </h4>
                                <h3 className="text-2xl font-black text-text-primary italic tracking-tight">Verified External Intelligence Dispatch</h3>
                                <p className="text-text-secondary font-bold max-w-md">This report is backed by data from a verified external domain. You can audit the original source below.</p>
                                <a 
                                    href={article.sourceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all no-underline text-xs uppercase tracking-widest mt-4"
                                >
                                    <ExternalLink size={18} /> Open Original Source
                                </a>
                            </div>
                        </div>
                    </footer>
                )}
            </article>

            {/* Discussion Section */}
            <section className="max-w-[1000px] mx-auto mt-32 px-[5%] space-y-12">
                <div className="flex items-center gap-6">
                    <h3 className="text-3xl font-black text-text-primary tracking-tighter flex items-center gap-3">
                        <MessageSquare className="text-primary" size={32} /> Discussions ({comments.length})
                    </h3>
                    <div className="flex-1 h-[2px] bg-bg-tertiary"></div>
                </div>

                {user ? (
                    <form onSubmit={handleCommentSubmit} className="bg-bg-secondary p-10 rounded-4xl border-2 border-bg-tertiary shadow-2xl space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-bg-tertiary text-text-secondary flex items-center justify-center font-black text-xs uppercase">
                                {user.name?.charAt(0)}
                            </div>
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Signed in as {user.name}</span>
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Provide your insight or perspective on this dispatch..."
                            className="w-full text-xl font-bold bg-bg-primary border-2 border-bg-tertiary rounded-2xl p-6 outline-none focus:border-primary transition-all min-h-[160px] text-text-primary placeholder:text-text-secondary/30 shadow-inner"
                        />
                        <div className="flex justify-end">
                            <button type="submit" className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <Zap size={18} /> Publish Insight
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-bg-secondary border-2 border-bg-tertiary p-12 rounded-4xl text-center space-y-6">
                         <User className="mx-auto text-text-secondary/50" size={48} />
                         <p className="text-xl font-black text-text-secondary uppercase tracking-tighter">Authentication Required to provide insight.</p>
                         <Link to="/login" className="inline-block px-10 py-4 bg-text-primary text-bg-primary rounded-2xl font-black shadow-xl hover:scale-105 transition-all no-underline">Authorize & Continue</Link>
                    </div>
                )}

                <div className="space-y-8">
                    {comments.map(comment => (
                        <div key={comment.$id} className="bg-bg-secondary p-8 rounded-4xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-bg-primary text-text-secondary flex items-center justify-center font-black uppercase border-2 border-bg-tertiary shadow-sm">
                                        {comment.authorName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">{comment.authorName}</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest truncate max-w-[100px]">Asset Verified</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-lg font-bold leading-relaxed text-text-primary/80">{comment.content}</p>
                        </div>
                    ))}
                    {comments.length === 0 && <p className="text-center py-20 text-text-secondary/30 font-black uppercase text-xs tracking-[0.2em] italic">Intelligence cycle initialized. No assets have provided insight yet.</p>}
                </div>
            </section>
        </div>
    );
};

export default ArticleDetail;
