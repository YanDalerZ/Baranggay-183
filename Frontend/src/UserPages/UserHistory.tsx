import {
    CheckCircle2,
    Clock,
    Package,
    Info
} from 'lucide-react';

// --- Types ---
interface ClaimRecord {
    id: number;
    title: string;
    description: string;
    claimId: string;
    date: string;
    status: 'Claimed' | 'Pending' | 'Approved';
    quantity?: number;
}

const CLAIMS: ClaimRecord[] = [
    {
        id: 1,
        title: 'Senior Citizen Monthly Pension',
        description: 'Monthly cash assistance for senior citizens',
        claimId: '1',
        date: '2026-02-01',
        status: 'Claimed'
    },
    {
        id: 2,
        title: 'Relief Goods Package',
        description: 'Emergency relief goods during disasters',
        claimId: '2',
        date: '2026-01-15',
        status: 'Claimed',
        quantity: 1
    }
];

// --- Sub-Components ---

const StatCard = ({ label, value, subtext, colorClass }: { label: string, value: string | number, subtext: string, colorClass: string }) => (
    <div className="bg-white p-6  border-2 border-gray-100 shadow-sm flex flex-col justify-between">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        <div className="my-4">
            <span className={`text-5xl font-black ${colorClass}`}>{value}</span>
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase">{subtext}</span>
    </div>
);

const ClaimItem = ({ claim }: { claim: ClaimRecord }) => (
    <div className="bg-white border-2 border-gray-100  p-6 mb-4 hover:border-[#00308F] transition-all group">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-green-50 p-4  flex-shrink-0">
                <CheckCircle2 size={32} className="text-green-600" />
            </div>

            <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{claim.title}</h3>
                    <span className="bg-green-100 text-green-700 px-4 py-1  text-xs font-black uppercase">
                        {claim.status}
                    </span>
                </div>
                <p className="text-gray-500 font-medium mb-3">{claim.description}</p>

                <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-400">
                    <span className="flex items-center gap-2">Claim ID: <span className="text-gray-900">{claim.claimId}</span></span>
                    <span className="flex items-center gap-2">Date: <span className="text-gray-900">{claim.date}</span></span>
                    {claim.quantity && <span className="flex items-center gap-2">Qty: <span className="text-gray-900">{claim.quantity}</span></span>}
                </div>
            </div>
        </div>

        <div className="mt-6 bg-green-50/50 p-4  border border-green-100">
            <p className="text-green-700 font-bold flex items-center gap-2">
                <CheckCircle2 size={18} /> This benefit has been successfully claimed. Thank you!
            </p>
        </div>
    </div>
);

export default function ClaimsHistory() {
    return (
        <div className=" min-h-screen bg-[#FDFDFD] pb-20">

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] mb-6 tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        Claim History</h2>
                    <p className="text-gray-500 text-xs sm:text-sm">Stay informed with your Claims</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 mb-12">
                    <StatCard label="Total Claims" value={2} subtext="All time" colorClass="text-gray-900" />
                    <StatCard label="Claimed" value={2} subtext="Completed" colorClass="text-green-600" />
                    <StatCard label="Approved" value={0} subtext="Ready to claim" colorClass="text-[#00308F]" />
                    <StatCard label="Pending" value={0} subtext="Under review" colorClass="text-[#FF9800]" />
                </div>

                <section className="mb-12">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Claims History</h2>
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Track your benefit claims and their status</p>
                    </div>

                    <div className="space-y-4">
                        {CLAIMS.map(claim => <ClaimItem key={claim.id} claim={claim} />)}
                    </div>
                </section>

                {/* Legend Section */}
                <section className="bg-white border-2 border-gray-100  p-8">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Info className="text-[#00308F]" /> Understanding Your Claims
                    </h3>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="flex items-start gap-6">
                            <div className="bg-orange-100 p-3 "><Clock className="text-[#FF9800]" size={24} /></div>
                            <div>
                                <h4 className="font-black text-gray-900 uppercase text-sm mb-1">Pending</h4>
                                <p className="text-gray-500 font-medium">Your application is being reviewed by the barangay staff. This usually takes 3-5 business days.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="bg-blue-100 p-3 "><Package className="text-[#00308F]" size={24} /></div>
                            <div>
                                <h4 className="font-black text-gray-900 uppercase text-sm mb-1">Approved</h4>
                                <p className="text-gray-500 font-medium">Your claim has been approved! Please visit the barangay office during office hours to claim your benefit.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="bg-green-100 p-3 "><CheckCircle2 className="text-green-600" size={24} /></div>
                            <div>
                                <h4 className="font-black text-gray-900 uppercase text-sm mb-1">Claimed</h4>
                                <p className="text-gray-500 font-medium">You have successfully received your benefit. The transaction is now complete.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}