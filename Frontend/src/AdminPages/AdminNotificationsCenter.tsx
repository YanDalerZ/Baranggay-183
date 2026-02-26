import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Send,
    Mail,
    Smartphone,
    Globe,
    Loader2,
    Trash2,
} from 'lucide-react';

import {
    API_BASE_URL,
    type NotificationHistoryItem,
    type NotificationStats
} from '../interfaces';

const AdminNotificationCenter = () => {
    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
    const [stats, setStats] = useState<NotificationStats>({
        sentToday: 0,
        totalRecipients: 0,
        deliveryRate: '0%'
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [sending, setSending] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        target_groups: [] as string[],
        title: '',
        message: '',
        channels: ['Web Notification'] as string[]
    });

    const { token, user } = useAuth();

    const channelOptions = [
        { id: 'SMS', label: 'SMS', icon: <Smartphone size={18} /> },
        { id: 'Email', label: 'Email', icon: <Mail size={18} /> },
        { id: 'Web Notification', label: 'Web Notification', icon: <Globe size={18} /> },
    ];

    const targetOptions = [
        { id: 'all', label: 'All Residents' },
        { id: 'sc', label: 'Senior Citizens' },
        { id: 'pwd', label: 'PWDs' },
        { id: 'flood_prone', label: 'Flood-Prone Areas' },
    ];

    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    const fetchData = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const [historyRes, statsRes] = await Promise.all([
                axios.get<NotificationHistoryItem[]>(`${API_BASE_URL}/api/notifications/history`, config),
                axios.get<NotificationStats>(`${API_BASE_URL}/api/notifications/stats`, config)
            ]);
            setHistory(historyRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [config]);

    const handleGroupToggle = (groupId: string) => {
        setFormData(prev => {
            const isSelected = prev.target_groups.includes(groupId);
            let updatedGroups;
            if (groupId === 'all') {
                updatedGroups = isSelected ? [] : ['all'];
            } else {
                const withoutAll = prev.target_groups.filter(g => g !== 'all');
                updatedGroups = isSelected ? withoutAll.filter(g => g !== groupId) : [...withoutAll, groupId];
            }
            return { ...prev, target_groups: updatedGroups };
        });
    };

    const handleChannelToggle = (channelId: string) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channelId)
                ? prev.channels.filter(c => c !== channelId)
                : [...prev.channels, channelId]
        }));
    };

    const handleSendNotification = async () => {
        if (!formData.title || !formData.message || formData.target_groups.length === 0 || formData.channels.length === 0) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            setSending(true);
            await axios.post(`${API_BASE_URL}/api/notifications/send`, {
                title: formData.title,
                message: formData.message,
                target_groups: formData.target_groups,
                channels: formData.channels,
                sender_id: user?.id
            }, config);

            setFormData({ target_groups: [], title: '', message: '', channels: ['Web Notification'] });
            fetchData();
            alert("Notification dispatched!");
        } catch (error) {
            alert("Failed to send notification.");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this notification log?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, config);
            fetchData();
        } catch (error) {
            alert("Delete failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                    Notifications Center
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: COMPOSE SECTION */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-sm border border-gray-100 p-6 h-full rounded-xl">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Send Notification</h2>
                                <p className="text-sm text-gray-600">Multi-channel notification gateway</p>
                            </div>

                            <div className="space-y-5">
                                {/* RECIPIENT GROUPS AS CHECKBOXES */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Recipient Groups</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {targetOptions.map((opt) => (
                                            <div
                                                key={opt.id}
                                                onClick={() => handleGroupToggle(opt.id)}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${formData.target_groups.includes(opt.id) ? 'bg-black border-black' : 'bg-white border-gray-300'}`}>
                                                    {formData.target_groups.includes(opt.id) && <div className="w-2 h-2 bg-white" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Title</label>
                                    <input
                                        placeholder="Enter notification title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Enter your message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Notification Channels</label>
                                    <div className="space-y-2">
                                        {channelOptions.map((ch) => (
                                            <div
                                                key={ch.id}
                                                onClick={() => handleChannelToggle(ch.id)}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${formData.channels.includes(ch.id) ? 'bg-black border-black' : 'bg-white border-gray-300'}`}>
                                                    {formData.channels.includes(ch.id) && <div className="w-2 h-2 bg-white" />}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    {ch.icon}
                                                    <span className="text-sm font-medium">{ch.label}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSendNotification}
                                    disabled={sending}
                                    className="w-full bg-[#05050F] text-white font-bold py-4 flex justify-center items-center gap-3 hover:bg-gray-800 transition-all rounded-lg disabled:opacity-50"
                                >
                                    {sending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                    <span>Send Notification</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: STATS SECTION */}
                    <div className="space-y-6">
                        <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Delivery Stats</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Sent Today</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.sentToday}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Recipients</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalRecipients}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Delivery Rate</p>
                                    <p className="text-3xl font-bold text-green-500">{stats.deliveryRate}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Channel Performance</h3>
                            <div className="space-y-4">
                                {channelOptions.map(ch => (
                                    <div key={ch.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            {ch.icon}
                                            <span className="text-sm font-medium">{ch.label === 'Web Notification' ? 'Web' : ch.label}</span>
                                        </div>
                                        <span className="bg-gray-100 text-gray-800 text-[11px] font-bold px-2 py-1 rounded">100%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* HISTORY SECTION */}
                <section className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-xl">
                    <header className="p-6 border-b border-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">Notification History</h2>
                    </header>
                    <div className="p-6 space-y-4">
                        {loading ? (
                            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-10 text-gray-600">No history found</div>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="group relative border border-gray-100 p-5 hover:border-gray-200 hover:bg-gray-50/50 transition-all rounded-lg">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed">{item.desc || item.message}</p>
                                            <div className="flex items-center gap-4 mt-4">
                                                <span className="text-xs text-gray-600 uppercase ">Recipient Group: {item.target_group}</span>
                                                <span className="text-xs text-gray-600">{item.recipients} recipients</span>
                                                <span className="text-xs text-gray-600">•</span>
                                                <span className="text-xs text-gray-600">{item.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 flex items-center gap-1 rounded">
                                                    Sent
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {item.channels?.map(ch => (
                                                    <span key={ch} className="bg-white border border-gray-200 text-gray-600 text-[10px] font-semibold px-2 py-1 shadow-sm rounded">
                                                        {ch.replace(' Notification', '')}
                                                    </span>
                                                ))}
                                                <button onClick={() => handleDelete(item.id)} className="ml-2 cursor-pointer text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminNotificationCenter;