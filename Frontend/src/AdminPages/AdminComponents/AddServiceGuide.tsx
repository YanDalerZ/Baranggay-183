import React, { useState } from 'react';
import {
    X,
    Trash2,
    GripVertical,
    Clock,
    Calendar,
    CheckSquare,
    ListOrdered,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../interfaces';

interface AddGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>; // Added missing prop to interface
}

const AddGuideModal = ({ isOpen, onClose, onSuccess }: AddGuideModalProps) => {
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [procTime, setProcTime] = useState('');
    const [officeHours, setOfficeHours] = useState('Monday to Friday, 8:00 AM - 5:00 PM');

    // Dynamic Fields
    const [requirements, setRequirements] = useState(['']);
    const [steps, setSteps] = useState(['']);

    if (!isOpen) return null;

    const addRequirement = () => setRequirements([...requirements, '']);
    const removeRequirement = (index: number) => {
        const newReqs = requirements.filter((_, i) => i !== index);
        setRequirements(newReqs.length ? newReqs : ['']);
    };

    const addStep = () => setSteps([...steps, '']);
    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps.length ? newSteps : ['']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Sanitize data (remove empty strings)
        const payload = {
            title,
            category,
            processing_time: procTime,
            office_hours: officeHours,
            requirements: requirements.filter(r => r.trim() !== ''),
            steps: steps.filter(s => s.trim() !== ''),
            last_updated: new Date().toISOString().split('T')[0]
        };

        try {
            await axios.post(`${API_BASE_URL}/api/serviceguide`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh the parent list
            await onSuccess();

            // Reset and close
            setTitle('');
            setCategory('');
            setProcTime('');
            setRequirements(['']);
            setSteps(['']);
            onClose();
        } catch (err) {
            console.error("Save Error:", err);
            alert("Error saving guide. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col rounded-xl">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Create Service Guide</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Knowledge Base Entry</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Service Title</label>
                            <input
                                required
                                placeholder="e.g. PWD ID Application"
                                className="w-full border-b-2 border-gray-100 py-2 focus:border-[#00308F] outline-none transition-colors font-bold text-gray-800"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Category</label>
                            <select
                                required
                                className="w-full border-b-2 border-gray-100 py-2 focus:border-[#00308F] outline-none transition-colors font-bold text-gray-800 bg-transparent"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                <option value="ID Application">ID Application</option>
                                <option value="Medical Assistance">Medical Assistance</option>
                                <option value="Financial Aid">Financial Aid</option>
                                <option value="Clearance & Permits">Clearance & Permits</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Processing Time</label>
                            <div className="flex items-center gap-2 border-b-2 border-gray-100 focus-within:border-[#00308F] transition-colors">
                                <Clock size={14} className="text-gray-300" />
                                <input
                                    required
                                    placeholder="e.g. 5-7 business days"
                                    className="w-full py-2 outline-none font-bold text-gray-800 bg-transparent"
                                    value={procTime}
                                    onChange={(e) => setProcTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Office Hours</label>
                            <div className="flex items-center gap-2 border-b-2 border-gray-100 focus-within:border-[#00308F] transition-colors">
                                <Calendar size={14} className="text-gray-300" />
                                <input
                                    className="w-full py-2 outline-none font-bold text-gray-800 bg-transparent"
                                    value={officeHours}
                                    onChange={(e) => setOfficeHours(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                                <CheckSquare size={16} className="text-[#00308F]" />
                                <h3 className="text-sm font-black uppercase text-gray-900">Requirements</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addRequirement}
                                className="text-[10px] font-black bg-blue-50 text-[#00308F] px-3 py-1 hover:bg-blue-100 transition rounded"
                            >
                                + ADD REQ
                            </button>
                        </div>
                        <div className="space-y-3">
                            {requirements.map((req, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                    <div className="mt-2 text-gray-300 group-hover:text-blue-400 transition-colors">
                                        <GripVertical size={16} />
                                    </div>
                                    <input
                                        placeholder="e.g. Valid Government ID"
                                        className="flex-1 bg-gray-50 border-none p-3 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none rounded-lg"
                                        value={req}
                                        onChange={(e) => {
                                            const newReqs = [...requirements];
                                            newReqs[idx] = e.target.value;
                                            setRequirements(newReqs);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeRequirement(idx)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Steps Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                                <ListOrdered size={16} className="text-[#00308F]" />
                                <h3 className="text-sm font-black uppercase text-gray-900">Step-by-Step Process</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addStep}
                                className="text-[10px] font-black bg-blue-50 text-[#00308F] px-3 py-1 hover:bg-blue-100 transition rounded"
                            >
                                + ADD STEP
                            </button>
                        </div>
                        <div className="space-y-3">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 shrink-0 group-hover:bg-[#00308F] group-hover:text-white transition-colors">
                                        {idx + 1}
                                    </div>
                                    <input
                                        placeholder="e.g. Present documents at Window 1"
                                        className="flex-1 bg-gray-50 border-none p-3 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none rounded-lg"
                                        value={step}
                                        onChange={(e) => {
                                            const newSteps = [...steps];
                                            newSteps[idx] = e.target.value;
                                            setSteps(newSteps);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeStep(idx)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 text-sm font-black uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 text-sm font-black uppercase tracking-widest bg-black text-white hover:bg-[#00308F] transition shadow-lg shadow-gray-200 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Saving...
                                </>
                            ) : 'Save Guide'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGuideModal;