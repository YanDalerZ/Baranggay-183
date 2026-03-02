import { X, Clock, MapPin, CheckCircle2, Phone, Lightbulb } from 'lucide-react';

interface ViewGuideModalProps {
    guide: any | null;
    onClose: () => void;
    onProceed: (guide: any) => void;
}

const ViewGuideModal = ({ guide, onClose, onProceed }: ViewGuideModalProps) => {
    if (!guide) return null;

    // Parse JSON safely
    const requirements = typeof guide.requirements === 'string'
        ? JSON.parse(guide.requirements) : guide.requirements;
    const steps = typeof guide.steps === 'string'
        ? JSON.parse(guide.steps) : guide.steps;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col rounded-2xl border border-gray-200">

                {/* Header Section */}
                <div className="p-8 border-b border-gray-100 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <CheckCircle2 size={18} className="text-blue-600" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {guide.category}
                        </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {guide.title}
                    </h2>

                    <div className="flex flex-wrap gap-8 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-blue-500" />
                            <span className="font-medium">Processing: {guide.processing_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-blue-500" />
                            <span className="font-medium">{guide.office_hours || 'Monday to Friday, 8:00 AM - 5:00 PM'}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="overflow-y-auto p-8 bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Left Column: Steps */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <ListOrdered size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Step-by-Step Process</h3>
                            </div>

                            <div className="space-y-4">
                                {steps?.map((step: string, idx: number) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed pt-1">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Right Column: Requirements & Tips */}
                        <div className="space-y-10">
                            {/* Requirements */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Required Documents</h3>
                                </div>

                                <ul className="space-y-4">
                                    {requirements?.map((req: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                <CheckCircle2 size={14} className="text-green-600" />
                                            </div>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Pro Tip Box */}
                            <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-2 mb-2 text-amber-700">
                                    <Lightbulb size={18} />
                                    <span className="font-bold text-sm">Pro Tip</span>
                                </div>
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    Prepare all required documents before visiting the barangay office to ensure a smooth and efficient application process. Make both original and photocopies of all documents.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                        <Clock size={14} />
                        <span>Last updated: {guide.last_updated ? new Date(guide.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                            <Phone size={14} />
                            <span>For questions, call: (02) 8123-4567</span>
                        </div>
                        <button
                            onClick={() => onProceed(guide)}
                            className="px-8 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all rounded-lg shadow-sm"
                        >
                            Book an Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ListOrdered = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
);

export default ViewGuideModal;