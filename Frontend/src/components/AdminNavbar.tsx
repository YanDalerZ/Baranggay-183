import React, { useState, useEffect } from 'react';
import {
  User, FileText, Bell, LogOut, Sun, Type, Volume2, Menu, X,
  LayoutDashboard, // For Dashboard
  Users,           // For Profiles
  ClipboardList,   // For Applications/Ledger
  Map,             // For Risk Mapping
  Megaphone,       // For Emergency Alerts
  Settings,        // For CMS
  Calendar          

} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  children: React.ReactNode;
}

const AdminNavbar: React.FC<NavbarProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/Login');
  };

  // --- UPDATED MENU ITEMS ---
  const menuItems = [
    { name: 'Dashboard', shortName: 'Dash', icon: LayoutDashboard, path: '/AdminDashboard' },
    { name: 'RBI Management', shortName: 'RBI', icon: FileText, path: '/AdminRBIManagement' },
    { name: 'PWD & SC Profiles', shortName: 'Profiles', icon: Users, path: '/AdminPWDSCProfiles' },
    { name: 'Applications', shortName: 'Applications', icon: ClipboardList, path: '/AdminApplicationsManagement' },
    { name: 'Risk Mapping', shortName: 'Map', icon: Map, path: '/AdminRiskMapping' },
    { name: 'Notifications Center', shortName: 'Notify', icon: Users, path: '/AdminNotificationsCenter'},
    { name: 'Alerts', shortName: 'Alerts', icon: Megaphone, path: '/AdminEmergencyAlerts' },
    { name: 'Benefits & Relief', shortName: 'Ledger', icon: ClipboardList, path: '/AdminBenefitsReliefLedger' },
    { name: 'Events', shortName: 'Events', icon: Calendar, path: '/AdminEventsCalendar' },
    { name: 'Content CMS', shortName: 'CMS', icon: Settings, path: '/AdminContentCMS' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* Top Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-white py-2 shadow-sm' : 'bg-white py-4'
      }`}>
        <div className="mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/AdminDashboard')}
          >
            <img className="size-10" src="/Logo.png" alt="Logo" />
            <div className="hidden md:block">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] leading-none text-[#00308F]">Barangay 183</h3>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Administration Portal</p>
            </div>
          </div>

          {/* Desktop Menu - Adjusted font size for fit */}
          <div className="hidden lg:flex items-center gap-4">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`text-[10px] font-bold uppercase tracking-wider hover:text-[#00308F] transition-colors whitespace-nowrap ${
                  location.pathname === item.path ? 'border-b-2 border-[#00308F] pb-1 text-[#00308F]' : 'text-gray-500'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-4 text-gray-400 mr-2">
              <button className="hover:text-[#00308F]"><Sun size={18} strokeWidth={1.5} /></button>
              <button className="hover:text-[#00308F]"><Type size={18} strokeWidth={1.5} /></button>
              <button className="hover:text-[#00308F] transition-colors"><Volume2 size={18} strokeWidth={1.5} /></button>
            </div>

            <button className="relative text-black hover:text-[#FF9800] transition-colors">
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 bg-[#FF9800] text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold underline-none">1</span>
            </button>

            <button
              onClick={() => navigate('/AdminDashboard')}
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

      {/* Mobile Fullscreen Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] pt-24 px-8 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300 overflow-y-auto">
          <div className="flex flex-col gap-6 pb-20">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className={`text-lg font-bold tracking-tight text-left border-b border-gray-50 pb-4 flex justify-between items-center ${
                  location.pathname === item.path ? 'text-[#00308F]' : 'text-gray-800'
                }`}
              >
                {item.name}
                <item.icon className={location.pathname === item.path ? 'text-[#00308F]' : 'text-gray-300'} size={20} />
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="text-[#FF9800] font-black uppercase tracking-widest text-lg mt-4 flex items-center gap-2"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-24 pb-32 md:pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
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
            onClick={handleLogout}
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

export default AdminNavbar;