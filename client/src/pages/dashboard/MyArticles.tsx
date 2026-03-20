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
        <div style={{ maxWidth: '1200px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2.5rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.025em' }}>My Articles</h2>
            <div style={{ display: 'grid', gap: '2rem' }}>
                {articles.map(article => (
                    <div key={article.$id} className="bg-white" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '2px solid var(--color-bg-tertiary)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease-in-out' }}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="font-extrabold text-2xl text-black tracking-tight">{article.title}</div>
                            <div style={{
                                padding: '0.4rem 1rem',
                                borderRadius: '999px',
                                backgroundColor: '#ffffff',
                                border: '2px solid var(--color-bg-tertiary)',
                                color: getStatusColor(article.status),
                                fontSize: '0.85rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                {article.status}
                            </div>
                        </div>

                        {article.status === 'REJECTED' && article.editorFeedback && (
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: '#fee2e2',
                                border: '2px solid #ef4444',
                                borderRadius: 'var(--radius-lg)',
                                marginTop: '1.5rem',
                                marginBottom: '1.5rem',
                                color: '#b91c1c',
                                fontWeight: 600
                            }}>
                                <strong style={{ fontWeight: 900, textTransform: 'uppercase', marginRight: '0.5rem' }}>Editor Feedback:</strong> {article.editorFeedback}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', color: '#4b5563', fontWeight: 600, marginBottom: '2rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📅 {new Date(article.createdAt).toLocaleDateString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📁 {article.category || 'General'}</span>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '1.5rem' }}>
                            <Link
                                to={`/dashboard/edit/${article.$id}`}
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 'var(--radius-lg)',
                                    fontWeight: 800,
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.3)'
                                }}
                            >
                                ✏️ Edit
                            </Link>

                            <Link
                                to={`/article/${article.$id}`}
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 'var(--radius-lg)',
                                    fontWeight: 800,
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    border: '2px solid var(--color-bg-tertiary)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                📄 View
                            </Link>
                        </div>
                    </div>
                ))}
                {articles.length === 0 && <p style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', fontWeight: 700, color: '#6b7280' }}>No articles found. Start writing your first story!</p>}
            </div>
        </div>

    );
};

export default MyArticles;
