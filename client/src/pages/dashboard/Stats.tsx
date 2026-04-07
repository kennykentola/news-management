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

    if (loading) return <div className="text-text-primary font-black uppercase tracking-widest p-20 text-center animate-pulse">Synchronizing metrics...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-6xl mx-auto">
            <h2 className="text-4xl font-black text-text-primary mb-8 tracking-tighter">Intelligence Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-bg-secondary p-8 rounded-2xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-all duration-300">
                    <h3 className="text-xs font-black text-text-secondary uppercase mb-3 tracking-widest">Total Articles Scanned</h3>
                    <p className="text-5xl font-black text-text-primary tracking-tighter">{metrics.total}</p>
                    <span className="text-[10px] text-primary-dark dark:text-primary font-black uppercase tracking-widest mt-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                        Neural Analysis Active
                    </span>
                </div>
                <div className="bg-bg-secondary p-8 rounded-2xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-l-danger">
                    <h3 className="text-xs font-black text-text-secondary uppercase mb-3 tracking-widest">Fake Detected</h3>
                    <p className="text-5xl font-black text-danger tracking-tighter">{metrics.fake}</p>
                    <span className="text-[10px] text-danger font-black uppercase tracking-widest mt-4 block opacity-80">High Volume Alert</span>
                </div>
                <div className="bg-bg-secondary p-8 rounded-2xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-l-primary">
                    <h3 className="text-xs font-black text-text-secondary uppercase mb-3 tracking-widest">AI Trust Index</h3>
                    <p className="text-5xl font-black text-text-primary tracking-tighter">{metrics.accuracy.toFixed(1)}%</p>
                    <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-4 block opacity-80">Confidence Interval</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-bg-secondary p-8 rounded-2xl border-2 border-bg-tertiary shadow-2xl h-[450px] flex flex-col">
                    <h3 className="text-2xl font-black text-text-primary mb-6 tracking-tighter">Detection Matrix</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="99%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    fill="var(--color-primary)"
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="transparent"
                                    strokeWidth={0}
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-primary)', border: '2px solid var(--color-bg-tertiary)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800, color: 'var(--color-text-primary)' }}
                                    itemStyle={{ color: 'var(--color-text-primary)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-8 mt-8 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Fake News</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Verified</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Unsure</span>
                    </div>
                </div>

                <div className="bg-bg-secondary p-8 rounded-2xl border-2 border-bg-tertiary shadow-2xl h-[450px] flex flex-col">
                    <h3 className="text-2xl font-black text-text-primary mb-6 tracking-tighter">Weekly Activity Hub</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={activityData}>
                                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} fontWeight={900} dy={10} />
                                <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} fontWeight={900} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: 'var(--color-bg-tertiary)', opacity: 0.3 }}
                                    contentStyle={{ backgroundColor: 'var(--color-bg-primary)', border: '2px solid var(--color-bg-tertiary)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800, color: 'var(--color-text-primary)' }}
                                    itemStyle={{ color: 'var(--color-text-primary)' }}
                                />
                                <Bar dataKey="checks" fill="var(--color-primary)" radius={[8, 8, 4, 4]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Stats;
