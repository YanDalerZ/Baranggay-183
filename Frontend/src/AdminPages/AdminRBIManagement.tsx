import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  MapPin, 
  AlertCircle
} from 'lucide-react';

// --- Types ---
interface Resident {
  id: string;
  name: string;
  type: 'Both' | 'Senior Citizen' | 'PWD';
  age: number;
  gender: string;
  address: string;
  isFloodProne: boolean;
}

// --- Mock Data ---
const residents: Resident[] = [
  { id: 'PWD-001', name: 'Maria Santos', type: 'Both', age: 60, gender: 'Female', address: 'Block 1, Lot 15, Camarin Road', isFloodProne: true },
  { id: 'SC-001', name: 'Pedro Reyes', type: 'Senior Citizen', age: 67, gender: 'Male', address: 'Block 2, Lot 8, Bagong Silang Avenue', isFloodProne: false },
  { id: 'PWD-002', name: 'Rosa Cruz', type: 'PWD', age: 40, gender: 'Female', address: 'Block 3, Lot 22, Camarin Street', isFloodProne: true },
  { id: 'SC-002', name: 'Jose Mendoza', type: 'Senior Citizen', age: 66, gender: 'Male', address: 'Block 1, Lot 30, Bagong Silang Road', isFloodProne: false },
  { id: 'PWD-003', name: 'Carmen Gonzales', type: 'PWD', age: 55, gender: 'Female', address: 'Block 4, Lot 12, Camarin Avenue', isFloodProne: true },
  { id: 'PWD-004', name: 'Roberto Dela Cruz', type: 'Both', age: 80, gender: 'Male', address: 'Block 2, Lot 5, Camarin Road', isFloodProne: true },
];

const AdminRBIManagement = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
      
      {/* Responsive Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          RBI Management
        </h2>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-3  font-bold hover:bg-gray-800 transition shadow-lg active:scale-95">
          <Plus size={20} /> Add Resident
        </button>
      </header>

      <main>
        <div className="bg-white  border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Table Header Section */}
          <div className="p-4 sm:p-8">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900">Registry of Barangay Inhabitants</h2>
              <p className="text-sm text-gray-500">Manage PWD and Senior Citizen profiles</p>
            </div>

            {/* Search Bar - Full width on mobile */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, ID, or address..." 
                className="w-full bg-gray-50 border-none  py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* Table Container with horizontal scroll safety */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
                <thead>
                  <tr className="text-sm font-bold text-gray-900 border-b border-gray-50">
                    <th className="pb-4 pr-4 pl-4 sm:pl-0">Name</th>
                    <th className="pb-4 pr-4">Type</th>
                    {/* Hidden on small mobile to save space */}
                    <th className="pb-4 pr-4 hidden sm:table-cell">Age/Sex</th>
                    <th className="pb-4 pr-4">Address</th>
                    <th className="pb-4 pr-4 text-center">Status</th>
                    <th className="pb-4 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {residents.map((person) => (
                    <tr key={person.id} className="group hover:bg-gray-50/50 transition">
                      <td className="py-5 pl-4 sm:pl-0">
                        <div className="font-bold text-gray-900">{person.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono sm:hidden">{person.id}</div>
                      </td>
                      <td className="py-5">
                        <span className={`px-3 py-1  text-[11px] font-bold whitespace-nowrap ${getTypeStyles(person.type)}`}>
                          {person.type}
                        </span>
                      </td>
                      <td className="py-5 hidden sm:table-cell text-sm text-gray-600">
                        {person.age} / {person.gender.charAt(0)}
                      </td>
                      <td className="py-5 text-sm text-gray-600 max-w-[150px] md:max-w-[250px] truncate">
                        {person.address}
                      </td>
                      <td className="py-5 text-center">
                        {person.isFloodProne ? (
                          <span className="inline-flex items-center gap-1 bg-red-600 text-white px-2 py-1  text-[9px] font-black uppercase tracking-tighter">
                            <AlertCircle size={10} /> Flood
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-5 pr-4 sm:pr-0">
                        <div className="flex justify-end gap-2 md:gap-4 text-gray-400">
                          <button className="p-2 hover:bg-blue-50 hover:text-blue-600  transition"><Eye size={18} /></button>
                          <button className="p-2 hover:bg-gray-100 hover:text-gray-900  transition"><Edit3 size={18} /></button>
                          <button className="p-2 hover:bg-green-50 hover:text-green-600  transition"><MapPin size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer Pagination Info */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400 font-medium">
              <p>Showing {residents.length} residents</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-100  hover:bg-gray-50">Prev</button>
                <button className="px-4 py-2 border border-gray-100  hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'Both': return 'bg-purple-100 text-purple-700';
    case 'Senior Citizen': return 'bg-green-100 text-green-700';
    case 'PWD': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default AdminRBIManagement;