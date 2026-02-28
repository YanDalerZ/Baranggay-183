import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    AlertTriangle,
    Send,
    History,
    Smartphone,
    Mail,
    Globe,
    Users,
    Loader2
} from 'lucide-react';
import { API_BASE_URL, NotificationHistoryItem, NotificationStats } from '../interfaces';

interface AffectedResident {
    id: string;
    name: string;
    address: string;
    phone: string;
    priority: number;
    priorityLabel: string; // Added to match backend
    tags: string[];
}

const AdminEmergencyAlerts = () => {
    const [hazardType, setHazardType] = useState('Flood');
    const [severity, setSeverity] = useState('High');
    const [message, setMessage] = useState('');
    const [channels, setChannels] = useState(['Web', 'SMS']);
    const [isSending, setIsSending] = useState(false);

    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
    const [residents, setResidents] = useState<AffectedResident[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchData = async () => {
        try {
            if (!token) return;
            const [histRes, statsRes, resData] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/notifications/history?type=emergency`, config),
                axios.get(`${API_BASE_URL}/api/notifications/stats`, config),
                axios.get(`${API_BASE_URL}/api/user/priority`, config)
            ]);

            setHistory(Array.isArray(histRes.data) ? histRes.data : []);
            setStats(statsRes.data);
            setResidents(resData.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
            setResidents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const toggleChannel = (channel: string) => {
        setChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        );
    };

    const handleBroadcast = async () => {
        if (!message) return alert("Please enter a message");
        setIsSending(true);
        try {
            await axios.post(`${API_BASE_URL}/api/notifications/broadcast`, {
                sender_id: user?.id || 'admin',
                title: `${hazardType.toUpperCase()} ALERT: ${severity}`,
                message: message,
                target_groups: ['flood_prone'],
                channels: channels,
            }, config);

            setMessage('');
            alert("Emergency Alert Broadcasted Successfully!");
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to broadcast alert");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-red-600" size={48} />
                <p className="text-gray-500 font-medium animate-pulse">Loading emergency systems...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Emergency Alerts
            </h2>

            <main className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Residents" value={stats?.totalRecipients || "0"} icon={<Users className="text-gray-400" size={20} />} />
                    <StatCard title="Flood-Prone Areas" value="4" valueColor="text-orange-600" />
                    <StatCard title="High Vulnerability" value="2" valueColor="text-red-600" />
                    <StatCard title="Alerts Sent (Today)" value={stats?.sentToday || "0"} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <section className="lg:col-span-5 bg-white border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="text-red-600" size={20} />
                            <h2 className="text-lg font-bold text-gray-900">Send Emergency Alert</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hazard Type</label>
                                <select value={hazardType} onChange={(e) => setHazardType(e.target.value)} className="w-full bg-gray-50 border-none py-3 px-4 text-sm focus:ring-2 focus:ring-red-500 outline-none">
                                    <option>Flood</option>
                                    <option>Fire</option>
                                    <option>Typhoon</option>
                                    <option>Earthquake</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity Level</label>
                                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full bg-gray-50 border-none py-3 px-4 text-sm focus:ring-2 focus:ring-red-500 outline-none">
                                    <option>Critical</option>
                                    <option>High</option>
                                    <option>Moderate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alert Message</label>
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter emergency alert message..." className="w-full bg-gray-50 border-none py-3 px-4 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[120px] resize-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Notification Channels</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <ChannelCheckbox icon={<Globe size={16} />} label="Web" checked={channels.includes('Web')} onChange={() => toggleChannel('Web')} />
                                    <ChannelCheckbox icon={<Mail size={16} />} label="Email" checked={channels.includes('Email')} onChange={() => toggleChannel('Email')} />
                                    <ChannelCheckbox icon={<Smartphone size={16} />} label="SMS" checked={channels.includes('SMS')} onChange={() => toggleChannel('SMS')} />
                                </div>
                            </div>

                            <button onClick={handleBroadcast} disabled={isSending} className="w-full bg-red-600 disabled:bg-red-400 text-white py-4 font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-[0.98]">
                                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                Broadcast Alert
                            </button>
                        </div>
                    </section>

                    <section className="lg:col-span-7 bg-white border border-gray-100 shadow-sm flex flex-col">
                        <div className="p-6 border-b border-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Priority Queue - Affected Residents</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[640px] p-4 space-y-3">
                            {residents.map((res) => (
                                <div key={res.id} className="group p-4 border border-gray-100 bg-white hover:bg-gray-50 transition-all cursor-pointer relative overflow-hidden">
                                    {/* Sidebar color based on priority */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${res.priorityLabel === 'High Priority' ? 'bg-red-600' :
                                            res.priorityLabel === 'Mid Priority' ? 'bg-orange-500' : 'bg-gray-200'
                                        }`} />

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900">{res.name}</h4>

                                                {/* Conditional Priority Badge */}
                                                {res.priorityLabel && (
                                                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase ${res.priorityLabel === 'High Priority'
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-orange-100 text-orange-600'
                                                        }`}>
                                                        {res.priorityLabel}
                                                    </span>
                                                )}
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
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Rank #{res.priority}</p>
                                            <p className="text-sm font-mono font-bold text-gray-700">{res.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <section className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <History size={18} className="text-gray-400" /> Alert History
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {Array.isArray(history) && history.length > 0 ? (
                            history.map(item => (
                                <HistoryItem
                                    key={item.id}
                                    type={item.title}
                                    severity={item.title?.includes('CRITICAL') ? 'Critical' : 'High'}
                                    time={item.date}
                                    message={item.desc}
                                    delivered={`${item.recipients}/${item.recipients}`}
                                    channels={item.channels}
                                />
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <p className="text-gray-400 text-sm">No emergency alerts recorded.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

// --- Sub-components ---

const StatCard = ({ title, value, valueColor = "text-gray-900", icon }: any) => (
    <div className="bg-white p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
        </div>
        {icon}
    </div>
);

const ChannelCheckbox = ({ icon, label, checked, onChange }: { icon: any, label: string, checked: boolean, onChange: () => void }) => (
    <label className="flex items-center gap-2 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <span className={checked ? "text-red-600" : "text-gray-400"}>{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
);

const HistoryItem = ({ type, severity, time, message, delivered, failedMsg, channels }: any) => (
    <div className="p-6 hover:bg-gray-50/50 transition-colors">
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{type}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                        {severity}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{time}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                    <div className="flex gap-2 items-center">
                        Channels:
                        {channels?.map((c: string) => (
                            <span key={c} className="bg-gray-100 px-1 rounded">{c}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="text-left md:text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">{delivered} Sent</p>
                {failedMsg && <p className="text-[11px] text-orange-600 font-medium">{failedMsg}</p>}
            </div>
        </div>
    </div>
);

export default AdminEmergencyAlerts;