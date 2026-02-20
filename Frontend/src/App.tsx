import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserMainPage from './UserPages/UserMainPage';
import UserLogin from './UserPages/UserLogin';
import UserProfile from './UserPages/UserProfile';
import UserApplyServices from './UserPages/UserApplyServices';
import UserServiceGuide from './UserPages/UserServiceGuide';
import UserAppointments from './UserPages/UserAppointments';

const App: React.FC = () => {
  // Vite's built-in types for environment variables

  return (
    <Router>

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


          {/* 404 Catch-all */}
          <Route path="*" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>404: Page Not Found</h2>
            </div>
          } />
        </Routes>

    </Router>
  );
}

export default App;