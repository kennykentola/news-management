import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const MyArticles = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyArticles = async () => {
            if (!user) return;
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_ARTICLES,
                    [
                        Query.equal('authorId', user.$id),
                        Query.orderDesc('createdAt')
                    ]
                );
                setArticles(response.documents);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyArticles();
    }, [user]);

    if (loading) return <div>Loading your articles...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'var(--color-success)';
            case 'APPROVED': return '#3b82f6'; // Blue
            case 'PENDING': return 'var(--color-warning)';
            case 'REJECTED': return 'var(--color-danger)';
            default: return 'gray';
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Articles</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {articles.map(article => (
                    <div key={article.$id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
                            <div className="font-semibold text-lg">{article.title}</div>
                            <div style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: getStatusColor(article.status),
                                fontSize: '0.8rem',
                                fontWeight: 700
                            }}>
                                {article.status}
                            </div>
                        </div>

                        {article.status === 'REJECTED' && article.editorFeedback && (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid var(--color-danger)',
                                borderRadius: 'var(--radius-md)',
                                marginTop: '1rem',
                                marginBottom: '1rem',
                                color: '#fca5a5'
                            }}>
                                <strong>Editor Feedback:</strong> {article.editorFeedback}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            <span>Category: {article.category || 'General'}</span>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <Link
                                to={`/dashboard/edit/${article.$id}`}
                                style={{
                                    color: 'var(--color-primary)',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                ✏️ Edit
                            </Link>

                            <Link
                                to={`/article/${article.$id}`}
                                style={{
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                📄 View
                            </Link>
                        </div>
                    </div>
                ))}
                {articles.length === 0 && <p>No articles found. Start writing!</p>}
            </div>
        </div>
    );
};

export default MyArticles;
