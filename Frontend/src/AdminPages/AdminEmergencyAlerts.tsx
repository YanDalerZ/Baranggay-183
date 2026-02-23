import React, { useState } from 'react';
import {
    AlertTriangle,
    Send,
    History,
    Smartphone,
    Mail,
    Globe,
    MessageSquare,
    Users,
    Info
} from 'lucide-react';

// --- Types ---
interface AffectedResident {
    id: string;
    name: string;
    address: string;
    phone: string;
    priority: number;
    tags: string[];
}

const AdminEmergencyAlerts = () => {
    const [hazardType, setHazardType] = useState('Flood');
    const [severity, setSeverity] = useState('High');

    const priorityResidents: AffectedResident[] = [
        {
            id: 'PWD-004',
            name: 'Roberto Dela Cruz',
            address: 'Block 2, Lot 5, Camarin Road',
            phone: '09681234567',
            priority: 1,
            tags: ['Flood-Prone', 'Bedridden', 'Senior Citizen']
        },
        {
            id: 'PWD-002',
            name: 'Rosa Cruz',
            address: 'Block 3, Lot 22, Camarin Street',
            phone: '09381234567',
            priority: 2,
            tags: ['Flood-Prone', 'Wheelchair-bound']
        },
        {
            id: 'PWD-001',
            name: 'Maria Santos',
            address: 'Block 1, Lot 15, Camarin Road',
            phone: '09171234567',
            priority: 3,
            tags: ['Flood-Prone', 'Visually Impaired', 'Senior Citizen']
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
            <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                Emergency Alerts</h2>

            <main>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Residents" value="6" icon={<Users className="text-gray-400" size={20} />} />
                    <StatCard title="Flood-Prone Areas" value="4" valueColor="text-orange-600" />
                    <StatCard title="High Vulnerability" value="2" valueColor="text-red-600" />
                    <StatCard title="Alerts Sent (Today)" value="2" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Send Emergency Alert Form */}
                    <section className="lg:col-span-5 bg-white  border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="text-red-600" size={20} />
                            <h2 className="text-lg font-bold text-gray-900">Send Emergency Alert</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hazard Type</label>
                                <select
                                    value={hazardType}
                                    onChange={(e) => setHazardType(e.target.value)}
                                    className="w-full bg-gray-50 border-none  py-3 px-4 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option>Flood</option>
                                    <option>Fire</option>
                                    <option>Typhoon</option>
                                    <option>Earthquake</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity Level</label>
                                <select
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="w-full bg-gray-50 border-none  py-3 px-4 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option>Critical</option>
                                    <option>High</option>
                                    <option>Moderate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alert Message</label>
                                <textarea
                                    placeholder="Enter emergency alert message..."
                                    className="w-full bg-gray-50 border-none  py-3 px-4 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[120px] resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Notification Channels (with Fallback)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <ChannelCheckbox icon={<Globe size={16} />} label="Web" defaultChecked />
                                    <ChannelCheckbox icon={<MessageSquare size={16} />} label="Messenger" />
                                    <ChannelCheckbox icon={<Mail size={16} />} label="Email" />
                                    <ChannelCheckbox icon={<Smartphone size={16} />} label="SMS" defaultChecked />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-3 italic">System will automatically use SMS Bridge for failed deliveries</p>
                            </div>

                            <button className="w-full bg-red-600 text-white py-4  font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-[0.98]">
                                <Send size={18} /> Broadcast Alert
                            </button>
                        </div>
                    </section>

                    {/* Priority Queue - Affected Residents */}
                    <section className="lg:col-span-7 bg-white  border border-gray-100 shadow-sm flex flex-col">
                        <div className="p-6 border-b border-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Priority Queue - Affected Residents</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[640px] p-4 space-y-3">
                            {priorityResidents.map((res) => (
                                <div key={res.id} className="group p-4  border border-red-50 bg-white hover:bg-red-50/30 transition-all cursor-pointer relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-100 group-hover:bg-red-500 transition-colors" />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900">{res.name}</h4>
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black  uppercase">High Priority</span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">{res.id} • {res.address}</p>
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {res.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold ">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Priority #{res.priority}</p>
                                            <p className="text-sm font-mono font-bold text-gray-700">{res.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Alert History */}
                <section className="bg-white  border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <History size={18} className="text-gray-400" /> Alert History
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        <HistoryItem
                            type="Typhoon Alert"
                            severity="High"
                            time="1/28/2026, 8:00:00 AM"
                            message="Typhoon Signal #2 has been raised. Residents in flood-prone areas are advised to evacuate. Relief goods available at the evacuation center."
                            delivered="3/4"
                            failedMsg="1 failed (SMS Bridge activated)"
                        />
                        <HistoryItem
                            type="Flood Alert"
                            severity="Critical"
                            time="2/3/2026, 8:00:00 AM"
                            message="CRITICAL FLOOD WARNING: Heavy rains expected. Immediate evacuation required for all flood-prone areas. Emergency hotline: 911"
                            delivered="4/4"
                        />
                    </div>
                </section>

                {/* Fallback Logic Info Box */}
                <div className="bg-blue-50/50 border border-blue-100  p-6 flex gap-4">
                    <div className="w-10 h-10 bg-blue-100  flex items-center justify-center shrink-0">
                        <Info className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">Multi-Channel Delivery with Fallback Logic</h4>
                        <p className="text-sm text-blue-800 leading-relaxed max-w-4xl">
                            The system attempts delivery via <strong>Web → Messenger → Email</strong> first. If delivery fails (no internet connectivity),
                            the <strong>SMS Bridge</strong> is automatically activated to ensure the alert reaches the resident via text message.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Sub-components ---

const StatCard = ({ title, value, valueColor = "text-gray-900", icon }: any) => (
    <div className="bg-white p-5 border border-gray-100  shadow-sm flex items-center justify-between">
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
        </div>
        {icon}
    </div>
);

const ChannelCheckbox = ({ icon, label, defaultChecked }: { icon: any, label: string, defaultChecked?: boolean }) => (
    <label className="flex items-center gap-2 p-3 bg-gray-50  cursor-pointer hover:bg-gray-100 transition-colors">
        <input type="checkbox" defaultChecked={defaultChecked} className="w-4 h-4  text-red-600 focus:ring-red-500 border-gray-300" />
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
);

const HistoryItem = ({ type, severity, time, message, delivered, failedMsg }: any) => (
    <div className="p-6 hover:bg-gray-50/50 transition-colors">
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{type}</span>
                    <span className={`px-2 py-0.5  text-[10px] font-bold uppercase ${severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                        {severity}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{time}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                    <div className="flex gap-2">Channels: <Smartphone size={12} /> <Mail size={12} /> <MessageSquare size={12} /> <Globe size={12} /></div>
                </div>
            </div>
            <div className="text-left md:text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">{delivered} Delivered</p>
                {failedMsg && <p className="text-[11px] text-orange-600 font-medium">{failedMsg}</p>}
            </div>
        </div>
    </div>
);

export default AdminEmergencyAlerts;