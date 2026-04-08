import { FileText, Database, Shield, Search, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const IntelligenceArchive = () => {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary px-[5%] py-20 font-sans selection:bg-primary selection:text-white transition-colors duration-500">
            <div className="max-w-6xl mx-auto space-y-20 animate-in fade-in slide-in-from-top-8 duration-1000">
                
                {/* Header Section */}
                <div className="space-y-8">
                    <Link to="/" className="inline-flex items-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-transform">
                        <Globe size={18} /> Back to Interface
                    </Link>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none uppercase">
                        Intelligence <span className="text-primary">Archive</span>
                    </h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-bg-secondary p-4 rounded-2xl border-2 border-bg-tertiary shadow-xl w-full max-w-xl">
                            <Search className="text-text-secondary/50" />
                            <input type="text" placeholder="Search decrypted archives..." className="bg-transparent border-none outline-none font-black text-text-primary w-full" />
                        </div>
                    </div>
                </div>

                {/* Archive Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-bg-secondary p-10 rounded-4xl border-2 border-bg-tertiary shadow-2xl space-y-4">
                        <Database className="text-primary" size={40} />
                        <h3 className="text-3xl font-black tracking-tight uppercase">Stored Assets</h3>
                        <p className="text-5xl font-black text-primary">2,425+</p>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Verified Multi-Node Sync</p>
                    </div>
                    <div className="bg-bg-secondary p-10 rounded-4xl border-2 border-bg-tertiary shadow-2xl space-y-4">
                        <FileText className="text-primary" size={40} />
                        <h3 className="text-3xl font-black tracking-tight uppercase">Decrypted</h3>
                        <p className="text-5xl font-black text-primary">99.4%</p>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">High Confidence Ratio</p>
                    </div>
                    <div className="bg-bg-secondary p-10 rounded-4xl border-2 border-bg-tertiary shadow-2xl space-y-4">
                        <Shield className="text-primary" size={40} />
                        <h3 className="text-3xl font-black tracking-tight uppercase">Secured</h3>
                        <p className="text-5xl font-black text-primary">Absolute</p>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Neural Integrity Enabled</p>
                    </div>
                </div>

                {/* Hub Placeholder Content */}
                <div className="bg-bg-secondary p-20 rounded-5xl border-2 border-dashed border-bg-tertiary text-center space-y-8">
                    <div className="w-24 h-24 bg-bg-primary rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <Shield className="text-text-secondary/20" size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tight uppercase">Mainframe Synchronization Required</h2>
                        <p className="text-xl font-medium text-text-secondary max-w-2xl mx-auto leading-relaxed">
                            Accessing the full Intelligence Archive requires Level 3 clearance. Current archives are being re-indexed for neural assessment.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default IntelligenceArchive;
