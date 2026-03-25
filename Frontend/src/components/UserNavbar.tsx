import React, { useState, useEffect, useRef } from 'react';
import {
  User, FileText, Gift, History, Bell,
  LogOut, Sun, Type, Volume2, Menu, X,
  Newspaper, Calendar, BookOpen,
  MoreHorizontal, Plus, Minus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  children: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Accessibility States
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('fontSize') || '16'));
  const [ttsEnabled, setTtsEnabled] = useState(() => localStorage.getItem('ttsEnabled') === 'true');

  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync Accessibility Settings
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      let style = document.getElementById('hc-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'hc-style';
        document.head.appendChild(style);
      }
      style.innerHTML = `
        .high-contrast * { 
          background-color: white !important;
          color: black !important; 
          border-color: black !important;
          text-shadow: none !important;
          box-shadow: none !important;
        }
        .high-contrast svg path, .high-contrast svg circle {
          stroke: black !important;
          fill: none !important;
        }
        .high-contrast button, .high-contrast a, .high-contrast input { 
          outline: 2px solid black !important; 
        }
        .high-contrast .bg-\[\#00308F\], .high-contrast .bg-orange-500 {
           background-color: black !important;
           color: white !important;
        }
      `;
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.getElementById('hc-style')?.remove();
    }
    localStorage.setItem('highContrast', highContrast.toString());
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize.toString());
    localStorage.setItem('ttsEnabled', ttsEnabled.toString());
  }, [highContrast, fontSize, ttsEnabled]);

  // --- REFINED TTS LOGIC ---
  // Using event delegation to capture text from any hovered element
  const handleGlobalMouseOver = (e: React.MouseEvent) => {
    if (!ttsEnabled) return;

    const target = e.target as HTMLElement;
    // Get text but ignore very long blocks or empty containers
    const text = target.innerText?.trim();

    if (text && text.length > 0 && text.length < 300) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGlobalMouseOut = () => {
    if (ttsEnabled) window.speechSynthesis.cancel();
  };

  const handleLogout = () => {
    logout();
    navigate('/Login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { name: 'Home', shortName: 'Home', icon: Newspaper, path: '/UserMainPage' },
    { name: 'Apply for Services', shortName: 'Apply', icon: FileText, path: '/UserApply' },
    { name: 'My Benefits', shortName: 'Benefits', icon: Gift, path: '/UserBenefits' },
    { name: 'Alerts', shortName: 'Alerts', icon: Bell, path: '/UserAlerts' },
    { name: 'Events Calendar', shortName: 'Events', icon: Calendar, path: '/UserEvents' },
    { name: 'Appointment', shortName: 'Appointment', icon: History, path: '/UserAppointments' },
    { name: 'Services Guide', shortName: 'Guide', icon: BookOpen, path: '/UserGuide' },
  ];

  return (
    <div
      className="min-h-screen bg-white font-sans text-black"
      onMouseOver={handleGlobalMouseOver}
      onMouseOut={handleGlobalMouseOut}
    >
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white py-2 shadow-sm' : 'bg-white py-4'}`}>
        <div className="mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/UserMainPage')}>
            <img className="size-10" src="/Logo.png" alt="Logo" />
            <div className="hidden md:block">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] leading-none text-[#00308F]">Barangay 183</h3>
              <p className="text-[10px] text-gray-400 font-small uppercase tracking-widest mt-1">Resident Portal</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-5">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`text-[11px] font-bold uppercase tracking-widest hover:text-[#00308F] transition-colors ${location.pathname === item.path ? 'border-b-2 border-[#00308F] pb-1 text-[#00308F]' : 'text-gray-500'}`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-5">
            {/* Desktop Accessibility Buttons */}
            <div className="hidden md:flex items-center gap-4 text-gray-400 mr-4">
              <button onClick={() => setHighContrast(!highContrast)} className={`transition-colors ${highContrast ? 'text-black' : 'hover:text-[#00308F]'}`}>
                <Sun size={18} strokeWidth={1.5} />
              </button>

              <div className="relative" ref={typeDropdownRef}>
                <button onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)} className="hover:text-[#00308F]">
                  <Type size={18} strokeWidth={1.5} />
                </button>
                {isTypeDropdownOpen && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-100 shadow-xl rounded-xl p-2 flex flex-col gap-2 z-[60]">
                    <button onClick={() => setFontSize(prev => Math.min(prev + 1, 24))} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 flex items-center gap-2">
                      <Plus size={14} /> <span className="text-[10px] font-bold">Increase</span>
                    </button>
                    <button onClick={() => setFontSize(prev => Math.max(prev - 1, 12))} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 flex items-center gap-2 border-t">
                      <Minus size={14} /> <span className="text-[10px] font-bold">Decrease</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => { if (ttsEnabled) window.speechSynthesis.cancel(); setTtsEnabled(!ttsEnabled); }}
                className={`transition-colors ${ttsEnabled ? 'text-[#FF9800]' : 'hover:text-[#00308F]'}`}
              >
                <Volume2 size={18} strokeWidth={1.5} />
              </button>
            </div>

            <button className="relative text-black hover:text-[#FF9800]">
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 bg-[#FF9800] text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>
            </button>

            <button onClick={() => navigate('/UserProfile')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#00308F] hover:text-white transition-all">
              <User size={16} strokeWidth={1.5} />
            </button>

            <button onClick={handleLogout} className="hidden md:block text-gray-500 hover:text-[#FF9800]">
              <LogOut size={18} strokeWidth={1.5} />
            </button>

            <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu */}
      <div className={`fixed inset-0 bg-white z-60 pt-24 px-8 lg:hidden transition-all duration-500 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 invisible'}`}>
        <div className="grid grid-cols-2 gap-4 pb-10">
          {/* Mobile Accessibility Controls */}
          <div className="col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-2">
            <button onClick={() => setHighContrast(!highContrast)} className={`p-3 rounded-xl ${highContrast ? 'bg-black text-white' : 'bg-white border text-gray-600'}`}>
              <Sun size={20} />
            </button>
            <div className="flex border rounded-xl bg-white overflow-hidden">
              <button onClick={() => setFontSize(f => Math.max(f - 1, 12))} className="p-3 hover:bg-gray-50 text-gray-600"><Minus size={20} /></button>
              <div className="flex items-center px-4 font-bold text-xs border-x">Size</div>
              <button onClick={() => setFontSize(f => Math.min(f + 1, 24))} className="p-3 hover:bg-gray-50 text-gray-600"><Plus size={20} /></button>
            </div>
            <button onClick={() => setTtsEnabled(!ttsEnabled)} className={`p-3 rounded-xl ${ttsEnabled ? 'bg-[#FF9800] text-white' : 'bg-white border text-gray-600'}`}>
              <Volume2 size={20} />
            </button>
          </div>

          {menuItems.map((item, index) => (
            <button
              key={item.name}
              onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${location.pathname === item.path ? 'bg-[#00308F] text-white' : 'bg-white text-gray-600'}`}
            >
              <item.icon size={24} className="mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </button>
          ))}

          <button onClick={handleLogout} className="col-span-2 flex items-center justify-center gap-2 p-5 rounded-2xl bg-red-50 text-red-500 font-bold uppercase text-xs">
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </div>

      <main className="pt-18 pb-32 md:pb-12 mx-auto">
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 lg:hidden z-70 px-2 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.name} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="flex flex-col items-center gap-1.5 min-w-15">
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[#00308F] text-white scale-110' : 'text-gray-400'}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-tighter ${isActive ? 'text-[#00308F]' : 'text-gray-400'}`}>{item.shortName}</span>
              </button>
            );
          })}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex flex-col items-center gap-1.5 min-w-15 text-gray-400">
            <div className={`p-2 rounded-xl transition-all ${isMenuOpen ? 'bg-orange-500 text-white' : 'bg-gray-50'}`}>
              {isMenuOpen ? <X size={20} /> : <MoreHorizontal size={20} />}
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tighter">{isMenuOpen ? 'Hide' : 'More'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;