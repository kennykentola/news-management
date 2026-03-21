import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES, COMMENTS_COLLECTION_ID, COLLECTION_ID_USERS_METADATA } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const ArticleDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth(); // To know who is commenting
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
                setError('Failed to load article.');
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert('Please login to comment.');
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
            text: 'Check out this article on NewsGuard AI!',
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <LoadingScreen message="Analyzing news reliability..." />;
    if (error || !article) return <div style={{ padding: '4rem', color: 'var(--color-danger)', textAlign: 'center', fontWeight: 900, fontSize: '1.5rem' }}>{error || 'Article not found'}</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#000000', paddingBottom: '5rem' }}>
            <nav style={{ padding: '0.75rem 5%', display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', justifyContent: 'space-between', borderBottom: '2px solid var(--color-bg-tertiary)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <Link to="/" style={{ color: '#000000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 900, fontSize: '1.1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>←</span> Back to News
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <button onClick={handleShare} style={{ background: 'var(--color-primary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-xl)', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.4)', fontSize: '1rem' }}>
                        Share Article
                    </button>
                </div>
            </nav>

            <article style={{ 
                maxWidth: '1000px', 
                margin: '2rem auto', 
                padding: '5%', 
                backgroundColor: '#ffffff', 
                borderRadius: '2rem', 
                border: '2px solid var(--color-bg-tertiary)', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
                overflowX: 'hidden'
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#e7ffed', color: 'var(--color-primary-dark)', padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{article.category || 'News'}</span>
                    <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 700 }}>📅 {new Date(article.createdAt).toLocaleDateString()}</span>
                </div>

                <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '2.5rem', color: '#000000', letterSpacing: '-0.04em' }}>
                    {article.title}
                </h1>

                {article.imageUrl && (
                    <img src={article.imageUrl} alt={article.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '1.5rem', marginBottom: '3rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4rem', borderBottom: '3px solid var(--color-bg-tertiary)', paddingBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>
                            {article.authorName?.charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <span style={{ fontSize: '1.1rem', color: '#000000', fontWeight: 900 }}>By {article.authorName}</span>
                            <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600 }}>Verified Journalist</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '999px',
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            backgroundColor: article.aiScore > 70 ? '#e7ffed' : '#fee2e2',
                            color: article.aiScore > 70 ? 'var(--color-primary-dark)' : '#b91c1c',
                            border: `2px solid ${article.aiScore > 70 ? 'var(--color-primary)' : '#ef4444'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            maxWidth: '100%',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}>
                            {article.aiScore > 70 ? '✅ Verified Reliability' : '❌ Low Reliability'}
                            ({article.aiScore}%)
                        </span>
                    </div>
                </div>

                <div 
                    style={{ 
                        fontSize: 'clamp(1.1rem, 4vw, 1.35rem)', 
                        lineHeight: 1.85, 
                        color: '#1a1a1a', 
                        fontWeight: 400,
                        overflowWrap: 'anywhere',
                        wordBreak: 'normal',
                        fontFamily: "'Inter', sans-serif"
                    }}
                    dangerouslySetInnerHTML={{ 
                        __html: (article.content || article.text || article.body || article.summary || 'No core content available. Please verify the source for full details.')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/\n/g, '<br/>')
                    }}
                />

                {article.sourceUrl && (
                    <div style={{ marginTop: '5rem', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '1rem', border: '2px solid var(--color-bg-tertiary)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900 }}>Original Source / Citations</h4>
                        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', fontWeight: 800, wordBreak: 'break-all', fontSize: '1.1rem', textDecoration: 'underline' }}>
                            {article.sourceUrl}
                        </a>
                    </div>
                )}
            </article>

            {/* Comment Section */}
            <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '2rem', color: '#000000', fontWeight: 900, letterSpacing: '-0.02em' }}>Reader Insights ({comments.length})</h3>
                    <div style={{ flex: 1, height: '3px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '999px' }}></div>
                </div>

                {user ? (
                    <form onSubmit={handleCommentSubmit} style={{ marginBottom: '4rem', backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '1.5rem', border: '2px solid var(--color-bg-tertiary)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', color: '#000000', fontWeight: 800, fontSize: '1.1rem' }}>Your Perspective</label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts on this story..."
                            style={{ width: '100%', padding: '1.5rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '2px solid var(--color-bg-tertiary)', color: '#000000', marginBottom: '1.5rem', minHeight: '150px', outline: 'none', transition: 'all 0.2s', fontSize: '1.1rem', fontWeight: 500, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                        />
                        <div style={{ textAlign: 'right' }}>
                            <button type="submit" style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '1rem 3rem', borderRadius: 'var(--radius-xl)', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.1rem', boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.4)' }}>
                                Publish Comment
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ marginBottom: '4rem', padding: '3rem', backgroundColor: '#f9fafb', border: '2px solid var(--color-bg-tertiary)', borderRadius: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#4b5563', fontSize: '1.2rem', fontWeight: 700 }}>Want to join the conversation? <Link to="/login" style={{ color: 'var(--color-primary-dark)', fontWeight: 900, textDecoration: 'underline' }}>Sign in now</Link></p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {comments.map(comment => (
                        <div key={comment.$id} style={{ padding: '2rem', backgroundColor: '#ffffff', border: '2px solid var(--color-bg-tertiary)', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#e7ffed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)', fontWeight: 900, fontSize: '0.9rem' }}>
                                        {comment.authorName?.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: 900, color: '#000000', fontSize: '1.1rem' }}>{comment.authorName}</span>
                                </div>
                                <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 700 }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ lineHeight: 1.6, color: '#000000', fontSize: '1.05rem', fontWeight: 500 }}>{comment.content}</p>
                        </div>
                    ))}
                    {comments.length === 0 && <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '4rem', fontSize: '1.1rem', fontWeight: 600 }}>No readers have commented yet. Be the first to share your insight!</p>}
                </div>
            {/* Premium Footer */}
            <footer style={{ 
                marginTop: '10rem', 
                backgroundColor: '#000000', 
                color: '#ffffff', 
                padding: '6rem 5% 4rem',
                borderTop: '8px solid var(--color-primary)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem' }}>
                    <div style={{ spaceY: '2rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>NewsGuard <span style={{ color: 'var(--color-primary)' }}>AI</span></h2>
                        <p style={{ color: '#9ca3af', fontWeight: 600, lineHeight: 1.6, maxWidth: '350px' }}>
                            Nigeria's leading AI-powered news verification platform. Ensuring the truth reaches every corner of the federation.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-primary)', marginBottom: '2rem' }}>Ecosystem</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontWeight: 700 }}>
                            <li><Link to="/" style={{ color: '#ffffff', textDecoration: 'none' }}>Home</Link></li>
                            <li><Link to="/about" style={{ color: '#ffffff', textDecoration: 'none' }}>About verification</Link></li>
                            <li><Link to="/dashboard" style={{ color: '#ffffff', textDecoration: 'none' }}>Citizen Dashboard</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-primary)', marginBottom: '2rem' }}>Security Protocol</h4>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                            Our AfriBERTa-based language models are audited daily for bias and accuracy. We use blockchain-inspired metadata to track article origins.
                        </p>
                    </div>
                </div>
                <div style={{ maxWidth: '1200px', margin: '6rem auto 0', paddingTop: '3rem', borderTop: '1px solid #1f2937', textAlign: 'center' }}>
                    <p style={{ color: '#4b5563', fontSize: '0.8rem', fontWeight: 800 }}>© 2026 NEWSGUARD AI NIGERIA. ALL TRUTH SECURED.</p>
                </div>
            </footer>
        </div>
    );
};

export default ArticleDetail;
