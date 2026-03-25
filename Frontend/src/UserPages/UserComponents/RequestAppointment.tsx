import React, { useState } from 'react';
import { X, Upload, ClipboardList } from 'lucide-react';

interface CustomRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
}

const CustomRequestModal: React.FC<CustomRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        service_type: 'Financial Aid',
        purpose: '',
        date: '',
        time: '',
        home_visit: false,
        file: null as File | null
    });

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFormData({ ...formData, file: selectedFile });
    };

    const removeFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFormData({ ...formData, file: null });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = new FormData();
        submitData.append('service_type', formData.service_type);
        submitData.append('purpose', formData.purpose);
        submitData.append('appointment_date', formData.date);
        submitData.append('appointment_time', formData.time);
        submitData.append('home_visit', String(formData.home_visit));

        if (formData.file) {
            // CRITICAL: Name must match the backend upload.single('attachment')
            submitData.append('attachment', formData.file);
        }

        onSubmit(submitData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-4xl shadow-2xl my-auto animate-in zoom-in-95 duration-200 rounded-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Request New Appointment</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Fill out the form below to schedule an appointment with the barangay office. Your request will be reviewed and you'll receive a confirmation within 24 hours.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Service Type Selection */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                            Service Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full border border-gray-200 p-3 text-sm font-medium focus:ring-1 focus:ring-blue-600 outline-none rounded appearance-none bg-white"
                            value={formData.service_type}
                            onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                        >
                            <option value="Financial Aid">Financial Aid</option>
                            <option value="Barangay Clearance">Barangay Clearance</option>
                            <option value="Health Consultation">Health Consultation</option>
                            <option value="Other">Other / Custom Request</option>
                        </select>
                    </div>

                    {/* Purpose of Appointment */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                            Purpose of Appointment <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows={4}
                            className="w-full border border-gray-200 p-3 text-sm font-medium focus:ring-1 focus:ring-blue-600 outline-none rounded"
                            placeholder="Please describe the reason for your appointment..."
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        ></textarea>
                    </div>

                    {/* Preferred Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">
                                Preferred Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="date"
                                className="w-full border border-gray-200 p-3 text-sm font-medium focus:ring-1 focus:ring-blue-600 outline-none rounded"
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">
                                Preferred Time <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                className="w-full border border-gray-200 p-3 text-sm font-medium focus:ring-1 focus:ring-blue-600 outline-none rounded bg-white"
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            >
                                <option value="">Select time slot</option>
                                <option value="08:00 AM">08:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="01:00 PM">01:00 PM</option>
                                <option value="03:00 PM">03:00 PM</option>
                            </select>
                        </div>
                    </div>

                    {/* Home Visit Notification */}
                    <div className="bg-[#fffbeb] border border-orange-100 p-4 rounded-sm flex items-start gap-3">
                        <div className="mt-1">
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-orange-500 cursor-pointer"
                                onChange={(e) => setFormData({ ...formData, home_visit: e.target.checked })}
                            />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase text-orange-900 flex items-center gap-2">
                                Request Home Visit
                            </h4>
                            <p className="text-[11px] text-orange-700 leading-tight mt-0.5">
                                Due to your mobility considerations, we can arrange for a barangay staff member to visit your home instead.
                            </p>
                        </div>
                    </div>

                    {/* Attach Documents */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Attach Supporting Documents (Optional)</label>
                        <label className={`border-2 border-dashed rounded-sm p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group ${formData.file ? 'border-blue-400 bg-blue-50/30' : 'border-gray-100 bg-white hover:bg-gray-50'}`}>

                            {!formData.file ? (
                                <>
                                    <Upload className="text-gray-300 group-hover:text-blue-600 transition-colors mb-2" size={24} />
                                    <p className="text-[13px] font-medium text-gray-500">Click to upload or drag and drop</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase">PDF, JPG, PNG up to 10MB</p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="bg-blue-600 p-2 rounded-full mb-2">
                                        <ClipboardList className="text-white" size={20} />
                                    </div>
                                    <p className="text-sm font-bold text-blue-900">{formData.file.name}</p>
                                    <p className="text-[10px] text-blue-600 uppercase">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        onClick={removeFile}
                                        className="mt-3 text-[10px] font-black uppercase text-red-500 hover:text-red-700 underline"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {/* What to Expect */}
                    <div className="bg-[#f0f7ff] border border-blue-100 p-5 rounded-sm">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase text-blue-900 mb-2">
                            <ClipboardList size={14} /> What to Expect:
                        </h4>
                        <ul className="space-y-1.5 ml-1">
                            {[
                                'Your appointment request will be reviewed within 24 hours',
                                'You\'ll receive a confirmation via SMS and email',
                                'Bring all required documents on your appointment date',
                                'Arrive 15 minutes early for check-in'
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px] text-blue-800 font-medium">
                                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5" /> {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse md:flex-row gap-2 pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            className="flex-1 bg-[#2563eb] text-white py-3 px-8 text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 rounded-sm"
                        >
                            Submit Appointment Request
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-none px-6 py-3 text-[11px] font-black uppercase text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors rounded-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomRequestModal;