import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import {
    Search, Eye, Edit3,
    Loader2, Trash2, Info,
    Plus, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import AddResidentForm from './AdminComponents/RBIForm';
import ViewUserDetails from './AdminComponents/UserDetails';
import { type User, API_BASE_URL } from '../interfaces';

type SortConfig = {
    key: keyof User | 'days_left' | null;
    direction: 'asc' | 'desc';
};

const AdminRBIManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [residents, setResidents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const { token } = useAuth();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const fetchResidents = async () => {
        try {
            if (!token) return;
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/user/`, config);
            setResidents(response.data);
        } catch (err) {
            console.error('Error fetching residents:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    const requestSort = (key: keyof User | 'days_left') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof User | 'days_left') => {
        if (sortConfig.key !== key) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={12} className="ml-1 text-blue-600" />
            : <ArrowDown size={12} className="ml-1 text-blue-600" />;
    };

    // Helper to calculate days remaining
    const calculateDaysLeft = (expiryDate?: string) => {
        if (!expiryDate) return null;
        const now = new Date();
        const exp = new Date(expiryDate);
        const diffTime = exp.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // --- Calculated Statistics ---
    const stats = useMemo(() => {
        const now = new Date();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(now.getDate() + 60);

        return residents.reduce((acc, curr) => {
            acc.total++;
            if (curr.id_expiry_date) {
                const expDate = new Date(curr.id_expiry_date);
                if (expDate < now) acc.expired++;
                else if (expDate <= sixtyDaysFromNow) acc.expiringSoon++;
            }
            if (curr.is_flood_prone) acc.floodProne++;
            if (curr.is_flood_prone === true) {
                acc.highVulnerability++;
            }
            return acc;
        }, { total: 0, expiringSoon: 0, expired: 0, floodProne: 0, highVulnerability: 0 });
    }, [residents]);

    const filteredAndSortedResidents = useMemo(() => {
        let result = residents.filter(person =>
            `${person.firstname} ${person.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.system_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig.key !== null) {
            result.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (sortConfig.key === 'days_left') {
                    aValue = calculateDaysLeft(a.id_expiry_date) ?? -9999;
                    bValue = calculateDaysLeft(b.id_expiry_date) ?? -9999;
                } else {
                    aValue = a[sortConfig.key as keyof User] ?? '';
                    bValue = b[sortConfig.key as keyof User] ?? '';
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [residents, searchTerm, sortConfig]);

    const handleDelete = async (id: string) => {
        if (!token) return;
        if (window.confirm("Are you sure you want to delete this profile?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/user/${id}`, config);
                fetchResidents();
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const handleAddClick = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleViewClick = (user: User) => {
        setSelectedUser(user);
        setIsViewDetailsOpen(true);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-[#F8FAFC] min-h-screen">
            <AddResidentForm
                isOpen={isModalOpen}
                initialData={selectedUser}
                onClose={() => { setIsModalOpen(false); fetchResidents(); }}
            />

            <ViewUserDetails
                isOpen={isViewDetailsOpen}
                onClose={() => setIsViewDetailsOpen(false)}
                user={selectedUser}
            />
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        Registry of Barangay Inhabitants (RBI)
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage PWD and Senior Citizen profiles
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard title="TOTAL PROFILES" count={stats.total} color="text-gray-900" />
                <StatCard title="EXPIRING SOON" count={stats.expiringSoon} sub="Within 60 days" color="text-orange-500" />
                <StatCard title="EXPIRED IDS" count={stats.expired} color="text-red-600" />
                <StatCard title="FLOOD-PRONE" count={stats.floodProne} color="text-orange-600" />
                <StatCard title="HIGH VULNERABILITY" count={stats.highVulnerability} sub="Bedridden/Wheelchair" color="text-purple-600" />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3 rounded-sm">
                <div className="bg-yellow-400 p-1 rounded-full">
                    <Info size={16} className="text-white" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-yellow-900">ID Expiration Alerts</h4>
                    <p className="text-sm text-yellow-800">
                        {stats.expiringSoon} resident(s) have IDs expiring within 60 days. {stats.expired} resident(s) have expired IDs.
                        Automatic renewal reminders have been sent via SMS and Email.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <main className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Profile Registry
                        </h2>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 text-sm font-semibold hover:bg-black transition shadow-sm active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={18} /> Add Resident
                        </button>
                    </div>
                    <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by ID or Name..."
                                className="w-full bg-gray-50 border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Loader2 className="animate-spin mb-2" size={32} />
                                <p>Loading Registry...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                        <th onClick={() => requestSort('system_id')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center">System ID {getSortIcon('system_id')}</div>
                                        </th>
                                        <th onClick={() => requestSort('firstname')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center">Full Name {getSortIcon('firstname')}</div>
                                        </th>
                                        <th onClick={() => requestSort('type')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center">Category {getSortIcon('type')}</div>
                                        </th>
                                        <th onClick={() => requestSort('id_expiry_date')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center">ID Status {getSortIcon('id_expiry_date')}</div>
                                        </th>
                                        <th onClick={() => requestSort('days_left')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center">Days Left {getSortIcon('days_left')}</div>
                                        </th>
                                        <th className="px-6 py-4">Vulnerability</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAndSortedResidents.map((person) => {
                                        const daysLeft = calculateDaysLeft(person.id_expiry_date);
                                        return (
                                            <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{person.system_id}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{person.firstname} {person.lastname}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getTypeStyles(person.type)}`}>
                                                        {person.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <IDStatusBadge date={person.id_expiry_date} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-medium ${daysLeft !== null && daysLeft <= 0 ? 'text-red-600 font-bold' : daysLeft !== null && daysLeft <= 60 ? 'text-orange-600' : 'text-gray-600'}`}>
                                                        {daysLeft === null ? 'N/A' : daysLeft <= 0 ? 'EXPIRED' : `${daysLeft} days`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex gap-1">
                                                    {person.is_flood_prone && (
                                                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 text-[10px] font-bold rounded">Flood-Prone</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <ActionButton icon={<Eye size={16} />} onClick={() => handleViewClick(person)} />
                                                        <ActionButton icon={<Edit3 size={16} />} onClick={() => handleEditClick(person)} />
                                                        <ActionButton icon={<Trash2 size={16} />} onClick={() => handleDelete(person.system_id!)} color="text-red-400 hover:text-red-600" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const StatCard = ({ title, count, sub, color }: any) => (
    <div className="bg-white p-5 border border-gray-200 shadow-sm rounded-sm">
        <p className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">{title}</p>
        <p className={`text-4xl font-black ${color}`}>{count}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
);

const ActionButton = ({ icon, onClick, color = "text-gray-400 hover:text-gray-900" }: any) => (
    <button onClick={onClick} className={`p-1.5 border border-gray-200 rounded hover:bg-white transition ${color}`}>
        {icon}
    </button>
);

const IDStatusBadge = ({ date }: { date?: string }) => {
    if (!date) return <span className="text-gray-300 text-xs italic">No Date</span>;
    const now = new Date();
    const exp = new Date(date);
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (diff < 0) return <span className="bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold rounded">Expired</span>;
    if (diff < 60) return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 text-[10px] font-bold rounded">Near Expiration</span>;
    return <span className="bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold rounded">Active</span>;
};

const getTypeStyles = (type: string) => {
    switch (type?.toUpperCase()) {
        case 'BOTH': return 'bg-purple-50 text-purple-600 border border-purple-100';
        case 'SENIOR CITIZEN': case 'SC': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        case 'PWD': return 'bg-blue-50 text-blue-600 border border-blue-100';
        default: return 'bg-gray-50 text-gray-600';
    }
};

export default AdminRBIManagement;