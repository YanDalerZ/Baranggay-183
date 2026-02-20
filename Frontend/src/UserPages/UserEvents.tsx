import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Heart,
    Package,
    Syringe,
    AlertCircle,
    Cake
} from 'lucide-react';

// --- Types ---
type Category = 'Community Event' | 'Birthday' | 'Health Mission' | 'Relief Distribution' | 'Vaccination' | 'Emergency';

interface EventItem {
    id: number;
    category: Category;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    tags: string[];
}

// --- Mock Data ---
const EVENTS: EventItem[] = [
    {
        id: 1,
        category: 'Community Event',
        title: 'Senior Citizens Day Celebration',
        description: 'Annual celebration for senior citizens with free health check-up',
        date: 'February 15, 2026',
        time: '09:00 AM',
        location: 'Barangay 183 Hall',
        tags: ['Senior Citizen']
    },
    {
        id: 2,
        category: 'Health Mission',
        title: 'Community Health Check-up',
        description: 'Free blood pressure monitoring and diabetes screening',
        date: 'February 18, 2026',
        time: '09:00 AM',
        location: 'Barangay Health Center',
        tags: ['PWD', 'Senior Citizen', 'Both']
    },
    {
        id: 3,
        category: 'Health Mission',
        title: 'Free Medical Mission',
        description: 'Free medical consultation and medicines for PWD and senior citizens',
        date: 'February 20, 2026',
        time: '08:00 AM',
        location: 'Barangay Health Center',
        tags: ['PWD', 'Senior Citizen', 'Both']
    },
    {
        id: 4,
        category: 'Community Event',
        title: 'Flood Preparedness Seminar',
        description: 'Emergency preparedness training for flood-prone areas',
        date: 'February 25, 2026',
        time: '02:00 PM',
        location: 'Barangay 183 Hall',
        tags: ['PWD', 'Senior Citizen', 'Both']
    },
    {
        id: 5,
        category: 'Relief Distribution',
        title: 'Relief Goods Distribution',
        description: 'Monthly relief goods distribution for PWDs and Senior Citizens',
        date: 'February 28, 2026',
        time: '09:00 AM',
        location: 'Barangay 183 Hall',
        tags: ['PWD', 'Senior Citizen', 'Both']
    }
];

const CATEGORIES: { label: Category, icon: React.ReactNode, color: string, bgColor: string, borderColor: string }[] = [
    { label: 'Community Event', icon: <CalendarIcon size={14} />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { label: 'Birthday', icon: <Cake size={14} />, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
    { label: 'Health Mission', icon: <Heart size={14} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    { label: 'Relief Distribution', icon: <Package size={14} />, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { label: 'Vaccination', icon: <Syringe size={14} />, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { label: 'Emergency', icon: <AlertCircle size={14} />, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
];

// --- Sub-Components ---

const CalendarWidget = () => {
    const days = Array.from({ length: 28 }, (_, i) => i + 1);
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="bg-white p-2 sm:p-4 border border-gray-100  shadow-sm w-full mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
                <button className="text-gray-400 hover:text-black p-1"><ChevronLeft size={18} /></button>
                <h3 className="font-bold text-sm">February 2026</h3>
                <button className="text-gray-400 hover:text-black p-1"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDays.map(d => <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                <div className="h-8"></div>
                {days.map(d => (
                    <div key={d} className={`h-8 flex items-center justify-center text-xs  cursor-pointer transition-colors
            ${d === 15 ? 'bg-black text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}
            ${[18, 20, 25, 28].includes(d) ? 'border border-gray-300' : ''}
          `}>
                        {d}
                    </div>
                ))}
            </div>
        </div>
    );
};

const EventCard = ({ event }: { event: EventItem }) => {
    const catInfo = CATEGORIES.find(c => c.label === event.category)!;

    return (
        <div className="bg-white border border-gray-100  p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5  border text-xs font-bold ${catInfo.bgColor} ${catInfo.color} ${catInfo.borderColor}`}>
                        {catInfo.icon} {event.category}
                    </span>
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{event.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{event.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-medium text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-blue-500 shrink-0" />
                            <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-blue-500 shrink-0" />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-blue-500 shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">For:</span>
                        {event.tags.map(tag => (
                            <span key={tag} className="px-3 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold ">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

export default function EventsCalendar() {
    const [activeCategory, setActiveCategory] = useState('All');

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            <div>
                <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] mb-6 tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                    Events Calendar</h2>
                <p className="text-gray-500 text-xs sm:text-sm">Stay informed about community events, health missions, and celebrations</p>
            </div>

            {/* Top Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Select Date Widget */}
                <div className="lg:col-span-4 bg-white p-4 sm:p-6 border border-gray-200 ">
                    <h3 className="text-sm font-bold mb-4 sm:mb-6">Select Date</h3>
                    <CalendarWidget />
                </div>

                {/* Filters */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 ">
                        <h3 className="text-sm font-bold mb-4">Filter by Month & Year</h3>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <select className="bg-white border border-gray-200  px-4 py-2 text-sm w-full sm:w-40 outline-none focus:ring-2 focus:ring-blue-100">
                                <option>February</option>
                            </select>
                            <select className="bg-white border border-gray-200  px-4 py-2 text-sm w-full sm:w-32 outline-none focus:ring-2 focus:ring-blue-100">
                                <option>2026</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 border border-gray-200 ">
                        <h3 className="text-sm font-bold mb-4">Filter by Category</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveCategory('All')}
                                className={`px-4 py-1.5  text-xs font-bold border transition-colors ${activeCategory === 'All' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                All
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.label}
                                    onClick={() => setActiveCategory(cat.label)}
                                    className={`flex items-center gap-2 px-3 py-1.5  text-xs font-bold border transition-colors
                          ${activeCategory === cat.label ? 'bg-gray-100 border-gray-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                        `}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Legend */}
            <section className="bg-white border border-gray-200  p-4 sm:p-6">
                <h3 className="text-sm font-bold mb-4">Event Categories Legend</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {CATEGORIES.map(cat => (
                        <div key={cat.label} className={`flex items-center gap-2 px-3 py-2  border text-[10px] sm:text-[11px] font-bold ${cat.bgColor} ${cat.color} ${cat.borderColor}`}>
                            <span className="shrink-0">{cat.icon}</span>
                            <span className="truncate">{cat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Events List */}
            <section className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold">
                    All Events in February 2026
                    <span className="text-gray-400 font-medium text-xs sm:text-sm ml-2">(5 events)</span>
                </h3>
                <div className="space-y-4">
                    {EVENTS.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </section>
        </main>
    );
}