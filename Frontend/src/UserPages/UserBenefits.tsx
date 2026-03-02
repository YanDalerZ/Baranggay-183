import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../interfaces';
import {
    CheckCircle2,
    Clock,
    Package,
    Loader2,
    Check,
    Info,
    FileText,
    X,
    Calendar,
    Users,
    MapPin,
    AlertCircle
} from 'lucide-react';

interface Benefit {
    batch_id: number;
    batch_name: string;
    target_group: string;
    items_summary: string;
    status: string;
    date_claimed: string | null;
    date_posted: string;
    quantity?: number;
}

// Modal Component defined in the same file for full working code
const BenefitDetailsModal = ({
    isOpen,
    onClose,
    benefit
}: {
    isOpen: boolean;
    onClose: () => void;
    benefit: Benefit | null
}) => {
    if (!isOpen || !benefit) return null;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Claimed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                    <section>
                        <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 italic">
                            <FileText size={14} /> Description & Items
                        </h4>
                        <p className="text-gray-900 font-bold leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {benefit.items_summary}
                        </p>
                    </section>

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

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                    >
                        Close Window
                    </button>

                </div>
            </div>
        </div>
    );
};

const StatCard = ({
    label,
    value,
    subtext,
    colorClass,
    isActive,
    onClick
}: {
    label: string,
    value: string | number,
    subtext: string,
    colorClass: string,
    isActive: boolean,
    onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={`bg-white p-6 rounded-xl border transition-all flex flex-col justify-between h-40 text-left shadow-sm ${isActive ? 'border-blue-600 ring-2 ring-blue-50' : 'border-gray-100 hover:border-gray-300'
            }`}
    >
        <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">{label}</span>
        <div>
            <span className={`text-4xl font-bold ${colorClass}`}>{value}</span>
            <p className="text-xs text-gray-800 font-bold mt-1 italic uppercase tracking-wider">
                {isActive ? '● Viewing' : subtext}
            </p>
        </div>
    </button>
);

export default function MyBenefits() {
    const { token, user } = useAuth();
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'All' | 'Claimed' | 'Pending'>('All');

    // States for Modal
    const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handler functions for Modal
    const handleViewDetails = (benefit: Benefit) => {
        setSelectedBenefit(benefit);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBenefit(null);
    };

    const fetchData = useCallback(async () => {
        if (!token || !user?.id) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/benefits/getBenefit/${user.id}`, config);

            if (Array.isArray(response.data)) {
                setBenefits(response.data);
            } else {
                setError("Invalid data format received.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not load your benefits. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [token, user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stats = useMemo(() => ({
        total: benefits.length,
        claimed: benefits.filter(b => b.status === 'Claimed').length,
        pending: benefits.filter(b => b.status !== 'Claimed').length,
    }), [benefits]);

    const filteredBenefits = useMemo(() => {
        if (activeFilter === 'All') return benefits;
        if (activeFilter === 'Claimed') return benefits.filter(b => b.status === 'Claimed');
        return benefits.filter(b => b.status !== 'Claimed');
    }, [benefits, activeFilter]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-900 font-bold uppercase tracking-widest italic">Syncing Benefits...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {error ? <div className="text-red-600 font-bold p-4">{error}</div> : null}
                {/* Header Section */}
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-[#00308F] bg-clip-text text-transparent italic">
                        My Benefits
                    </h2>
                    <p className="text-gray-900 font-bold uppercase text-xs tracking-widest mt-2">
                        Stay informed and manage your eligible claims
                    </p>
                </div>

                {/* 3-Column Stat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="Eligible Benefits"
                        value={stats.total}
                        subtext="Available for you"
                        colorClass="text-black"
                        isActive={activeFilter === 'All'}
                        onClick={() => setActiveFilter('All')}
                    />
                    <StatCard
                        label="Benefits Claimed"
                        value={stats.claimed}
                        subtext="Total completed"
                        colorClass="text-green-600"
                        isActive={activeFilter === 'Claimed'}
                        onClick={() => setActiveFilter('Claimed')}
                    />
                    <StatCard
                        label="Pending Claims"
                        value={stats.pending}
                        subtext="Awaiting pickup / review"
                        colorClass="text-orange-500"
                        isActive={activeFilter === 'Pending'}
                        onClick={() => setActiveFilter('Pending')}
                    />
                </div>

                {/* Status Explanation Guide */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-500"><Clock size={18} /></div>
                            <div>
                                <p className="font-bold text-sm text-gray-900 leading-tight">Pending</p>
                                <p className="text-[11px] text-gray-900 font-bold italic uppercase">Under review by staff</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Package size={18} /></div>
                            <div>
                                <p className="font-bold text-sm text-gray-900 leading-tight">Approved</p>
                                <p className="text-[11px] text-gray-900 font-bold italic uppercase">Ready for pickup</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 size={18} /></div>
                            <div>
                                <p className="font-bold text-sm text-gray-900 leading-tight">Claimed</p>
                                <p className="text-[11px] text-gray-900 font-bold italic uppercase">Transaction complete</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area: List and How-to-Apply */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Benefits List (Left 2 Columns) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight italic">
                                        {activeFilter} Programs List
                                    </h2>
                                    <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Linked to your profile</p>
                                </div>
                                <span className="text-xs font-black text-white bg-black px-3 py-1 rounded-full uppercase italic">
                                    {filteredBenefits.length} Items
                                </span>
                            </div>

                            <div className="p-6 space-y-4">
                                {filteredBenefits.length > 0 ? (
                                    filteredBenefits.map((benefit) => (
                                        <div key={benefit.batch_id} className="border border-gray-100 rounded-xl p-5 hover:border-blue-200 transition-all bg-[#FCFDFF]">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <div className={`p-3 rounded-xl h-fit ${benefit.status === 'Claimed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {benefit.status === 'Claimed' ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-gray-900 text-lg uppercase leading-none">{benefit.batch_name}</h3>
                                                            <span className="text-[9px] bg-gray-900 text-white px-2 py-0.5 font-black uppercase rounded italic">
                                                                {benefit.target_group}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 font-medium mb-3">{benefit.items_summary}</p>

                                                        <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-500 uppercase">
                                                            <span className="flex items-center gap-1"><Clock size={12} /> Posted: {benefit.date_posted}</span>
                                                            <span>•</span>
                                                            <span className={`px-2 py-0.5 rounded border ${benefit.status === 'Claimed' ? 'border-green-200 text-green-700 bg-green-50' : 'border-orange-200 text-orange-700 bg-orange-50'
                                                                }`}>
                                                                Status: {benefit.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleViewDetails(benefit)}
                                                        className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors uppercase italic"
                                                    >
                                                        <Info className="w-4 h-4" /> Details
                                                    </button>

                                                </div>
                                            </div>

                                            {benefit.status === 'Claimed' && (
                                                <div className="mt-4 bg-green-50/50 rounded-lg p-3 flex items-center gap-2 text-green-700 text-[11px] border border-green-100 font-bold uppercase italic">
                                                    <Check size={14} />
                                                    <span>Successfully claimed on {benefit.date_claimed || 'Record'}. Thank you!</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="mx-auto text-gray-200 mb-2" size={64} />
                                        <p className="text-gray-400 font-black uppercase tracking-[0.2em] italic">No Benefits Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* How to Apply Sidebar (Right 1 Column) */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-8">
                            <h2 className="text-lg font-black text-gray-900 uppercase italic mb-6 border-b pb-2 border-gray-100">
                                Application Guide
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { step: "01", title: "Verify Eligibility", desc: "Ensure you meet the target group requirements (SC/PWD)." },
                                    { step: "02", title: "Gather Files", desc: "Prepare your Barangay ID and necessary medical or age certificates." },
                                    { step: "04", title: "Tracking", desc: "Monitor your status here. We'll update you once approved." }
                                ].map((s) => (
                                    <div key={s.step} className="flex gap-4 group">
                                        <div className="text-lg font-black text-gray-200 group-hover:text-blue-600 transition-colors leading-none">
                                            {s.step}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 uppercase leading-none mb-1">{s.title}</h4>
                                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-[10px] text-blue-700 font-black uppercase italic mb-1">Need Assistance?</p>
                                <p className="text-[10px] text-blue-900 font-medium mb-3">Visit the help desk or contact our 24/7 hotline.</p>
                                <button className="w-full py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <BenefitDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                benefit={selectedBenefit}
            />
        </div>
    );
}