import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserMainPage from './UserPages/UserMainPage';
import UserLogin from './UserPages/UserLogin';
import UserProfile from './UserPages/UserProfile';


const App: React.FC = () => {

  return (
    <Router>

      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />

        <Route path="/Login" element={<UserLogin />} />
        <Route path="/MainPage" element={<UserMainPage />} />
        <Route path="/UserProfile" element={<UserProfile />} />


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