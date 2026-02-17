import React, { useState } from 'react';
import { 
  User, FileText, Gift, History, Bell,
   LogOut, Sun, Type, Volume2, Menu, ChevronLeft 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  children: React.ReactNode;
  pageTitle: string;
}

const Navbar: React.FC<NavbarProps> = ({ children, pageTitle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Profile', shortName: 'Profile', icon: User, path: '/MainPage' },
    { name: 'Apply for Services', shortName: 'Apply', icon: FileText, path: '/Apply' },
    { name: 'My Benefits', shortName: 'Benefits', icon: Gift, path: '/Benefits' },
    { name: 'Alerts', shortName: 'Alerts', icon: Bell, path: '/Alerts' },
    // These extra items will show in the sidebar but might be hidden in a 4-item bottom bar
    { name: 'History', shortName: 'History', icon: History, path: '/History' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f1f5f9] font-sans">
      
      {/* DESKTOP SIDEBAR (Visible only on md and up) */}
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
            {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all group relative ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} strokeWidth={2.5} className="flex-shrink-0" />
                {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">{item.name}</span>}
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
        
        {/* TOP NAVBAR (Adjusted for Mobile) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">B183</div>
             <h2 className="font-bold text-gray-800 text-base">{pageTitle}</h2>
          </div>
          <h2 className="hidden md:block font-bold text-gray-800 text-lg">{pageTitle}</h2>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden lg:flex items-center gap-4 text-[13px] font-bold text-gray-500">
              <button className="hover:text-blue-600"><Sun size={16} /></button>
              <button className="hover:text-blue-600"><Type size={16} /></button>
              <button className="text-green-600 bg-green-50 px-2 py-1 rounded-md"><Volume2 size={16} /></button>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none text-nowrap">Maria Santos</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Resident</p>
              </div>
              <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

        {/* MOBILE BOTTOM NAVIGATION (Visible only on mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase">{item.shortName}</span>
                {isActive && <div className="w-1 h-1 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
          <button onClick={() => navigate('/Login')} className="flex flex-col items-center gap-1 text-gray-400">
            <LogOut size={22} />
            <span className="text-[10px] font-bold uppercase">Exit</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;