import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';

const COLORS = ['#ef4444', '#22c55e', '#eab308'];

const Stats = () => {
    const [metrics, setMetrics] = useState({
        total: 0,
        fake: 0,
        verified: 0,
        unsure: 0,
        accuracy: 0
    });

    const [pieData, setPieData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all articles (limit 1000 for now)
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_ARTICLES,
                );

                const docs = response.documents;
                const total = docs.length;

                let fakeCount = 0;
                let verifiedCount = 0;
                let unsureCount = 0;

                docs.forEach(doc => {
                    // Logic to determine category
                    // If AI Score > 70 => Verified
                    // If AI Score < 50 or Result 'FAKE' => Fake
                    // Else => Unsure

                    const score = doc.aiScore || 0;
                    const result = doc.aiLabel || 'UNKNOWN';

                    if (result.includes('FAKE') || score < 50) {
                        fakeCount++;
                    } else if (score >= 70) {
                        verifiedCount++;
                    } else {
                        unsureCount++;
                    }
                });

                const accuracy = total > 0 ? ((verifiedCount + fakeCount) / total) * 100 : 0; // Simplified accuracy metric

                setMetrics({
                    total,
                    fake: fakeCount,
                    verified: verifiedCount,
                    unsure: unsureCount,
                    accuracy
                });

                setPieData([
                    { name: 'Fake News', value: fakeCount },
                    { name: 'Verified', value: verifiedCount },
                    { name: 'Unsure', value: unsureCount },
                ]);

            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const activityData = [
        { name: 'Mon', checks: 4 },
        { name: 'Tue', checks: 3 },
        { name: 'Wed', checks: 2 },
        { name: 'Thu', checks: 7 },
        { name: 'Fri', checks: 1 },
        { name: 'Sat', checks: 2 },
        { name: 'Sun', checks: 3 },
    ];

    if (loading) return <div className="text-white">Loading stats...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-white mb-6">Analytics Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-text-secondary uppercase mb-2">Total Articles Scanned</h3>
                    <p className="text-4xl font-bold text-white">{metrics.total}</p>
                    <span className="text-xs text-green-400">Live Data</span>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-text-secondary uppercase mb-2">Fake Detected</h3>
                    <p className="text-4xl font-bold text-red-400">{metrics.fake}</p>
                    <span className="text-xs text-red-400">High Volume Alert</span>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-text-secondary uppercase mb-2">Approx. Accuracy</h3>
                    <p className="text-4xl font-bold text-blue-400">{metrics.accuracy.toFixed(1)}%</p>
                    <span className="text-xs text-text-secondary">Based on Confidence</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-white/10 h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-4">Detection Outcomes</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2 text-sm text-text-secondary">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-full"></span> Fake</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded-full"></span> Verified</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-full"></span> Unsure</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-white/10 h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-4">Weekly Activity</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            />
                            <Bar dataKey="checks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Stats;
