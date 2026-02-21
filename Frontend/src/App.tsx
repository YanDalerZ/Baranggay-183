import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';

import UserMainPage from './UserPages/UserMainPage';
import UserLogin from './UserPages/UserLogin';
import UserProfile from './UserPages/UserProfile';
import UserApplyServices from './UserPages/UserApplyServices';
import UserServiceGuide from './UserPages/UserServiceGuide';
import UserAppointments from './UserPages/UserAppointments';
import AdminTest from './AdminPages/AdminTest';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<UserLogin />} />

        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/Login" replace />} />

          {/* Page Routes */}
          <Route path="/Login" element={<UserLogin />} />
          <Route path="/MainPage" element={<UserMainPage />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/UserApplyServices" element={<UserApplyServices />} />
          <Route path="/UserServiceGuide" element={<UserServiceGuide/>} />
          <Route path="/UserAppointments" element={<UserAppointments/>} />
          <Route path="/AdminTest" element={<AdminTest/>} />
          

        <Route path="/UserBenefits" element={<Navbar> <UserBenefits /></Navbar>} />
        <Route path="/UserAlerts" element={<Navbar> <UserAlert /></Navbar>} />
        <Route path="/UserEvents" element={<Navbar> <UserEvents /></Navbar>} />
        <Route path="/UserHistory" element={<Navbar> <UserHistory /></Navbar>} />

        <Route path="*" element={
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>404: Page Not Found</h2>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;