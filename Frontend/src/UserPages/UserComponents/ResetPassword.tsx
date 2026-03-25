import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import API_BASE_URL from '../../interfaces';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/login/reset-password`, { token, newPassword: password });
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Link expired or invalid.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
                    <p className="text-gray-600">Password updated. Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8 text-center">
                    <ShieldCheck className="size-12 text-blue-600 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
                </div>
                {status === 'error' && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center border border-red-100">{message}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white text-gray-700 transition"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                        <input
                            type="password"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white text-gray-700 transition"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#0a0a1a] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition flex items-center justify-center shadow-md">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;