import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../interfaces';

interface ServiceGuide {
    id: number;
    title: string;
    category: string;
    processing_time: string;
    requirements?: string | string[];
    steps: string | string[];
    office_hours?: string;
}

interface EditGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    guide: ServiceGuide | null;
}

const EditGuideModal = ({ isOpen, onClose, onSuccess, guide }: EditGuideModalProps) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [processingTime, setProcessingTime] = useState('');
    const [officeHours, setOfficeHours] = useState('');
    const [requirements, setRequirements] = useState<string[]>([]);
    const [steps, setSteps] = useState<string[]>([]);

    // Pre-fill form when guide changes or modal opens
    useEffect(() => {
        if (guide && isOpen) {
            setTitle(guide.title);
            setCategory(guide.category);
            setProcessingTime(guide.processing_time);
            setOfficeHours(guide.office_hours || '');

            // Handle parsing if data comes as a JSON string from the DB
            const parsedReqs = typeof guide.requirements === 'string'
                ? JSON.parse(guide.requirements)
                : (guide.requirements || []);

            const parsedSteps = typeof guide.steps === 'string'
                ? JSON.parse(guide.steps)
                : (guide.steps || []);

            setRequirements(Array.isArray(parsedReqs) ? parsedReqs : []);
            setSteps(Array.isArray(parsedSteps) ? parsedSteps : []);
        }
    }, [guide, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guide) return;

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                title,
                category,
                processing_time: processingTime,
                office_hours: officeHours,
                requirements, // Controller handles JSON.stringify
                steps
            };

            await axios.put(`${API_BASE_URL}/api/serviceguide/${guide.id}`, payload, config);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Update Error:", err);
            alert("Failed to update guide.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to manage dynamic lists
    const updateList = (index: number, value: string, type: 'req' | 'step') => {
        if (type === 'req') {
            const newReqs = [...requirements];
            newReqs[index] = value;
            setRequirements(newReqs);
        } else {
            const newSteps = [...steps];
            newSteps[index] = value;
            setSteps(newSteps);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Edit Service Guide</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase">Update ID: {guide?.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Service Title</label>
                            <input
                                required value={title} onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[#00308F] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Category</label>
                            <input
                                required value={category} onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[#00308F] outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Processing Time</label>
                            <input
                                required value={processingTime} onChange={(e) => setProcessingTime(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[#00308F] outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Office Hours</label>
                            <input
                                value={officeHours} onChange={(e) => setOfficeHours(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[#00308F] outline-none"
                            />
                        </div>
                    </div>

                    {/* Dynamic Requirements */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-gray-400">Requirements</label>
                            <button type="button" onClick={() => setRequirements([...requirements, ''])} className="text-[#00308F] text-[10px] font-bold flex items-center gap-1">
                                <Plus size={12} /> ADD ITEM
                            </button>
                        </div>
                        {requirements.map((req, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={req} onChange={(e) => updateList(idx, e.target.value, 'req')}
                                    className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded-md text-sm"
                                />
                                <button type="button" onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))} className="text-red-400 p-2"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>

                    {/* Dynamic Steps */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-gray-400">Procedure Steps</label>
                            <button type="button" onClick={() => setSteps([...steps, ''])} className="text-[#00308F] text-[10px] font-bold flex items-center gap-1">
                                <Plus size={12} /> ADD STEP
                            </button>
                        </div>
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex gap-2">
                                <span className="bg-gray-100 px-3 py-2 rounded text-xs font-bold">{idx + 1}</span>
                                <input
                                    value={step} onChange={(e) => updateList(idx, e.target.value, 'step')}
                                    className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded-md text-sm"
                                />
                                <button type="button" onClick={() => setSteps(steps.filter((_, i) => i !== idx))} className="text-red-400 p-2"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-[#00308F] transition-all flex items-center justify-center gap-3 disabled:bg-gray-300"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditGuideModal;