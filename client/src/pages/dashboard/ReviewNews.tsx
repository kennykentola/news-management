import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { Query } from 'appwrite';

const ReviewNews = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingArticles = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                [
                    Query.equal('status', 'PENDING')
                ]
            );
            setArticles(response.documents);
        } catch (error) {
            console.error('Failed to fetch articles', error);
            // Mock data for demo if DB fails
            setArticles([
                { $id: '1', title: 'Suspicious Alien Sighting', content: 'Aliens confirm landing...', aiLabel: 'FAKE', aiScore: 9, authorName: 'John Doe', createdAt: new Date().toISOString() },
                { $id: '2', title: 'City Council Meeting Notes', content: 'The council discussed...', aiLabel: 'REAL', aiScore: 92, authorName: 'Jane Smith', createdAt: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingArticles();
    }, []);

    const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED', feedback?: string) => {
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, id, {
                status: decision,
                editorFeedback: feedback || ''
            });

            // Optimistic update
            setArticles(articles.filter(a => a.$id !== id));
            alert(decision === 'APPROVED' ? 'Article Approved!' : 'Changes Requested.');
        } catch (e) {
            console.error(e);
            alert('Action failed');
        }
    };

    if (loading) return <div>Loading queue...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Editorial Review Queue</h2>

            {articles.length === 0 ? (
                <p className="text-gray-400">No pending articles to review.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {articles.map(article => (
                        <div key={article.$id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                        <Link to={`/article/${article.$id}`} className="hover:text-primary transition-colors hover:underline">
                                            {article.title}
                                        </Link>
                                    </h3>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                        By {article.authorName} • {new Date(article.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    backgroundColor: article.aiLabel === 'REAL' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: article.aiLabel === 'REAL' ? 'var(--color-success)' : 'var(--color-danger)',
                                }}>
                                    AI: {article.aiLabel} ({article.aiScore}%)
                                </div>
                            </div>

                            <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                                {article.content.substring(0, 200)}...
                            </p>

                            <div className="flex flex-col md:flex-row gap-4 mt-2">
                                <button
                                    onClick={() => handleDecision(article.$id, 'APPROVED')}
                                    className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition-colors"
                                >
                                    Approve for Admin
                                </button>
                                <button
                                    onClick={() => {
                                        const feedback = prompt("Reason for rejection / Changes needed:");
                                        if (feedback !== null) { // If user didn't cancel
                                            handleDecision(article.$id, 'REJECTED', feedback);
                                        }
                                    }}
                                    className="flex-1 py-2 px-4 bg-transparent border border-danger text-danger rounded-md font-semibold hover:bg-danger/10 transition-colors"
                                >
                                    Request Changes / Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewNews;
