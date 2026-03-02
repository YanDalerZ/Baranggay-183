import { X, Clock, Calendar, CheckSquare, ListOrdered } from 'lucide-react';

interface ViewGuideModalProps {
    guide: any | null;
    onClose: () => void;
}

const ViewGuideModal = ({ guide, onClose }: ViewGuideModalProps) => {
    if (!guide) return null;

    // Parse JSON if the backend returns it as a string
    const requirements = typeof guide.requirements === 'string'
        ? JSON.parse(guide.requirements) : guide.requirements;
    const steps = typeof guide.steps === 'string'
        ? JSON.parse(guide.steps) : guide.steps;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col rounded-xl border border-gray-100">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#00308F] bg-blue-50 px-2 py-0.5 rounded mb-2 inline-block">
                            {guide.category}
                        </span>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 leading-tight">
                            {guide.title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-[#00308F] mb-1">
                                <Clock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Process Time</span>
                            </div>
                            <p className="text-sm font-bold text-gray-800">{guide.processing_time}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-[#00308F] mb-1">
                                <Calendar size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Office Hours</span>
                            </div>
                            <p className="text-sm font-bold text-gray-800">{guide.office_hours || '8:00 AM - 5:00 PM'}</p>
                        </div>
                    </div>

                    {/* Requirements */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                            <CheckSquare size={18} className="text-[#00308F]" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Documentary Requirements</h3>
                        </div>
                        <ul className="space-y-2">
                            {requirements?.map((req: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                                    <CheckSquare size={18} className="text-green-500" />
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Steps */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                            <ListOrdered size={18} className="text-[#00308F]" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Step-by-Step Procedure</h3>
                        </div>
                        <div className="space-y-4">
                            {steps?.map((step: string, idx: number) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-[#00308F] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md shadow-blue-100">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 pt-1.5 border-b border-gray-50 pb-4 text-sm font-bold text-gray-800 leading-relaxed">
                                        {step}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase italic">
                        Last Updated: {new Date(guide.last_updated).toLocaleDateString()}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-[#00308F] transition rounded-lg"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewGuideModal;