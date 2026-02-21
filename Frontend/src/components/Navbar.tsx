import React, { useState } from 'react';
import { 
  User, FileText, Gift, Box, Bell, Calendar, BookOpen, ClipboardList,
  LogOut, Sun, Type, Volume2, Menu, ChevronLeft 
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
    { name: 'My Profile', shortName: 'Profile', icon: User, path: '/UserProfile' },
    { name: 'Apply for Services', shortName: 'Apply', icon: FileText, path: '/UserApplyServices' },
    { name: 'My Benefits', shortName: 'Benefits', icon: Gift, path: '/Benefits' },
    { name: 'Claims History', shortName: 'History', icon: Box, path: '/History' },
    { name: 'Alerts & Notifications', shortName: 'Alerts', icon: Bell, path: '/Alerts' },
    { name: 'Events Calendar', shortName: 'Events', icon: Calendar, path: '/Events' },
    { name: 'Services Guide', shortName: 'Guide', icon: BookOpen, path: '/UserServiceGuide' },
    { name: 'Appointments', shortName: 'Appts', icon: ClipboardList, path: '/UserAppointments' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f1f5f9] font-sans">
      
      {/* DESKTOP SIDEBAR */}
      <aside 
        className={`hidden md:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-gray-200 sticky top-0 h-screen flex-col transition-all duration-300 ease-in-out z-20`}
      >
        <div className="p-6 flex items-center justify-between relative">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-lg">B183</div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-gray-900">Barangay 183</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Resident Portal</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black mx-auto">B183</div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 absolute -right-3 top-12 bg-white border border-gray-200 shadow-sm z-30"
          >
            <img className="size-10" src="/Logo.png"></img>
            <div className="hidden md:block">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] leading-none text-[#00308F]">Barangay 183</h3>
              <p className="text-[10px] text-gray-400 font-small uppercase tracking-widest mt-1">Resident Portal</p>
            </div>
          </div>

        <nav className="flex-1 px-4 py-4 space-y-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`text-[11px] font-bold uppercase tracking-widest hover:text-[#00308F] transition-colors ${location.pathname === item.path ? 'border-b-2 border-[#00308F] pb-1 text-[#00308F]' : 'text-gray-500'
                  }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t">
          <button onClick={() => navigate('/Login')} className="w-full flex items-center gap-3 px-3 py-3 text-gray-500 font-bold hover:text-red-500 rounded-xl transition-colors">
            <LogOut size={20} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden pb-20 md:pb-0">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">B183</div>
             <h2 className="font-bold text-gray-800 text-base">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden lg:flex items-center gap-4 text-[13px] font-bold text-gray-500">
              <button className="hover:text-blue-600 flex items-center gap-1.5"><Sun size={16} /> High Contrast</button>
              <button className="hover:text-blue-600 flex items-center gap-1.5"><Type size={16} /> 100%</button>
              <button className="text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1.5"><Volume2 size={16} /> SR Enabled</button>
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

        {/* MOBILE BOTTOM NAVIGATION (Modified to show all items) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex overflow-x-auto no-scrollbar items-center px-4 py-3 gap-6">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 min-w-[60px] transition-all shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase whitespace-nowrap">{item.shortName}</span>
                  {isActive && <div className="w-1 h-1 bg-blue-600 rounded-full" />}
                </button>
              );
            })}
            {/* Exit Button at the end of scroll */}
            <button 
              onClick={() => navigate('/Login')} 
              className="flex flex-col items-center gap-1 min-w-[60px] text-gray-400 shrink-0"
            >
              <LogOut size={22} />
              <span className="text-[10px] font-bold uppercase">Exit</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;