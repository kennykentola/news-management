import { Shield, Eye, Lock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary px-[5%] py-20 font-sans selection:bg-primary selection:text-white transition-colors duration-500">
            <div className="max-w-4xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Header */}
                <div className="space-y-6 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-transform mb-8">
                        <Globe size={18} /> Back to Interface
                    </Link>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                        Privacy <span className="text-primary">Policy</span>
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm font-black text-text-secondary uppercase tracking-[0.3em]">
                        <span>Effective: April 2026</span>
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span>v3.2 Neural Secure</span>
                    </div>
                </div>

                <div className="prose prose-xl dark:prose-invert prose-black dark:prose-white max-w-none space-y-16">
                    
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <Shield size={32} />
                            <h2 className="text-3xl font-black m-0 tracking-tight uppercase">Neural Data Commitment</h2>
                        </div>
                        <p className="text-xl font-medium leading-relaxed text-text-primary/80">
                            At NewsGuard Intelligence Unit, our commitment to information integrity extends to the protection of your digital identity. We employ neural-grade assessment protocols to ensure that all data processed through our interface adheres to the highest standards of confidentiality and operational security.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <Eye size={32} />
                            <h2 className="text-3xl font-black m-0 tracking-tight uppercase">Intelligence Gathering</h2>
                        </div>
                        <p className="text-xl font-medium leading-relaxed text-text-primary/80">
                            We collect minimal data necessary for the verification and validation of information assets. This includes platform interaction metrics, AI verification scores, and editorial dispatch logs. We do not engage in unauthorized harvesting of user metadata for third-party commercial exploitation.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <Lock size={32} />
                            <h2 className="text-3xl font-black m-0 tracking-tight uppercase">Cryptographic Sovereignty</h2>
                        </div>
                        <p className="text-xl font-medium leading-relaxed text-text-primary/80">
                            Users retain sovereignty over their verified manuscripts. Once an article is archived in the Neural Archive, it is protected by cryptographic integrity checks to prevent unauthorized alteration or misinformation injection.
                        </p>
                    </section>

                </div>

                {/* Footer Ticker */}
                <div className="pt-20 border-t-4 border-primary">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] text-center">
                        🛡️ Protected by NewsGuard Intelligence Protocols • 2026 Secured Interface
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Privacy;
