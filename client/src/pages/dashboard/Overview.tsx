import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { Query } from 'appwrite';

const StatCard = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${color}` }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
    </div>
);

const Overview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSubmitted: 0,
        fakeDetected: 0,
        published: 0,
        realPercent: 0,
        fakePercent: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Total Articles (limit 0 to get total count)
                // Appwrite 1.4+ returns total in response
                const totalRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES);
                const total = totalRes.total;

                // Fetch Fake News (AI Label = FAKE)
                // Assuming we can filter by aiLabel. If not an index, this might be slow or fail if not indexed.
                // For MVP, we fetch all (since dataset is small) or rely on index.
                // Better approach: use query if possible.
                // If 'aiLabel' is not indexed, listDocuments(..., [Query.equal('aiLabel', 'FAKE')])
                const fakeRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [
                    Query.equal('aiLabel', 'FAKE')
                ]);
                const fakeCount = fakeRes.total;

                // Fetch Published
                const publishedRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [
                    Query.equal('status', 'PUBLISHED')
                ]);
                const publishedCount = publishedRes.total;

                // Calculate Percentages
                // Real = Total - Fake
                // Note: aiLabel can be 'REAL' or 'FAKE'. 
                // Let's assume everything not FAKE is REAL for this metric, or fetch query 'REAL'
                const realRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_ARTICLES, [
                    Query.equal('aiLabel', 'REAL')
                ]);
                const realCount = realRes.total;

                const totalAnalyzed = realCount + fakeCount;
                const realPerc = totalAnalyzed > 0 ? Math.round((realCount / totalAnalyzed) * 100) : 0;
                const fakePerc = totalAnalyzed > 0 ? Math.round((fakeCount / totalAnalyzed) * 100) : 0;

                setStats({
                    totalSubmitted: total,
                    fakeDetected: fakeCount,
                    published: publishedCount,
                    realPercent: realPerc,
                    fakePercent: fakePerc
                });

            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {user?.name}</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Here is what's happening today.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard label="Total Articles" value={stats.totalSubmitted} color="var(--color-primary)" />
                <StatCard label="Fake News Blocked" value={stats.fakeDetected} color="var(--color-danger)" />
                <StatCard label="Published Articles" value={stats.published} color="var(--color-success)" />
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>AI Performance</h3>
                <div style={{ height: '20px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${stats.realPercent}%`, backgroundColor: 'var(--color-success)' }} title="Real News"></div>
                    <div style={{ width: `${stats.fakePercent}%`, backgroundColor: 'var(--color-danger)' }} title="Fake News"></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <span>{stats.realPercent}% Real News</span>
                    <span>{stats.fakePercent}% Fake/Misleading</span>
                </div>
            </div>
        </div>
    );
};

export default Overview;
