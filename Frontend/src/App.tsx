import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
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
import UserCRUD from './UserPages/UserCRUD';

import AdminNavbar from './components/AdminNavbar';
import AdminLogin from './AdminPages/AdminLogin';
import AdminDashboard from './AdminPages/AdminDashboard';
import AdminRBIManagement from './AdminPages/AdminRBIManagement';
import AdminPWDSCProfiles from './AdminPages/AdminPWDSCProfiles';


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
        <Route path="/UserCRUD" element={<ProtectedRoute><UserCRUD /></ProtectedRoute>} />

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