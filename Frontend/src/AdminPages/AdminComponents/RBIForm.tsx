import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { type User, API_BASE_URL } from '../../interfaces';

interface ResidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: User | null;
}

const ResidentModal = ({ isOpen, onClose, initialData }: ResidentModalProps) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState<User>({
        firstname: '',
        lastname: '',
        gender: '',
        birthday: '',
        contact_number: '',
        email: '',
        address: '',
        type: '',
        id_expiry_date: '',
        disability: '',
        is_flood_prone: false,
        emergencyContact: {
            name: '',
            relationship: '',
            contact: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const formatDate = (dateStr: string | undefined) => {
                    if (!dateStr) return '';
                    return new Date(dateStr).toISOString().split('T')[0];
                };

                setFormData({
                    ...initialData,
                    birthday: formatDate(initialData.birthday),
                    id_expiry_date: formatDate(initialData.id_expiry_date),
                    emergencyContact: initialData.emergencyContact || { name: '', relationship: '', contact: '' }
                });
            } else {
                setFormData({
                    firstname: '', lastname: '', gender: '', birthday: '',
                    contact_number: '', email: '', address: '', type: '',
                    id_expiry_date: '', disability: '', is_flood_prone: false,
                    emergencyContact: { name: '', relationship: '', contact: '' }
                });
            }
            setMessage({ type: '', text: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact!,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (initialData && initialData.system_id) {
                await axios.put(`${API_BASE_URL}/api/user/${initialData.system_id}`, formData);
                setMessage({ type: 'success', text: 'Resident updated successfully!' });
            } else {
                await axios.post(`${API_BASE_URL}/api/user`, formData);
                setMessage({ type: 'success', text: 'Resident registered successfully!' });
            }

            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Action failed'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex h-[100vh] items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl pb-3 max-h-[95vh] overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-start justify-between p-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {initialData ? 'Edit Resident Profile' : 'Add New Resident'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {initialData ? `System ID: ${initialData.system_id}` : 'Registry of Barangay Inhabitants Entry'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                    {message.text && (
                        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
                            <input required name="firstname" value={formData.firstname} onChange={handleChange} type="text" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                            <input required name="lastname" value={formData.lastname} onChange={handleChange} type="text" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Gender</label>
                            <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all">
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Birthday</label>
                            <input required name="birthday" value={formData.birthday} onChange={handleChange} type="date" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Contact Number</label>
                            <input required name="contact_number" value={formData.contact_number} onChange={handleChange} type="text" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Complete Address</label>
                        <input required name="address" value={formData.address} onChange={handleChange} type="text" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Type</label>
                            <select required name="type" value={formData.type} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all">
                                <option value="">Select Type</option>
                                <option value="PWD">PWD</option>
                                <option value="SC">Senior Citizen</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">ID Expiry Date</label>
                            <input name="id_expiry_date" value={formData.id_expiry_date} onChange={handleChange} type="date" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Disability Details</label>
                        <input name="disability" value={formData.disability} onChange={handleChange} type="text" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <input name="is_flood_prone" checked={formData.is_flood_prone} onChange={handleChange} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                        <label className="text-sm font-semibold text-slate-700">Resident lives in a flood-prone area</label>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Emergency Contact Information</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</label>
                                <input required name="name" value={formData.emergencyContact?.name || ''} onChange={handleEmergencyChange} type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Relationship</label>
                                <input required name="relationship" value={formData.emergencyContact?.relationship || ''} onChange={handleEmergencyChange} type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                                <input required name="contact" value={formData.emergencyContact?.contact || ''} onChange={handleEmergencyChange} type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">
                            Cancel
                        </button>
                        <button disabled={loading} type="submit" className="flex items-center gap-2 rounded-lg bg-slate-900 px-8 py-2.5 text-sm font-bold text-white hover:bg-black transition-all disabled:opacity-70">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : initialData ? 'Update Resident' : 'Save Resident'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResidentModal;