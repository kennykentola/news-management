import { Zap, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary px-[5%] py-20 font-sans selection:bg-primary selection:text-white transition-colors duration-500">
            <div className="max-w-4xl mx-auto space-y-20 animate-in fade-in zoom-in duration-1000">
                
                {/* Header */}
                <div className="space-y-6 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-transform mb-8">
                        <Globe size={18} /> Back to Interface
                    </Link>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                        Terms of <span className="text-primary">Service</span>
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm font-black text-text-secondary uppercase tracking-[0.3em]">
                        <span>Standard: 2026.04</span>
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span>AI Managed Interface</span>
                    </div>
                </div>

                <div className="prose prose-xl dark:prose-invert prose-black dark:prose-white max-w-none space-y-16">
                    
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <Zap size={32} />
                            <h2 className="text-3xl font-black m-0 tracking-tight uppercase">Operational Access</h2>
                        </div>
                        <p className="text-xl font-medium leading-relaxed text-text-primary/80">
                            By accessing the NewsGuard Intelligence Interface, you agree to participate in the collective pursuit of information integrity. Access is granted to verified assets only. Unauthorized tampering with the AI Validation Engine or misinformation injection is strictly prohibited under our Neural Integrity Protocol.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <CheckCircle size={32} />
                            <h2 className="text-3xl font-black m-0 tracking-tight uppercase">Verification Standards</h2>
                        </div>
                        <p className="text-xl font-medium leading-relaxed text-text-primary/80">
                            All dispatches submitted for review must adhere to our lead intelligence standards. Manuscripts that fail our AI Accuracy assessment or are flagged by our neural nodes for high deception probability will be rejected or archived as flagged intelligence.
                        </p>
                    </section>

                    <section className="space-y-6 bg-danger/5 p-10 rounded-4xl border-2 border-danger/20">
                        <div className="flex items-center gap-4 text-danger">
                            <AlertCircle size={32} />
                            <h2 className="text-3xl font-black m-0 tracking-tight uppercase">Misinformation Breach</h2>
                        </div>
                        <p className="text-lg font-bold leading-relaxed text-text-primary/80">
                            Engagement in coordinated misinformation campaigns or the exploitation of linguistic edge cases for malicious narrative engineering will result in the immediate termination of identity credentials and permanent archival in our Misinformation Registry.
                        </p>
                    </section>

                </div>

                {/* Footer Ticker */}
                <div className="pt-20 border-t-4 border-primary">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] text-center">
                        ⚡ AI Managed Interface • Information Integrity Standard 2026.04
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Terms;
