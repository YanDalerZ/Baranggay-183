import React, { useState } from 'react';

const UserLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });
    // Add your login logic/API call here
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      {/* Card Container */}
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        
        {/* Logo Icon */}
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <span className="text-white font-bold text-2xl tracking-tighter">B183</span>
        </div>

        {/* Title Section */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Barangay 183</h1>
        <p className="text-gray-500 text-sm mb-8 text-center font-medium">
          PWD & Senior Citizen Services Platform
        </p>

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
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0a0a1a] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition duration-300 transform active:scale-95 shadow-md"
          >
            Sign In
          </button>
        </form>

        {/* Demo Accounts Section */}
        <div className="w-full mt-10">
          <p className="text-gray-400 text-sm mb-3">Demo Accounts:</p>
          <ul className="text-xs text-gray-500 space-y-2">
            <li>
              <span className="font-semibold text-gray-600">• Superadmin:</span> superadmin@barangay183.gov.ph / admin
            </li>
            <li>
              <span className="font-semibold text-gray-600">• Admin:</span> admin@barangay183.gov.ph / admin
            </li>
            <li>
              <span className="font-semibold text-gray-600">• Resident:</span> maria.santos@email.com / resident
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;