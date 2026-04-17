import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, AUDIT_LOGS_COLLECTION_ID } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { History, User, Activity, Clock, Info, Search, Trash2 } from 'lucide-react';

const AuditLog = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    AUDIT_LOGS_COLLECTION_ID,
                    [Query.orderDesc('timestamp'), Query.limit(100)]
                );
                setLogs(response.documents);
            } catch (error) {
                console.error('Failed to fetch audit logs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-text-primary tracking-widest uppercase text-sm">Accessing Archive...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-text-primary tracking-tighter">System Audit Trail</h2>
                    <p className="text-text-secondary font-bold mt-2">Immutable chronological record of all editorial and administrative actions.</p>
                </div>
                <div className="flex items-center gap-4 bg-bg-secondary p-2 rounded-2xl border-2 border-bg-tertiary shadow-sm focus-within:border-primary transition-all">
                    <Search className="text-text-secondary/50 ml-2" size={20} />
                    <input 
                        placeholder="Filter trail..." 
                        className="bg-transparent border-none outline-none font-bold text-text-primary p-2 w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredLogs.length === 0 ? (
                    <div className="bg-bg-secondary p-20 rounded-4xl border-2 border-dashed border-bg-tertiary text-center">
                        <p className="text-text-secondary/50 font-black text-xl tracking-tight uppercase">No records found in current segment.</p>
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <div key={log.$id} className="bg-bg-secondary p-6 rounded-3xl border-2 border-bg-tertiary shadow-xl hover:shadow-2xl transition-all group flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className={`p-4 rounded-2xl ${log.action === 'APPROVED' ? 'bg-green-500/10 text-green-600' : log.action === 'REJECTED' ? 'bg-red-500/10 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                <Activity size={24} />
                            </div>
                            
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-text-primary uppercase tracking-tight">{log.userName}</span>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${log.action === 'APPROVED' ? 'border-green-500/20 text-green-600 bg-green-500/5' : log.action === 'REJECTED' ? 'border-red-500/20 text-red-600 bg-red-500/5' : 'border-primary/20 text-primary bg-primary/5'}`}>
                                        {log.action}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-text-secondary leading-relaxed">{log.details}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <div className="flex items-center gap-2 text-xs font-black text-text-secondary/50 uppercase tracking-widest">
                                    <Clock size={12} />
                                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                                <div className="text-[10px] font-bold text-text-secondary/30 flex items-center gap-1">
                                    <Info size={10} /> Node: {log.entityId || 'SYS-KRNL'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AuditLog;
