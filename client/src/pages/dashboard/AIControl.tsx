import { useState, useEffect } from 'react';
import { Shield, Database, RefreshCw, Cpu, CheckCircle, AlertTriangle, Zap, Download, Search, FileText, ArrowRight } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:5000';

const AIControl = () => {
    const [loading, setLoading] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    };

    const handleDataClean = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading('Starting AI System...');
        addLog(`🧹 Starting One-Click Clean for: ${file.name}`);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${AI_SERVER_URL}/admin/clean-data`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cleaned_${file.name.split('.')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                addLog(`✅ Cleaning complete! Downloaded cleaned_${file.name.split('.')[0]}.csv`);
            } else {
                const data = await response.json();
                addLog(`❌ Cleaning failed: ${data.error}`);
            }
        } catch (err: any) {
            addLog(`❌ Error connecting to cleaning service: ${err.message}`);
        } finally {
            setLoading(null);
            if (e.target) e.target.value = '';
        }
    };

    const handleAction = async (endpoint: string, actionName: string, params?: any) => {
        setLoading(endpoint + (params?.type || ''));
        addLog(`Initiating ${actionName}...`);
        try {
            const res = await fetch(`${AI_SERVER_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params || {})
            });
            const data = await res.json();
            
            if (data.status === 'success' || data.status === 'started') {
                setStatus('success');
                addLog(`✅ ${actionName}: ${data.message || 'Complete'}`);
                if (data.output) addLog(`Details: ${data.output}`);
            } else {
                setStatus('error');
                addLog(`❌ ${actionName} failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err: any) {
            setStatus('error');
            addLog(`❌ Connection Error: ${err.message}`);
        } finally {
            setLoading(null);
        }
    };

    if (loading === 'Starting AI System...') return <LoadingScreen message={loading} />;

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Control Center */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-4xl border-2 border-bg-tertiary shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase">AI Brain Maintenance</h3>
                                <p className="text-xs font-black text-gray-400">Manage Nigerian Language Support & Model Training</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleAction('/admin/scrape-social', 'Trending Social News')}
                                disabled={!!loading}
                                className="flex items-center justify-between p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 group transition-all"
                            >
                                <div className="flex items-center gap-6 text-left">
                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary group-hover:scale-110 transition-all shadow-sm">
                                        <Search size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Social Media Trends</h4>
                                        <p className="text-xs font-bold text-gray-400">Search Nigeria-wide viral news (RSS/Meta)</p>
                                    </div>
                                </div>
                                {loading === '/admin/scrape-social' ? <RefreshCw className="animate-spin text-primary" /> : <Zap size={20} className="text-primary" />}
                            </button>

                            <button
                                onClick={() => handleAction('/admin/scrape', 'Scraping Africa Check & Dubawa')}
                                disabled={!!loading}
                                className="flex items-center justify-between p-6 rounded-3xl border-2 border-gray-50 hover:border-primary/30 group transition-all"
                            >
                                <div className="flex items-center gap-6 text-left">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-all">
                                        <Download size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Gather Data</h4>
                                        <p className="text-xs font-bold text-gray-400">Scrape Africa Check & Dubawa for 2026 facts</p>
                                    </div>
                                </div>
                                {loading === '/admin/scrape' ? <RefreshCw className="animate-spin text-primary" /> : <Zap size={20} className="text-gray-200" />}
                            </button>

                            <button
                                onClick={() => handleAction('/admin/sync', 'Pushing news to Home Page')}
                                disabled={!!loading}
                                className="flex items-center justify-between p-6 rounded-3xl border-2 border-black/5 bg-black text-white hover:bg-gray-900 group transition-all"
                            >
                                <div className="flex items-center gap-6 text-left">
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-all">
                                        <ArrowRight size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Sync to Home Page</h4>
                                        <p className="text-xs font-bold text-gray-400">Push verified news to front-end database</p>
                                    </div>
                                </div>
                                {loading === '/admin/sync' ? <RefreshCw className="animate-spin text-primary" /> : <Zap size={20} className="text-primary" />}
                            </button>

                            {/* One-Click Cleaner */}
                            <div className="relative group p-6 rounded-3xl border-2 border-green-500/20 bg-green-50/50 hover:bg-green-50 transition-all border-dashed">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleDataClean}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={!!loading}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-green-200 flex items-center justify-center text-green-600 shadow-sm">
                                            <RefreshCw className={loading === 'Starting AI System...' ? 'animate-spin' : ''} size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg text-green-800">One-Click Data Cleaner</h4>
                                            <p className="text-xs font-bold text-green-600/70">Upload CSV/Excel to auto-clean & download</p>
                                        </div>
                                    </div>
                                    <div className="bg-green-600 text-white p-2 rounded-xl">
                                        <Download size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAction('/admin/train', 'Fast Training', { type: 'fast' })}
                                    disabled={!!loading}
                                    className="flex items-center justify-between p-6 rounded-3xl bg-black text-white hover:bg-gray-800 transition-all shadow-xl shadow-black/10 border-2 border-black"
                                >
                                    <div className="flex flex-col text-left">
                                        <h4 className="font-black text-xs uppercase tracking-widest mb-1 text-primary">Fast Mode</h4>
                                        <p className="font-black text-lg">Naive Bayes</p>
                                        <p className="text-[10px] font-bold text-gray-500">2-5 Minutes</p>
                                    </div>
                                    {loading === '/admin/trainfast' ? <RefreshCw className="animate-spin text-primary" /> : <Zap size={20} className="text-primary" />}
                                </button>

                                <button
                                    onClick={() => handleAction('/admin/train', 'Advanced Training', { type: 'afriberta' })}
                                    disabled={!!loading}
                                    className="flex items-center justify-between p-6 rounded-3xl bg-white text-black border-2 border-primary/20 hover:border-primary transition-all shadow-xl shadow-primary/5"
                                >
                                    <div className="flex flex-col text-left">
                                        <h4 className="font-black text-xs uppercase tracking-widest mb-1 text-primary-dark">Deep Learning</h4>
                                        <p className="font-black text-lg">AfriBERTa</p>
                                        <p className="text-[10px] font-bold text-gray-400 tracking-tighter italic">High Resource Required</p>
                                    </div>
                                    {loading === '/admin/trainafriberta' ? <RefreshCw className="animate-spin text-primary" /> : <Cpu size={20} className="text-primary-dark" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary-dark p-8 rounded-4xl text-white relative overflow-hidden shadow-2xl">
                        <Cpu className="absolute -bottom-10 -right-10 text-white/5" size={160} />
                        <h4 className="text-xl font-black mb-4 relative z-10">Nigerian Language Protocol</h4>
                        <p className="text-sm font-bold text-white/60 mb-6 relative z-10">The current system uses AfriBERTa embeddings to detect misinformation patterns in local languages.</p>
                        <div className="flex gap-4 relative z-10">
                            <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">Yoruba</span>
                            <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">Igbo</span>
                            <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">Hausa</span>
                        </div>
                    </div>
                </div>

                {/* Log View */}
                <div className="bg-white border-2 border-bg-tertiary rounded-4xl flex flex-col h-[600px] shadow-sm">
                    <div className="p-6 border-b-2 border-bg-tertiary flex items-center justify-between">
                        <h4 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                            <FileText size={16} /> Maintenance Logs
                        </h4>
                        <button onClick={() => setLogs([])} className="text-[10px] font-black text-gray-400 hover:text-primary uppercase tracking-widest">Clear</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-3 bg-gray-50/50">
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <FileText size={48} className="mb-4" />
                                <p className="font-black uppercase tracking-widest">No recent logs</p>
                            </div>
                        ) : logs.map((log, i) => (
                            <div key={i} className="animate-in fade-in slide-in-from-left-2 transition-all p-3 rounded-xl bg-white border border-gray-100 shadow-sm border-l-4 border-l-primary">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIControl;
