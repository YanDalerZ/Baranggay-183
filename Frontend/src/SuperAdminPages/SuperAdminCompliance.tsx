import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Server, 
  Lock} from 'lucide-react';

// MetricCard Component
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
}

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

// Mock Data
const services = [
  { name: 'Authentication Service', lastCheck: '2 min ago', response: '45ms', uptime: '99.99%' },
  { name: 'Database Server', lastCheck: '1 min ago', response: '12ms', uptime: '100%' },
  { name: 'API Gateway', lastCheck: '30s ago', response: '8ms', uptime: '99.95%' },
];

const issues = [
  { id: 1, title: 'Pending Data Audit', category: 'Compliance', affectedRecords: '2,450', recommendation: 'Schedule quarterly audit review' },
  { id: 2, title: 'Certificate Expiry Alert', category: 'Security', affectedRecords: '1', recommendation: 'Renew SSL certificate before expiration' },
];

export default function SuperAdminCompliance() {
  // Toast state management
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <div >
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="bg-slate-900 text-white px-4 py-3 rounded shadow-lg text-sm animate-in slide-in-from-right fade-in">
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Compliance & Security Monitor</h2>
        <p className="text-sm md:text-base text-gray-500 font-medium">
            Manage your compliance ecosystem</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => addToast('Refreshing metrics...')}
            className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={() => addToast('Full system security scan initiated.')}
            className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Scan
          </button>
        </div>
      </div>

      {/* Overview Metrics - (No changes needed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Overall Score" value="98.5%" subtitle="Audit Ready" icon={ShieldCheck} />
        <MetricCard title="Data Privacy" value="97%" subtitle="RA 10173" icon={FileCheck} />
        <MetricCard title="Security" value="100%" subtitle="ISO 27001" icon={Lock} />
        <MetricCard title="Availability" value="99%" subtitle="Uptime SLA" icon={Server} />
      </div>

      {/* System Health */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-sm mb-8 overflow-hidden">
        <h2 className="text-base font-bold mb-6">System Services Health Check</h2>
        <div className="space-y-3">
          {services.map((svc, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 gap-2 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium text-slate-800 text-sm">{svc.name}</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-500 flex flex-wrap gap-4 sm:gap-6">
                <span>Last check: {svc.lastCheck}</span>
                <span>Response: {svc.response}</span>
                <span>Uptime: {svc.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Issues */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-sm mb-8">
        <h2 className="text-base font-bold mb-4">Compliance Issues & Recommendations</h2>
        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue.id} className="p-4 border border-slate-200 rounded">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                </div>
                <button 
                  onClick={() => addToast(`Resolution workflow started for: ${issue.title}`)}
                  className="text-xs border border-slate-300 px-3 py-1 rounded hover:bg-slate-50 w-full sm:w-auto"
                >
                  Resolve
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">{issue.category}</p>
              <div className="bg-slate-50 p-3 rounded text-sm text-slate-800 space-y-1">
                <p><strong>Affected:</strong> {issue.affectedRecords} records</p>
                <p><strong>Recommendation:</strong> {issue.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
       {/* Legal Status Footer */}
       <div className="bg-green-50 p-6 rounded-xl border border-green-100">
        <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Legal Compliance Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <strong>RA 10173:</strong> Digital consent timestamps tracked</p>
          <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <strong>ISO/IEC 25010:</strong> Triple redundancy backup</p>
          <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Audit Trail:</strong> Immutable logs maintained</p>
          <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Security:</strong> Encrypted communications active</p>
        </div>
      </div>
    </div>
  );
}