import React, { useState, useEffect, JSX } from 'react';
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
    Cake,
    Users,
    RotateCcw
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, type Event } from '../interfaces';
import { useAuth } from '../hooks/useAuth';

// --- Constants & Configuration ---

const CATEGORY_MAP: Record<string, { label: string; icon: JSX.Element; color: string; bgColor: string; borderColor: string; dotColor: string }> = {
    'Health Mission': { label: 'Health Mission', icon: <Heart size={14} />, color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', dotColor: 'bg-red-500' },
    'Relief Distribution': { label: 'Relief Distribution', icon: <Package size={14} />, color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', dotColor: 'bg-blue-500' },
    'Vaccination': { label: 'Vaccination', icon: <Syringe size={14} />, color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200', dotColor: 'bg-green-500' },
    'Community Event': { label: 'Community Event', icon: <AlertCircle size={14} />, color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', dotColor: 'bg-amber-500' },
    'Birthday': { label: 'Birthday', icon: <Cake size={14} />, color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', dotColor: 'bg-purple-500' },
};

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// --- Sub-components ---

const CalendarWidget = ({
    allData,
    viewDate,
    setViewDate,
    selectedDay,
    setSelectedDay
}: {
    allData: Event[],
    viewDate: Date,
    setViewDate: React.Dispatch<React.SetStateAction<Date>>,
    selectedDay: number | null,
    setSelectedDay: (day: number | null) => void
}) => {
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    const totalDays = daysInMonth(currentYear, currentMonth);
    const startDay = firstDayOfMonth(currentYear, currentMonth);
    const dayNodes = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanks = Array.from({ length: startDay });

    const isToday = (day: number) => {
        const now = new Date();
        return day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
    };

    const getEventTypesForDay = (day: number) => {
        const dayEvents = allData.filter(e => {
            const d = new Date(e.event_date);
            return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        return Array.from(new Set(dayEvents.map(e => e.type)));
    };

    return (
        <div className="bg-white p-2 sm:p-4 border border-gray-100 shadow-sm w-full mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
                <button
                    onClick={() => { setViewDate(new Date(currentYear, currentMonth - 1, 1)); setSelectedDay(null); }}
                    className="text-gray-400 hover:text-black p-1"
                >
                    <ChevronLeft size={18} />
                </button>
                <h3 className="font-bold text-sm">{monthName} {currentYear}</h3>
                <button
                    onClick={() => { setViewDate(new Date(currentYear, currentMonth + 1, 1)); setSelectedDay(null); }}
                    className="text-gray-400 hover:text-black p-1"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDays.map(d => <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {blanks.map((_, i) => <div key={`blank-${i}`} className="h-10"></div>)}
                {dayNodes.map(d => {
                    const eventTypes = getEventTypesForDay(d);
                    const isSelected = selectedDay === d;

                    return (
                        <div
                            key={d}
                            onClick={() => setSelectedDay(isSelected ? null : d)}
                            className={`h-10 flex flex-col items-center justify-center text-xs cursor-pointer transition-all relative rounded-sm
                                ${isToday(d) ? 'bg-black text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}
                                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : ''}
                            `}
                        >
                            <span>{d}</span>
                            {/* Dot Indicators */}
                            <div className="flex gap-0.5 mt-0.5 h-1 items-center justify-center">
                                {eventTypes.map(type => (
                                    <div
                                        key={type}
                                        className={`w-5 h-2 rounded-full ${CATEGORY_MAP[type]?.dotColor || 'bg-gray-400'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EventCard = ({ event }: { event: Event }) => {
    const catInfo = CATEGORY_MAP[event.type] || CATEGORY_MAP['Community Event'];

    return (
        <div className="bg-white border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-bold ${catInfo.bgColor} ${catInfo.color} ${catInfo.borderColor}`}>
                        {catInfo.icon} {event.type}
                    </span>
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{event.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{event.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-medium text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-blue-500 shrink-0" />
                            <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-blue-500 shrink-0" />
                            <span>{event.event_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-blue-500 shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Participants: {event.attendees}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function EventsCalendar() {
    const [allData, setAllData] = useState<Event[]>([]);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const { token } = useAuth();

    const fetchData = async () => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [eventsRes, birthdayRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/events`, config),
                axios.get(`${API_BASE_URL}/api/events/birthdays`, config)
            ]);

            const processedBirthdays = birthdayRes.data.map((b: Event) => ({
                ...b,
                type: 'Birthday'
            }));

            setAllData([...eventsRes.data, ...processedBirthdays]);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    // Complex filtering logic
    const filteredResults = allData.filter(item => {
        const eDate = new Date(item.event_date);
        const matchesMonth = eDate.getMonth() === viewDate.getMonth() && eDate.getFullYear() === viewDate.getFullYear();
        const matchesCategory = activeCategory === 'All' || item.type === activeCategory;
        const matchesDay = selectedDay ? eDate.getDate() === selectedDay : true;

        return matchesMonth && matchesCategory && matchesDay;
    });

    const currentMonthName = viewDate.toLocaleString('default', { month: 'long' });
    const currentYear = viewDate.getFullYear();

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        Events Calendar
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm">Stay informed about community events, health missions, and celebrations</p>
                </div>
                {selectedDay && (
                    <button
                        onClick={() => setSelectedDay(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                        <RotateCcw size={14} /> SHOW ALL {currentMonthName.toUpperCase()}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white p-2 sm:p-2 border border-gray-200">
                    <h3 className="text-m font-bold mb-4 sm:mb-6">Select Date to Filter</h3>
                    <CalendarWidget
                        allData={allData}
                        viewDate={viewDate}
                        setViewDate={setViewDate}
                        selectedDay={selectedDay}
                        setSelectedDay={setSelectedDay}
                    />
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-4 sm:p-6 border border-gray-200">
                        <h3 className="text-sm font-bold mb-4">Jump to Month & Year</h3>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <select
                                value={viewDate.getMonth()}
                                onChange={(e) => { setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1)); setSelectedDay(null); }}
                                className="bg-white border border-gray-200 px-4 py-2 text-sm w-full sm:w-40 outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select
                                value={viewDate.getFullYear()}
                                onChange={(e) => { setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1)); setSelectedDay(null); }}
                                className="bg-white border border-gray-200 px-4 py-2 text-sm w-full sm:w-32 outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                                <option value={2027}>2027</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 border border-gray-200">
                        <h3 className="text-sm font-bold mb-4">Filter by Category</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveCategory('All')}
                                className={`px-4 py-1.5 text-xs font-bold border transition-colors ${activeCategory === 'All' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                All
                            </button>
                            {Object.values(CATEGORY_MAP).map(cat => (
                                <button
                                    key={cat.label}
                                    onClick={() => setActiveCategory(cat.label)}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border transition-colors
                                        ${activeCategory === cat.label ? 'bg-gray-100 border-gray-400 text-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                                    `}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-sm font-bold mb-4">Event Categories Legend</h3>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {Object.values(CATEGORY_MAP).map(cat => (
                                <div key={cat.label} className={`flex items-center gap-2 px-3 py-2 border text-[10px] sm:text-[11px] font-bold ${cat.bgColor} ${cat.color} ${cat.borderColor}`}>
                                    <span className={`w-2 h-2 rounded-full ${cat.dotColor}`}></span>
                                    <span className="truncate">{cat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>



            <section className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold">
                    {selectedDay ? `Events on ${currentMonthName} ${selectedDay}, ${currentYear}` : `All Events in ${currentMonthName} ${currentYear}`}
                    <span className="text-gray-400 font-medium text-xs sm:text-sm ml-2">({filteredResults.length} items)</span>
                </h3>
                <div className="space-y-4">
                    {filteredResults.length > 0 ? (
                        filteredResults.map(item => (
                            <EventCard key={item.id} event={item} />
                        ))
                    ) : (
                        <div className="bg-white py-12 text-center border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">No items found for this selection.</p>
                            {selectedDay && (
                                <button onClick={() => setSelectedDay(null)} className="mt-2 text-blue-600 text-xs font-bold hover:underline">
                                    Clear day filter
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}