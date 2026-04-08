import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Globe, Mail, Github, Twitter, Linkedin, Zap } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-bg-primary border-t-2 border-bg-tertiary pt-20 pb-10 transition-colors">
            <div className="px-[5%] max-w-[1500px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link to="/" className="text-3xl font-black tracking-tighter hover:scale-105 transition-transform flex items-center gap-2 text-text-primary no-underline">
                            <span className="bg-text-primary text-bg-primary px-2 py-0.5 rounded-lg transition-colors">NEWS</span>
                            <span className="text-primary">GUARD</span>
                        </Link>
                        <p className="text-text-secondary font-bold text-sm leading-relaxed max-w-xs">
                            Neural-grade intelligence assessment for the digital news landscape. Verified integrity, AI-validated dispatches.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 bg-bg-secondary rounded-xl text-text-secondary hover:text-primary transition-all border border-bg-tertiary">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 bg-bg-secondary rounded-xl text-text-secondary hover:text-primary transition-all border border-bg-tertiary">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="p-2 bg-bg-secondary rounded-xl text-text-secondary hover:text-primary transition-all border border-bg-tertiary">
                                <Github size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Operational Hubs</h4>
                        <ul className="space-y-4 list-none p-0">
                            <li><Link to="/" className="text-text-primary font-bold text-sm hover:text-primary transition-colors no-underline">Intelligence Hub (Home)</Link></li>
                            <li><Link to="/category/Politics" className="text-text-primary font-bold text-sm hover:text-primary transition-colors no-underline">Political Analysis</Link></li>
                            <li><Link to="/category/Technology" className="text-text-primary font-bold text-sm hover:text-primary transition-colors no-underline">Neural Tech Feed</Link></li>
                            <li><Link to="/category/Health" className="text-text-primary font-bold text-sm hover:text-primary transition-colors no-underline">Critical Health Index</Link></li>
                        </ul>
                    </div>

                    {/* Logic & Tools */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Validation Lab</h4>
                        <ul className="space-y-4 list-none p-0">
                            <li><Link to="/check" className="text-text-primary font-bold text-sm hover:text-primary transition-colors no-underline">Neural Fact Check</Link></li>
                            <li><Link to="/archive" className="text-text-primary font-bold text-sm hover:text-primary transition-colors no-underline">Intelligence Archive</Link></li>
                            <li><Link to="/identity" className="text-text-primary font-bold text-sm hover:text-primary transition-colors no-underline">Identity Protocol</Link></li>
                        </ul>
                    </div>

                    {/* Active Status */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">System Integrity</h4>
                        <div className="bg-bg-secondary p-6 rounded-3xl border-2 border-bg-tertiary space-y-4 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-xs font-black text-text-primary uppercase tracking-tight">Mainframe Active</span>
                            </div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">
                                AI Pulse: High Confidence Mode Synchronized Across All Nodes.
                            </p>
                            <Link to="/status" className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:underline no-underline">
                                Verification Logs <TrendingUp size={12} />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-bg-tertiary flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                        © 2026 NEWS GUARD INTELLIGENCE UNIT. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-6 text-[10px] font-black text-text-secondary uppercase tracking-tighter">
                        <Link to="/privacy" className="flex items-center gap-2 hover:text-primary transition-colors no-underline text-text-secondary">
                             <Shield size={12} className="text-primary" /> Privacy Policy
                        </Link>
                        <Link to="/terms" className="flex items-center gap-2 hover:text-primary transition-colors no-underline text-text-secondary">
                             <Zap size={12} className="text-primary" /> Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
