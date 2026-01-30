import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES, COMMENTS_COLLECTION_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';

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

    if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading article...</div>;
    if (error || !article) return <div style={{ padding: '2rem', color: 'var(--color-danger)' }}>{error || 'Article not found'}</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', color: 'white', paddingBottom: '3rem' }}>
            <nav style={{ padding: '2rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-bg-tertiary)' }}>
                <Link to="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ← Back to News
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleShare} style={{ background: 'var(--color-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                        Share Article
                    </button>
                </div>
            </nav>

            <article style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem' }}>
                <div style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{article.category || 'News'}</span>
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }}>
                    {article.title}
                </h1>

                {article.imageUrl && (
                    <img src={article.imageUrl} alt={article.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-bg-tertiary)', paddingBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '1rem', color: 'white' }}>By {article.authorName}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '999px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            backgroundColor: article.aiScore > 70 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: article.aiScore > 70 ? 'var(--color-success)' : 'var(--color-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}>
                            {article.aiScore > 70 ? '🛡️ Verified Safe' : '⚠️ Low Reliability'}
                            ({article.aiScore}%)
                        </span>
                    </div>
                </div>

                <div style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                    {article.content}
                </div>

                {article.sourceUrl && (
                    <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-tertiary)' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source / Citation</h4>
                        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>
                            {article.sourceUrl}
                        </a>
                    </div>
                )}
            </article>

            {/* Comment Section */}
            <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', borderTop: '1px solid var(--color-bg-tertiary)', paddingTop: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Comments ({comments.length})</h3>

                {user ? (
                    <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem' }}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add to the conversation..."
                            style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', marginBottom: '0.5rem', minHeight: '100px' }}
                        />
                        <div style={{ textAlign: 'right' }}>
                            <button type="submit" style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                                Post Comment
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p>Please <Link to="/login" style={{ color: 'var(--color-primary)' }}>login</Link> to post a comment.</p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {comments.map(comment => (
                        <div key={comment.$id} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{comment.authorName}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ lineHeight: 1.5 }}>{comment.content}</p>
                        </div>
                    ))}
                    {comments.length === 0 && <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No comments yet. Be the first to say something!</p>}
                </div>
            </section>
        </div>
    );
};

export default ArticleDetail;
