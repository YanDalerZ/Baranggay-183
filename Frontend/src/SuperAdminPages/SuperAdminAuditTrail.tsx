import { useState, useMemo } from 'react';
import { 
  FileText, AlertTriangle, ShieldAlert, Download, 
  Search, ChevronDown, CheckCircle, Lock, AlertCircle 
} from 'lucide-react';

// --- Types ---
type Severity = 'All Severity' | 'Info' | 'Warning' | 'Critical';
type Category = 'All Categories' | 'User Management' | 'Profile Management' | 'Data Access' | 'System Maintenance' | 'Emergency Management' | 'Security' | 'System Configuration' | 'Compliance' | 'Authentication';

interface AuditLog {
  id: string;
  action: string;
  severity: 'Critical' | 'Warning' | 'Info';
  category: Category;
  description: string;
  target: string;
  user: string;
  ip: string;
  timestamp: string;
}

// --- Mock Data ---
const LOG_DATA: AuditLog[] = [
  { id: 'AL-20260210-005', action: 'ALERT BROADCASTED', severity: 'Critical', category: 'Emergency Management', description: 'Sent flood warning alert to 342 residents via SMS & Messenger', target: 'Emergency Alert: EA-2026-002', user: 'Juan dela Cruz (U002)', ip: '192.168.1.105', timestamp: '2026-02-10 09:00:12' },
  { id: 'AL-20260210-006', action: 'LOGIN FAILED', severity: 'Critical', category: 'Security', description: 'Failed login attempt with username "admin123" (invalid credentials)', target: 'Login Attempt', user: 'Unknown User (UNKNOWN)', ip: '203.124.45.22', timestamp: '2026-02-10 08:45:33' },
  { id: 'AL-20260210-009', action: 'RECORD DELETED', severity: 'Critical', category: 'Profile Management', description: 'Permanently deleted archived resident record (deceased)', target: 'Archived Record: RES-999', user: 'Pedro Garcia (U004)', ip: '192.168.1.110', timestamp: '2026-02-10 07:45:22' },
];

export const SuperAdminAuditTrail = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All Categories');
  const [severity, setSeverity] = useState<Severity>('All Severity');

  const filteredLogs = useMemo(() => {
    return LOG_DATA.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All Categories' || log.category === category;
      const matchesSeverity = severity === 'All Severity' || log.severity === severity;
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [search, category, severity]);

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div /*className="p-4 md:p-8 bg-slate-50 min-h-screen"*/>
      {/* Header - Adaptive Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Master Audit Trail
          </h2>
          <p className="text-xs md:text-base text-gray-500 font-medium mt-2">
            Immutable system activity log for forensic review and compliance (RA 10173)
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded sm text-sm font-semibold hover:bg-slate-800 transition shrink-0"
        >
          <Download size={16} /> Export
        </button>
      </div>

      {/* Stats Grid - Stacked on mobile, 4 columns on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Events" value="10" sub="Last 24h" icon={<FileText size={20} className="text-slate-400" />} />
        <StatCard title="Critical" value="3" sub="Requires attention" icon={<AlertTriangle size={20} className="text-red-500" />} valueColor="text-red-500" />
        <StatCard title="Failed" value="1" sub="Security incidents" icon={<ShieldAlert size={20} className="text-amber-500" />} valueColor="text-amber-500" />
        <StatCard title="Exports" value="1" sub="Compliance track" icon={<Download size={20} className="text-slate-400" />} />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded sm border border-slate-200 shadow-sm p-4 md:p-6">
        <h2 className="font-bold text-slate-900 mb-1">Audit Log Entries</h2>
        <p className="text-sm text-slate-500 mb-6">Non-editable chronological record of all system activities</p>

        {/* Filters - Stack on small, row on medium+ */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded sm text-sm focus:ring-2 focus:ring-slate-400 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <SelectFilter value={category} onChange={(v: any) => setCategory(v)} options={['All Categories', 'User Management', 'Profile Management', 'Data Access', 'System Maintenance', 'Emergency Management', 'Security', 'System Configuration', 'Compliance', 'Authentication']} />
            <SelectFilter value={severity} onChange={(v: any) => setSeverity(v)} options={['All Severity', 'Info', 'Warning', 'Critical']} />
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => <LogEntry key={log.id} log={log} />)
          ) : (
            <div className="py-12 text-center text-slate-400 border-2 border-dashed rounded sm">
              <FileText className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">No audit logs match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, valueColor = "text-slate-900" }: any) => (
  <div className="bg-white p-4 md:p-6 rounded sm border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      {icon}
    </div>
    <p className={`text-2xl md:text-3xl font-black ${valueColor}`}>{value}</p>
    <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
  </div>
);

const SelectFilter = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: string[] }) => (
  <div className="relative flex-1 md:flex-none">
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-slate-200 text-sm rounded sm pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer w-full"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <ChevronDown className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" size={16} />
  </div>
);

const LogEntry = ({ log }: { log: AuditLog }) => (
  <div className="border border-slate-100 rounded sm p-4 hover:border-slate-200 transition bg-slate-50/50">
    {/* Header Section */}
    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className={`w-2 h-2 rounded sm shrink-0 ${log.severity === 'Critical' ? 'bg-red-500' : 'bg-slate-400'}`} />
        <h4 className="font-bold text-sm text-slate-900">{log.action}</h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">{log.severity}</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{log.category}</span>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-slate-500 font-mono">{log.timestamp}</p>
        <p className="text-[9px] text-slate-400 font-mono">{log.id}</p>
      </div>
    </div>
    
    <p className="text-sm text-slate-700 mb-3">{log.description}</p>
    
    {/* Metadata Footer - Flex wrap ensures it stays readable on mobile */}
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-400 font-medium">
      <span className="flex items-center gap-1"><CheckCircle size={12}/> {log.target}</span>
      <span className="flex items-center gap-1"><Lock size={12}/> {log.user}</span>
      <span className="flex items-center gap-1"><AlertCircle size={12}/> {log.ip}</span>
    </div>
  </div>
);

export default SuperAdminAuditTrail;