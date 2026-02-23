import React from 'react';
import {
  Search,
  Eye,
  Edit3,
  Trash2,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

// --- Types & Mock Data ---
interface Profile {
  id: string;
  name: string;
  category: 'Both' | 'Senior Citizen' | 'PWD';
  disabilityType: string;
  idStatus: 'Near Expiration' | 'Active' | 'Expired';
  vulnerabilities: string[];
}

const profiles: Profile[] = [
  { id: 'PWD-001', name: 'Maria Santos', category: 'Both', disabilityType: 'Visual Impairment', idStatus: 'Near Expiration', vulnerabilities: ['Flood-Prone'] },
  { id: 'SC-001', name: 'Pedro Reyes', category: 'Senior Citizen', disabilityType: 'N/A', idStatus: 'Active', vulnerabilities: [] },
  { id: 'PWD-002', name: 'Rosa Cruz', category: 'PWD', disabilityType: 'Orthopedic Disability', idStatus: 'Active', vulnerabilities: ['Flood-Prone'] },
  { id: 'SC-002', name: 'Jose Mendoza', category: 'Senior Citizen', disabilityType: 'N/A', idStatus: 'Expired', vulnerabilities: [] },
  { id: 'PWD-003', name: 'Carmen Gonzales', category: 'PWD', disabilityType: 'Hearing Impairment', idStatus: 'Near Expiration', vulnerabilities: ['Flood-Prone'] },
  { id: 'PWD-004', name: 'Roberto Dela Cruz', category: 'Both', disabilityType: 'Mobility Impairment', idStatus: 'Expired', vulnerabilities: ['Flood-Prone', 'Bedridden'] },
];

const ProfileManagement = () => {
  return (
    /* Unified Max-Width and Padding for the whole page */
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">

      {/* Header Section: Aligned to container edge */}
      <header className="space-y-2">
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          PWD & Senior Citizen Profiles
        </h2>
        <p className="text-sm md:text-base text-gray-500 font-medium">
          PWD and Senior Citizen profiles for Barangay 183.
        </p>
      </header>

      {/* Main Content: No extra px-8 or max-w-1600 to ensure alignment */}
      <main className="space-y-8">

        {/* Summary Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Profiles" value="6" />
          <StatCard title="Expiring Soon" value="2" subtext="Within 60 days" valueColor="text-orange-500" />
          <StatCard title="Expired IDs" value="2" valueColor="text-red-600" />
          <StatCard title="Flood-Prone" value="4" valueColor="text-orange-600" />
          <StatCard title="High Vulnerability" value="2" subtext="Bedridden/Wheelchair" valueColor="text-purple-600" />
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-100 shadow-sm  overflow-hidden">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Registry</h2>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by ID or Name..."
                  className="w-full bg-gray-50 border-none py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none "
                />
              </div>
              <div className="flex flex-row gap-2">
                <FilterDropdown label="Categories" />
                <FilterDropdown label="Status" />
              </div>
            </div>

            {/* Profiles Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="text-[13px] font-bold text-gray-900 border-b border-gray-100">
                    <th className="pb-4 px-2 first:pl-0">System ID</th>
                    <th className="pb-4 px-2">Full Name</th>
                    <th className="pb-4 px-2">Category</th>
                    <th className="pb-4 px-2">Disability Type</th>
                    <th className="pb-4 px-2">ID Status</th>
                    <th className="pb-4 px-2">Vulnerability</th>
                    <th className="pb-4 px-2 text-right last:pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {profiles.map((person) => (
                    <tr key={person.id} className="group hover:bg-gray-50/50 transition">
                      <td className="py-4 px-2 first:pl-0 text-sm font-bold text-gray-900">{person.id}</td>
                      <td className="py-4 px-2 text-sm font-medium text-gray-700">{person.name}</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 bg-gray-100  text-[11px] font-bold text-gray-600">
                          {person.category}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-600">{person.disabilityType}</td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1  text-[11px] font-bold ${getStatusStyles(person.idStatus)}`}>
                          {person.idStatus}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-wrap gap-1">
                          {person.vulnerabilities.map(v => (
                            <span key={v} className={`px-2 py-0.5  text-[10px] font-bold ${getVulnerabilityStyles(v)}`}>
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right last:pr-0">
                        <div className="flex justify-end gap-2">
                          <ActionButton icon={<Eye size={16} />} />
                          <ActionButton icon={<Edit3 size={16} />} />
                          <ActionButton icon={<Trash2 size={16} />} variant="danger" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Alert */}
        <div className="bg-yellow-50/50 border border-yellow-200  p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
          <AlertCircle className="text-yellow-600 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-yellow-900">ID Expiration Alerts</h4>
            <p className="text-sm text-yellow-800 leading-relaxed">
              2 resident(s) have IDs expiring within 60 days. 2 resident(s) have expired IDs.
              Automatic renewal reminders have been sent via SMS and Email.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components & Styles (StatCard, FilterDropdown, etc.) stay the same as previous ---
const StatCard = ({ title, value, subtext, valueColor = "text-gray-900" }: any) => (
  <div className="bg-white p-5 border border-gray-100 shadow-sm  h-32 flex flex-col justify-between">
    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{title}</p>
    <div>
      <p className={`text-3xl font-black ${valueColor}`}>{value}</p>
      {subtext && <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{subtext}</p>}
    </div>
  </div>
);

const FilterDropdown = ({ label }: { label: string }) => (
  <div className="bg-gray-100/80 px-4 py-2  flex items-center justify-between min-w-[120px] sm:min-w-[160px] cursor-pointer hover:bg-gray-200 transition">
    <span className="text-sm font-bold text-gray-800">{label}</span>
    <ChevronDown size={16} className="text-gray-400 ml-2" />
  </div>
);

const ActionButton = ({ icon, variant = 'default' }: { icon: React.ReactNode, variant?: 'default' | 'danger' }) => (
  <button className={`p-2 border  transition ${variant === 'danger'
      ? 'border-red-100 text-red-500 hover:bg-red-50'
      : 'border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50 shadow-sm'
    }`}>
    {icon}
  </button>
);

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-700';
    case 'Near Expiration': return 'bg-yellow-100 text-yellow-700';
    case 'Expired': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getVulnerabilityStyles = (v: string) => {
  if (v === 'Flood-Prone') return 'bg-orange-50 text-orange-600 border border-orange-100';
  if (v === 'Bedridden') return 'bg-purple-50 text-purple-600 border border-purple-100';
  return 'bg-gray-50 text-gray-600';
};

export default ProfileManagement;