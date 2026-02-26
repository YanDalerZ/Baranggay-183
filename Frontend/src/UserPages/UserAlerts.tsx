import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Bell, AlertTriangle, Gift, CheckCircle, Loader2, X, Calendar, Share2 } from 'lucide-react';
import { API_BASE_URL } from '../interfaces';

type Severity = 'Warning' | 'Emergency' | 'Benefit';

interface Notification {
    id: number;
    title: string;
    isNew: boolean;
    type: Severity;
    message: string;
    date: string;
    channels: string[];
}

// --- Components ---

const StatCard = ({ title, value, subtext, colorClass }: { title: string, value: string | number, subtext: string, colorClass: string }) => (
    <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-32">
        <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
        <div>
            <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{subtext}</p>
        </div>
    </div>
);

// Added onClick prop to NotificationItem
const NotificationItem = ({ notification, onClick }: { notification: Notification, onClick: () => void }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'Warning': return <AlertTriangle className="text-amber-500" size={20} />;
            case 'Emergency': return <AlertTriangle className="text-red-500" size={20} />;
            case 'Benefit': return <Gift className="text-emerald-500" size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getBadgeStyles = () => {
        switch (notification.type) {
            case 'Warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Emergency': return 'bg-red-100 text-red-700 border-red-200';
            case 'Benefit': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const isHighlighted = (notification.isNew && (notification.type === 'Emergency' || notification.type === 'Warning'));

    return (
        <div
            onClick={onClick}
            className={`p-5 border transition-all cursor-pointer hover:shadow-md active:scale-[0.99] ${isHighlighted ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}
        >
            <div className="flex gap-4">
                <div className={`p-2 h-fit ${isHighlighted ? 'bg-white' : 'bg-gray-50'}`}>
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold text-gray-900 ${notification.isNew ? 'opacity-100' : 'opacity-70'}`}>{notification.title}</h4>
                        {notification.isNew && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase rounded-full">New</span>
                        )}
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 border uppercase inline-block mb-3 ${getBadgeStyles()}`}>
                        {notification.type}
                    </span>
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-2">{notification.message}</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>{new Date(notification.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                            {notification.channels.map(channel => (
                                <span key={channel} className="bg-gray-100 px-2 py-0.5 border border-gray-200 text-gray-600 font-medium">
                                    {channel}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { token, user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingRead, setMarkingRead] = useState(false);

    // State for Modal
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const determineType = (title: string): 'Emergency' | 'Benefit' | 'Warning' => {
        const t = title.toUpperCase();
        if (t.includes('EMERGENCY') || t.includes('CRITICAL') || t.includes('TYPHOON') || t.includes('FLOOD')) {
            return 'Emergency';
        }
        if (t.includes('BENEFIT') || t.includes('PENSION') || t.includes('GIFT') || t.includes('CLAIM')) {
            return 'Benefit';
        }
        return 'Warning';
    };

    const fetchNotifications = useCallback(async () => {
        if (!token || !user?.id) return;
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/notifications/user/${user.id}`, config);

            const mappedData = response.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                isNew: item.status === 'unread',
                type: determineType(item.title),
                message: item.desc || item.message,
                date: item.date || item.created_at,
                channels: Array.isArray(item.channels) ? item.channels : ['Web']
            }));

            setNotifications(mappedData);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, [token, user?.id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleNotificationClick = async (n: Notification) => {
        setSelectedNotification(n);

        // If it's already read, don't ping the server
        if (!n.isNew) return;

        try {
            // Update Backend
            await axios.post(`${API_BASE_URL}/api/notifications/mark-read`, {
                notification_id: n.id,
                user_id: user?.id
            }, config);

            // Update local state so the "New" badge disappears
            setNotifications(prev => prev.map(notif =>
                notif.id === n.id ? { ...notif, isNew: false } : notif
            ));
        } catch (error) {
            console.error("Error marking specific notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        setMarkingRead(true);
        try {
            await axios.post(`${API_BASE_URL}/api/notifications/mark-all-read`, { user_id: user?.id }, config);
            setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
        } catch (error) {
            console.error("Error marking all as read", error);
        } finally {
            setMarkingRead(false);
        }
    };

    const stats = {
        total: notifications.length,
        unread: notifications.filter(n => n.isNew).length,
        emergencies: notifications.filter(n => n.type === 'Emergency').length
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Fetching your updates...</p>
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto p-8 space-y-8 relative">
            {/* Notification Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start p-6 border-b border-gray-100">
                            <div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase mb-2 inline-block
                                    ${selectedNotification.type === 'Emergency' ? 'bg-red-100 text-red-700 border-red-200' :
                                        selectedNotification.type === 'Benefit' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                    {selectedNotification.type}
                                </span>
                                <h3 className="text-xl font-black uppercase text-gray-900 leading-tight">{selectedNotification.title}</h3>
                            </div>
                            <button onClick={() => setSelectedNotification(null)} className="p-2 hover:bg-gray-100 transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8">
                            <p className="text-gray-700 text-lg leading-relaxed mb-8">
                                {selectedNotification.message}
                            </p>
                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Calendar size={18} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Date Received</span>
                                        <span className="text-sm font-medium">{new Date(selectedNotification.date).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Share2 size={18} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Delivered Via</span>
                                        <span className="text-sm font-medium">{selectedNotification.channels.join(', ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="px-6 py-2 bg-gray-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                            >
                                Close Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                    Notifications & Alerts
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">Welcome back, {user?.firstname || 'Resident'}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Notifications" value={stats.total} subtext="All messages" colorClass="text-gray-800" />
                <StatCard title="Unread" value={stats.unread} subtext="New messages" colorClass="text-blue-600" />
                <StatCard title="Emergency Alerts" value={stats.emergencies} subtext="Priority alerts" colorClass="text-red-600" />
            </div>

            {/* Notifications List Section */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-lg font-bold">Your Feed</h2>
                        <p className="text-gray-500 text-sm">Click any notification to view details</p>
                    </div>
                    <button
                        onClick={markAllAsRead}
                        disabled={markingRead || stats.unread === 0}
                        className="flex items-center gap-2 text-xs font-bold border border-gray-300 px-4 py-2 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-50"
                    >
                        {markingRead ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                        Mark All as Read
                    </button>
                </div>

                <div className="space-y-3">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onClick={() => handleNotificationClick(n)}
                            />
                        ))
                    ) : (
                        <div className="text-center p-12 bg-white border border-dashed border-gray-300">
                            <Bell className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 italic">No notifications yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Preferences Section */}
            <section className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Notification Preferences</h2>
                        <p className="text-gray-500 text-sm">Manage how you receive notifications</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    {[
                        { id: 'sms', label: 'SMS Notifications', sub: 'Receive alerts via SMS' },
                        { id: 'email', label: 'Email Notifications', sub: 'Receive alerts via email' },
                        { id: 'messenger', label: 'Messenger Notifications', sub: 'Receive alerts via Facebook Messenger' },
                        { id: 'web', label: 'Web Notifications', sub: 'Receive browser notifications' },
                    ].map((item) => (
                        <div key={item.id} className="p-4 px-6 flex justify-between items-center group hover:bg-gray-50 transition-colors">
                            <div>
                                <p className="font-bold text-sm text-gray-800">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.sub}</p>
                            </div>
                            <button className="bg-gray-100 text-gray-800 text-[10px] font-bold px-3 py-1 border border-gray-200 uppercase">
                                Enabled
                            </button>
                        </div>
                    ))}
                </div>
            </section>


            <section className="bg-red-50 border border-red-100 p-8">
                <div className="flex items-center gap-2 text-red-700 mb-6">
                    <AlertTriangle size={20} />
                    <h2 className="font-bold uppercase tracking-widest text-sm">Emergency Hotlines</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-red-400 mb-1">Emergency</span>
                        <span className="text-2xl font-black text-red-900">911</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-red-400 mb-1">Barangay Office</span>
                        <span className="text-2xl font-black text-red-900">123-4567</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-red-400 mb-1">Health Center</span>
                        <span className="text-2xl font-black text-red-900">890-1234</span>
                    </div>
                </div>
            </section>
        </main>
    );
}