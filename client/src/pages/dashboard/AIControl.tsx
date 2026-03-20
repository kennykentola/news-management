import { useState, useEffect } from 'react';
import { Shield, Database, RefreshCw, Cpu, CheckCircle, AlertTriangle, Zap, Download, Search, FileText } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:5000';

const AIControl = () => {
    const [loading, setLoading] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const addLog = (msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 50));
    };

    const handleAction = async (endpoint: string, actionName: string) => {
        setLoading(endpoint);
        addLog(`Initiating ${actionName}...`);
        try {
            const res = await fetch(`${AI_SERVER_URL}${endpoint}`, {
                method: 'POST'
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
                                onClick={() => handleAction('/admin/clean', 'Dataset Cleaning')}
                                disabled={!!loading}
                                className="flex items-center justify-between p-6 rounded-3xl border-2 border-gray-50 hover:border-green-500/30 group transition-all"
                            >
                                <div className="flex items-center gap-6 text-left">
                                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-all">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Clean Dataset</h4>
                                        <p className="text-xs font-bold text-gray-400">Remove duplicates and normalize for Nigerian context</p>
                                    </div>
                                </div>
                                {loading === '/admin/clean' ? <RefreshCw className="animate-spin text-primary" /> : <Zap size={20} className="text-gray-200" />}
                            </button>

                            <button
                                onClick={() => handleAction('/admin/train', 'Core Training')}
                                disabled={!!loading}
                                className="flex items-center justify-between p-6 rounded-3xl bg-black text-white hover:bg-gray-800 group transition-all shadow-xl shadow-black/20"
                            >
                                <div className="flex items-center gap-6 text-left">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Train AI Model</h4>
                                        <p className="text-xs font-bold text-gray-400">Re-calibrate brain with Yoruba, Igbo, Hausa patterns</p>
                                    </div>
                                </div>
                                {loading === '/admin/train' ? <RefreshCw className="animate-spin text-primary" /> : <Zap size={20} className="text-primary" />}
                            </button>
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
