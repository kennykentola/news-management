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
        <div className="min-h-screen bg-white text-black p-8 md:p-16">
            <header className="max-w-5x; mx-auto text-center mb-16">
                <h1 className="text-5xl font-black mb-6 text-black tracking-tight" style={{ letterSpacing: '-0.05em' }}>
                    Instant Fact-Check
                </h1>
                <p className="text-gray-600 text-xl font-medium max-w-2xl mx-auto">
                    Paste an article, headline, or rumor below to let our AI analyze its credibility in seconds.
                </p>
            </header>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-2xl p-10 rounded-3xl mb-12 border-2 border-bg-tertiary">
                    <textarea
                        className="w-full h-60 bg-white border-2 border-bg-tertiary rounded-2xl p-6 text-black placeholder:text-gray-400 focus:border-primary outline-none resize-none transition-all text-lg font-medium shadow-inner"
                        placeholder="Paste text here to verify..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={handleCheck}
                            disabled={loading || !text.trim()}
                            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-white transition-all text-lg shadow-xl
                                ${loading
                                    ? 'bg-gray-300 cursor-wait'
                                    : 'bg-primary hover:bg-primary-dark shadow-primary/30 active:scale-95'
                                }`}
                        >
                            {loading ? 'Analyzing Complexity...' : <><Search size={24} /> Check Credibility</>}
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-bg-tertiary">
                        {/* Result Header */}
                        <div className={`p-10 border-b-2 border-bg-tertiary flex items-center justify-between
                            ${result.result === 'FAKE' ? 'bg-red-50' :
                                result.result === 'UNKNOWN' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                            <div className="flex items-center gap-8">
                                <div className={`p-6 rounded-2xl shadow-lg ${result.result === 'FAKE' ? 'bg-red-600 text-white' :
                                    result.result === 'UNKNOWN' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                                    {result.result === 'FAKE' ? <AlertOctagon size={48} /> :
                                        result.result === 'UNKNOWN' ? <AlertTriangle size={48} /> : <CheckCircle size={48} />}
                                </div>
                                <div>
                                    <h2 className={`text-4xl font-black ${result.result === 'FAKE' ? 'text-red-700' :
                                        result.result === 'UNKNOWN' ? 'text-amber-700' : 'text-emerald-700'} tracking-tight`}>
                                        {result.result === 'FAKE' ? 'Likely Misinformation' :
                                            result.result === 'UNKNOWN' ? 'Analysis Unavailable' : 'Likely Reliable'}
                                    </h2>
                                    {result.result !== 'UNKNOWN' && (
                                        <p className="text-black/70 text-lg font-bold mt-2">
                                            AI Confidence Score: <span className="font-black text-black text-2xl ml-2">{result.score}%</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Body */}
                        <div className="p-10">
                            <h3 className="text-2xl font-black text-black mb-8 flex items-center gap-3 tracking-tight">
                                <Info size={28} className="text-primary" strokeWidth={3} /> Why?
                            </h3>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">AI Deep Analysis</h4>
                                    <p className="text-black text-xl leading-relaxed font-medium">
                                        {result.analysis?.explanation || "No detailed explanation available."}
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Emotional Tone</h4>
                                        <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden border-2 border-bg-tertiary shadow-inner">
                                            <div
                                                className={`h-full ${result.analysis?.sentiment < 0 ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-1000 ease-out`}
                                                style={{ width: `${Math.abs(result.analysis?.sentiment || 0) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-sm text-black font-black mt-3 uppercase tracking-wider">
                                            <span>Negative</span>
                                            <span>Neutral</span>
                                            <span>Positive</span>
                                        </div>
                                    </div>

                                    {result.analysis?.triggers && result.analysis.triggers.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Detected Bias Triggers</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {result.analysis.triggers.map((word: string, i: number) => (
                                                    <span key={i} className="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 text-sm border-2 border-amber-200 font-black shadow-sm">
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
