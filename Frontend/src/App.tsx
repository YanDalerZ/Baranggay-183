import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/UserNavbar';
import ProtectedRoute from './components/ProtectedRoute';

import UserMainPage from './UserPages/UserMainPage';
import UserLogin from './UserPages/UserLogin';
import UserProfile from './UserPages/UserProfile';
import UserBenefits from './UserPages/UserBenefits';
import UserAlert from './UserPages/UserAlerts';
import UserEvents from './UserPages/UserEvents';
import UserHistory from './UserPages/UserHistory';
import UserApply from './UserPages/UserApplyServices';
import UserAppointments from './UserPages/UserAppointments';
import UserGuide from './UserPages/UserServiceGuide';

import AdminNavbar from './components/AdminNavbar';
import AdminLogin from './AdminPages/AdminLogin';
import AdminDashboard from './AdminPages/AdminDashboard';
import AdminRBIManagement from './AdminPages/AdminRBIManagement';
import AdminPWDSCProfiles from './AdminPages/AdminPWDSCProfiles';
import AdminApplicationsManagement from './AdminPages/AdminApplicationsManagement';
import AdminRiskMapping from './AdminPages/AdminRiskMapping';
import AdminNotificationsCenter from './AdminPages/AdminNotificationsCenter';
import AdminEmergencyAlerts from './AdminPages/AdminEmergencyAlerts';
import AdminBenefitsReliefLedger from './AdminPages/AdminBenefitsReliefLedger';
import AdminEventsCalendar from './AdminPages/AdminEventsCalendar';
import AdminContentCMS from './AdminPages/AdminContentCMS';


const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/UserMainPage" replace /> : <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />

        <Route
          path="/Login"
          element={
            <PublicRoute>
              <UserLogin />
            </PublicRoute>
          }
        />

        <Route
          path="/AdminLogin"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Only accessible if token exists */}
        <Route path="/UserMainPage" element={<ProtectedRoute><Navbar><UserMainPage /></Navbar></ProtectedRoute>} />

        <Route path="/UserProfile" element={<ProtectedRoute><Navbar><UserProfile /></Navbar></ProtectedRoute>} />

        <Route path="/UserBenefits" element={<ProtectedRoute><Navbar><UserBenefits /></Navbar></ProtectedRoute>} />

        <Route path="/UserAlerts" element={<ProtectedRoute><Navbar><UserAlert /></Navbar></ProtectedRoute>} />

        <Route path="/UserEvents" element={<ProtectedRoute><Navbar><UserEvents /></Navbar></ProtectedRoute>} />

        <Route path="/UserHistory" element={<ProtectedRoute><Navbar><UserHistory /></Navbar></ProtectedRoute>} />

        <Route path="/UserApply" element={<ProtectedRoute><Navbar><UserApply /></Navbar></ProtectedRoute>} />

        <Route path="/UserAppointments" element={<ProtectedRoute><Navbar><UserAppointments /></Navbar></ProtectedRoute>} />

        <Route path="/UserGuide" element={<ProtectedRoute><Navbar><UserGuide /></Navbar></ProtectedRoute>} />


        <Route path="/AdminDashboard" element={<ProtectedRoute><AdminNavbar><AdminDashboard /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminRBIManagement" element={<ProtectedRoute><AdminNavbar><AdminRBIManagement /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminPWDSCProfiles" element={<ProtectedRoute><AdminNavbar><AdminPWDSCProfiles /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminApplicationsManagement" element={<ProtectedRoute><AdminNavbar><AdminApplicationsManagement /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminRiskMapping" element={<ProtectedRoute><AdminNavbar><AdminRiskMapping /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminNotificationsCenter" element={<ProtectedRoute><AdminNavbar><AdminNotificationsCenter /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminEmergencyAlerts" element={<ProtectedRoute><AdminNavbar><AdminEmergencyAlerts /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminBenefitsReliefLedger" element={<ProtectedRoute><AdminNavbar><AdminBenefitsReliefLedger /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminEventsCalendar" element={<ProtectedRoute><AdminNavbar><AdminEventsCalendar /></AdminNavbar></ProtectedRoute>} />
        <Route path="/AdminContentCMS" element={<ProtectedRoute><AdminNavbar><AdminContentCMS /></AdminNavbar></ProtectedRoute>} />

        {/* 404 Route */}
        <Route path="*" element={
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2 style={{ color: '#00308F', fontWeight: 'bold' }}>404: Page Not Found</h2>
            <button
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '20px', color: '#00308F', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              Go Back Home
            </button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;