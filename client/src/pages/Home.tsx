import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                [
                    Query.equal('status', 'PUBLISHED'),
                    Query.orderDesc('createdAt'),
                    Query.limit(10)
                ]
            );
            setArticles(response.documents);
        } catch (error) {
            console.error('Failed to fetch news', error);
            // Mock Data
            setArticles([
                { $id: '3', title: 'New Park Opening', content: 'Mayor cuts the ribbon for the new centralized park in downtown, featuring...', aiScore: 98, authorName: 'Alice Wonders', createdAt: new Date().toISOString() },
                { $id: '4', title: 'Tech Giant Releases New Gadget', content: 'The latest phone from TechCorp features holographic display technology...', aiScore: 89, authorName: 'Bob Tech', createdAt: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', color: 'white' }}>
            <nav style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-bg-tertiary)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>NewsGuard AI</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
                    <Link to="/register" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>Get Started</Link>
                </div>
            </nav>

            <header style={{ padding: '5rem 5%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Trustworthy News, Verified by AI
                </h2>
                <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Stay informed with articles that have been fact-checked and analyzed for reliability.
                </p>
            </header>

            <main style={{ padding: '0 5% 5rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)', paddingLeft: '1rem' }}>Latest Verified Stories</h3>

                {loading ? <p>Loading news...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {articles.map(article => (
                            <article key={article.$id} className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '1.5rem', flex: 1 }}>
                                    {article.imageUrl && (
                                        <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>{article.category || 'General'}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(article.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>
                                        <Link to={`/article/${article.$id}`} style={{ color: 'white', textDecoration: 'none' }}>
                                            {article.title}
                                        </Link>
                                    </h4>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {article.content.substring(0, 120)}...
                                    </p>
                                    <Link to={`/article/${article.$id}`} style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                                        Read More →
                                    </Link>
                                </div>
                                <div style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>By {article.authorName}</span>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '999px',
                                        fontSize: '0.7rem',
                                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                        color: 'var(--color-success)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}>
                                        🛡️ {article.aiScore}% Safe
                                    </span>
                                </div>
                                <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={async () => {
                                            const reason = prompt("Why are you reporting this article?");
                                            if (reason) {
                                                try {
                                                    await databases.updateDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, article.$id, {
                                                        reportReason: reason
                                                    });
                                                    alert("Report submitted to Admins.");
                                                } catch (e) {
                                                    console.error(e);
                                                    alert("Failed to submit report.");
                                                }
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.7 }}
                                    >
                                        🚩 Report Issue
                                    </button>

                                    {/* Admin Delete Action */}
                                    {user?.role === 'ADMIN' && (
                                        <button
                                            onClick={async () => {
                                                if (confirm("Are you sure you want to DELETE this article? This cannot be undone.")) {
                                                    try {
                                                        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, article.$id);
                                                        setArticles(articles.filter(a => a.$id !== article.$id));
                                                        alert("Article Deleted.");
                                                    } catch (e) {
                                                        console.error(e);
                                                        alert("Failed to delete.");
                                                    }
                                                }
                                            }}
                                            style={{ background: 'var(--color-danger)', border: 'none', color: 'white', fontSize: '0.8rem', cursor: 'pointer', padding: '0.3rem 0.6rem', borderRadius: '4px', marginLeft: '1rem' }}
                                        >
                                            🗑️ Delete (Admin)
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
