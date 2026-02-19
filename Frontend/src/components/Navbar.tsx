import React, { useState } from 'react';
import {
  User, FileText, Gift, History, Bell,
  LogOut, Sun, Type, Volume2, Menu, X,
  Newspaper
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Navbar.css';

interface NavbarProps {
  children: React.ReactNode;
  pageTitle: string;
}

const Navbar: React.FC<NavbarProps> = ({ children, pageTitle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Main Page', shortName: 'Main', icon: Newspaper, path: '/MainPage' },
    { name: 'Profile', shortName: 'Profile', icon: User, path: '/UserProfile' },
    { name: 'Apply for Services', shortName: 'Apply', icon: FileText, path: '/Apply' },
    { name: 'My Benefits', shortName: 'Benefits', icon: Gift, path: '/UserBenefits' },
    { name: 'Alerts', shortName: 'Alerts', icon: Bell, path: '/UserAlerts' },
    { name: 'Events Calendar', shortName: 'Events', icon: Bell, path: '/UserEvents' },
    { name: 'History', shortName: 'History', icon: History, path: '/History' },
  ];

  return (
    <div className="navbar-scope">
      <aside className="sidebar-aside" data-collapsed={isCollapsed}>
        <div className="sidebar-header">
          {!isCollapsed ? (
            <div className="logo-text-container">
              <div className="logo-box">B183</div>
              <div>
                <h1 className="brand-title">Barangay 183</h1>
                <p className="brand-subtitle">Resident Portal</p>
              </div>
            </div>
          ) : (
            <div className="logo-box">B183</div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="collapse-btn"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="nav-item-list">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="nav-link"
                data-active={isActive}
              >
                <item.icon size={20} strokeWidth={2.5} />
                {!isCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="signout-container">
          <button onClick={() => navigate('/Login')} className="nav-link" data-active="false">
            <LogOut size={20} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-mobile-brand">
            <div className="mobile-logo-sm">B183</div>
            <h2 className="page-title-mobile">{pageTitle}</h2>
          </div>
          <h2 className="page-title-desktop">{pageTitle}</h2>

          <div className="header-actions">
            <div className="accessibility-tools">
              <button><Sun size={16} /></button>
              <button><Type size={16} /></button>
              <button className="tool-btn-volume"><Volume2 size={16} /></button>
            </div>
            <div className="vertical-divider" />
            <div className="user-info-block">
              <div className="user-details">
                <p className="user-name">Maria Santos</p>
                <p className="user-role">Resident</p>
              </div>
              <div className="user-avatar-circle">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>

        {/* MOBILE NAVIGATION */}
        <nav className="mobile-nav-bar">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="mobile-nav-btn"
                data-active={isActive}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="mobile-label">{item.shortName}</span>
                {isActive && <div className="active-dot" />}
              </button>
            );
          })}
          <button onClick={() => navigate('/Login')} className="mobile-nav-btn" data-active="false">
            <LogOut size={22} />
            <span className="mobile-label">Exit</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;