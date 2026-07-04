import { useState, useEffect } from 'react';
import {
    Users, Shield, Search,
    Plus, Edit, Trash2, X, CheckCircle
} from 'lucide-react';
import { type User, API_BASE_URL } from '../interfaces';
import { useAuth } from '../context/AuthContext';

// --- Types strictly aligned with Backend SuperAdminUserController ---
export type Role = 3 | 1; // 3: Super Admin, 1: Admin
export type Status = 'active' | 'inactive';

export const SuperAdminRBAC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ msg: string } | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { token } = useAuth();
    const [activeFilter, setActiveFilter] = useState<'all' | 'admin' | 'superadmin' | 'inactive'>('all');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const triggerToast = (msg: string) => {
        setToast({ msg });
        setTimeout(() => setToast(null), 4000);
    };

    // --- Fetch Users from Backend ---
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/superadmin/`, config);
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            triggerToast('Error: Could not retrieve accounts from the database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- Create or Update User via API ---
    const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
        try {
            if (editingUser) {
                // Update existing user via PUT /api/superadmin/users/:system_id
                const response = await fetch(`${API_BASE_URL}/api/superadmin/${editingUser.system_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...config.headers },
                    body: JSON.stringify(userData),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to update user');

                triggerToast(`Success: User records updated successfully.`);
            } else {
                // Create new user via POST /api/superadmin/users
                const response = await fetch(`${API_BASE_URL}/api/superadmin/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...config.headers },
                    body: JSON.stringify(userData),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to create user');

                triggerToast(`Success! Generated Password: ${result.data.generated_password}`);
            }

            fetchUsers();
            setIsModalOpen(false);
            setEditingUser(null);
        } catch (error: any) {
            console.error('Error saving user:', error);
            triggerToast(`Error: ${error.message}`);
        }
    };

    // --- Delete User via API ---
    const handleDeleteUser = async (system_id: string) => {
        if (!window.confirm(`Are you sure you want to permanently delete user ${system_id}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/superadmin/${system_id}`, {
                method: 'DELETE',
                headers: config.headers
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to delete user');

            triggerToast(`Success: Account ${system_id} deleted successfully.`);
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            triggerToast(`Error: ${error.message}`);
        }
    };

    const filteredUsers = users.filter(u => {
        const fullName = `${u.firstname || ''} ${u.lastname || ''}`.toLowerCase();
        const searchStr = search.toLowerCase();

        // Check search match
        const matchesSearch = (
            fullName.includes(searchStr) ||
            (u.email && u.email.toLowerCase().includes(searchStr)) ||
            (u.system_id && u.system_id.toLowerCase().includes(searchStr))
        );

        // Check card filter match
        let matchesFilter = true;
        if (activeFilter === 'admin') {
            matchesFilter = Number(u.role) === 1 && u.status === 'active';
        } else if (activeFilter === 'superadmin') {
            matchesFilter = Number(u.role) === 3 && u.status === 'active';
        } else if (activeFilter === 'inactive') {
            matchesFilter = u.status === 'inactive';
        }

        return matchesSearch && matchesFilter;
    });

    const totalUsers = users.length;
    const activeAdmins = users.filter(u => Number(u.role) === 1 && u.status === 'active').length;
    const activeSuperAdmins = users.filter(u => Number(u.role) === 3 && u.status === 'active').length;
    const inactiveCount = users.filter(u => u.status === 'inactive').length;

    return (
        <div>
            {toast && (
                <div className="fixed bottom-5 right-5 z-100 flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-sm shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                    <p className="font-semibold text-sm select-all">{toast.msg}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        User Role-Based Access Control Management
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">
                        Control administrator credentials and system access permissions
                    </p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 sm:py-2 rounded-sm text-sm font-semibold hover:bg-slate-800 transition"
                >
                    <Plus size={16} /> Add Account
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div onClick={() => setActiveFilter('all')} className={`cursor-pointer transition-all ${activeFilter === 'all' ? 'ring-2 ring-slate-900 shadow-md' : 'opacity-80 hover:opacity-100'}`}>
                    <StatCard title="Total Users" value={totalUsers} icon={<Users size={20} className="text-slate-400" />} />
                </div>
                <div onClick={() => setActiveFilter('admin')} className={`cursor-pointer transition-all ${activeFilter === 'admin' ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-80 hover:opacity-100'}`}>
                    <StatCard title="Active Admins" value={activeAdmins} icon={<Shield size={20} className="text-slate-400" />} />
                </div>
                <div onClick={() => setActiveFilter('superadmin')} className={`cursor-pointer transition-all ${activeFilter === 'superadmin' ? 'ring-2 ring-purple-500 shadow-md' : 'opacity-80 hover:opacity-100'}`}>
                    <StatCard title="Active Super Admins" value={activeSuperAdmins} icon={<Shield size={20} className="text-purple-400" />} />
                </div>
                <div onClick={() => setActiveFilter('inactive')} className={`cursor-pointer transition-all ${activeFilter === 'inactive' ? 'ring-2 ring-red-500 shadow-md' : 'opacity-80 hover:opacity-100'}`}>
                    <StatCard title="Inactive / Suspended" value={inactiveCount} icon={<Trash2 size={20} className="text-red-400" />} />
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col gap-4 mb-6">
                    <h3 className="font-bold text-lg text-slate-800">User Accounts</h3>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, email or system id..."
                            className="w-full pl-10 pr-4 py-3 sm:py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-sm font-medium text-slate-500">Loading dynamic database records...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="p-4 border border-slate-100 rounded-sm hover:border-slate-200 transition bg-slate-50/50 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-slate-800">{user.firstname} {user.lastname}</h4>
                                            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono font-bold">
                                                {user.system_id}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 break-all mt-0.5">{user.email || 'No email registered'}</p>
                                        <p className="text-xs text-slate-400">{user.contact_number || 'No contact number'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge type={Number(user.role) === 3 ? 'Super Admin' : 'Admin'} />
                                        <Badge type={user.status ? 'active' : 'inactive'} />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-sm text-xs font-semibold hover:bg-slate-50 transition"
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.system_id ? user.system_id : '')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 border border-red-200 text-red-600 rounded-sm text-xs font-semibold hover:bg-red-100 transition"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-6 text-sm text-slate-400">No matching user records found.</div>
                        )}
                    </div>
                )}
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
        'active': 'bg-green-100 text-green-700',
        'inactive': 'bg-gray-100 text-gray-700',
        'suspended': 'bg-red-100 text-red-700'
    };
    return <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${colors[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>;
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
    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        email: user?.email || '',
        contact_number: user?.contact_number || '',
        role: user?.role || '' as any,
        status: user?.status || 'active',
        password: ''
    });

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!formData.firstname || !formData.lastname || !formData.role) {
            setError('Please fill in all required fields (Firstname, Lastname, Role).');
            return;
        }
        onSave(formData);
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
            <div className="bg-white p-6 sm:p-8 rounded-sm w-full max-w-112.5 shadow-xl max-h-[85svh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">
                        {user ? `Edit User (${user.system_id})` : 'Create New User'}
                    </h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold block mb-1">First Name *</label>
                        <input className="w-full border border-slate-200 p-2 text-sm rounded-sm" placeholder="Juan" value={formData.firstname} onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1">Last Name *</label>
                        <input className="w-full border border-slate-200 p-2 text-sm rounded-sm" placeholder="dela Cruz" value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1">Email Address</label>
                        <input type="email" className="w-full border border-slate-200 p-2 text-sm rounded-sm" placeholder="juan@domain.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1">Contact Number</label>
                        <input className="w-full border border-slate-200 p-2 text-sm rounded-sm" placeholder="09XXXXXXXXX" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1">Role *</label>
                        <select className="w-full border border-slate-200 p-2 text-sm rounded-sm" value={formData.role} onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) as Role })}>
                            <option value="" disabled>Select a role...</option>
                            <option value={1}>Admin (Role 1)</option>
                            <option value={3}>Super Admin (Role 3)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1">Account Status *</label>
                        <select className="w-full border border-slate-200 p-2 text-sm rounded-sm" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1">
                            {user ? 'New Password (Leave blank to keep current)' : 'Password (Leave blank to auto-generate)'}
                        </label>
                        <input
                            type="password"
                            className="w-full border border-slate-200 p-2 text-sm rounded-sm"
                            placeholder={user ? "••••••••" : "Auto-generated format if empty"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
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