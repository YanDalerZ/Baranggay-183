import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { X, User as UserIcon, MapPin, ShieldCheck, ExternalLink, Heart, Fingerprint, GraduationCap, AlertCircle, FileText } from 'lucide-react';
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
        const baseUrl = API_BASE_URL.endsWith('/')
            ? API_BASE_URL.slice(0, -1)
            : API_BASE_URL;

        const normalizedPath = cleanPath.startsWith('/')
            ? cleanPath
            : `/${cleanPath}`;

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
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Get specific images
    const profilePic = displayData.attachments?.find((a: any) => a.file_type === 'photo_2x2');

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">Loading...</div>}
            <div className="bg-white shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

                {/* TOP HEADER */}
                <div className="bg-gray-900 p-8 flex justify-between items-center text-white relative">
                    <div className="flex items-center gap-8">
                        <div className="h-28 w-28 border-4 rounded-full border-gray-700 bg-gray-800 overflow-hidden shadow-2xl">
                            {profilePic ? (
                                <img src={getSafeUrl(profilePic.file_path)} alt="Profile" className="h-full rounded-full w-full object-cover"
                                    onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${displayData.firstname}+${displayData.lastname}&background=random`)} />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500"><UserIcon size={48} /></div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight uppercase">
                                    {displayData.firstname} {displayData.middlename || ''} {displayData.lastname} {displayData.suffix || ''}
                                </h1>
                                <Badge color={displayData.status === 'active' ? 'green' : 'red'} label={displayData.status} />
                            </div>
                            <p className="text-gray-400 font-mono tracking-widest mt-1">ID: {displayData.system_id} | {displayData.type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-white/10 p-3 hover:bg-white/20 transition-all text-white rounded-full"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="space-y-6">
                            <SectionCard icon={<Fingerprint className="text-indigo-500" />} title="Primary Identity">
                                <div className="grid grid-cols-1 gap-4">
                                    <DataRow label="Email Address" value={displayData.email} />
                                    <DataRow label="Contact Number" value={displayData.contact_number} />
                                    <DataRow label="Gender" value={displayData.gender} />
                                    <DataRow label="Civil Status" value={displayData.civil_status} />
                                    <Badge label={displayData.nationality || "Filipino"} color="green" />
                                    <DataRow label="TCIC ID" value={displayData.tcic_id} />
                                </div>
                            </SectionCard>

                            <SectionCard icon={<Heart className="text-red-500" />} title="Health & Physical">
                                <div className="grid grid-cols-2 gap-4">
                                    <DataRow label="Blood Type" value={displayData.blood_type} />
                                    <DataRow label="Birthday" value={formatDate(displayData.birthday)} />
                                    <DataRow label="Age" value={`${calculateAge(displayData.birthday)} Years Old`} />
                                    <DataRow label="Birthplace" value={displayData.birthplace} />
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <DataRow label="Disability Status" value={displayData.disability || 'None Reported'} isAlert={!!displayData.disability && displayData.disability !== 'N/A'} />
                                </div>
                            </SectionCard>
                        </div>

                        {/* CENTER COLUMN: LOCATION & SOCIO-ECONOMIC */}
                        <div className="space-y-6">
                            <SectionCard icon={<MapPin className="text-orange-500" />} title="Residence Mapping">
                                <div className="space-y-4">
                                    <div className="bg-white p-4 border border-gray-100 shadow-sm">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Registered Address</p>
                                        <p className="font-bold text-gray-800">{displayData.house_no} {displayData.street}, {displayData.barangay}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataRow label="Ownership" value={displayData.ownership_type} />
                                        <DataRow label="Household No." value={displayData.household_number} />
                                        <DataRow label="Years Stayed" value={displayData.years_of_residency} />
                                        <DataRow label="Residence Status" value={displayData.residence_status} />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={<GraduationCap className="text-blue-500" />} title="Economic Profile">
                                <div className="grid grid-cols-1 gap-4">
                                    <DataRow label="Occupation" value={displayData.occupation} />
                                    <DataRow label="Monthly Income" value={displayData.monthly_income ? `₱${(displayData.monthly_income).toLocaleString()}` : 'N/A'} />
                                    <DataRow label="Education" value={displayData.education} />
                                    <DataRow label="Institution" value={displayData.school} />
                                </div>
                            </SectionCard>
                        </div>

                        {/* RIGHT COLUMN: ATTACHMENTS & EMERGENCY */}
                        <div className="space-y-6">
                            <SectionCard icon={<ShieldCheck className="text-emerald-500" />} title="System Flags & Documents">
                                <div className="flex gap-2 mb-6">
                                    <StatusChip active={!!displayData.is_registered_voter} label="Voter" />
                                    <StatusChip active={!!displayData.is_flood_prone} label="Flood Prone" type="danger" />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Uploaded Files</p>
                                    {displayData.attachments && displayData.attachments.length > 0 ? (
                                        displayData.attachments.map((file: any, idx: number) => (
                                            <FilePreview key={idx} file={file} getSafeUrl={getSafeUrl} />
                                        ))
                                    ) : (
                                        <div className="text-center py-6 border-2 border-dashed border-gray-200 text-gray-400 text-xs">No attachments found</div>
                                    )}
                                </div>
                            </SectionCard>

                            {displayData.emergencyContact && (
                                <div className="bg-red-600 p-6 text-white shadow-xl shadow-red-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle size={20} />
                                        <p className="text-xs font-black uppercase tracking-widest">In Case of Emergency</p>
                                    </div>
                                    <h3 className="text-xl font-black uppercase">{displayData.emergencyContact.name}</h3>
                                    <p className="text-red-100 text-sm font-medium mt-1">{displayData.emergencyContact.relationship}</p>
                                    <div className="mt-4 bg-white/20 p-3 font-mono text-center text-lg font-bold">
                                        {displayData.emergencyContact.contact}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// UI COMPONENTS (No changes needed to these helpers)
const SectionCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-50 ">{icon}</div>
            <h3 className="font-black text-gray-500 text-[11px] uppercase tracking-[2px]">{title}</h3>
        </div>
        {children}
    </div>
);

const DataRow = ({ label, value, isAlert = false }: { label: string; value: any; isAlert?: boolean }) => (
    <div className={`${isAlert ? 'bg-red-50 p-2 border border-red-100' : ''}`}>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
        <p className={`text-sm font-black ${isAlert ? 'text-red-700' : 'text-gray-800'} truncate`}>{value || '---'}</p>
    </div>
);

const Badge = ({ color, label }: { color: 'green' | 'red'; label: string }) => (
    <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest ${color === 'green' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {label}
    </span>
);

const StatusChip = ({ active, label, type = 'primary' }: { active: boolean; label: string; type?: 'primary' | 'danger' }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 border-2 transition-all ${active
        ? (type === 'danger' ? 'border-red-500 bg-red-50 text-red-600' : 'border-blue-500 bg-blue-50 text-blue-600')
        : 'border-gray-100 bg-white text-gray-300'
        }`}>
        <ShieldCheck size={14} className={active ? 'opacity-100' : 'opacity-30'} />
        <span className="text-[10px] font-black uppercase">{label}</span>
    </div>
);

const FilePreview = ({ file, getSafeUrl }: { file: any; getSafeUrl: Function }) => {
    const isImage = /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file.file_path);
    const url = getSafeUrl(file.file_path);

    return (
        <div className="group relative border border-gray-100 overflow-hidden bg-white shadow-sm hover:border-blue-300 transition-all">
            <div className="flex items-center p-3 gap-4">
                <div className="h-12 w-12 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {isImage ? (
                        <img src={url} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                        <FileText className="text-blue-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase truncate">{file.file_type.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-gray-400 truncate font-mono">{file.file_path.split(/[\\/]/).pop()}</p>
                </div>
                <a href={url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                    <ExternalLink size={18} />
                </a>
            </div>
        </div>
    );
};

export default ViewUserDetails;