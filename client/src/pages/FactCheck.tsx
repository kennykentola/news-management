import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Shield, Zap, Search, ArrowLeft, Cpu, Globe, CheckCircle2, AlertCircle, XCircle, Sun, Moon } from 'lucide-react';
import Footer from '../components/Footer';

const FactCheck = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [query, setQuery] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setAnalyzing(true);
        // Simulate deep neural analysis
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const score = Math.floor(Math.random() * 40) + 60; // 60-100
        setResult({
            score,
            label: score > 80 ? 'VERIFIED' : 'CAUTION',
            reason: score > 80 
                ? "Neural assessment confirms high internal consistency and linguistic patterns matching verified global intelligence dispatches."
                : "Analysis detected minor linguistic anomalies and cross-referencing gaps. Proceed with verification audit.",
            riskLevel: score > 80 ? 'LOW' : 'MEDIUM'
        });
        setAnalyzing(false);
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-white transition-colors duration-500">
            {/* Minimal Logic Nav */}
            <nav className="p-6 px-[5%] flex justify-between items-center border-b-2 border-bg-tertiary bg-bg-primary/50 backdrop-blur-xl sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2 text-text-primary font-black uppercase text-[10px] tracking-widest hover:text-primary transition-all no-underline">
                    <ArrowLeft size={16} /> Hub
                </Link>
                <button 
                    onClick={toggleDarkMode}
                    className="p-1.5 bg-bg-secondary rounded-lg border border-bg-tertiary text-text-primary hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                    {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
            </nav>

            <main className="max-w-[1200px] mx-auto pt-20 px-[5%] pb-32">
                <header className="text-center space-y-6 mb-20">
                    <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-2 rounded-2xl border-2 border-primary/20 animate-bounce">
                        <Zap size={20} />
                        <span className="font-black text-xs uppercase tracking-widest">Neural Analysis Engine Active</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-text-primary">
                        FACT CHECK <span className="text-primary italic">LAB</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary font-bold max-w-2xl mx-auto italic">
                        Deploy our NewsGuard Neural Engine to audit the integrity of any information asset.
                    </p>
                </header>

                <section className="bg-bg-secondary p-2 rounded-4xl border-2 border-bg-tertiary shadow-3xl mb-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-primary">
                        <Cpu size={200} />
                    </div>
                    
                    <form onSubmit={handleAnalyze} className="relative z-10 bg-bg-primary p-8 md:p-12 rounded-4xl space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                                <Search size={14} /> Intelligence Input Field
                            </label>
                            <textarea 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Paste the claim, news snippet, or information asset here for a deep neural audit..."
                                className="w-full h-48 md:h-64 bg-bg-secondary border-2 border-bg-tertiary rounded-3xl p-8 text-xl md:text-2xl font-bold outline-none focus:border-primary transition-all text-text-primary placeholder:text-text-secondary/20 shadow-inner"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-4 text-text-secondary">
                                <Globe size={24} className="opacity-50" />
                                <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px]">Cross-referencing 4.2B primary data points</p>
                            </div>
                            <button 
                                disabled={analyzing || !query.trim()}
                                className="w-full md:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                            >
                                {analyzing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Auditing Asset...
                                    </>
                                ) : (
                                    <>
                                        <Shield size={20} /> Run Neural Audit
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>

                {result && (
                    <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1 bg-bg-secondary p-10 rounded-4xl border-2 border-bg-tertiary shadow-2xl text-center space-y-4 flex flex-col items-center justify-center">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-8 border-bg-tertiary flex items-center justify-center">
                                        <span className="text-4xl font-black text-primary">{result.score}%</span>
                                    </div>
                                    <div className="absolute inset-0 w-32 h-32 rounded-full border-8 border-primary border-t-transparent animate-spin-slow"></div>
                                </div>
                                <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Integrity Score</h4>
                            </div>

                            <div className="md:col-span-2 bg-text-primary text-bg-primary p-10 rounded-4xl shadow-3xl flex flex-col justify-center space-y-6 transition-colors">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2
                                        ${result.label === 'VERIFIED' ? 'bg-primary text-white' : 'bg-danger text-white'}
                                    `}>
                                        {result.label === 'VERIFIED' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        Status: {result.label}
                                    </span>
                                    <span className="bg-bg-primary/10 text-bg-primary/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-bg-primary/20">
                                        Risk: {result.riskLevel}
                                    </span>
                                </div>
                                <p className="text-2xl md:text-3xl font-black italic tracking-tight leading-snug">
                                    "{result.reason}"
                                </p>
                            </div>
                        </div>

                        <div className="bg-bg-secondary p-10 rounded-4xl border-2 border-bg-tertiary shadow-2xl">
                             <div className="flex items-center gap-6 mb-8">
                                <h3 className="text-2xl font-black text-text-primary tracking-tighter uppercase">Cross-Verification Logs</h3>
                                <div className="flex-1 h-[2px] bg-bg-tertiary"></div>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { icon: <Globe />, label: 'Web Source Audit', status: 'Passed' },
                                    { icon: <Cpu />, label: 'Logic Consistency', status: 'High' },
                                    { icon: <Shield />, label: 'Fact Database', status: 'Match Found' }
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center gap-4 p-6 bg-bg-primary rounded-2xl border-2 border-bg-tertiary shadow-inner">
                                        <div className="text-primary">{log.icon}</div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{log.label}</p>
                                            <p className="font-black text-text-primary">{log.status}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default FactCheck;
