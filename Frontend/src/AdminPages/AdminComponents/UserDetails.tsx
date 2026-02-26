import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { X, AlertTriangle } from 'lucide-react';
import { type User, API_BASE_URL } from '../../interfaces';

interface ViewUserDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ViewUserDetails: React.FC<ViewUserDetailsProps> = ({ isOpen, onClose, user }) => {
    const [details, setDetails] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const token = useAuth().token;
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const fetchResidentById = useCallback(async () => {
        if (!user?.system_id) return;

        try {
            if (!token) return;
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/user/${user.system_id}`, config);
            setDetails(response.data);
        } catch (err) {
            console.error('Error fetching resident details:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.system_id]);

    useEffect(() => {
        if (isOpen && user) {
            fetchResidentById();
        }
    }, [isOpen, user, fetchResidentById]);

    const displayData = details || user;

    if (!isOpen || !displayData) return null;

    const calculateAge = (birthday: string) => {
        if (!birthday) return 'N/A';
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return dateString.split('T')[0];
    };

    const getDaysLeft = (dateString: string | undefined) => {
        if (!dateString) return null;
        const now = new Date();
        const exp = new Date(dateString);
        const diffTime = exp.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysLeft = getDaysLeft(displayData.id_expiry_date);

    return (
        <div className="fixed inset-0 z-50 flex h-[100vh] items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[95vh] max-w-xl overflow-hidden relative animate-in fade-in zoom-in duration-200">

                <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Resident Profile</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {loading ? 'Refreshing data...' : `Detailed information for ${displayData.system_id}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className={`p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh] ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    {/* Column 1: Personal Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            Personal Information
                        </h3>
                        <div className="space-y-3">
                            <DetailItem label="Name" value={`${displayData.firstname} ${displayData.lastname}`} />
                            <DetailItem label="System ID" value={displayData.system_id!} />
                            <DetailItem label="Birthday" value={formatDate(displayData.birthday)} />
                            <DetailItem label="Age" value={`${calculateAge(displayData.birthday)} years old`} />
                            <DetailItem label="Gender" value={displayData.gender} />
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Type</p>
                                <span className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                    {displayData.type}
                                </span>
                            </div>
                            <DetailItem label="Disability" value={displayData.disability || 'N/A'} />
                        </div>
                    </div>

                    {/* Column 2: Contact, Risk & ID Status */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Contact & Location</h3>
                            <div className="space-y-3">
                                <DetailItem label="Address" value={displayData.address} />
                                <DetailItem label="Contact" value={displayData.contact_number} />
                                <DetailItem label="Email" value={displayData.email} />
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Flood Risk</p>
                                    {displayData.is_flood_prone ? (
                                        <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                            <AlertTriangle size={12} /> High Risk
                                        </span>
                                    ) : (
                                        <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            Low Risk
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- ID Expiry Section --- */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3">Identification Status</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <DetailItem label="ID Expiry Date" value={formatDate(displayData.id_expiry_date)} />
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Remaining Validity</p>
                                    <p className={`text-sm font-bold mt-0.5 ${daysLeft === null ? 'text-gray-400' :
                                        daysLeft <= 0 ? 'text-red-600' :
                                            daysLeft <= 60 ? 'text-orange-600' : 'text-green-600'
                                        }`}>
                                        {daysLeft === null ? 'No data' : daysLeft <= 0 ? 'EXPIRED' : `${daysLeft} days remaining`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                            {displayData.emergencyContact ? (
                                <div className="space-y-3">
                                    <DetailItem label="Name" value={displayData.emergencyContact.name} />
                                    <DetailItem label="Relationship" value={displayData.emergencyContact.relationship} />
                                    <DetailItem label="Contact" value={displayData.emergencyContact.contact} />
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No emergency contact provided.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all active:scale-95">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || '---'}</p>
    </div>
);

export default ViewUserDetails;