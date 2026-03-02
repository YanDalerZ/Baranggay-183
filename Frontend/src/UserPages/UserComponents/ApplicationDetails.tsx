import React, { useEffect } from 'react';
import { X, Loader2, User as UserIcon, Clock, CheckCircle, XCircle, FileText, ShieldCheck } from 'lucide-react';

interface ApplicationDetailsProps {
    isOpen: boolean;
    loading: boolean;
    data: any;
    onClose: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
    isOpen,
    loading,
    data,
    onClose
}) => {

    useEffect(() => {
        if (isOpen && !loading) {
            console.log("DEBUG: ApplicationDetails received data:", data);
        }
    }, [isOpen, loading, data]);

    if (!isOpen) return null;

    /**
     * FIXED handleViewFile:
     * To bypass Partitioned Blob URL issues, we create the blob and 
     * use a temporary anchor element to trigger the browser's 
     * native handling.
     */
    const handleViewFile = (base64: string, mimeType: string) => {
        try {
            // 1. Clean the base64 string
            const base64WithoutPrefix = base64.includes(',') ? base64.split(',')[1] : base64;

            // 2. Convert to binary
            const byteCharacters = atob(base64WithoutPrefix);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            // 3. Create the URL
            const fileURL = URL.createObjectURL(blob);

            // 4. Bypassing Partitioning: Use a hidden anchor
            // This method is more reliable for opening files from blobs in modern Chrome
            const link = document.createElement('a');
            link.href = fileURL;
            link.target = '_blank';
            // link.download = fileName; // Uncomment this if you want it to download instead of view

            document.body.appendChild(link);
            link.click();

            // 5. Cleanup
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(fileURL), 100);
        } catch (error) {
            console.error("Error generating file preview:", error);
            alert("Could not open the file. The data might be corrupted or the browser is blocking the request.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden border-4 border-black relative flex flex-col shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)]">

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 hover:rotate-90 transition-transform z-10 bg-black text-white p-1"
                >
                    <X size={24} />
                </button>

                {loading ? (
                    <div className="p-40 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
                        <p className="font-black uppercase text-sm tracking-[0.2em]">Synchronizing Data...</p>
                    </div>
                ) : data ? (
                    <div className="flex flex-col h-full overflow-y-auto">
                        <header className="p-8 border-b-4 border-black bg-gray-50">
                            <div className="flex items-center gap-3 mb-4">
                                <StatusBadge status={data.status} />
                                <span className="text-xs font-black text-gray-400 tracking-widest">CASE FILE: #{data.id}</span>
                            </div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
                                {data.application_type} REGISTRATION
                            </h2>
                            <p className="text-sm font-bold text-gray-500 mt-2">
                                Submitted {new Date(data.created_at).toLocaleString()}
                            </p>
                        </header>

                        <div className="p-8 space-y-12">
                            {/* Resident Profile */}
                            <section>
                                <div className="flex items-center gap-2 mb-6 text-blue-600">
                                    <UserIcon size={18} />
                                    <h4 className="font-black uppercase text-sm tracking-widest">Resident Information Profile</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 border-2 border-black">
                                    <DataField label="Full Legal Name" value={`${data.firstname || ''} ${data.middlename || ''} ${data.lastname || ''}`} />
                                    <DataField label="System ID" value={data.user_system_id} />
                                    <DataField label="Gender" value={data.gender} />
                                    <DataField label="Date of Birth" value={data.birthday ? new Date(data.birthday).toLocaleDateString() : 'N/A'} />
                                    <DataField label="Nationality" value={data.nationality} />
                                    <DataField label="Civil Status" value={data.civil_status} />
                                    <DataField label="Occupation" value={data.occupation} />
                                    <DataField label="Monthly Income" value={data.monthly_income} />
                                </div>
                            </section>

                            {/* Medical Info */}
                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h4 className="font-black uppercase text-sm tracking-widest text-blue-600">Residency & Status</h4>
                                    <div className="grid grid-cols-2 gap-4 border-l-4 border-black pl-4">
                                        <DataField label="Complete Address" value={data.address} />
                                        <DataField label="Blood Type" value={data.blood_type} />
                                        <DataField label="Employment" value={data.employment_status} />
                                        <DataField label="Voter Status" value={data.is_registered_voter === 1 ? 'Registered' : 'Not Registered'} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="font-black uppercase text-sm tracking-widest text-blue-600">Health Profile</h4>
                                    <div className="grid grid-cols-2 gap-4 border-l-4 border-black pl-4">
                                        <DataField label="Disability" value={data.disability_type} />
                                        <DataField label="Condition" value={data.medical_condition} />
                                        <DataField label="GSIS/SSS #" value={data.gsis_sss_number} />
                                        <DataField label="Living Alone?" value={data.is_living_alone === 1 ? 'YES' : 'NO'} />
                                    </div>
                                </div>
                            </section>

                            {/* Verification Documents */}
                            <section>
                                <div className="flex items-center gap-2 mb-6 text-blue-600">
                                    <ShieldCheck size={18} />
                                    <h4 className="font-black uppercase text-sm tracking-widest">Verification Documents</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {data.attachments && data.attachments.length > 0 ? (
                                        data.attachments.map((doc: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-4 border-2 border-black hover:bg-gray-50 transition-all bg-white group">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-black text-white p-2 group-hover:bg-blue-600 transition-colors">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{doc.file_type}</p>
                                                        <p className="text-sm font-black uppercase truncate max-w-[200px]">{doc.file_name}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleViewFile(doc.file_data, doc.mime_type)}
                                                    className="bg-black text-white px-5 py-2 text-[10px] font-black uppercase hover:bg-blue-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-10 border-2 border-dashed border-gray-300 text-center">
                                            <p className="text-xs font-bold text-gray-400 uppercase italic">No files attached</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <footer className="p-8 bg-gray-100 border-t-4 border-black mt-auto flex justify-end">
                            <button onClick={onClose} className="px-12 py-3 bg-black text-white font-black uppercase text-sm">
                                Close File
                            </button>
                        </footer>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        Pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={12} /> },
        Approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={12} /> },
        Denied: { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={12} /> },
        Rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={12} /> },
    };
    const current = config[status] || config.Pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-black uppercase rounded-full ${current.color}`}>
            {current.icon} {status}
        </span>
    );
};

const DataField = ({ label, value, invert = false }: { label: string, value?: any, invert?: boolean }) => (
    <div className="min-w-0">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${invert ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-sm font-black uppercase tracking-tight truncate ${invert ? 'text-white' : 'text-black'}`}>
            {value !== null && value !== undefined && String(value).trim() !== "" ? String(value) : 'N/A'}
        </p>
    </div>
);

export default ApplicationDetails;