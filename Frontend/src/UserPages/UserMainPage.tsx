import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, CheckCircle2, X, ChevronRight as ChevronRightIcon } from 'lucide-react';
import '../css/UserMainPage.css';
import { API_BASE_URL, type EventData, type ServiceData } from '../interfaces';
import { useAuth } from '../context/AuthContext';
import ViewGuideModal from './UserComponents/ViewGuide';

import defaultLogo from '/Logo.png';

const UserMainPage: React.FC = () => {
    const { token } = useAuth();
    const [events, setEvents] = useState<EventData[]>([]);
    const [services, setServices] = useState<ServiceData[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    // Modal & Booking States
    const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        purpose: '',
        priority: 'Normal',
        home_visit: false
    });

    const fetchData = useCallback(async () => {
        try {
            if (!token) return;
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };

            const [eventsRes, servicesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/events`, authConfig),
                axios.get(`${API_BASE_URL}/api/serviceguide`, authConfig)
            ]);

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const allUpcoming = eventsRes.data
                .filter((event: any) => new Date(event.event_date) >= now)
                .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

            setEvents(allUpcoming);
            setServices(servicesRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Slider Logic
    const nextSlide = useCallback(() => {
        const slideCount = Math.min(events.length, 4);
        if (slideCount === 0) return;
        setCurrentSlide((prev) => (prev + 1) % slideCount);
        setProgress(0);
    }, [events.length]);

    const prevSlide = () => {
        const slideCount = Math.min(events.length, 4);
        if (slideCount === 0) return;
        setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
        setProgress(0);
    };

    useEffect(() => {
        if (events.length === 0) return;
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    nextSlide();
                    return 0;
                }
                return prev + 0.4;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [nextSlide, events.length]);

    const getEventImage = (event: any) => {
        if (!event || !event.event_bg) return null;
        const bg = event.event_bg;
        if (typeof bg === 'string' && bg.startsWith('data:')) return bg;
        if (typeof bg === 'string' && bg.startsWith('http')) return bg;
        return `data:image/jpeg;base64,${bg}`;
    };

    // Booking Logic applied from UserServiceGuide
    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService || !token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_BASE_URL}/api/appointments`, {
                service_id: selectedService.id,
                service_type: selectedService.title,
                appointment_date: formData.date,
                appointment_time: formData.time,
                purpose: formData.purpose,
                priority: formData.priority,
                home_visit: formData.home_visit
            }, config);

            setIsBookingModalOpen(false);
            setSelectedService(null);
            alert("Appointment booked successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to book appointment");
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const heroSlides = events.slice(0, 4);

    return (
        <div className="user-main-page-scope">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="relative w-full h-[90vh] overflow-hidden bg-white">
                    {heroSlides.length > 0 ? (
                        heroSlides.map((slide, idx) => {
                            const imageUrl = getEventImage(slide);
                            const isDefault = !imageUrl;

                            return (
                                <div
                                    key={slide.id}
                                    className={`${idx === currentSlide ? 'opacity-100' : 'opacity-0'} hero-slide transition-opacity duration-1000 flex items-center`}
                                >
                                    {isDefault ? (
                                        <div className="flex items-center w-full px-12 md:px-24 gap-12">
                                            <img src={defaultLogo} alt="Brgy Logo" className="w-48 h-48 md:w-80 md:h-80 object-contain" />
                                            <div className="flex flex-col">
                                                <h2 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-2">
                                                    {slide.title}
                                                </h2>
                                                <p className="text-2xl md:text-4xl font-bold text-gray-800 uppercase tracking-tight">
                                                    {slide.location}
                                                </p>
                                                <p className="text-lg md:text-xl text-gray-500 font-medium">
                                                    {slide.event_time}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <img
                                                src={imageUrl}
                                                className="hero-bg-image"
                                                style={{
                                                    transform: idx === currentSlide ? 'scale(1.05)' : 'scale(1)',
                                                    width: '100%',
                                                    height: '100%',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    objectFit: 'fill',
                                                    zIndex: 0,
                                                    transition: 'transform 1000ms ease'
                                                }}
                                            />
                                            <div className="hero-content relative z-10 ">
                                                <span className="hero-badge bg-[#00308F]">Upcoming Event</span>
                                                <h2 className="hero-title text-white">{slide.title}</h2>
                                                <p className="hero-desc text-white/90">
                                                    Join us on {new Date(slide.event_date).toLocaleDateString()} at {slide.location}.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No Upcoming Events</div>
                    )}
                </div>

                <div className="slider-nav-container">
                    <button onClick={prevSlide} className="slider-arrow-btn group"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextSlide} className="slider-arrow-btn group"><ChevronRight className="w-5 h-5" /></button>
                </div>
                <div className="progress-bar-bg">
                    <div className="h-full bg-[#FF9800]" style={{ width: `${progress}%` }} />
                </div>
            </section>

            {/* Services Guide */}
            <section id="services" className="section-container bg-gray-50 py-20">
                <div className="section-header mb-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#00308F]">Services Guide</h2>
                        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-3">Requirements & Processes</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {services.map((service) => {
                        const requirements = typeof service.requirements === 'string'
                            ? JSON.parse(service.requirements)
                            : service.requirements;

                        return (
                            <div
                                key={service.id}
                                onClick={() => setSelectedService(service)}
                                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#00308F] transition-all cursor-pointer group shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                        {service.description}
                                    </span>
                                </div>
                                <h3 className="font-black text-xl uppercase mb-6 group-hover:text-[#00308F] transition-colors">
                                    {service.title}
                                </h3>

                                <div className="space-y-3">
                                    <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Initial Requirements:</p>
                                    {requirements?.slice(0, 3).map((req: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                            <span className="line-clamp-1 font-medium">{req}</span>
                                        </div>
                                    ))}
                                    {requirements?.length > 3 && (
                                        <p className="text-xs text-blue-600 font-bold mt-2">+ {requirements.length - 3} more requirements</p>
                                    )}
                                </div>

                                <button className="w-full mt-8 py-3 bg-gray-50 group-hover:bg-[#00308F] group-hover:text-white text-gray-900 text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                                    View Full Guide
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>

            <footer id="about" className="footer-wrapper">
                <div className="max-w-full mx-auto px-4 md:px-6">
                    <div className="footer-grid">
                        <div className="space-y-8">
                            <div className=" text-[#00308F] p-3 leading-none inline-flex flex-col items-center justify-center">
                                <img className="size-30" src="./Logo.png" alt="Logo" />
                                <span className="text-[14px] font-black tracking-tighter uppercase">Barangay</span>
                                <span className="text-[24px] font-black tracking-tighter uppercase">183</span>
                            </div>
                            <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-xs">
                                Official Digital Hub of Barangay 183, Villamor Airbase, Pasay City.
                            </p>
                        </div>

                        <div>
                            <h5 className="footer-heading">Our Barangay</h5>
                            <ul className="footer-link-list">
                                <li><a href="#" className="hover:text-[#00308F] transition-colors">Profile</a></li>
                                <li><a href="#" className="hover:text-[#00308F] transition-colors">Transparency</a></li>
                                <li><a href="#" className="hover:text-[#00308F] transition-colors">Officials</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="footer-heading text-[#FF9800]">Quick Support</h5>
                            <ul className="footer-link-list">
                                <li><a href="#" className="hover:text-[#FF9800] transition-colors">Hotlines</a></li>
                                <li><a href="#" className="hover:text-[#FF9800] transition-colors">Forms</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="footer-heading">Contact</h5>
                            <p className="text-[12px] font-bold text-gray-500 mb-6 uppercase">Brgy 183 Hall, Villamor Airbase, Pasay City</p>
                            <div className="flex space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 border border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#00308F] transition-colors">
                                        <div className="w-3 h-3 bg-gray-300 rounded-sm" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-gray-100 text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] text-center">
                        &copy; 2026 Barangay 183 Community Hub. All Rights Reserved.
                    </div>
                </div>
            </footer>

            {/* View Guide Modal */}
            {selectedService && !isBookingModalOpen && (
                <ViewGuideModal
                    guide={selectedService}
                    onClose={() => setSelectedService(null)}
                    onProceed={() => setIsBookingModalOpen(true)}
                />
            )}

            {/* Appointment Booking Modal (Copied Logic) */}
            {isBookingModalOpen && selectedService && (
                <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden rounded-xl">
                        <div className="bg-[#00308F] p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase -skew-x-12">New Appointment</h3>
                                <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">{selectedService.title}</p>
                            </div>
                            <button onClick={() => { setIsBookingModalOpen(false); setSelectedService(null); }} className="hover:rotate-90 transition-transform"><X /></button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Preferred Date</label>
                                    <input required type="date" className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none"
                                        onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Preferred Time</label>
                                    <input required type="time" className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none"
                                        onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Purpose</label>
                                <textarea required rows={3} className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none"
                                    placeholder="Tell us more..." onChange={e => setFormData({ ...formData, purpose: e.target.value })}></textarea>
                            </div>
                            <div className="flex items-center justify-between py-2 border-y border-gray-50">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 accent-[#00308F]" onChange={e => setFormData({ ...formData, home_visit: e.target.checked })} />
                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Request Home Visit</span>
                                </label>
                                <select className="text-[10px] font-black border-none bg-orange-50 text-orange-700 px-3 py-1 uppercase"
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                    <option value="Normal">Normal Priority</option>
                                    <option value="High Priority">High Priority</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-[#00308F] text-white py-4 font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2">
                                Submit Application <ChevronRightIcon size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMainPage;