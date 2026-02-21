import React, { useState } from 'react';
import axios from 'axios';

const CreateUser: React.FC = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        contact_number: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Adjust URL based on your index.ts routing
            const response = await axios.post('http://localhost:3000/api/user', formData);
            setMessage({ type: 'success', text: response.data.message });
            setFormData({ firstname: '', lastname: '', email: '', password: '', contact_number: '' });
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Registration failed'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Account</h1>

                {message.text && (
                    <div className={`p-3 mb-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="firstname" placeholder="First Name" required className="w-full px-4 py-3 rounded-xl bg-gray-100" value={formData.firstname} onChange={handleChange} />
                        <input name="lastname" placeholder="Last Name" required className="w-full px-4 py-3 rounded-xl bg-gray-100" value={formData.lastname} onChange={handleChange} />
                    </div>
                    <input name="email" type="email" placeholder="Email Address" required className="w-full px-4 py-3 rounded-xl bg-gray-100" value={formData.email} onChange={handleChange} />
                    <input name="password" type="password" placeholder="Password" required className="w-full px-4 py-3 rounded-xl bg-gray-100" value={formData.password} onChange={handleChange} />
                    <input name="contact_number" placeholder="Contact Number" className="w-full px-4 py-3 rounded-xl bg-gray-100" value={formData.contact_number} onChange={handleChange} />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
                    >
                        {loading ? 'Creating...' : 'Register User'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Already have an account? <a href="/login" className="text-blue-600 font-bold">Sign In</a>
                </p>
            </div>
        </div>
    );
};

export default CreateUser;