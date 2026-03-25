import React, { useState } from 'react';
import { X, Send, Mail, MessageSquare } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../interfaces';
import { useAuth } from '../../context/AuthContext';

interface SupportModalProps {
    onClose: () => void;
    userId: string | number; // To track who sent it
}

const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
    const [message, setMessage] = useState('');
    const [channel, setChannel] = useState<'Email' | 'SMS'>('Email');
    const [loading, setLoading] = useState(false);
    const { token, user } = useAuth();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(
                `${API_BASE_URL}/api/notifications/support`,
                {
                    user_id: user?.id,
                    message: message,
                    channel: channel
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert('Your message has been sent to the Barangay Admin.');
            onClose();
        } catch (error) {
            console.error(error);
            alert('Could not reach admin. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold">Contact Support</h3>
                        <p className="text-blue-100 text-xs">We typically respond within 24 hours.</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Channel Selection */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setChannel('Email')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${channel === 'Email' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <Mail size={14} /> EMAIL
                        </button>
                        <button
                            type="button"
                            onClick={() => setChannel('SMS')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${channel === 'SMS' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <MessageSquare size={14} /> SMS
                        </button>
                    </div>

                    {/* Message Body */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Your Message</label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="How can we help you today?"
                            className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Sending...' : (
                            <>
                                <Send size={16} /> Send via {channel}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SupportModal;