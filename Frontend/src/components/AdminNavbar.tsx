import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, FileText, Bell, LogOut, Sun, Menu, X,
  Home, Users, Gift, AlertTriangle,
  Calendar, ClipboardCheck, MoreHorizontal
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  children: React.ReactNode;
}

const AdminNavbar: React.FC<NavbarProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { name: 'Dashboard', shortName: 'Dash', icon: Home, path: '/AdminDashboard' },
    { name: 'RBI Management', shortName: 'RBI', icon: Users, path: '/AdminRBIManagement' },
    { name: 'Applications', shortName: 'Apps', icon: ClipboardCheck, path: '/AdminApplicationsManagement' },
    //{ name: 'Risk Mapping', shortName: 'Map', icon: MapPin, path: '/AdminRiskMapping' },
    { name: 'Notifications Center', shortName: 'Notify', icon: Bell, path: '/AdminNotificationsCenter' },
    { name: 'Alerts and Risk Mapping', shortName: 'Alerts', icon: AlertTriangle, path: '/AdminEmergencyAlerts' },
    { name: 'Benefits & Relief', shortName: 'Ledger', icon: Gift, path: '/AdminBenefitsReliefLedger' },
    { name: 'Events', shortName: 'Events', icon: Calendar, path: '/AdminEventsCalendar' },
    { name: 'Content CMS', shortName: 'CMS', icon: FileText, path: '/AdminContentCMS' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-black">

      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 fixed h-screen z-70 ${isCollapsed ? 'w-20' : 'w-72'
          }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-50">
          <div
            className={`flex items-center gap-3 cursor-pointer transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}
            onClick={() => navigate('/AdminDashboard')}
          >
            <img className="size-8 shrink-0" src="/Logo.png" alt="Logo" />
            <div className="whitespace-nowrap">
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-[#00308F]">Barangay 183</h3>
              <p className="text-[9px] text-gray-400 font-medium uppercase">Admin Portal</p>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 ${isCollapsed ? 'mx-auto' : ''}`}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-6 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group ${isActive
                  ? 'bg-[#00308F] text-white shadow-lg shadow-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#00308F]'
                  }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className="shrink-0" />
                {!isCollapsed && (
                  <span className="text-[11px] font-bold uppercase tracking-wide truncate animate-in fade-in slide-in-from-left-2">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* --- SIDEBAR FOOTER (USER DISPLAY) --- */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#00308F]">
                <UserIcon size={16} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold uppercase text-gray-700 truncate">
                  {user ? `${user.firstname} ${user.lastname}` : 'Loading...'}
                </span>
                <span className="text-[8px] font-medium text-gray-400 uppercase tracking-tighter">
                  Administrator
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-[11px] font-bold uppercase tracking-wide">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* --- TOP NAVBAR (Mobile/Tablet Only) --- */}
      <nav className={`lg:hidden fixed top-0 w-full z-50 transition-all duration-300 border-b bg-white ${scrolled ? 'py-2 shadow-md' : 'py-4'
        }`}>
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={() => navigate('/AdminDashboard')}>
            <img className="size-8" src="/Logo.png" alt="Logo" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00308F]">Barangay 183</h3>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400"><Sun size={18} /></button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-white z-60 pt-24 px-8 lg:hidden transition-all duration-500 ease-in-out transform overflow-y-auto ${isMenuOpen
        ? 'translate-y-0 opacity-100 visible'
        : '-translate-y-full opacity-0 invisible'
        }`}>
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
          <div className="w-12 h-12 rounded-full bg-[#00308F] flex items-center justify-center text-white">
            <UserIcon size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{user?.firstname} {user?.lastname}</h4>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
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

      {/* --- MAIN CONTENT AREA --- */}
      <main
        className={`flex-1 transition-all duration-300 min-h-screen pt-24 lg:pt-10 pb-32 lg:pb-10 px-4 md:px-12 ${!isCollapsed ? 'lg:ml-72' : 'lg:ml-20'
          }`}
      >
        <div className="max-w-350 mx-auto">
          {children}
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION (Mobile/Tablet Only) --- */}
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

export default AdminNavbar;