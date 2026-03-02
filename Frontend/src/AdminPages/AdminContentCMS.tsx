import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  BookOpen,
  Clock,
  Info,
  Loader2,
  Search,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../interfaces';
import AddGuideModal from './AdminComponents/AddServiceGuide';
import ViewGuideModal from './AdminComponents/ViewGuide';

interface ServiceGuide {
  id: number;
  title: string;
  category: string;
  processing_time: string;
  requirements?: string | string[]; // Added to support viewing details
  steps: string | string[]; // Support both API formats
  last_updated: string;
  office_hours?: string;
}

const AdminContentCMS = () => {
  const [activeTab, setActiveTab] = useState<'guides' | 'forms'>('guides');
  const [guides, setGuides] = useState<ServiceGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for Viewing a Guide
  const [selectedGuide, setSelectedGuide] = useState<ServiceGuide | null>(null);

  const { token } = useAuth();

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [guidesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/serviceguide`, config)]);
      setGuides(guidesRes.data);
    } catch (err) {
      console.error("CMS Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const filteredGuides = guides.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (loading && guides.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00308F]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          Content Management
        </h2>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-tight">Barangay Digital Transformation Hub</p>
      </header>

      <main className="space-y-6">


        {/* CMS Container */}
        <section className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-xl">
          <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-gray-900" />
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">Management System</h2>
            </div>

            {/* Integrated Search */}
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-transparent text-sm outline-none w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Responsive Tabs */}
            <div className="bg-gray-100 p-1 flex mb-6 w-full lg:max-w-md rounded-lg">
              <button
                onClick={() => { setActiveTab('guides'); setSearchTerm(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'guides' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Services Guide
              </button>

            </div>

            {activeTab === 'guides' ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-gray-400">Knowledge Base for ID Applications and Services</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-black text-white px-5 py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#00308F] transition shadow-lg shadow-gray-200"
                  >
                    <Plus size={18} /> Add New Guide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGuides.map((guide) => (
                    <div key={guide.id} onClick={() => setSelectedGuide(guide)}>
                      <GuideCard guide={guide} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-gray-400 font-medium">Online-to-Offline (O2O) Workflow</p>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0 border border-gray-50 rounded-lg">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                        <th className="px-4 py-4">Resident</th>
                        <th className="px-4 py-4">Form Type</th>
                        <th className="px-4 py-4">Submitted</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">

                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* O2O Logic Info Box */}
          <div className="m-4 md:m-6 p-6 bg-[#00308F]/5 border border-[#00308F]/10 flex flex-col md:flex-row gap-4 rounded-xl">
            <Info className="text-[#00308F] shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-[#00308F] mb-1 uppercase tracking-tight">O2O Logic Implementation</h4>
              <p className="text-xs text-gray-600 leading-relaxed max-w-5xl">
                This CMS facilitates the <strong>Online-to-Offline</strong> bridge. Pre-verifying residents here allows them to spend 70% less time at the Barangay Hall. Approved forms trigger an automated notification for the resident to proceed with their physical appearance.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <AddGuideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />

      <ViewGuideModal
        guide={selectedGuide}
        onClose={() => setSelectedGuide(null)}
      />
    </div>
  );
};

const GuideCard = ({ guide }: { guide: ServiceGuide }) => {
  const stepCount = Array.isArray(guide.steps)
    ? guide.steps.length
    : (typeof guide.steps === 'string' ? JSON.parse(guide.steps).length : 0);

  return (
    <div className="group bg-white p-6 border border-gray-100 hover:border-[#00308F] transition-all cursor-pointer relative overflow-hidden rounded-xl shadow-sm hover:shadow-md">
      <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
        <BookOpen size={16} className="text-gray-300 group-hover:text-[#00308F]" />
      </div>
      <h4 className="font-black text-gray-900 mb-1 pr-6 uppercase text-sm group-hover:text-[#00308F] transition-colors">{guide.title}</h4>
      <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#00308F] text-[9px] font-black uppercase mb-4 rounded">
        {guide.category}
      </span>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Clock size={14} className="text-gray-300" /> {guide.processing_time}
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <FileText size={14} className="text-gray-300" />
          {stepCount} Steps
        </div>
        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] text-gray-300 font-medium italic">
            Sync: {new Date(guide.last_updated).toLocaleDateString()}
          </p>
          <span className="text-[9px] font-black text-[#00308F] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminContentCMS;