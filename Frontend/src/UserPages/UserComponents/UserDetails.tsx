import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import {
    X,
    User as UserIcon,
    MapPin,
    Shield,
    Phone,
    Info,
    Briefcase,
    Heart,
    FileText,
    ExternalLink,
    Activity,
    Download
} from 'lucide-react';
import { type User, API_BASE_URL } from '../../interfaces';

interface ViewUserDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ViewUserDetails: React.FC<ViewUserDetailsProps> = ({ isOpen, onClose, user }) => {
    const [details, setDetails] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
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
        } else {
            setDetails(null); // Reset details when closed
        }
    }, [isOpen, user, fetchResidentById]);

    const displayData = details || user;

    // Updated to handle Base64 BLOB data
    const getFileSrc = (file: any) => {
        if (!file || !file.file_data) return "";
        // Support for legacy file paths if any still exist
        if (file.file_data.startsWith('http')) return file.file_data;
        // Construct Base64 Data URI
        return `data:${file.mime_type || 'image/png'};base64,${file.file_data}`;
    };

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

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (val: any) => {
        if (!val) return '—';
        const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? '—' : `₱${num.toLocaleString()}`;
    };

    const getDaysLeft = (dateString?: string) => {
        if (!dateString) return null;
        const diffDays = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysLeft = getDaysLeft(displayData.id_expiry_date);
    const profilePic = displayData.attachments?.find((a: any) => a.file_type === 'photo_2x2');

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-0 sm:p-6 transition-all">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-6xl h-full sm:h-[95vh] md:h-[90vh] shadow-2xl flex flex-col md:flex-row overflow-hidden sm:rounded-lg animate-in fade-in zoom-in-95 duration-200">

                {loading && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse z-110" />}

                {/* Left Sidebar */}
                <div className="w-full md:w-1/4 bg-zinc-50 border-b md:border-b-0 md:border-r border-zinc-200 p-6 flex flex-col shrink-0 overflow-y-auto">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="relative group">
                            <div className="h-32 w-32 md:h-40 md:w-40 bg-zinc-200 border-4 border-white shadow-md ring-1 ring-zinc-200 overflow-hidden rounded-sm">
                                {profilePic && profilePic.file_data ? (
                                    <img
                                        src={getFileSrc(profilePic)}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                        onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${displayData.firstname}+${displayData.lastname}&background=f1f5f9&color=0f172a`)}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-zinc-400">
                                        <UserIcon size={48} strokeWidth={1} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 text-center md:text-left w-full">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">System Identifier</p>
                            <code className="text-[12px] font-bold text-zinc-900 block bg-zinc-100 px-2 py-1 rounded">{displayData.system_id || 'NOT ASSIGNED'}</code>

                            <div className="mt-6 grid grid-cols-2 md:grid-cols-1 gap-4">
                                <StatusBadge
                                    label="Status"
                                    value={displayData.status || 'Active'}
                                    colorClass={displayData.status?.toLowerCase() === 'inactive' ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}
                                />
                                <StatusBadge
                                    label="Resident Type"
                                    value={displayData.type || 'N/A'}
                                    colorClass="bg-zinc-900 text-white"
                                />
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-200 space-y-4 hidden md:block">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Voter Status</p>
                                    <StatusChip active={!!displayData.is_registered_voter} label="Registered Voter" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Flood Exposure</p>
                                    <StatusChip active={!!displayData.is_flood_prone} label="Flood Prone Area" type="danger" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Header */}
                    <div className="flex justify-between items-start p-6 md:p-8 border-b border-zinc-100 bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 leading-tight uppercase">
                                {displayData.firstname} {displayData.middlename && `${displayData.middlename} `}
                                <span className="font-bold">{displayData.lastname}</span>
                                {displayData.suffix && ` ${displayData.suffix}`}
                            </h2>
                            <p className="text-zinc-500 text-xs md:sm mt-2 font-medium flex items-center gap-2">
                                <Info size={14} /> Created: {formatDate(displayData.created_at)}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 -mt-2 -mr-2 text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all rounded-full">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Data Grid */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-12 pt-6 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">

                            {/* Section: Personal Info */}
                            <section className="space-y-4">
                                <SectionHeader icon={<Heart size={16} />} title="Personal Details" />
                                <div className="space-y-3">
                                    <DetailRow label="Gender" value={displayData.gender} />
                                    <DetailRow label="Birth Date" value={formatDate(displayData.birthday)} />
                                    <DetailRow label="Age" value={`${calculateAge(displayData.birthday)} yrs`} />
                                    <DetailRow label="Civil Status" value={displayData.civil_status} />
                                    <DetailRow label="Nationality" value={displayData.nationality} />
                                    <DetailRow label="Blood Type" value={displayData.blood_type} />
                                    <DetailRow label="Disability" value={displayData.disability} isAlert={!!displayData.disability && displayData.disability.toLowerCase() !== 'none' && displayData.disability.toLowerCase() !== 'n/a'} />
                                </div>
                            </section>

                            {/* Section: Contact & Address */}
                            <section className="space-y-4">
                                <SectionHeader icon={<MapPin size={16} />} title="Contact & Address" />
                                <div className="space-y-3">
                                    <DetailRow label="Mobile" value={displayData.contact_number} />
                                    <DetailRow label="Email" value={displayData.email} />
                                    <div className="p-3 bg-zinc-50 border border-zinc-100 rounded">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Full Address</p>
                                        <p className="text-xs font-bold text-zinc-800 leading-relaxed uppercase">
                                            {displayData.house_no} {displayData.street}, {displayData.barangay}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <DetailRow label="Ownership" value={displayData.ownership_type} />
                                        <DetailRow label="Residency" value={`${displayData.years_of_residency || 0} Years`} />
                                    </div>
                                </div>
                            </section>

                            {/* Section: Socio-Economic */}
                            <section className="space-y-4">
                                <SectionHeader icon={<Briefcase size={16} />} title="Socio-Economic" />
                                <div className="space-y-3">
                                    <DetailRow label="Occupation" value={displayData.occupation} />
                                    <DetailRow label="Monthly Income" value={formatCurrency(displayData.monthly_income)} />
                                    <DetailRow label="Education" value={displayData.education} />
                                    <div className="mt-4">
                                        <SectionHeader icon={<Shield size={16} />} title="ID Validity" />
                                        <div className="mt-2 p-3 border border-zinc-100 rounded bg-zinc-50">
                                            <DetailRow label="Expires On" value={formatDate(displayData.id_expiry_date)} />
                                            <p className={`text-[10px] font-black mt-2 uppercase ${!daysLeft || daysLeft <= 0 ? 'text-red-600' : 'text-zinc-900'}`}>
                                                {daysLeft === null ? 'STATUS UNKNOWN' : daysLeft <= 0 ? 'EXPIRED' : `${daysLeft} Days Remaining`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Emergency Contact */}
                            <section className="space-y-4 sm:col-span-2">
                                <SectionHeader icon={<Phone size={16} />} title="Emergency Contact (ICE)" />
                                {displayData.emergencyContact ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-red-50 p-4 border border-red-100 rounded">
                                        <DetailRow label="Contact Person" value={displayData.emergencyContact.name} />
                                        <DetailRow label="Relationship" value={displayData.emergencyContact.relationship} />
                                        <DetailRow label="Phone Number" value={displayData.emergencyContact.contact} />
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-400 italic">No emergency contact information provided.</p>
                                )}
                            </section>

                            {/* Section: Attachments */}
                            <section className="space-y-4">
                                <SectionHeader icon={<FileText size={16} />} title="Documents" />
                                <div className="space-y-2">
                                    {displayData.attachments && displayData.attachments.length > 0 ? (
                                        displayData.attachments.map((file: any, idx: number) => (
                                            <FilePreview key={idx} file={file} getFileSrc={getFileSrc} />
                                        ))
                                    ) : (
                                        <p className="text-xs text-zinc-400 italic">No uploaded documents.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 md:p-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0">
                        <div className="flex md:hidden gap-2 mb-2 sm:mb-0">
                            <StatusChip active={!!displayData.is_registered_voter} label="Voter" />
                            <StatusChip active={!!displayData.is_flood_prone} label="Flood Prone" type="danger" />
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-10 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
                        >
                            Close Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- Sub-Components --- */

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex items-center gap-2 pb-2 border-b-2 border-zinc-900">
        <span className="text-zinc-900">{icon}</span>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">{title}</h3>
    </div>
);

const DetailRow = ({ label, value, isAlert = false }: { label: string, value: any, isAlert?: boolean }) => (
    <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">{label}</p>
        <p className={`text-[13px] font-semibold ${isAlert ? 'text-red-600' : 'text-zinc-800'} wrap-break-word uppercase`}>
            {value || '—'}
        </p>
    </div>
);

const StatusBadge = ({ label, value, colorClass }: { label: string, value: string, colorClass: string }) => (
    <div className="w-full">
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">{label}</p>
        <span className={`px-2.5 py-1 block text-center md:inline-block text-[10px] font-black uppercase tracking-tight rounded-sm ${colorClass}`}>
            {value}
        </span>
    </div>
);

const StatusChip = ({ active, label, type = 'primary' }: { active: boolean; label: string; type?: 'primary' | 'danger' }) => (
    <div className={`px-2 py-1.5 border flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter transition-colors ${active
        ? (type === 'danger' ? 'border-red-600 bg-red-50 text-red-600' : 'border-zinc-900 bg-zinc-900 text-white')
        : 'border-zinc-100 bg-white text-zinc-300'
        }`}>
        {active ? <Activity size={10} /> : <div className="w-2.5 h-2.5" />}
        {label}
    </div>
);

const FilePreview = ({ file, getFileSrc }: { file: any; getFileSrc: Function }) => {
    const src = getFileSrc(file);
    const isPdf = file.mime_type === 'application/pdf';

    return (
        <a
            href={src}
            target="_blank"
            rel="noreferrer"
            download={isPdf ? file.file_name : undefined}
            className="flex items-center p-3 border border-zinc-100 hover:bg-zinc-50 hover:border-zinc-300 transition-all group rounded-sm"
        >
            {isPdf ? (
                <Download size={16} className="text-blue-600 mr-3 shrink-0" />
            ) : (
                <FileText size={16} className="text-zinc-400 mr-3 shrink-0" />
            )}
            <p className="text-[10px] font-bold text-zinc-600 uppercase truncate flex-1">
                {file.file_type ? file.file_type.replace(/_/g, ' ') : 'Document'}
            </p>
            <ExternalLink size={14} className="text-zinc-300 group-hover:text-black shrink-0" />
        </a>
    );
};

export default ViewUserDetails;