import React, { useState } from 'react';
import { 
  User, FileText, Gift, Box, Bell, Calendar, BookOpen, ClipboardList,
  LogOut, Sun, Type, Volume2, Menu, ChevronLeft 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  children: React.ReactNode;
  pageTitle: string;
}

const AdminNavbar: React.FC<NavbarProps> = ({ children, pageTitle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', shortName: 'Dashboard', icon: User, path: '/AdminDashboard' },
    { name: 'RBI Management', shortName: 'RBI', icon: FileText, path: '/AdminRBIManagement' },
    { name: 'PWD & SC Profiles', shortName: 'Profiles', icon: Gift, path: '/AdminPWDSCProfiles' },
    { name: 'Applications Management', shortName: 'Apps', icon: Box, path: '/AdminApplicationsManagement' },
    { name: 'Risk Mapping', shortName: 'Mapping', icon: Calendar, path: '/AdminRiskMapping' }, 
    { name: 'Notifications', shortName: 'Notifs', icon: Bell, path: '/AdminNotifications' },
    { name: 'Emergency Alerts', shortName: 'Alerts', icon: BookOpen, path: '/AdminEmergencyAlerts' },
    { name: 'Benefits & Relief Ledger', shortName: 'Ledger', icon: ClipboardList, path: '/AdminBenefitsReliefLedger' },
    { name: 'Events & Calendar', shortName: 'Events', icon: ClipboardList, path: '/AdminEventsCalendar' },
    { name: 'Content CMS', shortName: 'CMS', icon: ClipboardList, path: '/AdminContentCMS' },
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
            {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 mt-4 overflow-y-auto">
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
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">B183</div>
             <h2 className="font-bold text-gray-800 text-base">{pageTitle}</h2>
          </div>
          <h2 className="hidden md:block font-bold text-gray-800 text-lg">{pageTitle}</h2>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden lg:flex items-center gap-4 text-[13px] font-bold text-gray-500">
              <button className="hover:text-blue-600 flex items-center gap-1.5"><Sun size={16} /> High Contrast</button>
              <button className="hover:text-blue-600 flex items-center gap-1.5"><Type size={16} /> 100%</button>
              <button className="text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1.5"><Volume2 size={16} /> SR Enabled</button>
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

export default AdminNavbar;