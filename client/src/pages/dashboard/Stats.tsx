import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
    { name: 'Fake News', value: 400 },
    { name: 'Verified', value: 300 },
    { name: 'Unsure', value: 100 },
];

const COLORS = ['#ef4444', '#22c55e', '#eab308'];

const activityData = [
    { name: 'Mon', checks: 40 },
    { name: 'Tue', checks: 30 },
    { name: 'Wed', checks: 20 },
    { name: 'Thu', checks: 27 },
    { name: 'Fri', checks: 18 },
    { name: 'Sat', checks: 23 },
    { name: 'Sun', checks: 34 },
];

const Stats = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-white mb-6">Analytics Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-text-secondary uppercase mb-2">Total Scans</h3>
                    <p className="text-4xl font-bold text-white">1,204</p>
                    <span className="text-xs text-green-400">+12% from last week</span>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-text-secondary uppercase mb-2">Fake Detected</h3>
                    <p className="text-4xl font-bold text-red-400">432</p>
                    <span className="text-xs text-red-400">High Volume Alert</span>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-text-secondary uppercase mb-2">Accuracy Rate</h3>
                    <p className="text-4xl font-bold text-blue-400">86.5%</p>
                    <span className="text-xs text-text-secondary">Model v2.0</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-white/10 h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-4">Detection Outcomes</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
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
