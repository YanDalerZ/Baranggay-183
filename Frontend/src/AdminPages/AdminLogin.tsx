import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../interfaces';

const UserLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login/admin`, {
        email,
        password,
      }, {
        withCredentials: true
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Login Successful:', user);


      window.location.href = '/AdminDashboard';
    
    } catch (err: any) {
      console.error('Login Error:', err);
      // Update the error state to show feedback to the user
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      {/* Card Container */}
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">

        <img className="size-25" src="Logo.png" alt="" />

        {/* Title Section */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Barangay 183</h1>
        <p className="text-gray-500 text-sm mb-8 text-center font-medium">
          Administration Login
        </p>

        {/* Error Feedback (Optional but helpful for debugging) */}
        {error && (
          <div className="w-full mb-4 text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="w-full space-y-5">
          <div>
            <label className="block text-gray-800 font-bold mb-2 ml-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-2 ml-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a0a1a] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition duration-300 transform active:scale-95 shadow-md disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>


      </div>
    </div>
  );
};

export default UserLogin;