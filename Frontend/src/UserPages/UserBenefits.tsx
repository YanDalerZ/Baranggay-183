import React from 'react';
import { Info, ExternalLink, CheckCircle2 } from 'lucide-react';
import '../css/UserBenefits.css';

const UserBenefits: React.FC = () => {
    return (
        <div className="user-benefits-scope">
            <div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                    My Benefits
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">Stay informed about your Benefits</p>
            </div>

            <div className="benefits-container mt-5">

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Eligible Benefits</span>
                        <div className="stat-value">5</div>
                        <p className="text-xs text-gray-400 mt-1">Available for you</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label text-green-600">Benefits Claimed</span>
                        <div className="stat-value text-green-600">2</div>
                        <p className="text-xs text-gray-400 mt-1">Total claims</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label text-orange-500">Pending Claims</span>
                        <div className="stat-value text-orange-500">0</div>
                        <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
                    </div>
                </div>
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
                <div className="section-wrapper">
                    <div className="section-header">
                        <h2 className="text-xl font-bold">Available Benefits & Programs</h2>
                        <p className="text-sm text-gray-500">Benefits you are eligible to claim</p>
                    </div>

                    <div className="py-4">
                        {/* Benefit Item 1 */}
                        <div className="benefit-item">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg">Senior Citizen Monthly Pension</h3>
                                    <span className="tag tag-financial">Financial</span>
                                    <span className="flex items-center gap-1 bg-black text-white px-2 py-0.5  text-[10px] uppercase font-bold">
                                        <CheckCircle2 className="w-3 h-3" /> Claimed
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">Monthly cash assistance for senior citizens</p>
                                <p className="text-blue-600 font-bold text-sm">₱1,500</p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5  font-bold text-gray-500">Senior Citizen</span>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <button className="btn-details"><Info className="w-4 h-4" /> Details</button>
                            </div>
                        </div>

                        {/* Benefit Item 2 */}
                        <div className="benefit-item">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg">PWD Discount Card</h3>
                                    <span className="tag tag-discount">Discount</span>
                                </div>
                                <p className="text-sm text-gray-500">20% discount on goods and services</p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5  font-bold text-gray-500">PWD</span>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4 md:mt-0">
                                <button className="btn-details"><Info className="w-4 h-4" /> Details</button>
                                <button className="btn-apply"><ExternalLink className="w-4 h-4" /> Apply</button>
                            </div>
                        </div>
                    </div>
                </div>



            </div>
        </div>
    );
};

export default UserBenefits;