import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
    Search, Eye, Edit3,
    Loader2, Trash2,
    Plus, ArrowUpDown, ArrowUp, ArrowDown,
    FileSpreadsheet, Printer, X, Download
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
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [residents, setResidents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const { token } = useAuth();

    const config = {
        headers: { Authorization: `Bearer ${token}` }
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

    const calculateDaysLeft = (expiryDate?: string) => {
        if (!expiryDate) return null;
        const now = new Date();
        const exp = new Date(expiryDate);
        const diffTime = exp.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

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
            return acc;
        }, { total: 0, expiringSoon: 0, expired: 0, floodProne: 0 });
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

    const requestSort = (key: keyof User | 'days_left') => {
        let direction: 'asc' | 'desc' = (sortConfig.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof User | 'days_left') => {
        if (sortConfig.key !== key) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={12} className="ml-1 text-blue-600" />
            : <ArrowDown size={12} className="ml-1 text-blue-600" />;
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/user/${id}`, config);
                fetchResidents();
            } catch (err) { console.error(err); }
        }
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

            {isExportModalOpen && (
                <ExportSelectionModal
                    residents={residents}
                    onClose={() => setIsExportModalOpen(false)}
                />
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase tracking-tighter -skew-x-12 bg-blue-900 bg-clip-text text-transparent">
                        Registry of Barangay Inhabitants
                    </h2>
                    <p className="text-sm text-gray-500">Manage PWD and Senior Citizen profiles</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition shadow-sm active:scale-95"
                    >
                        <FileSpreadsheet size={18} /> Export & Reports
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="TOTAL PROFILES" count={stats.total} color="text-gray-900" />
                <StatCard title="EXPIRING SOON" count={stats.expiringSoon} sub="Within 60 days" color="text-orange-500" />
                <StatCard title="EXPIRED IDS" count={stats.expired} color="text-red-600" />
                <StatCard title="FLOOD-PRONE" count={stats.floodProne} color="text-orange-600" />
            </div>

            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-75">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by ID or Name..."
                            className="w-full bg-gray-50 border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
                        />
                    </div>
                    <button
                        onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 text-sm font-semibold hover:bg-black transition"
                    >
                        <Plus size={18} /> Add Resident
                    </button>
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
                                <tr className="text-[11px] font-bold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <th onClick={() => requestSort('system_id')} className="px-6 py-4 cursor-pointer">ID {getSortIcon('system_id')}</th>
                                    <th onClick={() => requestSort('firstname')} className="px-6 py-4 cursor-pointer">Name {getSortIcon('firstname')}</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAndSortedResidents.map((person) => (
                                    <tr key={person.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-bold">{person.system_id}</td>
                                        <td className="px-6 py-4 text-sm">{person.firstname} {person.lastname}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getTypeStyles(person.type)}`}>
                                                {person.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <IDStatusBadge date={person.id_expiry_date} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <ActionButton icon={<Eye size={16} />} onClick={() => { setSelectedUser(person); setIsViewDetailsOpen(true); }} />
                                                <ActionButton icon={<Edit3 size={16} />} onClick={() => { setSelectedUser(person); setIsModalOpen(true); }} />
                                                <ActionButton icon={<Trash2 size={16} />} onClick={() => handleDelete(person.system_id!)} color="text-red-400 hover:text-red-600" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * EXPORT & PRINT MODAL COMPONENT
 */
const ExportSelectionModal = ({ residents, onClose }: { residents: User[], onClose: () => void }) => {

    const getFilteredList = (filterType: string) => {
        const now = new Date();
        const sixtyDays = new Date();
        sixtyDays.setDate(now.getDate() + 60);

        let list = [...residents];
        let title = "Resident Registry";

        if (filterType === 'PWD') {
            list = list.filter(r => r.type === 'PWD' || r.type?.toLowerCase() === 'both');
            title = "PWD Report";
        }
        else if (filterType === 'SC') {
            list = list.filter(r => r.type?.toLowerCase() === 'senior citizen' || r.type?.toLowerCase() === 'sc' || r.type?.toLowerCase() === 'both');
            title = "Senior Citizen Report";
        }
        else if (filterType === 'FLOOD') {
            list = list.filter(r => r.is_flood_prone);
            title = "Flood-Prone Areas Report";
        }
        else if (filterType === 'EXPIRED') {
            list = list.filter(r => r.id_expiry_date && new Date(r.id_expiry_date) < now);
            title = "Expired ID Report";
        }
        else if (filterType === 'EXPIRING') {
            list = list.filter(r => r.id_expiry_date && new Date(r.id_expiry_date) >= now && new Date(r.id_expiry_date) <= sixtyDays);
            title = "Expiring IDs (Next 60 Days)";
        }

        return { list, title };
    };

    const handleExcel = (filterType: string) => {
        const { list, title } = getFilteredList(filterType);

        const dataToExport = list.map(r => ({
            'System ID': r.system_id,
            'First Name': r.firstname,
            'Last Name': r.lastname,
            'Category': r.type,
            'Expiry Date': r.id_expiry_date || 'N/A',
            'Flood Prone': r.is_flood_prone ? 'Yes' : 'No',
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = (filterType: string) => {
        const { list, title } = getFilteredList(filterType);

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>Print - ${title}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f2f2f2; }
                        h1 { text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 5px; }
                        .date { text-align: right; font-size: 10px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="date">Generated on: ${new Date().toLocaleString()}</div>
                    <h1>${title}</h1>
                    <p style="text-align:center; font-size: 12px; color: #444;">Total Records: ${list.length}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>System ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Expiry Date</th>
                                <th>Flood Prone</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.map(r => `
                                <tr>
                                    <td>${r.system_id}</td>
                                    <td>${r.firstname} ${r.lastname}</td>
                                    <td>${r.type}</td>
                                    <td>${r.id_expiry_date || 'N/A'}</td>
                                    <td>${r.is_flood_prone ? 'YES' : 'NO'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Export & Reports Center</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={20} /></button>
                </div>

                <div className="p-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase text-gray-400 font-bold border-b">
                                <th className="pb-3">Report Type</th>
                                <th className="pb-3 text-center">Excel</th>
                                <th className="pb-3 text-center">Print / PDF</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <ReportRow label="All Residents" onExcel={() => handleExcel('ALL')} onPrint={() => handlePrint('ALL')} />
                            <ReportRow label="PWD Residents" onExcel={() => handleExcel('PWD')} onPrint={() => handlePrint('PWD')} />
                            <ReportRow label="Senior Citizens" onExcel={() => handleExcel('SC')} onPrint={() => handlePrint('SC')} />
                            <ReportRow label="Flood-Prone Areas" onExcel={() => handleExcel('FLOOD')} onPrint={() => handlePrint('FLOOD')} />
                            <ReportRow label="Expired IDs" labelColor="text-red-600" onExcel={() => handleExcel('EXPIRED')} onPrint={() => handlePrint('EXPIRED')} />
                            <ReportRow label="Expiring Soon" labelColor="text-orange-600" onExcel={() => handleExcel('EXPIRING')} onPrint={() => handlePrint('EXPIRING')} />
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50 border-t text-center">
                    <p className="text-xs text-gray-500">Reports are generated based on the current system date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

const ReportRow = ({ label, onExcel, onPrint, labelColor = "text-gray-700" }: any) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className={`py-4 font-semibold text-sm ${labelColor}`}>{label}</td>
        <td className="py-4 text-center">
            <button onClick={onExcel} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors" title="Download Excel">
                <Download size={18} />
            </button>
        </td>
        <td className="py-4 text-center">
            <button onClick={onPrint} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Print Report">
                <Printer size={18} />
            </button>
        </td>
    </tr>
);

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
    if (diff < 60) return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 text-[10px] font-bold rounded">Near Expiry</span>;
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