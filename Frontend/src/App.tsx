import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context & Guards
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Navbars
import Navbar from './components/UserNavbar';
import AdminNavbar from './components/AdminNavbar';
import SuperAdminNavbar from './components/SuperAdminNavbar';

// User Pages
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

// Admin Pages
import AdminLogin from './AdminPages/AdminLogin';
import AdminDashboard from './AdminPages/AdminDashboard';
import AdminRBIManagement from './AdminPages/AdminRBIManagement';
import AdminApplicationsManagement from './AdminPages/AdminApplicationsManagement';
import AdminRiskMapping from './AdminPages/AdminRiskMapping';
import AdminNotificationsCenter from './AdminPages/AdminNotificationsCenter';
import AdminEmergencyAlerts from './AdminPages/AdminEmergencyAlerts';
import AdminBenefitsReliefLedger from './AdminPages/AdminBenefitsReliefLedger';
import AdminEventsCalendar from './AdminPages/AdminEventsCalendar';
import AdminContentCMS from './AdminPages/AdminContentCMS';

//SuperAdmin Pages
import SuperAdminDashboard from './SuperAdminPages/SuperAdminDashboard';
import SuperAdminLogin from './SuperAdminPages/SuperAdminLogin';
import SuperAdminRBAC from './SuperAdminPages/SuperAdminRBAC';
import SuperAdminAuditTrail from './SuperAdminPages/SuperAdminAuditTrail';
import SuperAdminConfiguration from './SuperAdminPages/SuperAdminConfiguration';
import SuperAdminDatabase from './SuperAdminPages/SuperAdminDatabase';
import SuperAdminCompliance from './SuperAdminPages/SuperAdminCompliance';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading session...</p>
      </div>
    );
  }

    if (isAuthenticated && user) {
    return <Navigate to={user.role === 3 ? "/SuperAdminDashboard" : user.role === 1 ? "/AdminDashboard" : "/UserMainPage"} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Please wait...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root path redirects to Login */}
      <Route path="/" element={<Navigate to="/Login" replace />} />

      {/* --- PUBLIC ROUTES --- */}
      <Route path="/Login" element={<PublicRoute><UserLogin /></PublicRoute>} />
      <Route path="/AdminLogin" element={<PublicRoute><AdminLogin /></PublicRoute>} />
      <Route path="/SuperAdminLogin" element={<PublicRoute><SuperAdminLogin /></PublicRoute>} />

      {/* --- USER PROTECTED ROUTES --- */}
      <Route path="/UserMainPage" element={<ProtectedRoute><Navbar><UserMainPage /></Navbar></ProtectedRoute>} />
      <Route path="/UserProfile" element={<ProtectedRoute><Navbar><UserProfile /></Navbar></ProtectedRoute>} />
      <Route path="/UserBenefits" element={<ProtectedRoute><Navbar><UserBenefits /></Navbar></ProtectedRoute>} />
      <Route path="/UserAlerts" element={<ProtectedRoute><Navbar><UserAlert /></Navbar></ProtectedRoute>} />
      <Route path="/UserEvents" element={<ProtectedRoute><Navbar><UserEvents /></Navbar></ProtectedRoute>} />
      <Route path="/UserHistory" element={<ProtectedRoute><Navbar><UserHistory /></Navbar></ProtectedRoute>} />
      <Route path="/UserApply" element={<ProtectedRoute><Navbar><UserApply /></Navbar></ProtectedRoute>} />
      <Route path="/UserAppointments" element={<ProtectedRoute><Navbar><UserAppointments /></Navbar></ProtectedRoute>} />
      <Route path="/UserGuide" element={<ProtectedRoute><Navbar><UserGuide /></Navbar></ProtectedRoute>} />

      {/* --- ADMIN PROTECTED ROUTES (Required Role: 1) --- */}
      <Route path="/AdminDashboard" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminDashboard /></AdminNavbar></ProtectedRoute>} />
      <Route path="/AdminRBIManagement" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminRBIManagement /></AdminNavbar></ProtectedRoute>} />
      <Route path="/AdminApplicationsManagement" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminApplicationsManagement /></AdminNavbar></ProtectedRoute>} />
      <Route path="/AdminRiskMapping" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminRiskMapping /></AdminNavbar></ProtectedRoute>} />
      <Route path="/AdminNotificationsCenter" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminNotificationsCenter /></AdminNavbar></ProtectedRoute>} />
      <Route path="/AdminEmergencyAlerts" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminEmergencyAlerts /></AdminNavbar></ProtectedRoute>} />
      <Route path="/AdminBenefitsReliefLedger" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminBenefitsReliefLedger /></AdminNavbar></ProtectedRoute>} />
      <Route path="/AdminEventsCalendar" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminEventsCalendar /></AdminNavbar></ProtectedRoute>} />
      <Route path="/AdminContentCMS" element={<ProtectedRoute requiredRole={1}><AdminNavbar><AdminContentCMS /></AdminNavbar></ProtectedRoute>} />

      {/* --- SUPER ADMIN PROTECTED ROUTES (Required Role: 3) --- */}
      <Route path="/SuperAdminDashboard" element={<ProtectedRoute requiredRole={3}><SuperAdminNavbar><SuperAdminDashboard /></SuperAdminNavbar></ProtectedRoute>} />
      <Route path="/SuperAdminRBAC" element={<ProtectedRoute requiredRole={3}><SuperAdminNavbar><SuperAdminRBAC /></SuperAdminNavbar></ProtectedRoute>} />
      <Route path="/SuperAdminAuditTrail" element={<ProtectedRoute requiredRole={3}><SuperAdminNavbar><SuperAdminAuditTrail /></SuperAdminNavbar></ProtectedRoute>} />
      <Route path="/SuperAdminConfiguration" element={<ProtectedRoute requiredRole={3}><SuperAdminNavbar><SuperAdminConfiguration /></SuperAdminNavbar></ProtectedRoute>} />
      <Route path="/SuperAdminDatabase" element={<ProtectedRoute requiredRole={3}><SuperAdminNavbar><SuperAdminDatabase /></SuperAdminNavbar></ProtectedRoute>} />
      <Route path="/SuperAdminCompliance" element={<ProtectedRoute requiredRole={3}><SuperAdminNavbar><SuperAdminCompliance /></SuperAdminNavbar></ProtectedRoute>} />


      {/* --- 404 PAGE --- */}
      <Route path="*" element={
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2 style={{ color: '#00308F', fontWeight: 'bold' }}>404: Page Not Found</h2>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '20px',
              color: '#00308F',
              fontWeight: 'bold',
              textDecoration: 'underline',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            Go Back Home
          </button>
        </div>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;