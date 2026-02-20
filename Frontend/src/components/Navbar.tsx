import React, { useState, useEffect } from 'react';
import {
  User, FileText, Gift, History, Bell,
  LogOut, Sun, Type, Volume2, Menu, X,
  Newspaper
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  children: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Home', shortName: 'Home', icon: Newspaper, path: '/UserMainPage' },
    { name: 'Apply for Services', shortName: 'Apply', icon: FileText, path: '/UserApply' },
    { name: 'My Benefits', shortName: 'Benefits', icon: Gift, path: '/UserBenefits' },
    { name: 'Alerts', shortName: 'Alerts', icon: Bell, path: '/UserAlerts' },
    { name: 'Events Calendar', shortName: 'Events', icon: Bell, path: '/UserEvents' },
    { name: 'History', shortName: 'History', icon: History, path: '/UserHistory' },
    { name: 'Appointment', shortName: 'Appointment', icon: History, path: '/UserAppointment' },
    { name: 'Services Guide', shortName: 'Guide', icon: Bell, path: '/UserGuide' },

  ];

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white py-2 shadow-sm' : 'bg-white py-4'
        }`}>
        <div className=" mx-auto px-4 md:px-8 flex items-center justify-between">

          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/UserMainPage')}
          >
            <img className="size-10" src="/Logo.png"></img>
            <div className="hidden md:block">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] leading-none text-[#00308F]">Barangay 183</h3>
              <p className="text-[10px] text-gray-400 font-small uppercase tracking-widest mt-1">Resident Portal</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-5">
            {menuItems.slice(0, 10).map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`text-[11px] font-bold uppercase tracking-widest hover:text-[#00308F] transition-colors ${location.pathname === item.path ? 'border-b-2 border-[#00308F] pb-1 text-[#00308F]' : 'text-gray-500'
                  }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-4 text-gray-400 mr-4">
              <button className="hover:text-[#00308F]"><Sun size={18} strokeWidth={1.5} /></button>
              <button className="hover:text-[#00308F]"><Type size={18} strokeWidth={1.5} /></button>
              <button className="hover:text-[#00308F] transition-colors"><Volume2 size={18} strokeWidth={1.5} /></button>
            </div>

            {/* Notification bell hover and badge color changed to Orange */}
            <button className="relative text-black hover:text-[#FF9800] transition-colors">
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 bg-[#FF9800] text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>
            </button>

            <button
              onClick={() => navigate('/UserProfile')}
              className="flex items-center gap-2 group"
            >
              {/* Profile circle hover color changed to Royal Blue */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#00308F] group-hover:text-white transition-all">
                <User size={16} strokeWidth={1.5} />
              </div>
            </button>

            <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] pt-24 px-8 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-8">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="text-2xl font-bold tracking-tighter text-left border-b border-gray-100 pb-4 flex justify-between items-center"
              >
                {item.name}
                <item.icon className="text-gray-300" />
              </button>
            ))}
            <button
              onClick={() => navigate('/Login')}
              /* Sign out changed to Orange */
              className="text-[#FF9800] font-bold uppercase tracking-widest text-sm mt-4"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <main className="pt-18 pb-32 md:pb-12 mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 lg:hidden z-50 px-2 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 min-w-[64px]"
              >
                {/* Mobile active state background changed to Royal Blue tint and text to Royal Blue */}
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#00308F]/10 text-[#00308F]' : 'text-gray-400'}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'text-[#00308F]' : 'text-gray-400'}`}>
                  {item.shortName}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('/Login')}
            className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400"
          >
            <div className="p-1.5">
              <LogOut size={20} strokeWidth={1.5} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Exit</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;