import React, { useState }  from'react';
import { 
  FileText, 
  Plus, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Info
} from 'lucide-react';

// --- Types ---
interface ServiceGuide {
  id: string;
  title: string;
  category: string;
  processingTime: string;
  steps: number;
  lastUpdated: string;
}

interface InterestForm {
  resident: string;
  id: string;
  type: string;
  date: string;
  status: 'Pending' | 'Pre-verified' | 'Approved' | 'Completed';
}

const AdminContentCMS = () => {
  const [activeTab, setActiveTab] = useState<'guides' | 'forms'>('guides');

  const guides: ServiceGuide[] = [
    { id: '1', title: 'PWD ID Application', category: 'ID Application', processingTime: '5-7 business days', steps: 7, lastUpdated: '2026-01-15' },
    { id: '2', title: 'Senior Citizen ID Application', category: 'ID Application', processingTime: '3-5 business days', steps: 6, lastUpdated: '2026-01-15' },
    { id: '3', title: 'Medical Assistance Application', category: 'Medical Assistance', processingTime: '3-5 business days', steps: 6, lastUpdated: '2026-01-20' },
  ];

  const forms: InterestForm[] = [
    { resident: 'Rosa Cruz', id: 'PWD-002', type: 'Financial Aid', date: '2026-02-05', status: 'Pending' },
    { resident: 'Carmen Gonzales', id: 'PWD-003', type: 'ID Application', date: '2026-02-07', status: 'Pre-verified' },
    { resident: 'Jose Mendoza', id: 'SC-002', type: 'Medical Assistance', date: '2026-02-08', status: 'Approved' },
  ];

  return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
            <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Content Management</h2>


      <main>
        
        {/* Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatBox title="Service Guides" value="3" />
          <StatBox title="Total Forms" value="3" />
          <StatBox title="Pending" value="1" valueColor="text-orange-500" />
          <StatBox title="Pre-verified" value="1" valueColor="text-blue-600" />
          <StatBox title="Approved" value="1" valueColor="text-green-600" />
        </div>

        {/* CMS Container */}
        <section className="bg-white  border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-50 flex items-center gap-2">
            <FileText size={20} className="text-gray-900" />
            <h2 className="text-base font-bold text-gray-900">Content Management System</h2>
          </div>

          <div className="p-4 md:p-6">
            {/* Responsive Tabs */}
            <div className="bg-gray-50 p-1  flex mb-6 w-full lg:max-w-3xl">
              <button 
                onClick={() => setActiveTab('guides')}
                className={`flex-1 py-2.5 text-xs md:text-sm font-bold  transition-all ${activeTab === 'guides' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Services Guide
              </button>
              <button 
                onClick={() => setActiveTab('forms')}
                className={`flex-1 py-2.5 text-xs md:text-sm font-bold  transition-all ${activeTab === 'forms' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Community Interest Forms
              </button>
            </div>

            {activeTab === 'guides' ? (
              /* Services Guide View */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-gray-400">Knowledge Base for ID Applications and Services</p>
                  <button className="w-full sm:w-auto bg-black text-white px-5 py-2.5  text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                    <Plus size={18} /> Add New Guide
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guides.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
              </div>
            ) : (
              /* Community Interest Forms View */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-gray-400 font-medium">Online-to-Offline (O2O) Form Processing</p>
                  <select className="w-full sm:w-auto bg-gray-50 border-none  text-sm font-bold py-2 px-4 focus:ring-2 focus:ring-gray-200 outline-none">
                    <option>All Forms</option>
                    <option>Pending</option>
                    <option>Approved</option>
                  </select>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                        <th className="px-4 py-4">Resident</th>
                        <th className="px-4 py-4">Form Type</th>
                        <th className="px-4 py-4">Submitted Date</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Details</th>
                        <th className="px-4 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {forms.map((form) => (
                        <FormRow key={form.id} form={form} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* O2O Logic Info Box */}
          <div className="m-4 md:m-6 p-6 bg-purple-50/50 border border-purple-100  flex flex-col md:flex-row gap-4">
            <Info className="text-purple-600 shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-purple-900 mb-1">Online-to-Offline (O2O) Logic</h4>
              <p className="text-xs text-purple-800 leading-relaxed max-w-5xl">
                The system collects residents' preliminary data and intent digitally, allowing admins to pre-verify their eligibility before the resident visits the physical Barangay Hall. This significantly reduces foot traffic and processing time. Pre-verified residents receive priority scheduling for walk-in appointments.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Actions */}
          <div className="bg-white  border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-5">Pending Actions</h3>
            <div className="p-4 bg-orange-50/50  border border-orange-100 flex justify-between items-center group cursor-pointer hover:bg-orange-50 transition-colors">
              <div>
                <p className="font-bold text-gray-900">Rosa Cruz</p>
                <p className="text-xs text-gray-500 font-medium">Financial Aid</p>
              </div>
              <button className="bg-black text-white px-4 py-1.5  text-xs font-black hover:scale-105 transition-transform">Review</button>
            </div>
          </div>

          {/* Ready for Walk-in */}
          <div className="bg-white  border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-5">Ready for Walk-in</h3>
            <div className="p-4 bg-blue-50/50  border border-blue-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900">Carmen Gonzales</p>
                <p className="text-xs text-gray-500 font-medium mb-1">ID Application</p>
                <p className="text-[10px] text-green-600 font-bold">All documents verified. Ready for walk-in appointment.</p>
              </div>
              <span className="text-blue-600 flex items-center gap-1 text-[10px] font-black bg-white px-2 py-1  shadow-sm border border-blue-50">
                <CheckCircle size={12}/> Ready
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const StatBox = ({ title, value, valueColor = "text-gray-900" }: any) => (
  <div className="bg-white p-5  border border-gray-100 shadow-sm">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
  </div>
);

const GuideCard = ({ guide }: { guide: ServiceGuide }) => (
  <div className="group bg-white p-6  border border-gray-100 hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden">
    <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
        <BookOpen size={16} className="text-gray-300 group-hover:text-blue-500" />
    </div>
    <h4 className="font-black text-gray-900 mb-1 pr-6">{guide.title}</h4>
    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase  mb-4">
      {guide.category}
    </span>
    
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <Clock size={14} className="text-gray-300" /> Processing: {guide.processingTime}
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <FileText size={14} className="text-gray-300" /> {guide.steps} steps
      </div>
      <p className="text-[10px] text-gray-300 font-medium pt-2">Last updated: {guide.lastUpdated}</p>
    </div>
  </div>
);

const FormRow = ({ form }: { form: InterestForm }) => (
  <tr className="text-sm group hover:bg-gray-50/50 transition-colors">
    <td className="px-4 py-5">
      <div className="font-bold text-gray-900">{form.resident}</div>
      <div className="text-[10px] text-gray-400 font-mono">{form.id}</div>
    </td>
    <td className="px-4 py-5">
      <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold  border border-gray-100">
        {form.type}
      </span>
    </td>
    <td className="px-4 py-5 text-gray-500 font-medium">{form.date}</td>
    <td className="px-4 py-5">
      <StatusBadge status={form.status} />
    </td>
    <td className="px-4 py-5">
      <button className="px-3 py-1 bg-white border border-gray-200  text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm">
        View Details
      </button>
    </td>
    <td className="px-4 py-5 text-right">
      <button className={`px-4 py-1.5  text-xs font-black transition ${
        form.status === 'Pending' ? 'bg-black text-white hover:bg-gray-800' :
        form.status === 'Pre-verified' ? 'bg-black text-white hover:bg-gray-800' :
        'text-green-600 bg-green-50'
      }`}>
        {form.status === 'Pending' ? 'Pre-verify' : 
         form.status === 'Pre-verified' ? 'Approve' : 
         form.status === 'Approved' ? 'Completed' : 'Finished'}
      </button>
    </td>
  </tr>
);

const StatusBadge = ({ status }: { status: InterestForm['status'] }) => {
  const styles = {
    Pending: 'bg-orange-50 text-orange-600 border-orange-100',
    'Pre-verified': 'bg-blue-50 text-blue-600 border-blue-100',
    Approved: 'bg-green-50 text-green-600 border-green-100',
    Completed: 'bg-green-100 text-green-700 border-green-200'
  };
  return (
    <span className={`px-2 py-0.5  text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default AdminContentCMS;