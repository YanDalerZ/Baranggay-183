import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { X, AlertTriangle, User as UserIcon, MapPin, Shield, Phone, Mail } from 'lucide-react';
import { type User, API_BASE_URL } from '../../interfaces';

interface ViewUserDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ViewUserDetails: React.FC<ViewUserDetailsProps> = ({ isOpen, onClose, user }) => {
    const [details, setDetails] = useState<User | null>(null);
    const [, setLoading] = useState<boolean>(false);
    const { token } = useAuth();

    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    const fetchResidentById = useCallback(async () => {
        if (!user?.system_id || !token) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/user/${user.system_id}`, config);
            setDetails(response.data);
        } catch (err) {
            console.error('Error fetching resident details:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.system_id, token, config]);

    useEffect(() => {
        if (isOpen && user) {
            fetchResidentById();
        }
    }, [isOpen, user, fetchResidentById]);

    const displayData = details || user;

    if (!isOpen || !displayData) return null;

    // Helper Functions
    const calculateAge = (birthday: string) => {
        if (!birthday) return 'N/A';
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const formatDate = (dateString?: string) => dateString ? dateString.split('T')[0] : '—';

    const getDaysLeft = (dateString?: string) => {
        if (!dateString) return null;
        const diffDays = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysLeft = getDaysLeft(displayData.id_expiry_date);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-[2px] p-0 sm:p-4 transition-all">
            {/* Modal Container: Adjusted for full-screen on mobile, fixed height on desktop */}
            <div className="bg-white w-full max-w-2xl h-full sm:h-[90vh] sm:max-h-[95vh] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden sm:border border-zinc-200">

                {/* Left Sidebar: Stacks on top on mobile (md:w-1/3) */}
                <div className="w-full md:w-1/3 bg-zinc-50 border-b md:border-b-0 md:border-r border-zinc-200 p-6 md:p-8 flex flex-col justify-between shrink-0">
                    <div>
                        <div className="w-12 h-1 bg-black mb-3 hidden md:block" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Resident File</p>
                        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 leading-tight mb-2">
                            {displayData.firstname}<br />
                            <span className="font-bold">{displayData.lastname}</span>
                        </h2>
                        <code className="text-[11px] bg-zinc-200 px-2 py-1 text-zinc-600 rounded">
                            ID: {displayData.system_id}
                        </code>
                    </div>

                    <div className="mt-8 md:mt-12 space-y-6 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4">
                        <StatusBadge
                            label="Verification Type"
                            value={displayData.type}
                            colorClass="bg-zinc-900 text-white"
                        />
                        <div className="md:pt-4 md:border-t border-zinc-200 w-full md:w-auto">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 hidden md:block">Risk Profile</p>
                            {displayData.is_flood_prone ? (
                                <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] md:text-xs">
                                    <AlertTriangle size={14} /> HIGH FLOOD RISK
                                </div>
                            ) : (
                                <div className="text-emerald-600 font-bold text-[10px] md:text-xs uppercase">Low Risk Environment</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                    {/* Header: Close button position */}
                    <div className="flex justify-end p-4 sticky top-0 bg-white z-10 md:static">
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all rounded-full"
                        >
                            <X size={24} strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Scrollable Content: 1 col on mobile, 2 col on md */}
                    <div className="flex-1 overflow-y-auto px-3 md:px-12 pb-12 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">

                            {/* Section: Personal */}
                            <section className="space-y-2">
                                <SectionHeader icon={<UserIcon size={16} />} title="Identity" />
                                <div className="space-y-3">
                                    <DetailRow label="Birth Date" value={formatDate(displayData.birthday)} />
                                    <DetailRow label="Age" value={`${calculateAge(displayData.birthday)} years`} />
                                    <DetailRow label="Gender" value={displayData.gender} />
                                    <DetailRow label="Disability Status" value={displayData.disability || 'None Reported'} />
                                </div>
                            </section>

                            {/* Section: Contact */}
                            <section className="space-y-2">
                                <SectionHeader icon={<MapPin size={16} />} title="Location & Reach" />
                                <div className="space-y-4">
                                    <DetailRow label="Address" value={displayData.address} isAddress />
                                    <DetailRow label="Mobile" value={displayData.contact_number} />
                                    <DetailRow label="Email" value={displayData.email} />
                                </div>
                            </section>

                            {/* Section: Identification Expiry */}
                            <section className="space-y-2">
                                <SectionHeader icon={<Shield size={16} />} title="Documents" />
                                <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-sm">
                                    <DetailRow label="Valid Until" value={formatDate(displayData.id_expiry_date)} />
                                    <div className="mt-2">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Status</p>
                                        <p className={`text-xs font-bold ${!daysLeft || daysLeft <= 0 ? 'text-red-600' :
                                            daysLeft <= 60 ? 'text-orange-500' : 'text-zinc-900'
                                            }`}>
                                            {daysLeft === null ? 'UNKNOWN' : daysLeft <= 0 ? 'EXPIRED' : `${daysLeft} DAYS REMAINING`}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Emergency */}
                            <section className="space-y-2">
                                <SectionHeader icon={<Phone size={16} />} title="Emergency" />
                                {displayData.emergencyContact ? (
                                    <div className="space-y-3">
                                        <DetailRow label="Contact Person" value={displayData.emergencyContact.name} />
                                        <DetailRow label="Relation" value={displayData.emergencyContact.relationship} />
                                        <DetailRow label="Direct Line" value={displayData.emergencyContact.contact} />
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-400 italic font-light">No emergency contact on file.</p>
                                )}
                            </section>

                        </div>
                    </div>

                    {/* Footer: Sticky on mobile */}
                    <div className="p-6 border-t border-zinc-100 bg-white flex justify-end gap-3 sticky bottom-0">
                        <button
                            onClick={onClose}
                            className="w-full md:w-auto px-8 py-3 bg-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-[0.98]"
                        >
                            Close Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- Sub-Components --- */

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
        <span className="text-zinc-400">{icon}</span>
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900">{title}</h3>
    </div>
);

const DetailRow = ({ label, value, isAddress = false }: { label: string, value: string, isAddress?: boolean }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">{label}</p>
        <p className={`text-sm text-zinc-800 ${isAddress ? 'leading-relaxed' : 'font-medium'}`}>
            {value || '—'}
        </p>
    </div>
);

const StatusBadge = ({ label, value, colorClass }: { label: string, value: string, colorClass: string }) => (
    <div className="w-full md:w-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 hidden md:block">{label}</p>
        <span className={`px-3 py-1 inline-block text-[10px] font-black uppercase tracking-tighter ${colorClass}`}>
            {value}
        </span>
    </div>
);

export default ViewUserDetails;