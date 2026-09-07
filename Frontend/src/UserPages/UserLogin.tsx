import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../interfaces';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, X, UserCheck, KeyRound } from 'lucide-react';

const UserLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // States for Privacy Pop-up
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  // States for Proxy / Caretaker Modal
  const [showProxyModal, setShowProxyModal] = useState<boolean>(false);
  const [proxyStep, setProxyStep] = useState<'details' | 'otp'>('details');
  const [residentFullName, setResidentFullName] = useState<string>('');
  const [residentbirthday, setResidentbirthday] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [proxyUserId, setProxyUserId] = useState<number | null>(null);
  const [maskedContact, setMaskedContact] = useState<string>('');
  const [proxyError, setProxyError] = useState<string | null>(null);
  const [proxyLoading, setProxyLoading] = useState<boolean>(false);

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

  const handlePreSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowPrivacyModal(true);
  };

  const executeLogin = async () => {
    setLoading(true);
    setShowPrivacyModal(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }

      login(token, user);
      window.location.href = '/UserMainPage';

    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestProxyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setProxyError(null);
    setProxyLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/proxy/request-otp`, {
        fullName: residentFullName,
        birthday: residentbirthday,
      });

      setProxyUserId(response.data.userId);
      setMaskedContact(response.data.maskedContact);
      setProxyStep('otp');
    } catch (err: any) {
      setProxyError(err.response?.data?.message || 'Failed to request OTP. Please verify resident credentials.');
    } finally {
      setProxyLoading(false);
    }
  };

  const handleVerifyProxyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setProxyError(null);
    setProxyLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/proxy/login`, {
        userId: proxyUserId,
        otp: otpCode,
      });

      const { token, user } = response.data;
      login(token, user);
      setShowProxyModal(false);
      window.location.href = '/UserMainPage';
    } catch (err: any) {
      setProxyError(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setProxyLoading(false);
    }
  };

  const resetProxyModal = () => {
    setShowProxyModal(false);
    setProxyStep('details');
    setResidentFullName('');
    setResidentbirthday('');
    setOtpCode('');
    setProxyUserId(null);
    setMaskedContact('');
    setProxyError(null);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4" style={{ backgroundImage: 'url("loginbg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md flex flex-col items-center" style={{ opacity: 0.90 }}>
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

        <form onSubmit={handlePreSignIn} className="w-full space-y-5">
          <div>
            <label className="block text-gray-800 font-bold mb-2 ml-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-gray-200 border-transparent focus:border-blue-500 focus:bg-white transition duration-200 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-2 ml-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-gray-200 border-transparent focus:border-blue-500 focus:bg-white text-gray-700 transition duration-200 outline-none"
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
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a0a1a] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition duration-300 disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setShowProxyModal(true)}
            className="w-full bg-blue-50 text-blue-800 font-bold py-3 rounded-xl border border-blue-200 hover:bg-blue-100 transition duration-300 shadow-sm flex items-center justify-center space-x-2"
          >
            <UserCheck className="size-5" />
            <span>Login VIA Proxy / CareTaker Login</span>
          </button>
        </form>
      </div>

      {/* --- PRIVACY ACT MODAL --- */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ShieldCheck className="text-blue-600 size-6" />
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">Data Privacy Agreement</h2>
            <div className="text-sm text-gray-600 space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
              <p>
                In compliance with the <strong>Data Privacy Act of 2012</strong>, Barangay 183 is committed to protecting your personal information.
              </p>
              <p>
                By proceeding, you agree that we may collect and process your data to provide PWD and Senior Citizen services effectively. We will not share your data with third parties without your explicit consent.
              </p>
            </div>

            <label className="flex items-start mb-6 cursor-pointer group">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 leading-tight group-hover:text-gray-900">
                I have read and agree to the Terms and Conditions and Data Privacy Policy.
              </span>
            </label>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                disabled={!isAgreed}
                onClick={executeLogin}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PROXY / CARETAKER LOGIN MODAL --- */}
      {showProxyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <UserCheck className="text-blue-600 size-6" />
              </div>
              <button onClick={resetProxyModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {proxyStep === 'details' ? 'Proxy / Caretaker Verification' : 'Enter OTP Code'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {proxyStep === 'details'
                ? 'Enter the resident information to send a single-use OTP code to their emergency contact number.'
                : `Enter the 6-digit verification code sent to ${maskedContact}.`}
            </p>

            {proxyError && (
              <div className="w-full mb-4 text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center border border-red-100">
                {proxyError}
              </div>
            )}

            {proxyStep === 'details' ? (
              <form onSubmit={handleRequestProxyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Resident Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Juan Dela Cruz"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 focus:border-blue-500 focus:bg-white text-sm transition outline-none"
                    value={residentFullName}
                    onChange={(e) => setResidentFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Resident birthday</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 focus:border-blue-500 focus:bg-white text-sm transition outline-none"
                    value={residentbirthday}
                    onChange={(e) => setResidentbirthday(e.target.value)}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={resetProxyModal}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={proxyLoading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm shadow-md"
                  >
                    {proxyLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyProxyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">OTP Verification Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit code"
                      className="w-full px-4 py-2.5 pl-10 rounded-xl bg-gray-100 border border-gray-200 focus:border-blue-500 focus:bg-white text-center text-lg tracking-widest font-mono transition outline-none"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                    <KeyRound className="absolute left-3 top-3 text-gray-400 size-5" />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setProxyStep('details')}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={proxyLoading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm shadow-md"
                  >
                    {proxyLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLogin;