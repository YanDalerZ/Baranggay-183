import {
    X,
    Calendar,
    Users,
    FileText,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';

interface Benefit {
    batch_id: number;
    batch_name: string;
    target_group: string;
    items_summary: string;
    status: string;
    date_claimed: string | null;
    date_posted: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    benefit: Benefit | null;
}

export default function BenefitDetailsModal({ isOpen, onClose, benefit }: ModalProps) {
    if (!isOpen || !benefit) return null;

    // Helper for status badge styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Claimed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Modal Header */}
                <div className="relative p-6 border-b border-gray-100 bg-[#FCFDFF]">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-gray-400 hover:text-black transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase italic ${getStatusStyle(benefit.status)}`}>
                            {benefit.status}
                        </span>
                        <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 font-black uppercase rounded italic">
                            {benefit.target_group}
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 uppercase leading-none italic tracking-tight">
                        {benefit.batch_name}
                    </h2>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">

                    {/* Summary Section */}
                    <section>
                        <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 italic">
                            <FileText size={14} /> Description & Items
                        </h4>
                        <p className="text-gray-900 font-bold leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {benefit.items_summary}
                        </p>
                    </section>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Date Posted</p>
                                    <p className="text-sm font-bold text-gray-900">{benefit.date_posted}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Eligibility</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {benefit.target_group === 'BOTH' ? 'Seniors & PWDs' :
                                            benefit.target_group === 'SC' ? 'Senior Citizens Only' : 'PWD Only'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><MapPin size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Pickup Location</p>
                                    <p className="text-sm font-bold text-gray-900">Barangay Hall Main Office</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    {benefit.status === 'Claimed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Claim Status</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {benefit.status === 'Claimed' ? `Claimed on ${benefit.date_claimed}` : 'Ready for Processing'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Note */}
                    <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <AlertCircle className="text-amber-600 shrink-0" size={20} />
                        <div>
                            <p className="text-xs font-black text-amber-800 uppercase italic">Requirement Notice</p>
                            <p className="text-[11px] text-amber-900 font-bold">
                                Please bring your original Barangay ID and a photocopy of your Senior/PWD ID to claim this benefit.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                    >
                        Close Window
                    </button>
                    {benefit.status !== 'Claimed' && (
                        <button className="flex-2 px-8 py-3 bg-[#00308F] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-800 transition-all italic">
                            Claim this Benefit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}