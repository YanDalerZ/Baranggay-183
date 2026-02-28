import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { X, User as UserIcon, MapPin, ShieldCheck, ExternalLink, Heart, Fingerprint, GraduationCap, AlertCircle, FileText, Activity } from 'lucide-react';
import { type User, API_BASE_URL } from '../../interfaces';

interface ViewUserDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ViewUserDetails: React.FC<ViewUserDetailsProps> = ({ isOpen, onClose, user }) => {
    const [details, setDetails] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { token } = useAuth();

    const fetchResidentById = useCallback(async () => {
        if (!user?.system_id || !token) return;
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/user/${user.system_id}`, config);
            setDetails(response.data);
        } catch (err) {
            console.error('Error fetching resident details:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.system_id, token]);

    useEffect(() => {
        if (isOpen && user) fetchResidentById();
    }, [isOpen, user, fetchResidentById]);

    const displayData = details || user;

    const getSafeUrl = (filePath: string | undefined) => {
        if (!filePath) return "";
        const cleanPath = filePath.replace(/\\/g, '/');
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `${baseUrl}${normalizedPath}`;
    };

    if (!isOpen || !displayData) return null;

    const calculateAge = (birthday: string) => {
        if (!birthday) return 'N/A';
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatCurrency = (val: any) => {
        if (!val) return 'N/A';
        const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 'N/A' : `₱${num.toLocaleString()}`;
    };

    const profilePic = displayData.attachments?.find((a: any) => a.file_type === 'photo_2x2');

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 h-[100vh] backdrop-blur-sm p-4 transition-all duration-300 lg:pl-[280px]`}>
            <div className="bg-white border border-slate-200 w-full max-w-5xl max-h-[100vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

                {loading && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse z-[60]" />}

                <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
                            {profilePic ? (
                                <img src={getSafeUrl(profilePic.file_path)} alt="Profile" className="h-full w-full object-cover"
                                    onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${displayData.firstname}+${displayData.lastname}&background=f1f5f9&color=0f172a`)} />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400"><UserIcon size={24} /></div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none uppercase">
                                    {displayData.firstname} {displayData.lastname}
                                </h1>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 uppercase border ${displayData.status === 'active' ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'}`}>
                                    {displayData.status}
                                </span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                                {displayData.system_id} <span className="mx-2 text-slate-300">|</span> {displayData.type}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"><X size={20} /></button>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto bg-white p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* COLUMN 1: VITAL INFO */}
                        <div className="space-y-6">
                            <SectionHeader icon={<Fingerprint size={14} />} title="Identity" />
                            <div className="space-y-4">
                                <DataRow label="Email Address" value={displayData.email} />
                                <DataRow label="Contact No." value={displayData.contact_number} />
                                <div className="grid grid-cols-2 gap-2">
                                    <DataRow label="Gender" value={displayData.gender} />
                                    <DataRow label="Civil Status" value={displayData.civil_status} />
                                </div>
                                <DataRow label="Nationality" value={displayData.nationality || "Filipino"} />
                            </div>
                        </div>

                        {/* COLUMN 2: HEALTH & BIO */}
                        <div className="space-y-6">
                            <SectionHeader icon={<Heart size={14} />} title="Biological" />
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <DataRow label="Blood" value={displayData.blood_type} />
                                    <DataRow label="Age" value={`${calculateAge(displayData.birthday)} Y/O`} />
                                </div>
                                <DataRow label="Birthday" value={formatDate(displayData.birthday)} />
                                <DataRow label="Birthplace" value={displayData.birthplace} />
                                <DataRow label="Disability" value={displayData.disability || 'None'} isAlert={!!displayData.disability && displayData.disability !== 'N/A'} />
                            </div>
                        </div>

                        {/* COLUMN 3: RESIDENCY & ECON */}
                        <div className="space-y-6">
                            <SectionHeader icon={<MapPin size={14} />} title="Logistics" />
                            <div className="space-y-4">
                                <div className="p-2 bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Registered Address</p>
                                    <p className="font-bold text-[11px] text-slate-800 leading-tight uppercase">{displayData.house_no} {displayData.street}, {displayData.barangay}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <DataRow label="Ownership" value={displayData.ownership_type} />
                                    <DataRow label="Residency" value={`${displayData.years_of_residency}Y`} />
                                </div>
                                <DataRow label="Income" value={formatCurrency(displayData.monthly_income)} />
                                <DataRow label="Education" value={displayData.education} />
                            </div>
                        </div>

                        {/* COLUMN 4: SYSTEM & EMERGENCY */}
                        <div className="space-y-6">
                            <SectionHeader icon={<ShieldCheck size={14} />} title="Compliance" />
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <StatusChip active={!!displayData.is_registered_voter} label="Voter" />
                                    <StatusChip active={!!displayData.is_flood_prone} label="Flood Zone" type="danger" />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Files</p>
                                    {displayData.attachments?.slice(0, 3).map((file: any, idx: number) => (
                                        <FilePreview key={idx} file={file} getSafeUrl={getSafeUrl} />
                                    ))}
                                </div>

                                {displayData.emergencyContact && (
                                    <div className="mt-4 p-3 bg-red-600 text-white">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity size={12} />
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-red-100">ICE Contact</p>
                                        </div>
                                        <p className="text-[11px] font-bold uppercase truncate">{displayData.emergencyContact.name}</p>
                                        <p className="text-[14px] font-mono font-bold mt-1">{displayData.emergencyContact.contact}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* COMPACT FOOTER */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                        Close Record
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPACT UI COMPONENTS ---

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 border-b border-slate-900 pb-1">
        <div className="text-slate-900">{icon}</div>
        <h3 className="font-bold text-slate-900 text-[10px] uppercase tracking-[0.2em]">{title}</h3>
    </div>
);

const DataRow = ({ label, value, isAlert = false }: { label: string; value: any; isAlert?: boolean }) => (
    <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">{label}</p>
        <p className={`text-[12px] font-bold tracking-tight ${isAlert ? 'text-red-600' : 'text-slate-900'} truncate`}>
            {value || '—'}
        </p>
    </div>
);

const StatusChip = ({ active, label, type = 'primary' }: { active: boolean; label: string; type?: 'primary' | 'danger' }) => (
    <div className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-tighter ${active
        ? (type === 'danger' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-900 bg-slate-900 text-white')
        : 'border-slate-100 bg-white text-slate-300'
        }`}>
        {label}
    </div>
);

const FilePreview = ({ file, getSafeUrl }: { file: any; getSafeUrl: Function }) => {
    const url = getSafeUrl(file.file_path);
    return (
        <a href={url} target="_blank" rel="noreferrer" className="flex items-center p-1.5 border border-slate-100 hover:bg-slate-50 transition-colors group">
            <FileText size={12} className="text-slate-400 mr-2" />
            <p className="text-[9px] font-bold text-slate-600 uppercase truncate flex-1">{file.file_type.replace(/_/g, ' ')}</p>
            <ExternalLink size={10} className="text-slate-300 group-hover:text-slate-900" />
        </a>
    );
};

export default ViewUserDetails;