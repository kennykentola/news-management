import { Shield, Fingerprint, Lock, Cpu, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const IdentityProtocol = () => {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary px-[5%] py-20 font-sans selection:bg-primary selection:text-white transition-colors duration-500">
            <div className="max-w-6xl mx-auto space-y-20 animate-in fade-in slide-in-from-right-8 duration-700">
                
                {/* Header */}
                <div className="space-y-6">
                    <Link to="/" className="inline-flex items-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-transform mb-8">
                        <Globe size={18} /> Back to Interface
                    </Link>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none uppercase">
                        Identity <span className="text-primary">Protocol</span>
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-black text-text-secondary uppercase tracking-[0.3em]">
                        <span>Secure Node ID: #NG-770-SEC</span>
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span>Multi-Layer Verification Enabled</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-bg-secondary p-12 rounded-4xl border-2 border-bg-tertiary shadow-2xl relative overflow-hidden group">
                        <Fingerprint className="absolute -bottom-4 -right-4 text-primary/10 w-48 h-48 transition-transform group-hover:scale-110" />
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-4xl font-black tracking-tight leading-none uppercase">Neural Verification</h3>
                            <p className="text-xl font-medium text-text-secondary leading-relaxed">
                                Our platform employs neural biometric assessment to ensure that every dispatch is authentically anchored to a verified intelligence asset.
                            </p>
                            <ul className="space-y-3 list-none p-0 text-sm font-black uppercase text-text-primary">
                                <li className="flex items-center gap-3"><Shield size={16} className="text-primary" /> Encrypted Metadata Tracking</li>
                                <li className="flex items-center gap-3"><Shield size={16} className="text-primary" /> AI Behavioral Analysis</li>
                                <li className="flex items-center gap-3"><Shield size={16} className="text-primary" /> Cryptographic Identity Lock</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-bg-secondary p-12 rounded-4xl border-2 border-bg-tertiary shadow-2xl space-y-8 flex flex-col justify-center">
                        <div className="space-y-4">
                            <Lock className="text-primary" size={48} />
                            <h3 className="text-4xl font-black tracking-tight leading-none uppercase">Operational Security</h3>
                            <p className="text-xl font-medium text-text-secondary leading-relaxed">
                                All administrative actions within the NewsGuard ecosystem are logged in our neural immutable ledger, preventing unauthorized identity exploitation.
                            </p>
                        </div>
                        <div className="pt-8 border-t-2 border-bg-tertiary">
                            <Link to="/login" className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
                                Request Clearance <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Secure Interface Message */}
                <div className="bg-primary/5 p-12 rounded-5xl border-2 border-primary/20 text-center space-y-6">
                    <Cpu className="text-primary mx-auto mb-4" size={48} />
                    <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none">"Your identity is your greatest information asset."</h2>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em]">
                        NewsGuard Intelligence Unit • All Rights Reserved 2026
                    </p>
                </div>

            </div>
        </div>
    );
};

export default IdentityProtocol;
