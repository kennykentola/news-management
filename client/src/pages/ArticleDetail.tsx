import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES, COMMENTS_COLLECTION_ID } from '../lib/appwrite';
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

            <article style={{ maxWidth: '900px', margin: '4rem auto', padding: '4rem', backgroundColor: '#ffffff', borderRadius: '2rem', border: '2px solid var(--color-bg-tertiary)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <span style={{ backgroundColor: '#e7ffed', color: 'var(--color-primary-dark)', padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{article.category || 'News'}</span>
                    <span style={{ fontSize: '1rem', color: '#4b5563', fontWeight: 700 }}>📅 {new Date(article.createdAt).toLocaleDateString()}</span>
                </div>

                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2.5rem', color: '#000000', letterSpacing: '-0.04em' }}>
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
                    style={{ fontSize: '1.25rem', lineHeight: 1.8, color: '#000000', fontWeight: 500 }}
                    dangerouslySetInnerHTML={{ __html: (article.content || article.text || article.body || article.summary || article.description) || 'No core content available in document.' }}
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
            </section>
        </div>


    );
};

export default ArticleDetail;
