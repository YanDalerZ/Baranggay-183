import { useState } from 'react';
import {
    Database, HardDrive, ShieldCheck, Download,
    RotateCcw, RefreshCw, AlertTriangle, X
} from 'lucide-react';

// --- Types ---
interface Backup {
    id: string;
    date: string;
    size: string;
    records: number;
    type: 'automatic' | 'manual';
    status: 'completed';
}

// --- Mock Data ---
const BACKUP_HISTORY: Backup[] = [
    { id: 'BK-20260210-001', date: '2026-02-10 08:00:00', size: '2.4 GB', records: 8542, type: 'automatic', status: 'completed' },
    { id: 'BK-20260209-001', date: '2026-02-09 08:00:00', size: '2.4 GB', records: 8538, type: 'automatic', status: 'completed' },
    { id: 'BK-20260208-002', date: '2026-02-08 15:30:00', size: '2.4 GB', records: 8535, type: 'manual', status: 'completed' },
];

export const SuperAdminDatabase = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRollbackModal, setShowRollbackModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div /*className="p-4 md:p-8 bg-slate-50 min-h-screen"*/>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-4 left-4 md:left-auto md:right-6 bg-slate-900 text-white px-6 py-4 rounded md shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 z-50">
                    <div className="bg-slate-700 p-1 rounded sm shrink-0"><AlertTriangle size={14} /></div>
                    <p className="text-sm font-medium">{toast}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        Database Maintenance
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-2">
                        Manage your backup and recovery ecosystem
                    </p>
                </div>
                <button
                    onClick={() => triggerToast("Manual backup initiated...")}
                    className="flex w-full lg:w-auto items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded sm font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                    <Download size={18} /> Create Manual Backup
                </button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatusCard title="Total Records" value="8,542" sub="7,845 active, 697 archived" icon={<Database className="text-slate-400" />} />
                <StatusCard title="Database Size" value="2.4 GB" sub="Last backup: 2h ago" icon={<HardDrive className="text-slate-400" />} />
                <StatusCard title="Backup Status" value="Healthy" sub="Triple Redundancy" icon={<ShieldCheck className="text-emerald-500" />} />
                <StatusCard title="Integrity Check" value="Passed" sub="Last verified: Today" icon={<ShieldCheck className="text-emerald-500" />} />
            </div>

{/* Critical Operations */}
            <div className="bg-white border border-red-100 rounded-md p-6 mb-8 shadow-sm">
                <h2 className="text-red-600 font-bold flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} /> Critical Database Operations
                </h2>
                <div>
                    <p className="text-sm text-red-600 mb-4">Superadmin-only operations. Use with extreme caution.</p>
                </div>
                {/* flex-1 on buttons makes them expand to fill space equally */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                        onClick={() => setShowDeleteModal(true)} 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition"
                    >
                        <X size={18} /> Hard Delete Records
                    </button>
                    <button 
                        onClick={() => setShowRollbackModal(true)} 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-amber-300 text-amber-700 bg-amber-50 rounded-md font-semibold hover:bg-amber-100 transition"
                    >
                        <RotateCcw size={18} /> Rollback Database
                    </button>
                    <button 
                        onClick={() => triggerToast("Optimizing database...")} 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 bg-white rounded-md font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <RefreshCw size={18} /> Optimize Database
                    </button>
                </div>
            </div>

            {/* Backup History */}
            <div className="bg-white rounded md border border-slate-200 p-4 md:p-6 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-6">Backup History</h2>
                <div className="space-y-4">
                    {BACKUP_HISTORY.map((bk) => (
                        <div key={bk.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded sm hover:border-slate-200 transition">
                            <div className="flex items-center gap-4">
                                <Database className="text-slate-300 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-900 text-sm md:text-base">{bk.id}</div>
                                    <div className="text-xs text-slate-500 flex gap-2">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold">{bk.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-left sm:text-right text-xs md:text-sm text-slate-600 font-medium">
                                {bk.date} <span className="hidden sm:inline">|</span> {bk.size}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => triggerToast(`Downloading backup ${bk.id}...`)}
                                    className="flex-1 sm:flex-none p-3 sm:p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded sm bg-slate-50 sm:bg-transparent"
                                >
                                    <Download size={16} />
                                </button>
                                <button
                                    onClick={() => triggerToast(`Restoring backup ${bk.id}...`)}
                                    className="flex-1 sm:flex-none p-3 sm:p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded sm bg-slate-50 sm:bg-transparent"
                                >
                                    <RotateCcw size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {(showDeleteModal || showRollbackModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded md max-w-sm w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" />
                            {showDeleteModal ? 'Delete Records' : 'Rollback Database'}
                        </h3>
                        <p className="text-sm text-slate-600 mb-6">
                            {showDeleteModal
                                ? 'This will permanently delete archived records. This cannot be undone.'
                                : 'This will restore the database to a selected backup point. Recent changes will be lost.'}
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setShowRollbackModal(false);
                                    triggerToast("Action confirmed.");
                                }}
                                className="w-full px-4 py-3 bg-red-600 text-white rounded sm font-semibold hover:bg-red-700"
                            >
                                Confirm
                            </button>
                            <button onClick={() => { setShowDeleteModal(false); setShowRollbackModal(false) }} className="w-full px-4 py-3 border border-slate-200 rounded sm font-semibold text-slate-700">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusCard = ({ title, value, sub, icon }: any) => (
    <div className="bg-white p-5 rounded md border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase text-slate-400">{title}</span>
            {icon}
        </div>
        <div className="text-xl md:text-2xl font-black text-slate-900">{value}</div>
        <div className="text-[10px] md:text-xs text-slate-500 mt-1">{sub}</div>
    </div>
);

export default SuperAdminDatabase;