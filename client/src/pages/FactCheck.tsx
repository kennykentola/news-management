import { useState } from 'react';
import { AlertTriangle, CheckCircle, Search, AlertOctagon, Info, ArrowRight } from 'lucide-react';

const FactCheck = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCheck = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('http://127.0.0.1:5000/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze. Ensure the AI service is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12">
            <header className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-heading font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Instant Fact-Check
                </h1>
                <p className="text-text-secondary text-lg">
                    Paste an article, headline, or rumor below to let our AI analyze its credibility in seconds.
                </p>
            </header>

            <div className="max-w-3xl mx-auto">
                <div className="glass-panel p-6 rounded-2xl mb-8">
                    <textarea
                        className="w-full h-40 bg-bg-secondary border border-bg-tertiary rounded-xl p-4 text-white placeholder:text-slate-500 focus:border-primary outline-none resize-none transition-all"
                        placeholder="Paste text here to verify..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleCheck}
                            disabled={loading || !text.trim()}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                                ${loading
                                    ? 'bg-slate-700 cursor-wait'
                                    : 'bg-primary hover:bg-primary-hover shadow-lg shadow-blue-500/20'
                                }`}
                        >
                            {loading ? 'Analyzing...' : <><Search size={20} /> Check Credibility</>}
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Result Header */}
                        <div className={`p-6 rounded-t-2xl border-b border-white/5 flex items-center justify-between
                            ${result.result === 'FAKE' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${result.result === 'FAKE' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {result.result === 'FAKE' ? <AlertOctagon size={32} /> : <CheckCircle size={32} />}
                                </div>
                                <div>
                                    <h2 className={`text-2xl font-bold ${result.result === 'FAKE' ? 'text-red-400' : 'text-green-400'}`}>
                                        {result.result === 'FAKE' ? 'Likely Misinformation' : 'Likely Reliable'}
                                    </h2>
                                    <p className="text-text-secondary text-sm">
                                        Confidence Score: <span className="font-mono text-white">{result.score}%</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Body */}
                        <div className="glass-panel rounded-b-2xl p-6 border-t-0">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Info size={18} className="text-primary" /> Why?
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">AI Explanation</h4>
                                    <p className="text-slate-300 leading-relaxed">
                                        {result.analysis?.explanation || "No detailed explanation available."}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Sentiment</h4>
                                        <div className="w-full bg-bg-secondary h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${result.analysis?.sentiment < 0 ? 'bg-red-400' : 'bg-green-400'}`}
                                                style={{ width: `${Math.abs(result.analysis?.sentiment || 0) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                            <span>Negative</span>
                                            <span>Neutral</span>
                                            <span>Positive</span>
                                        </div>
                                    </div>

                                    {result.analysis?.triggers && result.analysis.triggers.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Trigger Words</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.analysis.triggers.map((word: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20">
                                                        {word}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FactCheck;
