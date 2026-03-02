import React, { useState, useEffect } from 'react';
import { X, Loader2, ChevronRight, ChevronLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { type User, API_BASE_URL } from '../../interfaces';

interface ResidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: User | null;
}

const ResidentModal = ({ isOpen, onClose, initialData }: ResidentModalProps) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { token } = useAuth();

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        }
    };

    // Helper to handle Base64/BLOB data from the database
    const getFileUrl = (fileObj: any) => {
        if (!fileObj) return "";
        if (typeof fileObj === 'string') return fileObj;
        if (fileObj.file_data) {
            return `data:${fileObj.mime_type};base64,${fileObj.file_data}`;
        }
        return "";
    };

    const [formData, setFormData] = useState<any>({
        firstname: '',
        lastname: '',
        middlename: '',
        suffix: '',
        gender: '',
        birthday: '',
        birthplace: '',
        nationality: 'Filipino',
        contact_number: '',
        email: '',
        house_no: '',
        street: '',
        barangay: '',
        ownership_type: '',
        years_of_residency: '',
        occupation: '',
        monthly_income: '',
        civil_status: '',
        blood_type: '',
        type: 'Resident',
        is_pwd: false,
        is_registered_voter: false,
        is_flood_prone: false,
        tcic_id: '',
        education: '',
        school: '',
        educational_level: '',
        residence_status: '',
        yearly_income: '',
        household_number: '',
        id_expiry_date: '',
        disability: '',
        emergencyContact: {
            name: '',
            relationship: '',
            contact: ''
        },
        photo_2x2: null,
        proof_of_residency: null,
    });

    // Classification Logic
    useEffect(() => {
        if (!formData.birthday) return;
        const birthDate = new Date(formData.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        const isSenior = age >= 60;
        const isPWD = formData.is_pwd;

        setFormData((prev: any) => {
            let newType = 'Resident';
            if (isSenior && isPWD) newType = 'Both';
            else if (isSenior) newType = 'Senior Citizen';
            else if (isPWD) newType = 'PWD';

            if (prev.type !== newType) return { ...prev, type: newType };
            return prev;
        });
    }, [formData.birthday, formData.is_pwd]);

    // Initial Data Population Logic
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            if (initialData) {
                const clean = (val: any) => (val === 'null' || val === null || val === undefined) ? '' : val;

                const formatDate = (dateStr: string | undefined) => {
                    const cleaned = clean(dateStr);
                    if (!cleaned) return '';
                    try { return new Date(cleaned).toISOString().split('T')[0]; } catch (e) { return ''; }
                };

                const toBool = (val: any) => val === 1 || val === '1' || val === true || val === 'true';

                const findFile = (type: string) => {
                    return initialData.attachments?.find(a => a.file_type === type) || null;
                };

                setFormData({
                    firstname: clean(initialData.firstname),
                    lastname: clean(initialData.lastname),
                    middlename: clean(initialData.middlename),
                    suffix: clean(initialData.suffix),
                    gender: clean(initialData.gender),
                    civil_status: clean(initialData.civil_status),
                    birthplace: clean(initialData.birthplace),
                    nationality: clean(initialData.nationality) || 'Filipino',
                    contact_number: clean(initialData.contact_number),
                    email: clean(initialData.email),
                    house_no: clean(initialData.house_no),
                    street: clean(initialData.street),
                    barangay: clean(initialData.barangay),
                    occupation: clean(initialData.occupation),
                    monthly_income: clean(initialData.monthly_income),
                    education: clean(initialData.education),
                    school: clean(initialData.school),
                    ownership_type: clean(initialData.ownership_type),
                    years_of_residency: clean(initialData.years_of_residency),
                    household_number: clean(initialData.household_number),
                    disability: clean(initialData.disability),
                    tcic_id: clean(initialData.tcic_id),
                    birthday: formatDate(initialData.birthday),
                    id_expiry_date: formatDate(initialData.id_expiry_date),
                    type: clean(initialData.type) || 'Resident',
                    is_pwd: initialData.type === 'PWD' || initialData.type === 'Both',
                    is_registered_voter: toBool(initialData.is_registered_voter),
                    is_flood_prone: toBool(initialData.is_flood_prone),
                    emergencyContact: {
                        name: clean(initialData.emergencyContact?.name),
                        relationship: clean(initialData.emergencyContact?.relationship),
                        contact: clean(initialData.emergencyContact?.contact)
                    },
                    photo_2x2: findFile('photo_2x2'),
                    proof_of_residency: findFile('proof_of_residency')
                });
            } else {
                setFormData({
                    firstname: '', lastname: '', middlename: '', suffix: '', gender: '', birthday: '',
                    birthplace: '', nationality: 'Filipino', contact_number: '', email: '', house_no: '',
                    street: '', barangay: '', ownership_type: '', years_of_residency: '', occupation: '',
                    monthly_income: '', civil_status: '', blood_type: '', type: 'Resident', is_pwd: false,
                    is_registered_voter: false, tcic_id: '', education: '', school: '',
                    is_flood_prone: false, id_expiry_date: '', household_number: '', disability: '',
                    emergencyContact: { name: '', relationship: '', contact: '' },
                    photo_2x2: null, proof_of_residency: null
                });
            }
            setMessage({ type: '', text: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const isStepValid = () => {
        switch (step) {
            case 1:
                return (formData.firstname && formData.lastname && formData.middlename &&
                    formData.gender && formData.civil_status && formData.birthday &&
                    formData.birthplace && formData.nationality && formData.contact_number && formData.email);
            case 2:
                return (formData.house_no && formData.street && formData.barangay &&
                    formData.ownership_type && formData.years_of_residency &&
                    formData.emergencyContact.name && formData.emergencyContact.relationship &&
                    formData.emergencyContact.contact);
            case 3:
                const basicValid = formData.occupation && formData.monthly_income && formData.education;
                if (formData.type !== 'Resident' && !formData.id_expiry_date) return false;
                return basicValid;
            case 4:
                return (formData.photo_2x2 && formData.proof_of_residency);
            default:
                return false;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const name = target.name;
        if (target.type === 'checkbox') {
            setFormData((prev: any) => ({ ...prev, [name]: target.checked }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: target.value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev: any) => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, [name]: value }
        }));
    };

    const getImagePreview = (fieldValue: any) => {
        if (!fieldValue) return null;
        if (fieldValue instanceof File) return URL.createObjectURL(fieldValue);
        return getFileUrl(fieldValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            const val = formData[key];
            if (key === 'emergencyContact') {
                data.append(key, JSON.stringify(val));
            } else if (val instanceof File) {
                data.append(key, val);
            } else if (val !== null && val !== undefined) {
                if (key === 'photo_2x2' || key === 'proof_of_residency') {
                    if (!(val instanceof File)) return;
                }
                if (typeof val === 'boolean') {
                    data.append(key, val ? 'true' : 'false');
                } else {
                    data.append(key, String(val));
                }
            }
        });

        try {
            if (initialData) {
                await axios.put(`${API_BASE_URL}/api/user/${initialData.system_id}`, data, config);
                setMessage({ type: 'success', text: 'Resident updated successfully!' });
            } else {
                await axios.post(`${API_BASE_URL}/api/user`, data, config);
                setMessage({ type: 'success', text: 'Resident registered successfully!' });
            }
            setTimeout(() => onClose(), 1500);
        } catch (err: any) {
            console.error("Submission Error:", err);
            const errorMsg = err.response?.data?.message || 'Submission failed.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => { if (isStepValid()) setStep(s => s + 1); };
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {initialData ? 'Edit Resident Profile' : 'RBI Registration Form'}
                        </h2>
                        <div className="flex gap-2 mt-1">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form className="flex-1 overflow-y-auto p-6 space-y-6">
                    {message.text && (
                        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {!isStepValid() && (
                        <div className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1.5 rounded-md border border-amber-100 font-bold uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle size={14} /> Please fill in all required fields (*) to continue
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-500 pl-3">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="First Name" name="firstname" value={formData.firstname || ''} onChange={handleChange} required />
                                <Input label="Middle Name" name="middlename" value={formData.middlename || ''} onChange={handleChange} required />
                                <Input label="Last Name" name="lastname" value={formData.lastname || ''} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Suffix" name="suffix" placeholder="Jr., Sr., III" value={formData.suffix || ''} onChange={handleChange} />
                                <Select label="Sex" name="gender" value={formData.gender || ''} onChange={handleChange} options={['Male', 'Female']} required />
                                <Select label="Civil Status" name="civil_status" value={formData.civil_status || ''} onChange={handleChange} options={['Single', 'Married', 'Widowed', 'Separated']} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Date of Birth" name="birthday" type="date" value={formData.birthday || ''} onChange={handleChange} required />
                                <Input label="Place of Birth" name="birthplace" value={formData.birthplace || ''} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Nationality" name="nationality" value={formData.nationality || ''} onChange={handleChange} required />
                                <Input label="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
                                <Input label="Contact Number" name="contact_number" value={formData.contact_number || ''} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Blood Type" name="blood_type" placeholder="e.g. O+" value={formData.blood_type || ''} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-500 pl-3">Residence Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="House No." name="house_no" value={formData.house_no || ''} onChange={handleChange} required />
                                <Input label="Street" name="street" value={formData.street || ''} onChange={handleChange} required />
                                <Input label="Barangay / Zone" name="barangay" value={formData.barangay || ''} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select label="Ownership Type" name="ownership_type" value={formData.ownership_type || ''} onChange={handleChange} options={['Owner', 'Tenant', 'Sharer']} required />
                                <Input label="Years of Residency" name="years_of_residency" type="number" value={formData.years_of_residency || ''} onChange={handleChange} required />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-orange-500 pl-3 pt-4">Emergency Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Emergency Contact Person" name="name" value={formData.emergencyContact.name || ''} onChange={handleEmergencyChange} required />
                                <Input label="Relationship" name="relationship" value={formData.emergencyContact.relationship || ''} onChange={handleEmergencyChange} required />
                                <Input label="Emergency Contact Number" name="contact" value={formData.emergencyContact.contact || ''} onChange={handleEmergencyChange} required />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-500 pl-3">Household & Classification</h3>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Classification Logic</p>
                                <Checkbox label="Resident is a PWD (Person with Disability)" name="is_pwd" checked={!!formData.is_pwd} onChange={handleChange} />
                                <div className="text-sm font-bold text-slate-700">
                                    Determined Type: <span className="text-blue-600 underline underline-offset-4">{formData.type}</span>
                                    {formData.type === 'Both' && <span className="ml-2 text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">Dual Eligibility</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Occupation" name="occupation" value={formData.occupation || ''} onChange={handleChange} required />
                                <Select label="Monthly Income" name="monthly_income" value={formData.monthly_income || ''} onChange={handleChange} options={['No Income', 'Below 10k', '10k-20k', '20k-50k', 'Above 50k']} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select label="Education" name="education" value={formData.education || ''} onChange={handleChange} options={['Elementary', 'High School', 'Vocational', 'College', 'Post-Grad']} required />
                                <Input label="School Name" name="school" value={formData.school || ''} onChange={handleChange} />
                            </div>
                            {formData.type !== 'Resident' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-300">
                                    <Input label={`${formData.type} ID Expiry`} name="id_expiry_date" type="date" value={formData.id_expiry_date || ''} onChange={handleChange} required />
                                    <Input label="Disability (if applicable)" name="disability" value={formData.disability || ''} onChange={handleChange} placeholder="Specify disability" />
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="TCIC ID No." name="tcic_id" value={formData.tcic_id || ''} onChange={handleChange} />
                            </div>
                            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl">
                                <Checkbox label="Registered Voter" name="is_registered_voter" checked={!!formData.is_registered_voter} onChange={handleChange} />
                                <Checkbox label="Located in Flood-Prone Area?" name="is_flood_prone" checked={!!formData.is_flood_prone} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-500 pl-3">Verification Documents</h3>
                            <div className="space-y-4">
                                <div className={`p-4 border-2 border-dashed rounded-xl transition-colors ${formData.photo_2x2 ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:border-blue-400'}`}>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload 2x2 Photo <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-4">
                                        <div className="h-24 w-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
                                            {formData.photo_2x2 ? (
                                                <img src={getImagePreview(formData.photo_2x2)!} className="h-full w-full object-cover" alt="Preview" />
                                            ) : <Upload size={28} />}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo_2x2')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                                            {formData.photo_2x2 && !(formData.photo_2x2 instanceof File) && (
                                                <span className="text-[10px] text-blue-600 font-medium italic">Currently on file: {formData.photo_2x2.file_name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 border-2 border-dashed rounded-xl transition-colors ${formData.proof_of_residency ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:border-blue-400'}`}>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Proof of Residency <span className="text-red-500">*</span></label>
                                    <div className="flex flex-col gap-2">
                                        <input type="file" onChange={(e) => handleFileChange(e, 'proof_of_residency')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                                        {formData.proof_of_residency && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                                                <CheckCircle2 size={14} className="text-green-500" />
                                                <span className="truncate flex-1 font-medium">
                                                    {formData.proof_of_residency instanceof File ? formData.proof_of_residency.name : `Stored: ${formData.proof_of_residency.file_name}`}
                                                </span>
                                                <div className="flex items-center gap-3 ml-2 border-l pl-3 border-slate-200">
                                                    {!(formData.proof_of_residency instanceof File) && (
                                                        <a href={getFileUrl(formData.proof_of_residency)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">View</a>
                                                    )}
                                                    <button type="button" onClick={() => setFormData({ ...formData, proof_of_residency: null })} className="text-red-500 hover:underline font-bold">
                                                        {formData.proof_of_residency instanceof File ? 'Remove' : 'Replace'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Input label="Household Number" name="household_number" value={formData.household_number || ''} onChange={handleChange} placeholder="Assigned by Barangay Secretary" />
                            </div>
                        </div>
                    )}
                </form>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <button type="button" onClick={step === 1 ? onClose : prevStep} className="px-6 py-2 text-sm font-bold text-slate-500 flex items-center gap-2 hover:text-slate-700 transition-colors">
                        {step === 1 ? 'Cancel' : <><ChevronLeft size={18} /> Back</>}
                    </button>
                    <div className="flex gap-3">
                        {step < 4 ? (
                            <button type="button" onClick={nextStep} disabled={!isStepValid()} className={`px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 ${isStepValid() ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'}`}>
                                Next Step <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button disabled={loading || !isStepValid()} onClick={handleSubmit} className={`px-10 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${isStepValid() && !loading ? 'bg-slate-900 hover:bg-black text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
                                {loading ? <Loader2 size={18} className="animate-spin" /> : initialData ? 'Update Profile' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Input = ({ label, required, value, ...props }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
            {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <input
            {...props}
            value={value ?? ''}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
    </div>
);

const Select = ({ label, options, required, value, ...props }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
            {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <select
            {...props}
            value={value ?? ''}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
        >
            <option value="">Select {label}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const Checkbox = ({ label, checked, ...props }: any) => (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
        <input
            type="checkbox"
            {...props}
            checked={!!checked}
            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
        />
        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
    </label>
);

export default ResidentModal;