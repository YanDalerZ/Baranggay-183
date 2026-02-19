import { Bell, AlertTriangle, Gift, CheckCircle, } from 'lucide-react';

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

const notifications: Notification[] = [
    {
        id: 1,
        title: "ID Expiration Reminder",
        isNew: true,
        type: "Warning",
        message: "Your PWD ID will expire on March 15, 2026. Please renew at the barangay office.",
        date: "2026-02-08",
        channels: ["SMS", "Email", "Web"]
    },
    {
        id: 2,
        title: "Flood Alert - Critical Severity",
        isNew: true,
        type: "Emergency",
        message: "CRITICAL FLOOD WARNING: Heavy rains expected. Immediate evacuation required for all flood-prone areas. Emergency hotline: 911",
        date: "2026-02-03",
        channels: ["SMS", "Web"]
    },
    {
        id: 3,
        title: "Monthly Pension Available",
        isNew: false,
        type: "Benefit",
        message: "Your February pension is now available for claiming at the barangay office.",
        date: "2026-02-01",
        channels: ["SMS", "Email", "Messenger", "Web"]
    },
    {
        id: 4,
        title: "Typhoon Warning",
        isNew: false,
        type: "Emergency",
        message: "Typhoon Signal #2 has been raised. Please prepare and stay safe. Relief goods are available at the evacuation center.",
        date: "2026-01-28",
        channels: ["SMS", "Email", "Messenger", "Web"]
    },
    {
        id: 5,
        title: "Typhoon Alert - High Severity",
        isNew: true,
        type: "Emergency",
        message: "Typhoon Signal #2 has been raised. Residents in flood-prone areas are advised to evacuate. Relief goods available at the evacuation center.",
        date: "2026-01-28",
        channels: ["SMS", "Email", "Messenger", "Web"]
    }
];

// --- Components ---

const StatCard = ({ title, value, subtext, colorClass }: { title: string, value: string | number, subtext: string, colorClass: string }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
        <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
        <div>
            <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{subtext}</p>
        </div>
    </div>
);

const NotificationItem = ({ notification }: { notification: Notification }) => {
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
        }
    };

    const isHighlighted = notification.isNew && notification.type === 'Emergency' || notification.type === 'Warning' && notification.isNew;

    return (
        <div className={`p-5 border rounded-lg transition-colors ${isHighlighted ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
            <div className="flex gap-4">
                <div className={`p-2 rounded-lg h-fit ${isHighlighted ? 'bg-white' : 'bg-gray-50'}`}>
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{notification.title}</h4>
                        {notification.isNew && (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
                        )}
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase inline-block mb-3 ${getBadgeStyles()}`}>
                        {notification.type}
                    </span>
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">{notification.message}</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>{notification.date}</span>
                        <div className="flex items-center gap-2">
                            <span>Sent via:</span>
                            {notification.channels.map(channel => (
                                <span key={channel} className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600 font-medium">
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

    return (



        <main className="max-w-7xl mx-auto p-8 space-y-8">

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Notifications" value={5} subtext="All messages" colorClass="text-gray-800" />
                <StatCard title="Unread" value={3} subtext="New messages" colorClass="text-blue-600" />
                <StatCard title="Emergency Alerts" value={3} subtext="Priority alerts" colorClass="text-red-600" />
            </div>

            {/* Notifications List Section */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-lg font-bold">Notifications & Alerts</h2>
                        <p className="text-gray-500 text-sm">Stay updated with important information</p>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-50 shadow-sm">
                        <CheckCircle size={14} /> Mark All as Read
                    </button>
                </div>

                <div className="space-y-3">
                    {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
            </section>

            {/* Preferences Section */}
            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold">Notification Preferences</h2>
                    <p className="text-gray-500 text-sm">Manage how you receive notifications</p>
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
                            <button className="bg-gray-100 text-gray-800 text-[10px] font-bold px-3 py-1 rounded border border-gray-200 uppercase">
                                Enabled
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Emergency Contacts Footer */}
            <section className="bg-red-50 border border-red-100 rounded-xl p-8">
                <div className="flex items-center gap-2 text-red-700 mb-6">
                    <AlertTriangle size={20} />
                    <h2 className="font-bold">Emergency Contacts</h2>
                </div>
                <div className="space-y-3 max-w-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-red-800 font-bold text-sm underline decoration-red-300 decoration-1 underline-offset-4">Barangay Emergency Hotline:</span>
                        <span className="font-bold text-red-900">911</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-red-800 font-bold text-sm underline decoration-red-300 decoration-1 underline-offset-4">Barangay Office:</span>
                        <span className="font-bold text-red-900">(02) 1234-5678</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-red-800 font-bold text-sm underline decoration-red-300 decoration-1 underline-offset-4">Health Center:</span>
                        <span className="font-bold text-red-900">(02) 1234-5679</span>
                    </div>
                </div>
            </section>
        </main>
    );
}