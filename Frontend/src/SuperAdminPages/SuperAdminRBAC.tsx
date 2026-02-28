import { useState, useEffect } from 'react';
import {
    Users, Shield, Search,
    Plus, Edit, Lock, Unlock, X, CheckCircle
} from 'lucide-react';

// --- Types ---
type Role = 'Super Admin' | 'Admin';
type Status = 'Active' | 'Suspended';

interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    status: Status;
    permissions: string[];
    lastLogin: string;
    created: string;
}

// --- Mock Data ---
const INITIAL_USERS: User[] = [
    { id: 1, name: 'Super Admin', email: 'superadmin@b183.gov.ph', role: 'Super Admin', status: 'Active', permissions: ['*'], lastLogin: '2026-02-10 10:30:00', created: '2025-01-01' },
    { id: 2, name: 'Juan dela Cruz', email: 'juan.admin@b183.gov.ph', role: 'Admin', status: 'Active', permissions: ['rbi.manage', 'profiles.manage', 'benefits.manage'], lastLogin: '2026-02-10 09:15:00', created: '2025-06-15' },
    { id: 4, name: 'Pedro Garcia', email: 'pedro.admin@b183.gov.ph', role: 'Admin', status: 'Suspended', permissions: ['rbi.manage', 'profiles.manage'], lastLogin: '2026-01-28 14:20:00', created: '2025-03-10' },
];

export const SuperAdminRBAC = () => {
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ msg: string } | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const triggerToast = (msg: string) => {
        setToast({ msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveUser = (userData: Partial<User>) => {
        if (editingUser) {
            // Update existing user
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } as User : u));
            triggerToast(`Success: User ${userData.name} has been updated.`);
        } else {
            // Create new user (your previous logic)
            const userToAdd: User = {
                ...(userData as Omit<User, 'id' | 'lastLogin' | 'created' | 'status'>),
                id: Date.now(),
                status: 'Active',
                lastLogin: 'Never',
                created: new Date().toISOString().split('T')[0],
            };
            setUsers([...users, userToAdd]);
            triggerToast(`Success: User ${userData.name} has been added.`);
        }
        setIsModalOpen(false);
        setEditingUser(null);
    };




    const toggleStatus = (id: number) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));

        triggerToast(`Success: User ${user.name} was ${newStatus === 'Active' ? 'activated' : 'suspended'}`);

    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalUsers = users.length;
    const activeAdmins = users.filter(u => u.role === 'Admin' && u.status === 'Active').length;
    const activeSuperAdmins = users.filter(u => u.role === 'Super Admin' && u.status === 'Active').length;
    const suspendedCount = users.filter(u => u.status === 'Suspended').length;

    return (
        <div>
            {toast && (
                <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-sm shadow-xl animate-in slide-in-from-top-4 duration-300 slide-out-from-top-4 ease-in duration-300">
                    <CheckCircle className="text-emerald-400" size={20} />
                    <p className="font-semibold text-sm">{toast.msg}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        User Role-Based Access Control Management</h2>
        <p className="text-sm md:text-base text-gray-500 font-medium">
                        Control user access and implement role-based permissions

                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 sm:py-2 rounded sm text-sm font-semibold hover:bg-slate-800 transition"
                >
                    <Plus size={16} /> Add Account
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Users" value={totalUsers} icon={<Users size={20} className="text-slate-400" />} />
                <StatCard title="Active Admins" value={activeAdmins} icon={<Shield size={20} className="text-slate-400" />} />
                <StatCard title="Active Super Admins" value={activeSuperAdmins} icon={<Shield size={20} className="text-slate-400" />} />
                <StatCard title="Suspended" value={suspendedCount} icon={<Lock size={20} className="text-red-400" />} />
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col gap-4 mb-6">
                    <h3 className="font-bold text-lg text-slate-800">User Accounts</h3>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-3 sm:py-2 border border-slate-200 rounded sm text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <p className="text-s text-slate-500"> Manage user accounts and permissions </p>


                <div className="space-y-4">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="p-4 border border-slate-100 rounded sm hover:border-slate-200 transition bg-slate-50/50 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-800">{user.name}</h4>
                                    <p className="text-xs text-slate-500 break-all">{user.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Badge type={user.role} />
                                    <Badge type={user.status} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {user.permissions.map(p => (
                                    <span key={p} className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 font-mono text-slate-600">
                                        {p}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-2">
                                {user.role !== 'Super Admin' ? (
                                    <>
                                        <button
                                            onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded sm text-xs font-semibold hover:bg-slate-50"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(user.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded sm text-xs font-semibold text-white ${user.status === 'Active' ? 'bg-red-600' : 'bg-slate-900'}`}
                                        >
                                            {user.status === 'Active' ? <><Lock size={14} /> Suspend</> : <><Unlock size={14} /> Activate</>}
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-[10px] text-slate-400 italic py-2">System Protected</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <UserModal
                    user={editingUser}
                    onSave={handleSaveUser}
                    onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
                />
            )}

        </div>
    );
};

const Badge = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
        'Super Admin': 'bg-purple-100 text-purple-700',
        'Admin': 'bg-blue-100 text-blue-700',
        'Active': 'bg-green-100 text-green-700',
        'Suspended': 'bg-red-100 text-red-700'
    };
    return <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${colors[type] || 'bg-gray-100'}`}>{type}</span>;
};

const StatCard = ({ title, value, icon }: any) => (
    <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-xs font-semibold uppercase">{title}</p>
                <p className="text-2xl font-black mt-2">{value}</p>
            </div>
            {icon}
        </div>
    </div>
);


const UserModal = ({
    onClose,
    onSave,
    user
}: {
    onClose: () => void;
    onSave: (data: any) => void;
    user?: User | null;
}) => {
    // If 'user' prop exists, pre-fill the form
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || '',
        permissions: user?.permissions || [] as string[]
    });

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!formData.name || !formData.email || !formData.role) {
            setError('Please fill in all required fields.');
            return;
        }
        onSave(formData);
    };

    const togglePermission = (perm: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    useEffect(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;


        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, []);

    return (
<div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 h-svh">
<div className="bg-white p-6 sm:p-8 rounded-sm w-full max-w-[450px] shadow-xl max-h-[85svh] overflow-y-auto">                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">
                        {user ? 'Edit User' : 'Create New User'}
                    </h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold block mb-1">Full Name *</label>
                        <input className="w-full border border-slate-200 p-2 text-sm rounded-sm" placeholder="Juan dela Cruz" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1">Email Address *</label>
                        <input className="w-full border border-slate-200 p-2 text-sm rounded-sm" placeholder="juan@b183.gov.ph" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1">Role *</label>
                        <select className="w-full border border-slate-200 p-2 text-sm rounded-sm" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}>
                            <option value="" disabled>Select a role...</option>
                            <option value='Admin'>Admin (day-to-day operations)</option>
                            <option value='Super Admin'>Super Admin (highest privileges)</option>
                        </select>
                    </div>

                    <p className="text-xs font-bold mb-2">Permissions (Principle of Least Privilege)</p>
                    <div className="border rounded-sm h-48 overflow-y-scroll p-3 bg-slate-50">
                        {['Manage RBI Records (Core Data)',
                            'Manage PWD/SC Profiles (Core Data)',
                            'View PWD/SC Profiles (Core Data)',
                            'Manage Benefits & Relief (Operations)',
                            'View Benefits & Relief (Operations)',
                            'Send Emergency Alerts (Communications)',
                            'Send Notifications (Communications)',
                            'Manage Events (Content)',
                            'Manage CMS Content (Content)',
                            'View Reports (Analytics)',
                            'Export Data (Analytics)'
                        ].map(p => (
                            <label key={p} className="flex items-center gap-2 text-xs mb-2">
                                <input type="checkbox" checked={formData.permissions.includes(p)} onChange={() => togglePermission(p)} /> {p}
                            </label>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-sm border border-red-200">
                            {error}
                        </div>
                    )}

                </div>
                <div className="flex gap-2 mt-6">
                    <button onClick={onClose} className="flex-1 py-2 text-sm font-bold border rounded-sm">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 py-2 text-sm font-bold bg-slate-900 text-white rounded-sm">
                        {user ? 'Save Changes' : 'Create User'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SuperAdminRBAC;