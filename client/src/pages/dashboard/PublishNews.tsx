import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { Query } from 'appwrite';

const PublishNews = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApprovedArticles = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                [
                    Query.equal('status', 'APPROVED')
                ]
            );
            setArticles(response.documents);
        } catch (error) {
            console.error('Failed to fetch articles', error);
            // Mock data
            setArticles([
                { $id: '1', title: 'Suspicious Alien Sighting', content: 'Aliens confirm landing...', aiLabel: 'FAKE', aiScore: 9, authorName: 'John Doe', createdAt: new Date().toISOString() },
                { $id: '3', title: 'New Park Opening', content: 'Mayor cuts the ribbon...', aiLabel: 'REAL', aiScore: 98, authorName: 'Alice Wonders', createdAt: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovedArticles();
    }, []);

    const handlePublish = async (id: string) => {
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, id, { status: 'PUBLISHED' });
            setArticles(articles.filter(a => a.$id !== id));
            alert('Article Published to Live Site!');
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div>Loading queue...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Ready for Publication</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {articles.map(article => (
                    <div key={article.$id} className="bg-bg-primary shadow-sm border border-bg-tertiary" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{article.title}</h3>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                By {article.authorName} • AI Reliability: <span style={{ color: article.aiScore > 70 ? 'var(--color-primary-dark)' : 'var(--color-warning)', fontWeight: 700 }}>{article.aiScore}%</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handlePublish(article.$id)}
                            style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Publish Live
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PublishNews;
