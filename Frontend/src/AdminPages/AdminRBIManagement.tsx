import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Eye, Edit3, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import AddResidentForm from './AdminComponents/RBIForm';
import ViewUserDetails from './AdminComponents/UserDetails';
import { type User, API_BASE_URL } from '../interfaces';

const AdminRBIManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [residents, setResidents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

    const fetchResidents = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/user/`);
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

    const filteredResidents = residents.filter(person =>
        `${person.firstname} ${person.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.system_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateAge = (birthday: string) => {
        if (!birthday) return 'N/A';
        const ageDifMs = Date.now() - new Date(birthday).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
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

    const handleCloseViewModal = () => {
        setIsViewDetailsOpen(false);
        setSelectedUser(null);
    };

    const handleCloseFormModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        fetchResidents();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <AddResidentForm
                isOpen={isModalOpen}
                initialData={selectedUser}
                onClose={handleCloseFormModal}
            />

            <ViewUserDetails
                isOpen={isViewDetailsOpen}
                onClose={handleCloseViewModal}
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

            <main className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, ID, or address..."
                            className="w-full bg-gray-50 border border-gray-200 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-50 focus:border-blue-400 outline-none transition"
                        />
                    </div>

                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 text-sm font-semibold hover:bg-black transition shadow-sm active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Resident
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p className="text-sm">Fetching inhabitants...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4">System ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Age</th>
                                    <th className="px-6 py-4">Gender</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredResidents.map((person) => (
                                    <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            {person.system_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                            {person.firstname} {person.lastname}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[11px] font-bold ${getTypeStyles(person.type)}`}>
                                                {person.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {calculateAge(person.birthday)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {person.gender}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                                            {person.address}
                                        </td>
                                        <td className="px-6 py-4">
                                            {person.is_flood_prone ? (
                                                <span className="inline-flex items-center gap-1.5 bg-[#E11D48] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-tight">
                                                    <AlertCircle size={12} /> Flood Prone
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3 text-gray-400">
                                                <button
                                                    onClick={() => handleViewClick(person)}
                                                    className="p-1 hover:text-blue-600 transition"
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(person)}
                                                    className="p-1 hover:text-gray-900 transition"
                                                    title="Edit Profile"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button className="p-1 hover:text-gray-900 transition" title="View Location">
                                                    <MapPin size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <p>Showing {filteredResidents.length} of {residents.length} residents</p>
                </div>
            </main>
        </div>
    );
};

const getTypeStyles = (type: string) => {
    switch (type) {
        case 'Both': return 'bg-purple-100 text-purple-700';
        case 'SC': return 'bg-green-100 text-green-700';
        case 'PWD': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-600';
    }
};

export default AdminRBIManagement;