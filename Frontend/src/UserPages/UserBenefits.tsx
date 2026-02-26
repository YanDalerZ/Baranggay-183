import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../interfaces';
import { Info, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import '../css/UserBenefits.css';

interface Benefit {
    batch_id: number;
    batch_name: string;
    target_group: string;
    items_summary: string;
    status: string;
    date_claimed: string | null;
    date_posted: string;
}

const UserBenefits: React.FC = () => {
    const { user, token } = useAuth();
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getBenefits = async () => {
            if (!user?.id) return;

            setLoading(true);
            setError(null);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            try {
                const response = await axios.get(`${API_BASE_URL}/api/benefits/getBenefit/${user.id}`, config);

                if (Array.isArray(response.data)) {
                    setBenefits(response.data);
                } else {
                    console.error("Expected array but got:", typeof response.data);
                    setError("Invalid data format received from server.");
                    setBenefits([]);
                }
            } catch (err) {
                console.error("Error fetching benefits:", err);
                setError("Failed to load benefits. Please try again later.");
                setBenefits([]);
            } finally {
                setLoading(false);
            }
        };

        getBenefits();
    }, [user?.id, token]);

    const safeBenefits = Array.isArray(benefits) ? benefits : [];

    const stats = {
        eligible: safeBenefits.length,
        claimed: safeBenefits.filter(b => b.status === 'Claimed').length,
        pending: safeBenefits.filter(b => b.status === 'To Claim').length
    };

    return (
        <div className="user-benefits-scope">
            <div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                    My Benefits
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">Stay informed about your Benefits</p>
            </div>

            <div className="benefits-container mt-5">

                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Eligible Benefits</span>
                        <div className="stat-value">{stats.eligible}</div>
                        <p className="text-xs text-gray-400 mt-1">Available for you</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label text-green-600">Benefits Claimed</span>
                        <div className="stat-value text-green-600">{stats.claimed}</div>
                        <p className="text-xs text-gray-400 mt-1">Total claims</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label text-orange-500">To Claim</span>
                        <div className="stat-value text-orange-500">{stats.pending}</div>
                        <p className="text-xs text-gray-400 mt-1">Awaiting pickup</p>
                    </div>
                </div>

                {/* Error State UI */}
                {error && (
                    <div className="flex items-center gap-2 p-4 mb-4 text-red-800 border border-red-200 bg-red-50 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* How to Apply Section */}
                <div className="section-wrapper p-8">
                    <h2 className="text-xl font-bold mb-8">How to Apply for Benefits</h2>
                    <div className="space-y-8">
                        {[
                            { step: 1, title: "Check Eligibility", desc: "Review the benefit details and ensure you meet the eligibility requirements." },
                            { step: 2, title: "Prepare Documents", desc: "Gather all required documents listed in the benefit requirements." },
                            { step: 3, title: "Submit Application", desc: "Visit the barangay office or use the online form to submit your application." },
                            { step: 4, title: "Wait for Approval", desc: "Your application will be reviewed within 3-5 business days. You'll receive a notification." }
                        ].map((s) => (
                            <div key={s.step} className="step-container">
                                <div className="step-number">{s.step}</div>
                                <div>
                                    <h4 className="font-bold">{s.title}</h4>
                                    <p className="text-sm text-gray-500">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dynamic Benefits List */}
                <div className="section-wrapper">
                    <div className="section-header">
                        <h2 className="text-xl font-bold">Available Benefits & Programs</h2>
                        <p className="text-sm text-gray-500">Benefits linked to your profile</p>
                    </div>

                    <div className="py-4">
                        {loading ? (
                            <div className="p-12 flex flex-col items-center justify-center space-y-3">
                                <div className="w-8 h-8 border-4 border-[#00308F] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm">Loading your benefits...</p>
                            </div>
                        ) : safeBenefits.length > 0 ? (
                            safeBenefits.map((benefit) => (
                                <div key={benefit.batch_id} className="benefit-item">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg">{benefit.batch_name}</h3>
                                            <span className={`tag ${benefit.target_group === 'SC' ? 'tag-financial' : 'tag-discount'}`}>
                                                {benefit.target_group}
                                            </span>
                                            {benefit.status === 'Claimed' ? (
                                                <span className="flex items-center gap-1 bg-black text-white px-2 py-0.5 text-[10px] uppercase font-bold">
                                                    <CheckCircle2 className="w-3 h-3" /> Claimed
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 text-[10px] uppercase font-bold">
                                                    <Clock className="w-3 h-3" /> To Claim
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{benefit.items_summary}</p>
                                        <p className="text-blue-600 font-bold text-sm">Posted: {benefit.date_posted}</p>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 font-bold text-gray-500">
                                                {benefit.target_group === 'BOTH' ? 'SC/PWD' : benefit.target_group}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex gap-2">
                                        <button className="btn-details">
                                            <Info className="w-4 h-4" /> Details
                                        </button>
                                        {benefit.status !== 'Claimed' && (
                                            <button className="btn-apply">
                                                <ExternalLink className="w-4 h-4" /> Requirements
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">No benefits found for your account at this time.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserBenefits;