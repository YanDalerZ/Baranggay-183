import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserMainPage from './UserPages/UserMainPage';
import UserLogin from './UserPages/UserLogin';
import UserProfile from './UserPages/UserProfile';
import UserBenefits from './UserPages/UserBenefits';
import Navbar from './components/Navbar';
import UserAlert from './UserPages/UserAlerts';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<UserLogin />} />

        <Route path="/MainPage" element={<UserMainPage />} />

        <Route path="/UserProfile" element={<Navbar pageTitle="User Profile"><UserProfile /></Navbar>} />

        <Route path="/UserBenefits" element={<Navbar pageTitle="My Benefits"> <UserBenefits /></Navbar>} />
        <Route path="/UserAlerts" element={<Navbar pageTitle="User Alerts and Notifications"> <UserAlert /></Navbar>} />

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