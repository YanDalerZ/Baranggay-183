import { useState, useEffect, useCallback } from 'react';
import {
    Eye, X, CheckCircle, AlertCircle, Ban, Loader2, Search, FileText, User as UserIcon, Phone, Heart
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../interfaces';

// --- Types ---
type Status = 'Pending' | 'Approved' | 'Denied' | 'Incomplete';
// Changed to match backend strings
type AppType = 'PWD' | 'SC';

interface Application {
    id: number;
    user_system_id: string;
    name: string;
    status: Status;
    submittedDate: string;
    reviewedDate?: string;
    application_type: string; // From backend
    // These will be populated by the single fetch
    details?: any;
    attachments?: { file_type: string; file_name: string; file_data: string; mime_type: string }[];
    [key: string]: any;
}

export default function AdminApplicationsManagement() {
    const { token } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<AppType>('PWD');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/applications/admin/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const mappedData = response.data.map((app: any) => ({
                ...app,
                // Align the tab logic with the raw backend field
                submittedDate: new Date(app.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                })
            }));

            setApplications(mappedData);
        } catch (err) {
            console.error("Failed to fetch applications", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleReviewClick = async (app: Application) => {
        setSelectedApp(app);
        setDetailsLoading(true);
        try {
            // Use your specific single application endpoint to get BLOBs and full details
            const response = await axios.get(`${API_BASE_URL}/api/applications/${app.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedApp(response.data);
        } catch (err) {
            console.error("Error fetching full details:", err);
            alert("Could not load full application details.");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: Status, notes: string) => {
        try {
            await axios.put(`${API_BASE_URL}/api/applications/admin/update/${id}`,
                { status: newStatus, admin_notes: notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setApplications(prev => prev.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));

            setSelectedApp(null);
            alert(`Application ${newStatus} successfully.`);
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const filteredApps = applications.filter(app =>
        app.application_type === selectedTab &&
        (app.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const stats = {
        pending: applications.filter(a => a.status === 'Pending').length,
        incomplete: applications.filter(a => a.status === 'Incomplete').length,
        approved: applications.filter(a => a.status === 'Approved').length,
        denied: applications.filter(a => a.status === 'Denied').length,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                <p className="font-black uppercase text-xs tracking-widest">Loading Applications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        Applications Management
                    </h2>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search name..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 outline-none text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <main>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <StatCard label="Pending" value={stats.pending.toString()} />
                    <StatCard label="Incomplete" value={stats.incomplete.toString()} />
                    <StatCard label="Approved" value={stats.approved.toString()} color="text-green-600" />
                    <StatCard label="Denied" value={stats.denied.toString()} color="text-red-600" />
                </div>

                <div className="flex bg-gray-200 p-1 mb-6">
                    <TabButton active={selectedTab === 'PWD'} label={`PWD (${applications.filter(a => a.application_type === 'PWD').length})`} onClick={() => setSelectedTab('PWD')} />
                    <TabButton active={selectedTab === 'SC'} label={`SC (${applications.filter(a => a.application_type === 'SC').length})`} onClick={() => setSelectedTab('SC')} />
                </div>

                <div className="space-y-4">
                    {filteredApps.length > 0 ? filteredApps.map(app => (
                        <div key={app.id} className="bg-white p-6 border border-gray-100 flex justify-between items-center hover:border-blue-300 transition-colors">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg">{app.name || `User ${app.user_system_id}`}</h3>
                                    <StatusBadge status={app.status} />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Submitted: {app.submittedDate}</p>
                            </div>
                            <button
                                onClick={() => handleReviewClick(app)}
                                className="flex items-center gap-2 border-2 border-black px-4 py-1.5 font-black uppercase hover:bg-black hover:text-white transition text-xs"
                            >
                                <Eye size={16} /> Review
                            </button>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-gray-50 border-2 border-dashed">
                            <p className="font-bold text-gray-400 uppercase text-sm">No applications found</p>
                        </div>
                    )}
                </div>
            </main>

            {selectedApp && (
                <ReviewModal
                    app={selectedApp}
                    isLoading={detailsLoading}
                    onClose={() => setSelectedApp(null)}
                    onAction={handleUpdateStatus}
                />
            )}
        </div>
    );
}

// --- Sub-components ---

function ReviewModal({ app, isLoading, onClose, onAction }: { app: Application, isLoading: boolean, onClose: () => void, onAction: (id: number, status: Status, notes: string) => void }) {
    const [notes, setNotes] = useState(app.admin_notes || "");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async (status: Status) => {
        setIsProcessing(true);
        await onAction(app.id, status, notes);
        setIsProcessing(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-black z-10 p-2"><X size={24} /></button>

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                        <p className="font-black uppercase tracking-tighter">Fetching Full Documentation...</p>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={app.status} />
                            <span className="text-[10px] font-black uppercase text-gray-400">ID: #{app.id}</span>
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">
                            {app.firstname} {app.lastname}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Personal & Medical Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <section>
                                    <h3 className="font-black text-xs uppercase tracking-widest border-b-2 border-black pb-1 mb-4 flex items-center gap-2">
                                        <UserIcon size={14} /> Personal Information
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <DetailRow label="Gender" value={app.gender} />
                                        <DetailRow label="Birthday" value={new Date(app.birthday).toLocaleDateString()} />
                                        <DetailRow label="Civil Status" value={app.civil_status} />
                                        <DetailRow label="Contact" value={app.contact_number} />
                                        <DetailRow label="Occupation" value={app.occupation} />
                                        <DetailRow label="Monthly Income" value={app.monthly_income} />
                                        <DetailRow label="Address" value={app.address} />
                                    </div>
                                </section>

                                <section>
                                    <h3 className="font-black text-xs uppercase tracking-widest border-b-2 border-black pb-1 mb-4 flex items-center gap-2">
                                        <Heart size={14} /> Medical Profile
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <DetailRow label="Disability Type" value={app.disability_type} />
                                        <DetailRow label="Medical Condition" value={app.medical_condition} />
                                        <DetailRow label="Blood Type" value={app.blood_type} />
                                        <DetailRow label="GSIS/SSS #" value={app.gsis_sss_number} />
                                        <DetailRow label="Maintenance Meds" value={app.maintenance_meds} />
                                        <DetailRow label="Health Provider" value={app.healthcare_provider} />
                                    </div>
                                </section>

                                <section>
                                    <h3 className="font-black text-xs uppercase tracking-widest border-b-2 border-black pb-1 mb-4 flex items-center gap-2">
                                        <Phone size={14} /> Emergency Contact
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <DetailRow label="Contact Name" value={app.emergency_name} />
                                        <DetailRow label="Relationship" value={app.emergency_relationship} />
                                        <DetailRow label="Phone" value={app.emergency_contact} />
                                    </div>
                                </section>
                            </div>

                            {/* Documents & Assessment */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="font-black text-xs uppercase tracking-widest border-b-2 border-black pb-1 mb-4">Files & Evidence</h3>
                                    <div className="space-y-3">
                                        {app.attachments?.map((doc, idx) => (
                                            <a
                                                key={idx}
                                                href={`data:${doc.mime_type};base64,${doc.file_data}`}
                                                download={doc.file_name}
                                                className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-100 hover:border-black transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-blue-600" />
                                                    <span className="text-xs font-black uppercase">{doc.file_type}</span>
                                                </div>
                                                <Eye size={16} className="text-gray-400 group-hover:text-black" />
                                            </a>
                                        ))}
                                        {!app.attachments?.length && <p className="text-xs italic text-gray-400">No attachments found.</p>}
                                    </div>
                                </section>

                                <section className="pt-4">
                                    <h3 className="font-black text-xs uppercase tracking-widest border-b-2 border-black pb-1 mb-4">Admin Assessment</h3>
                                    <textarea
                                        className="w-full border-2 border-gray-200 p-3 text-sm h-32 outline-none focus:border-blue-600 font-medium"
                                        placeholder="Add internal notes or reason for denial..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                    <div className="flex flex-col gap-2 mt-4">
                                        <button onClick={() => handleConfirm('Approved')} disabled={isProcessing} className="w-full bg-green-600 text-white py-3 text-xs font-black uppercase flex items-center justify-center gap-2">
                                            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} Approve Application
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => handleConfirm('Incomplete')} disabled={isProcessing} className="bg-amber-500 text-white py-3 text-xs font-black uppercase flex items-center justify-center gap-2">
                                                <AlertCircle size={16} /> Incomplete
                                            </button>
                                            <button onClick={() => handleConfirm('Denied')} disabled={isProcessing} className="bg-rose-600 text-white py-3 text-xs font-black uppercase flex items-center justify-center gap-2">
                                                <Ban size={16} /> Deny
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="space-y-0.5">
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
            <p className="text-sm text-gray-900 font-bold leading-tight">{value || 'N/A'}</p>
        </div>
    );
}

function StatCard({ label, value, color = "text-black" }: { label: string, value: string, color?: string }) {
    return (
        <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-[10px] mb-1 uppercase font-black tracking-widest">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
        </div>
    );
}

function TabButton({ active, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 text-xs transition-all ${active ? 'bg-white shadow-sm font-black border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-300 uppercase font-bold'}`}
        >
            {label}
        </button>
    );
}

function StatusBadge({ status }: { status: Status }) {
    const styles: Record<Status, string> = {
        Pending: 'bg-amber-100 text-amber-700 border-amber-200',
        Approved: 'bg-green-100 text-green-700 border-green-200',
        Denied: 'bg-red-100 text-red-700 border-red-200',
        Incomplete: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
        <span className={`px-2 py-0.5 border text-[10px] font-black uppercase ${styles[status]}`}>
            {status}
        </span>
    );
}