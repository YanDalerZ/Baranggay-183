import React, { useState, useEffect, useCallback } from 'react';
import { Search, Menu, X, ChevronLeft, ChevronRight, HelpCircle, MapPin, Globe } from 'lucide-react';

// --- Types ---

interface SlideData {
    id: number;
    category: string;
    title: string;
    description: string;
    image: string;
    cta: string;
}

interface ServiceData {
    id: number;
    label: string;
    title: string;
    description: string;
    image: string;
}

interface EventData {
    id: number;
    day: string;
    month: string;
    year: string;
    title: string;
    time: string;
    location: string;
    featured?: boolean;
}

// --- Mock Data ---

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

// --- Sub-Component: UserMainPage ---
// This represents the main portal view as requested

const UserMainPage: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="min-h-screen bg-white text-black font-sans selection:bg-red-100">

            {/* Top Utility Bar */}
            <div className="hidden md:flex justify-end px-6 py-2 space-x-6 text-[11px] font-bold border-b border-gray-100 uppercase tracking-widest text-gray-400">
                <a href="#" className="flex items-center hover:text-black"><HelpCircle className="w-3 h-3 mr-1" /> Help</a>
                <a href="#" className="flex items-center hover:text-black"><MapPin className="w-3 h-3 mr-1" /> Brgy Hall</a>
                <a href="#" className="flex items-center hover:text-black"><Globe className="w-3 h-3 mr-1" /> PH / Tagalog</a>
            </div>

            {/* Main Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-6 h-16 md:h-20">
                    <div className="flex items-center space-x-10">
                        <div className="bg-[#ff0000] text-white p-2 md:p-3 leading-none flex flex-col items-center justify-center cursor-pointer">
                            <span className="text-[10px] md:text-[13px] font-black tracking-tighter uppercase">Barangay</span>
                            <span className="text-[18px] md:text-[22px] font-black tracking-tighter uppercase">183</span>
                        </div>

                        <nav className="hidden lg:flex space-x-10 font-bold text-[13px] uppercase tracking-[0.15em]">
                            <a href="#services" className="hover:border-b-2 border-black pb-1 transition-all">Services</a>
                            <a href="#events" className="hover:border-b-2 border-black pb-1 text-red-600 transition-all">Events</a>
                            <a href="#about" className="hover:border-b-2 border-black pb-1 transition-all">About</a>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center border-b border-black py-1">
                            <input
                                type="text"
                                placeholder="Search Programs"
                                className="text-[11px] uppercase outline-none w-32 lg:w-48 placeholder:text-gray-300"
                            />
                            <Search className="w-4 h-4 text-black" />
                        </div>
                        <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl py-6 px-6 flex flex-col space-y-4 font-bold text-sm uppercase tracking-widest">
                        <a href="#services" onClick={() => setIsMenuOpen(false)}>Services</a>
                        <a href="#events" onClick={() => setIsMenuOpen(false)} className="text-red-600">Events</a>
                        <a href="#about" onClick={() => setIsMenuOpen(false)}>About Us</a>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative w-full overflow-hidden bg-black aspect-[4/5] md:aspect-video">
                <div className="relative w-full h-full">
                    {SLIDES.map((slide, idx) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear"
                                style={{
                                    backgroundImage: `url(${slide.image})`,
                                    transform: idx === currentSlide ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 md:bg-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/20" />
                            <div className="relative h-full flex flex-col justify-end p-6 md:p-16 text-white max-w-3xl">
                                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase w-fit mb-4 tracking-widest">
                                    {slide.category}
                                </span>
                                <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] mb-6 tracking-tighter italic">
                                    {slide.title.split('.').map((part, i) => (part && <React.Fragment key={i}>{part}{i === 0 && <br />}</React.Fragment>))}
                                </h2>
                                <p className="text-sm md:text-lg mb-8 opacity-90 font-medium max-w-lg leading-relaxed">
                                    {slide.description}
                                </p>
                                <button className="bg-white text-black text-[12px] font-black uppercase py-4 px-12 w-fit hover:bg-gray-200 transition-colors shadow-lg">
                                    {slide.cta}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-10 right-6 md:right-16 flex space-x-1 z-20">
                    <button onClick={prevSlide} className="bg-white/90 p-4 md:p-5 hover:bg-white transition-colors group">
                        <ChevronLeft className="w-5 h-5 group-active:scale-90 transition-transform" />
                    </button>
                    <button onClick={nextSlide} className="bg-white/90 p-4 md:p-5 hover:bg-white transition-colors group">
                        <ChevronRight className="w-5 h-5 group-active:scale-90 transition-transform" />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20 z-30">
                    <div className="h-full bg-red-600" style={{ width: `${progress}%` }} />
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="max-w-[1440px] mx-auto px-4 md:px-6 py-16 md:py-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-100 pb-8">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Services Guide</h2>
                        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-3">Essential Community Support</p>
                    </div>
                    <button className="text-[12px] font-bold uppercase underline mt-6 md:mt-0 hover:text-red-600 transition-colors">
                        View All Programs
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
                    {SERVICES.map((item) => (
                        <div key={item.id} className="group cursor-pointer mb-8 md:mb-0">
                            <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute top-4 left-4 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                    {item.label}
                                </div>
                            </div>
                            <div className="py-6 border-b-2 border-transparent group-hover:border-red-600 transition-all duration-500">
                                <h3 className="font-black text-[20px] uppercase tracking-tight leading-none mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Events Calendar Section */}
            <section id="events" className="bg-[#f4f4f4] py-20 md:py-32">
                <div className="max-w-[1440px] mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Upcoming Events</h2>
                        <div className="w-16 h-1 bg-red-600 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {EVENTS.map((event) => (
                            <div
                                key={event.id}
                                className={`bg-white p-8 transition-all hover:shadow-2xl hover:-translate-y-1 border-t-4 ${event.featured ? 'border-red-600' : 'border-gray-200'}`}
                            >
                                <div className={`font-black text-4xl mb-1 ${event.featured ? 'text-red-600' : 'text-black'}`}>
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

            {/* Footer */}
            <footer id="about" className="bg-white border-t border-gray-200 pt-20 pb-12">
                <div className="max-w-[1440px] mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-20">
                        <div className="space-y-8">
                            <div className="bg-[#ff0000] text-white p-3 leading-none inline-flex flex-col items-center justify-center">
                                <span className="text-[14px] font-black tracking-tighter uppercase">Barangay</span>
                                <span className="text-[24px] font-black tracking-tighter uppercase">183</span>
                            </div>
                            <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-xs">
                                Official Digital Hub of Barangay 183, Villamor Airbase, Pasay City.
                            </p>
                        </div>

                        <div>
                            <h5 className="font-black text-[12px] uppercase mb-8 tracking-[0.2em]">Our Barangay</h5>
                            <ul className="text-[12px] space-y-4 font-bold text-gray-400 uppercase">
                                <li><a href="#" className="hover:text-black transition-colors">Profile</a></li>
                                <li><a href="#" className="hover:text-black transition-colors">Transparency</a></li>
                                <li><a href="#" className="hover:text-black transition-colors">Officials</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-black text-[12px] uppercase mb-8 tracking-[0.2em] text-red-600">Quick Support</h5>
                            <ul className="text-[12px] space-y-4 font-bold text-gray-400 uppercase">
                                <li><a href="#" className="hover:text-red-600 transition-colors">Hotlines</a></li>
                                <li><a href="#" className="hover:text-red-600 transition-colors">Forms</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-black text-[12px] uppercase mb-8 tracking-[0.2em]">Contact</h5>
                            <p className="text-[12px] font-bold text-gray-500 mb-6 uppercase">Brgy 183 Hall, Villamor Airbase, Pasay City</p>
                            <div className="flex space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 border border-gray-200 flex items-center justify-center cursor-pointer">
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
        </div>
    );
};

// --- Main App Entry ---

const App: React.FC = () => {
    // Simulating a simple router where / (default) points to UserMainPage
    const [currentPath, setCurrentPath] = useState('/');

    useEffect(() => {
        // Handle hash or path changes if needed
        const handleLocationChange = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    // Simple routing logic: only UserMainPage is available on /
    const renderContent = () => {
        switch (currentPath) {
            case '/':
            default:
                return <UserMainPage />;
        }
    };

    return (
        <div className="app-container">
            {renderContent()}
        </div>
    );
};

export default App;