import { Shield } from 'lucide-react';

const LoadingScreen = ({ message = "Calibrating AI Truth Engines..." }: { message?: string }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-primary"></div>
                <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/20" size={40} />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">News<span className="text-primary">Guard</span></h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">{message}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
