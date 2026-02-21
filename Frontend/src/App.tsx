import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';

import UserMainPage from './UserPages/UserMainPage';
import UserLogin from './UserPages/UserLogin';
import UserProfile from './UserPages/UserProfile';
import UserBenefits from './UserPages/UserBenefits';
import UserAlert from './UserPages/UserAlerts';
import UserEvents from './UserPages/UserEvents';
import UserHistory from './UserPages/UserHistory';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<UserLogin />} />

        <Route path="/UserMainPage" element={<Navbar><UserMainPage /></Navbar>} />

        <Route path="/UserProfile" element={<Navbar><UserProfile /></Navbar>} />

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