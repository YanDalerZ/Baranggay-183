import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../interfaces';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/login/forgot-password`, { email });
            setStatus('success');
            setMessage(response.data.message || 'Reset link sent! Please check your email.');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Email not found or service error.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button onClick={() => navigate('/login')} className="text-blue-600 font-semibold hover:underline">
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
                <button onClick={() => navigate('/login')} className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6">
                    <ArrowLeft className="size-4 mr-1" /> Back to Login
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
                <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you a recovery link.</p>
                {status === 'error' && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center">
                        <AlertCircle className="size-5 mr-2" /> {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                        <input
                            type="email"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 transition"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#0a0a1a] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition flex items-center justify-center">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Send Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;