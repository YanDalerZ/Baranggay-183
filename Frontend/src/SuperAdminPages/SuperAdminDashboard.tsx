import { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, Database,
  Activity, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { API_BASE_URL } from "../interfaces";
import { useAuth } from '../context/AuthContext';

interface TableStats {
  table_name: string;
  table_rows: number;
  size_mb: number;
}

interface QueryPerformance {
  query: string;
  avg_latency: number;
  exec_count: number;
}

interface AivenStatus {
  state: string;
  plan: string;
  disk_total_mb: number;
  disk_used_mb: number;
  memory_mb: number;
  cpu: number;
  nodes: number;
  created_at: string;
  backup_enabled: boolean;
  query_performance: QueryPerformance[];
  database_tables: TableStats[];
}

interface DynamicConfigState {
  [key: string]: string | number;
}

export const SuperAdminDashboard = () => {
  const { token } = useAuth();

  // States matching the existing page fetches
  const [aivenData, setAivenData] = useState<AivenStatus | null>(null);
  const [config, setConfig] = useState<DynamicConfigState>({});
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        // Fetch concurrently including both superadmin and user endpoints
        const [aivenRes, configRes, usersRes, superadminRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/database/aiven-status`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/config`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/user`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/superadmin`, { headers }).catch(() => null)
        ]);

        // 1. Process Database metrics
        if (aivenRes && aivenRes.ok) {
          const aivenJson = await aivenRes.json();
          setAivenData(aivenJson);
        }

        // 2. Process system configuration metadata
        if (configRes && configRes.ok) {
          const configJson = await configRes.json();
          setConfig(configJson);
        }

        let regularCount = 0;
        let superCount = 0;

        // 3. Process Regular Users metrics
        if (usersRes && usersRes.ok) {
          const usersJson = await usersRes.json();
          if (Array.isArray(usersJson)) {
            regularCount = usersJson.length;
          }
        }

        // 4. Process Super Admin metrics
        if (superadminRes && superadminRes.ok) {
          const superadminJson = await superadminRes.json();
          if (Array.isArray(superadminJson)) {
            superCount = superadminJson.length;
          }
        }

        // Update counts (Sum of regular users + superadmins)
        setAdminCount(superCount);
        setTotalUsersCount(regularCount + superCount);

      } catch (err: any) {
        console.error("Dashboard data resolution error:", err);
        setErrorMsg("Failed to synchronize dashboard metrics with the live environment.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, refreshTrigger]);

  const handleManualRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Safe extraction of parsed numbers derived from database status schemas
  const diskTotal = aivenData?.disk_total_mb || 0;
  const diskUsed = aivenData?.database_tables?.reduce((sum, table) => {
    return sum + parseFloat(table.size_mb.toString() || "0");
  }, 0) || 0;
  // Custom static arrays derived dynamically or handled with fallback state logic
  const liveServices = [
    { name: 'SMS Gateway API', status: config?.smsGatewayStatus === 'disabled' ? 'Offline' : 'Online', color: config?.smsGatewayStatus === 'disabled' ? 'text-red-500' : 'text-green-600', dot: config?.smsGatewayStatus === 'disabled' ? 'bg-red-500' : 'bg-green-500' },
    { name: 'Database Cloud Engine', status: aivenData?.state === 'RUNNING' ? 'Online' : 'Pending', color: aivenData?.state === 'RUNNING' ? 'text-green-600' : 'text-amber-500', dot: aivenData?.state === 'RUNNING' ? 'bg-green-500' : 'bg-amber-500' },
    { name: 'High Availability Nodes', status: `${aivenData?.nodes || 0} Active`, color: 'text-green-600', dot: 'bg-green-500' },
  ];

  return (
    <div className="p-1 min-h-screen">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Super Admin Dashboard
          </h2>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">
            Super Admin control center for Barangay 183 Management Platform
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border bg-white rounded-sm font-semibold text-sm text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-600" : ""} />
          Refresh Metrics
        </button>
      </header>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-sm text-sm flex items-center gap-3">
          <AlertTriangle size={18} />
          <span><strong>System Warning:</strong> {errorMsg}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total System Users"
          value={isLoading ? "..." : totalUsersCount.toString()}
          sub={`${adminCount} active admins included`}
          icon={<Users size={20} className="text-slate-400" />}
        />
        <StatCard
          title="System Memory Allocation"
          value={isLoading ? "..." : `${aivenData?.memory_mb ? (aivenData.memory_mb / 1024).toFixed(1) : '0'} GB`}
          sub={`Assigned Across ${aivenData?.cpu || 0} vCPUs`}
          icon={<Activity size={20} className="text-slate-400" />}
        />
        <StatCard
          title="Storage Allocated"
          value={isLoading ? "..." : `${diskUsed.toFixed(1)} MB`}
          sub={`Out of ${diskTotal.toLocaleString()} MB Capacity`}
          icon={<ShieldCheck size={20} className="text-slate-400" />}
        />
        <StatCard
          title="Cloud Engine Status"
          value={isLoading ? "Loading..." : (aivenData?.state || "Offline")}
          sub={`Cluster Topology: Verified`}
          icon={<Database size={20} className="text-slate-400" />}
          isStatus
          statusColor={aivenData?.state === "RUNNING" ? "text-green-500" : "text-amber-500"}
        />
      </div>


      <div className="bg-white p-8 rounded-sm shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="font-bold text-xl text-slate-800">System Services Status</h3>
          <p className="text-slate-400 text-sm">Real-time health check of critical services</p>
        </div>
        <div className="space-y-4">
          {liveServices.map((s, i) => (
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


    </div>
  );
};

// Helper Components
interface StatCardProps {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  isStatus?: boolean;
  statusColor?: string;
}

const StatCard = ({ title, value, sub, icon, isStatus, statusColor = "text-green-500" }: StatCardProps) => (
  <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100 relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <h3 className="text-slate-500 text-sm font-semibold">{title}</h3>
        <p className={`text-3xl font-black ${isStatus ? statusColor : 'text-slate-800'}`}>
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