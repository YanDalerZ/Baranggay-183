import {
    Send,
    MessageSquare,
    Mail,
    Smartphone,
    Globe,
    History,
    BarChart3,
} from 'lucide-react';

const AdminNotificationCenter = () => {

    const channelPerformance = [
        { name: 'SMS', icon: <Smartphone size={16} />, rate: '100%' },
        { name: 'Email', icon: <Mail size={16} />, rate: '95%' },
        { name: 'Messenger', icon: <MessageSquare size={16} />, rate: '98%' },
        { name: 'Web', icon: <Globe size={16} />, rate: '100%' },
    ];

    const history = [
        {
            title: 'Monthly Pension Available',
            desc: 'Your February pension is now ready for claiming.',
            recipients: 2,
            date: '2026-02-01 09:00 AM',
            channels: ['SMS', 'Email', 'Web']
        },
        {
            title: 'Typhoon Warning Signal #2',
            desc: 'Typhoon approaching. Evacuation recommended for flood-prone areas.',
            recipients: 3,
            date: '2026-01-28 06:30 AM',
            channels: ['SMS', 'Email', 'Messenger', 'Web']
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
            {/* Top Navbar */}
            <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                Notifications Center</h2>

            <main>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Send Notification Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white  border border-gray-100 shadow-sm p-6">
                            <header className="mb-6">
                                <h2 className="text-base font-bold text-gray-900">Send Notification</h2>
                                <p className="text-sm text-gray-500">Multi-channel notification gateway</p>
                            </header>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Recipient Group</label>
                                    <select className="w-full bg-gray-50 border-gray-200  py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none">
                                        <option>Select recipient group</option>
                                        <option>All Residents</option>
                                        <option>Senior Citizens</option>
                                        <option>PWDs</option>
                                        <option>Flood-Prone Areas</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notification Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter notification title"
                                        className="w-full bg-gray-50 border-gray-200  py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Message</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Enter your message"
                                        className="w-full bg-gray-50 border-gray-200  py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Notification Channels</label>
                                    <div className="flex flex-wrap gap-6">
                                        {['SMS', 'Email', 'Messenger', 'Web Notification'].map((channel) => (
                                            <label key={channel} className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" className="w-4 h-4  text-blue-600 border-gray-300 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{channel}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-full bg-[#030712] text-white py-3  font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all mt-6 shadow-md active:scale-[0.98]">
                                    <Send size={18} /> Send Notification
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Stats & Performance */}
                    <div className="space-y-6">
                        {/* Delivery Stats Card */}
                        <div className="bg-white  border border-gray-100 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <BarChart3 size={16} className="text-blue-500" /> Delivery Stats
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Sent Today</p>
                                    <p className="text-2xl font-black text-gray-900">3</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Total Recipients</p>
                                    <p className="text-2xl font-black text-gray-900">10</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Delivery Rate</p>
                                    <p className="text-2xl font-black text-green-600">98%</p>
                                </div>
                            </div>
                        </div>

                        {/* Channel Performance Card */}
                        <div className="bg-white  border border-gray-100 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-6">Channel Performance</h3>
                            <div className="space-y-4">
                                {channelPerformance.map((channel) => (
                                    <div key={channel.name} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                                            {channel.icon}
                                            <span className="text-sm font-medium">{channel.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{channel.rate}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Notification History */}
                <section className="bg-white  border border-gray-100 shadow-sm overflow-hidden">
                    <header className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <History size={18} className="text-gray-400" /> Notification History
                        </h2>
                    </header>
                    <div className="divide-y divide-gray-50">
                        {history.map((item, idx) => (
                            <div key={idx} className="p-6 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold  uppercase">Sent</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[11px] font-medium text-gray-400">{item.recipients} recipients</span>
                                            <span className="text-gray-200">•</span>
                                            <span className="text-[11px] font-medium text-gray-400">{item.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 self-start md:self-center">
                                        {item.channels.map(c => (
                                            <span key={c} className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold ">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminNotificationCenter;