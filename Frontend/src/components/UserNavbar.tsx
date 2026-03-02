import React, { useState, useEffect } from 'react';
import {
  User, FileText, Gift, History, Bell,
  LogOut, Sun, Type, Volume2, Menu, X,
  Newspaper, Calendar, BookOpen,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  children: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleLogout = () => {
    logout();
    navigate('/Login');
  };

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
    <div className="min-h-screen bg-white font-sans text-black">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white py-2 shadow-sm' : 'bg-white py-4'
        }`}>
        <div className=" mx-auto px-4 md:px-8 flex items-center justify-between">

          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/UserMainPage')}
          >
            <img className="size-10" src="/Logo.png" alt="Logo"></img>
            <div className="hidden md:block">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] leading-none text-[#00308F]">Barangay 183</h3>
              <p className="text-[10px] text-gray-400 font-small uppercase tracking-widest mt-1">Resident Portal</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-5">
            {menuItems.map((item) => (
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

            <button className="relative text-black hover:text-[#FF9800] transition-colors">
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 bg-[#FF9800] text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>
            </button>

            <button
              onClick={() => navigate('/UserProfile')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#00308F] group-hover:text-white transition-all">
                <User size={16} strokeWidth={1.5} />
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-gray-500 hover:text-[#FF9800] transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>

            <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-white z-60 pt-24 px-8 lg:hidden transition-all duration-500 ease-in-out transform overflow-y-auto ${isMenuOpen
        ? 'translate-y-0 opacity-100 visible'
        : '-translate-y-full opacity-0 invisible'
        }`}>
        <div className="grid grid-cols-2 gap-4 pb-32">
          {menuItems.map((item, index) => (
            <button
              key={item.name}
              onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
              style={{ transitionDelay: isMenuOpen ? `${index * 100}ms` : '0ms' }}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                } ${location.pathname === item.path
                  ? 'bg-[#00308F] border-[#00308F] text-white'
                  : 'bg-white border-gray-100 text-gray-600 shadow-sm active:scale-95'
                }`}
            >
              <item.icon size={24} className="mb-2" />
              <span className="text-[10px] font-bold uppercase text-center tracking-wider">{item.name}</span>
            </button>
          ))}

          <button
            onClick={handleLogout}
            style={{ transitionDelay: isMenuOpen ? `${menuItems.length * 100}ms` : '0ms' }}
            className={`col-span-2 flex items-center justify-center gap-2 p-5 rounded-2xl bg-red-50 text-red-500 font-bold uppercase text-xs transition-all transform duration-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </div>

      <main className="pt-18 pb-32 md:pb-12 mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 lg:hidden z-70 px-2 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="flex flex-col items-center gap-1.5 min-w-15"
              >
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[#00308F] text-white scale-110 shadow-md shadow-blue-200' : 'text-gray-400'}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-tighter ${isActive ? 'text-[#00308F]' : 'text-gray-400'}`}>
                  {item.shortName}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col items-center gap-1.5 min-w-15 text-gray-400"
          >
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