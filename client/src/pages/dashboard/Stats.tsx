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

    if (loading) return <div className="text-black font-bold p-10 text-center animate-pulse">Loading statistics...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-6xl mx-auto">
            <h2 className="text-4xl font-black text-black mb-8 tracking-tight">Analytics Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-3 tracking-widest">Total Articles Scanned</h3>
                    <p className="text-5xl font-black text-black">{metrics.total}</p>
                    <span className="text-[10px] text-primary-dark font-black uppercase tracking-widest mt-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                        Live Data Streaming
                    </span>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-3 tracking-widest">Fake Detected</h3>
                    <p className="text-5xl font-black text-danger">{metrics.fake}</p>
                    <span className="text-[10px] text-danger font-black uppercase tracking-widest mt-4 block opacity-80">High Volume Alert</span>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-3 tracking-widest">AI Accuracy Index</h3>
                    <p className="text-5xl font-black text-primary-dark">{metrics.accuracy.toFixed(1)}%</p>
                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-4 block opacity-80">Based on Confidence</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border-2 border-bg-tertiary shadow-2xl h-[450px] flex flex-col">
                    <h3 className="text-2xl font-black text-black mb-6 tracking-tight">Detection Outcomes</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
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
                                    stroke="#ffffff"
                                    strokeWidth={4}
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '2px solid var(--color-bg-tertiary)', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800, color: '#000000' }}
                                    itemStyle={{ color: '#000000' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-8 mt-8 text-sm font-black text-gray-700 uppercase tracking-wider">
                        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></span> Fake</span>
                        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></span> Verified</span>
                        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></span> Unsure</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border-2 border-bg-tertiary shadow-2xl h-[450px]">
                    <h3 className="text-2xl font-black text-black mb-6 tracking-tight">Weekly Activity</h3>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
                                <XAxis dataKey="name" stroke="#000000" fontSize={12} tickLine={false} axisLine={false} fontWeight={800} dy={10} />
                                <YAxis stroke="#000000" fontSize={12} tickLine={false} axisLine={false} fontWeight={800} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '2px solid var(--color-bg-tertiary)', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800 }}
                                />
                                <Bar dataKey="checks" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Stats;
