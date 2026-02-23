import React, { useState } from 'react';
import {
    Eye, FileText, CreditCard, X, CheckCircle, AlertCircle, Ban
} from 'lucide-react';

// --- Types ---
type Status = 'Pending' | 'Approved' | 'Denied' | 'Incomplete';

interface Application {
    id: number;
    name: string;
    status: Status;
    submittedDate: string;
    reviewedDate?: string;
    type: 'RBI' | 'PWD' | 'SC';
}

const MOCK_APPLICATIONS: Application[] = [
    { id: 1, name: "Juan Dela Cruz", status: "Pending", submittedDate: "February 8, 2026", type: 'RBI' },
    { id: 2, name: "Ana Garcia", status: "Approved", submittedDate: "February 5, 2026", reviewedDate: "February 7, 2026", type: 'RBI' },
];

export default function AdminApplicationsManagement() {
    const [selectedTab, setSelectedTab] = useState<'RBI' | 'PWD' | 'SC'>('RBI');
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                Applications Management
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
                Review and process digital applications for RBI registration, PWD ID, and Senior Citizen ID.
            </p>

            <main>
                {/* Stats Cards - Responsive Grid (2 cols on mobile, 4 on tablet+) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
                    <StatCard label="Total Pending" value="3" />
                    <StatCard label="Incomplete" value="1" />
                    <StatCard label="Approved" value="3" color="text-green-600" />
                    <StatCard label="Denied" value="1" color="text-red-600" />
                </div>

                {/* Tabs - Scrollable on very small screens if tabs grow */}
                <div className="flex bg-gray-200 p-1  mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <TabButton active={selectedTab === 'RBI'} label="RBI (2)" onClick={() => setSelectedTab('RBI')} icon={<FileText size={16} />} />
                    <TabButton active={selectedTab === 'PWD'} label="PWD (3)" onClick={() => setSelectedTab('PWD')} icon={<CreditCard size={16} />} />
                    <TabButton active={selectedTab === 'SC'} label="SC (3)" onClick={() => setSelectedTab('SC')} icon={<CreditCard size={16} />} />
                </div>

                {/* List - Responsive padding and button layout */}
                <div className="space-y-4">
                    {MOCK_APPLICATIONS.map(app => (
                        <div key={app.id} className="bg-white p-4 sm:p-6  border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-base sm:text-lg">{app.name}</h3>
                                    <span className={`px-3 py-0.5  text-[10px] font-medium ${app.status === 'Pending' ? 'bg-gray-200 text-gray-700' : 'bg-black text-white'}`}>
                                        {app.status}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Submitted: {app.submittedDate}
                                    {app.reviewedDate && <span className="hidden sm:inline"> • Reviewed: {app.reviewedDate}</span>}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 border px-4 py-1.5  hover:bg-gray-50 transition shadow-sm text-sm"
                            >
                                <Eye size={18} /> Review
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {showModal && <ReviewModal onClose={() => setShowModal(false)} />}
        </div>
    );
}

// --- Sub-components ---

function StatCard({ label, value, color = "text-black" }: { label: string, value: string, color?: string }) {
    return (
        <div className="bg-white p-4 sm:p-6  border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-[10px] sm:text-sm mb-1 uppercase font-bold tracking-wider">{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function TabButton({ active, label, onClick, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2  text-xs sm:text-sm transition ${active ? 'bg-white shadow-sm font-semibold' : 'text-gray-600 hover:bg-gray-300'}`}
        >
            {icon} <span>{label}</span>
        </button>
    );
}

function ReviewModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            {/* Modal Container: Fullscreen on mobile,  box on desktop */}
            <div className="bg-white  sm: w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-black z-10 p-2"><X size={24} /></button>

                <div className="p-5 sm:p-8">
                    <h2 className="text-xl font-bold">Review Application</h2>
                    <p className="text-sm text-gray-500 mb-6">Juan Dela Cruz - RBI Application</p>

                    {/* Responsive Grid: 1 column on mobile, 2 on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <h3 className="font-bold text-sm border-b pb-1">Application Details</h3>
                            <div className="grid grid-cols-1 gap-y-3">
                                <DetailRow label="Full Name:" value="Juan Reyes Dela Cruz" />
                                <DetailRow label="Sex:" value="Male" />
                                <DetailRow label="Birthplace:" value="Caloocan City" />
                                <DetailRow label="Nationality:" value="Filipino" />
                                <DetailRow label="Address:" value="123 Camarin Road, Purok 5" />
                                <DetailRow label="Monthly Income:" value="₱15,000 - ₱20,000" />
                                <DetailRow label="Emergency Contact:" value="Maria Dela Cruz (09123456789)" />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div>
                                <h3 className="font-bold text-sm mb-3 border-b pb-1">Uploaded Documents</h3>
                                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                    <DocumentItem label="2x2 Photo" />
                                    <DocumentItem label="Proof of Residency" />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-sm">Assessment</h3>
                                <p className="text-[10px] font-bold mt-2 mb-1 uppercase text-gray-400">Admin Notes</p>
                                <textarea
                                    className="w-full border-2 border-blue-500  p-3 text-sm h-24 outline-none focus:ring-2 ring-blue-200"
                                    placeholder="Enter notes about missing documents..."
                                />
                            </div>
                        </section>
                    </div>

                    {/* Footer Buttons: Stacks on small mobile, 2x2 on small tablet, row on desktop */}
                    <div className="grid grid-cols-2 lg:flex lg:flex-row gap-2 mt-8 pt-6 border-t">
                        <button onClick={onClose} className="col-span-2 lg:flex-1 px-4 py-3 border  text-sm font-bold order-last lg:order-none">
                            Cancel
                        </button>
                        <button className="bg-rose-600 text-white px-4 py-3  text-sm font-bold flex items-center justify-center gap-1">
                            <Ban size={16} /> <span className="hidden sm:inline">Deny</span>
                        </button>
                        <button className="px-4 py-3 border  text-sm font-bold flex items-center justify-center gap-1">
                            <AlertCircle size={16} /> <span className="hidden sm:inline">Incomplete</span>
                        </button>
                        <button className="bg-slate-900 text-white px-4 py-3  text-sm font-bold flex items-center justify-center gap-1 col-span-2 lg:col-span-1">
                            <CheckCircle size={16} /> Approve Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm text-gray-800 font-semibold">{value}</p>
        </div>
    );
}

function DocumentItem({ label }: { label: string }) {
    return (
        <div className="mb-2">
            <div className="border  p-2 text-[11px] font-bold bg-gray-50 flex items-center justify-between">
                {label}
                <Eye size={14} className="text-gray-400" />
            </div>
            <div className="mt-1 space-y-1">
                <div className="h-1.5 bg-gray-100  w-full"></div>
                <div className="h-1.5 bg-gray-100  w-2/3"></div>
            </div>
        </div>
    );
}