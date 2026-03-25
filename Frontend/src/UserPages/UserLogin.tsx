import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../interfaces';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }

      // Use the login function from AuthContext to sync state
      login(token, user);
      window.location.href = '/UserMainPage';

    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <img className="size-24 mb-4" src="Logo.png" alt="Logo" />
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Barangay 183</h1>
        <p className="text-gray-500 text-sm mb-8 text-center font-medium">
          PWD & Senior Citizen Services Platform
        </p>

        {error && (
          <div className="w-full mb-4 text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="w-full space-y-5">
          <div>
            <label className="block text-gray-800 font-bold mb-2 ml-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white text-gray-700 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-2 ml-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white text-gray-700 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between w-full px-1">
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Remember me
            </label>
            <button type="button" onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a0a1a] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;