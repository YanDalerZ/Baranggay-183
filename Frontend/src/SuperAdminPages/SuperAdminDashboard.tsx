import { 
  Users, ShieldCheck, Database, 
  Activity, AlertTriangle, ShieldAlert} from 'lucide-react';

// Mock Data to match screenshots exactly
const SERVICES = [
  { name: 'SMS Gateway API', status: 'Online', color: 'text-green-600', dot: 'bg-green-500' },
  { name: 'Messenger Bridge', status: 'Online', color: 'text-green-600', dot: 'bg-green-500' },
  { name: 'GIS Mapping Service', status: 'Online', color: 'text-green-600', dot: 'bg-green-500' },
  { name: 'Backup Service', status: 'Scheduled', color: 'text-amber-500', dot: 'bg-amber-500' },
];

const ALERTS = [
  { type: 'error', title: '4 Failed Login Attempts', msg: 'From IP: 192.168.1.unknown - Last 24 hours', icon: <ShieldAlert size={18} /> },
  { type: 'warning', title: 'Consent Records Missing', msg: '12 resident records need consent timestamp update', icon: <AlertTriangle size={18} /> },
  { type: 'info', title: 'API Key Expiring Soon', msg: 'SMS Gateway API key expires in 30 days', icon: <ShieldCheck size={18} /> },
];

const EVENTS = [
  { type: 'INFO', action: 'Admin Account Created', user: 'superadmin@b183', time: '2026-02-10 09:15:00', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { type: 'SUCCESS', action: 'Database Backup Completed', user: 'SYSTEM', time: '2026-02-10 08:00:00', color: 'bg-green-50 text-green-600 border-green-100' },
  { type: 'WARNING', action: 'Configuration Updated', user: 'superadmin@b183', time: '2026-02-10 07:45:00', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { type: 'ERROR', action: 'Failed Login Attempt', user: 'unknown@external', time: '2026-02-10 07:30:00', color: 'bg-red-50 text-red-600 border-red-100' },
  { type: 'SUCCESS', action: 'Compliance Scan Completed', user: 'SYSTEM', time: '2026-02-10 06:00:00', color: 'bg-green-50 text-green-600 border-green-100' },
];

export const SuperAdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
      {/* Top Header */}
      <header>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          Super Admin Dashboard</h2>
        <p className="text-sm md:text-base text-gray-500 font-medium">
          Super Admin control center for Barangay 183 Management Platform</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total System Users" value="156" sub="8 active admins" icon={<Users size={20} className="text-slate-400" />} />
        <StatCard title="System Uptime" value="99.98%" sub="Last backup: 2 hours ago" icon={<Activity size={20} className="text-slate-400" />} />
        <StatCard title="Compliance Score" value="98.5%" sub="3 pending audits" icon={<ShieldCheck size={20} className="text-slate-400" />} />
        <StatCard title="Database Status" value="Healthy" sub="Integrity: Verified" icon={<Database size={20} className="text-slate-400" />} isStatus />
      </div>

      {/* Services & Security Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Services Status */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-slate-800">System Services Status</h3>
            <p className="text-slate-400 text-sm">Real-time health check of critical services</p>
          </div>
          <div className="space-y-4">
            {SERVICES.map((s, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="font-medium text-slate-700">{s.name}</span>
                </div>
                <span className={`font-bold ${s.color}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-slate-800">Security Alerts</h3>
            <p className="text-slate-400 text-sm">Recent security events requiring attention</p>
          </div>
          <div className="space-y-4">
            {ALERTS.map((a, i) => (
              <div key={i} className={`p-4 rounded-sm border flex gap-4 ${
                a.type === 'error' ? 'bg-red-50 border-red-100' : 
                a.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
              }`}>
                <div className={`mt-0.5 ${
                   a.type === 'error' ? 'text-red-600' : 
                   a.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`}>
                  {a.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{a.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

{/* Events Log */}
<section className="bg-white p-8 rounded-sm shadow-sm border border-slate-100">
  <div className="mb-6">
    <h3 className="font-bold text-xl text-slate-800">Recent System Events</h3>
    <p className="text-slate-400 text-sm">Comprehensive log of critical system activities</p>
  </div>
  
  <div className="space-y-4">
    {EVENTS.map((e, i) => (
      <div 
        key={i} 
        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-sm border border-slate-50 bg-white hover:bg-slate-50 transition-colors gap-3"
      >
        {/* Left Side: Badge + Info (Stacked on Mobile) */}
        <div className="flex items-start gap-4">
          <span className={`w-20 shrink-0 text-center py-1 rounded text-[10px] font-black tracking-widest border ${e.color}`}>
            {e.type}
          </span>
          <div className="min-w-0"> {/* min-w-0 prevents text overflow issues */}
            <p className="font-bold text-slate-800 break-words">{e.action}</p>
            <p className="text-slate-400 text-sm italic">by {e.user}</p>
          </div>
        </div>

        {/* Right Side: Time (Right aligned on desktop, left on mobile) */}
        <div className="text-slate-400 text-sm font-mono tracking-tight md:text-right pl-[96px] md:pl-0">
          {e.time}
        </div>
      </div>
    ))}
  </div>
</section>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, sub, icon, isStatus }: any) => (
  <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100 relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <h3 className="text-slate-500 text-sm font-semibold">{title}</h3>
        <p className={`text-3xl font-black ${isStatus ? 'text-green-500' : 'text-slate-800'}`}>
          {value}
        </p>
        <p className="text-xs text-slate-400 font-medium">{sub}</p>
      </div>
      <div className="bg-slate-50 p-2 rounded-sm">
        {icon}
      </div>
    </div>
  </div>
);

export default SuperAdminDashboard;