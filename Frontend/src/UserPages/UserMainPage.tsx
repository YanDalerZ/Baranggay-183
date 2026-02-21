import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/UserMainPage.css';
import { type SlideData, type ServiceData, type EventData } from '../interfaces';

const SLIDES: SlideData[] = [
    {
        id: 1,
        category: "Pension News",
        title: "Social Pension Distribution.",
        description: "Schedule for the distribution of Social Pension for Senior Citizens starts this Monday at the Hall.",
        image: "https://images.unsplash.com/photo-1573497620053-ea5310f94f17?q=80&w=2070",
        cta: "View Schedule"
    },
    {
        id: 2,
        category: "PWD Program",
        title: "New Digital Literacy.",
        description: "Join our upcoming computer literacy workshop specially designed for our PWD residents.",
        image: "https://images.unsplash.com/photo-1581578731522-aa02efcc3c7b?q=80&w=2070",
        cta: "Register Now"
    }
];

const SERVICES: ServiceData[] = [
    {
        id: 1,
        label: "Required",
        title: "PWD Application",
        description: "Complete guide for medical certification and ID processing.",
        image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1000"
    },
    {
        id: 2,
        label: "Age 60+",
        title: "Senior Citizen ID",
        description: "Registration for benefits, discounts, and medical assistance.",
        image: "https://images.unsplash.com/photo-1516307361668-30058aba9209?q=80&w=1000"
    },
    {
        id: 3,
        label: "Health",
        title: "Medical Assistance",
        description: "Guidelines for financial aid for prescriptions and tests.",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000"
    }
];

const EVENTS: EventData[] = [
    { id: 1, day: "24", month: "Feb", year: "2026", title: "Senior Assembly", time: "8:00 AM", location: "Multi-Purpose Hall", featured: true },
    { id: 2, day: "02", month: "Mar", year: "2026", title: "Health Check-up", time: "9:00 AM", location: "Health Center" },
    { id: 3, day: "15", month: "Mar", year: "2026", title: "PWD Livelihood", time: "1:00 PM", location: "Activity Center" },
    { id: 4, day: "20", month: "Mar", year: "2026", title: "Community Clean-up", time: "6:00 AM", location: "Zone A" }
];

const UserMainPage: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        setProgress(0);
    }, []);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
        setProgress(0);
    };

    useEffect(() => {
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
    }, [nextSlide]);

    return (
        <div className="user-main-page-scope">

            <section className="hero-section">
                <div className="relative w-full h-[90vh]">
                    {SLIDES.map((slide, idx) => (
                        <div
                            key={slide.id}
                            className={`${idx === currentSlide ? 'opacity-100' : 'opacity-0'} hero-slide`}
                        >
                            <div
                                className="hero-bg-image"
                                style={{
                                    backgroundImage: `url(${slide.image})`,
                                    transform: idx === currentSlide ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                            <div className="hero-overlay" />
                            <div className="hero-content">
                                <span className="hero-badge bg-[#00308F]">{slide.category}</span>
                                <h2 className="hero-title">
                                    {slide.title.split('.').map((part, i) => (
                                        part && <React.Fragment key={i}>{part}{i === 0 && <br />}</React.Fragment>
                                    ))}
                                </h2>
                                <p className="hero-desc">{slide.description}</p>
                                {/* Button color updated to Royal Blue */}
                                <button className="hero-btn bg-[#00308F] hover:bg-blue-900">{slide.cta}</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="slider-nav-container">
                    <button onClick={prevSlide} className="slider-arrow-btn group">
                        <ChevronLeft className="w-5 h-5 group-active:scale-90 transition-transform" />
                    </button>
                    <button onClick={nextSlide} className="slider-arrow-btn group">
                        <ChevronRight className="w-5 h-5 group-active:scale-90 transition-transform" />
                    </button>
                </div>

                <div className="progress-bar-bg">
                    {/* Progress bar color updated to Vibrant Orange */}
                    <div className="h-full bg-[#FF9800]" style={{ width: `${progress}%` }} />
                </div>
            </section>

            {/* Services Guide */}
            <section id="services" className="section-container">
                <div className="section-header">
                    <div>
                        {/* Heading color updated to Royal Blue */}
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#00308F]">Services Guide</h2>
                        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-3">Essential Community Support</p>
                    </div>
                    {/* View All hover color updated to Royal Blue */}
                    <button className="text-[12px] font-bold uppercase underline mt-6 md:mt-0 hover:text-[#00308F] transition-colors">
                        View All Programs
                    </button>
                </div>

                <div className="service-grid">
                    {SERVICES.map((item) => (
                        <div key={item.id} className="group cursor-pointer mb-8 md:mb-0">
                            <div className="service-card-img-wrapper">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                {/* Label background updated to Royal Blue */}
                                <div className="service-card-label bg-[#00308F]">{item.label}</div>
                            </div>
                            {/* Card border hover color updated to Vibrant Orange */}
                            <div className="service-card-content group-hover:border-[#FF9800]">
                                <h3 className="font-black text-[20px] uppercase tracking-tight leading-none mb-3">{item.title}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Events Calendar */}
            <section id="events" className="events-section">
                <div className="max-w-full mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-[#00308F]">Upcoming Events</h2>
                        <div className="w-16 h-1 bg-[#FF9800] mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {EVENTS.map((event) => (
                            <div
                                key={event.id}
                                /* Featured border updated to Royal Blue */
                                className={`${event.featured ? 'border-[#00308F]' : 'border-gray-200'} event-card`}
                            >
                                {/* Date number updated to Royal Blue or Orange for featured */}
                                <div className={`${event.featured ? 'text-[#FF9800]' : 'text-[#00308F]'} event-date-number`}>
                                    {event.day}
                                </div>
                                <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6">
                                    {event.month} {event.year}
                                </div>
                                <h4 className="font-black text-[15px] uppercase mb-3 leading-tight tracking-tight">
                                    {event.title}
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{event.time}</p>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">@ {event.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer id="about" className="footer-wrapper">
                <div className="max-w-full mx-auto px-4 md:px-6">
                    <div className="footer-grid">
                        <div className="space-y-8">
                            <div className=" text-[#00308F] p-3 leading-none inline-flex flex-col items-center justify-center">

                                <img className="size-30" src="./Logo.png"></img>
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
            </footer >
        </div >
    );
};

export default UserMainPage;