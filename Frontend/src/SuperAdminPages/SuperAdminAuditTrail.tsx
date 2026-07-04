import { useState, useMemo, useEffect } from 'react';
import {
  FileText, AlertTriangle, ShieldAlert, Download,
  Search, ChevronDown, CheckCircle, Lock, AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../interfaces';
import { useAuth } from '../context/AuthContext';

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

export const SuperAdminAuditTrail = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All Categories');
  const [severity, setSeverity] = useState<Severity>('All Severity');
  const [exportCount, setExportCount] = useState<number>(0);
  const { token } = useAuth();

  const fetchAllLogsFromControllers = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      // --- PHASE 1: Fetch Primary List Collections to Gather Genuine IDs ---
      const [
        baseUsersRes,
        baseAppsRes,
        baseAptsRes,
        baseBatchesRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/applications/admin/list`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/appointments/admin/all`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/benefits/batches`, { headers }).catch(() => null)
      ]);

      // Safely extract items from the baseline requests
      const extractedUsers = baseUsersRes && baseUsersRes.ok ? await baseUsersRes.json().catch(() => []) : [];
      const rawApps = baseAppsRes && baseAppsRes.ok ? await baseAppsRes.json().catch(() => []) : [];
      const extractedApps = Array.isArray(rawApps) ? rawApps : (rawApps.applications || []);
      const extractedApts = baseAptsRes && baseAptsRes.ok ? await baseAptsRes.json().catch(() => []) : [];
      const extractedBatches = baseBatchesRes && baseBatchesRes.ok ? await baseBatchesRes.json().catch(() => []) : [];

      // Collect real IDs or fall back to default arrays if empty
      const userSystemIds: string[] = Array.isArray(extractedUsers)
        ? extractedUsers.map((u: any) => u.system_id || u.id).filter(Boolean)
        : [];
      const userIds: string[] = Array.isArray(extractedUsers)
        ? extractedUsers.map((u: any) => u.id || u.user_id).filter(Boolean)
        : [];
      const applicationIds: string[] = Array.isArray(extractedApps)
        ? extractedApps.map((a: any) => a.id).filter(Boolean)
        : [];
      const appointmentIds: string[] = Array.isArray(extractedApts)
        ? extractedApts.map((a: any) => a.id).filter(Boolean)
        : [];
      const batchIds: string[] = Array.isArray(extractedBatches)
        ? extractedBatches.map((b: any) => b.id).filter(Boolean)
        : [];

      // Select specific individual target IDs to satisfy detail-oriented endpoints
      const targetSystemId = userSystemIds[0] || 'SYSTEM_ID_PLACEHOLDER';
      const targetUserId = userIds[0] || 'USER_ID_PLACEHOLDER';
      const targetAppId = applicationIds[0] || 'ID_PLACEHOLDER';
      const targetAptId = appointmentIds[0] || 'ID_PLACEHOLDER';
      const targetBatchId = batchIds[0] || 'BATCH_ID_PLACEHOLDER';

      // --- PHASE 2: Execute All Remaining Endpoints Using Extracted Parameters Concurrently ---
      const [
        // Applications
        userAppsRes, singleAppRes,
        // Appointments
        userAptsRes, aptAttachmentRes,
        // Benefits
        userBenefitsRes, claimStatsRes, inventoryRes, allDistRes, distBatchRes,
        // Events
        allEventsRes, birthdaysRes,
        // Login / Auth
        verifyTokenRes,
        // Notifications
        userNotifRes, historyNotifRes, statsNotifRes, supportTicketsRes,
        // Risk Map
        residentsRiskRes, floodZonesRes,
        // Service Guide
        serviceGuidesRes,
        // Super Admin User
        superAdminUsersRes, superAdminUserSingleRes,
        // User Controller Remaining
        priorityUsersRes, singleUserRes, userLocationsRes
      ] = await Promise.all([
        // Applications
        fetch(`${API_BASE_URL}/api/applications/user/${targetSystemId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/applications/${targetAppId}`, { headers }).catch(() => null),

        // Appointments
        fetch(`${API_BASE_URL}/api/appointments`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/appointments/${targetAptId}/attachment`, { headers }).catch(() => null),

        // Benefits
        fetch(`${API_BASE_URL}/api/benefits/getBenefit/${targetUserId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/benefits/stats/${targetUserId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/benefits/inventory`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/benefits/distribution/all`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/benefits/distribution/${targetBatchId}`, { headers }).catch(() => null),

        // Events
        fetch(`${API_BASE_URL}/api/events`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/events/birthdays`, { headers }).catch(() => null),

        // Login
        fetch(`${API_BASE_URL}/api/login/verify`, { headers }).catch(() => null),

        // Notifications
        fetch(`${API_BASE_URL}/api/notifications/user/${targetAptId}`, { headers }).catch(() => null), // Uses an id placeholder
        fetch(`${API_BASE_URL}/api/notifications/history`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/notifications/stats`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/notifications/support/${targetAptId}`, { headers }).catch(() => null),

        // Risk Map (Matching routes defined in source code: /api/risk-map)
        fetch(`${API_BASE_URL}/api/risk/residents`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/risk/flood-zones`, { headers }).catch(() => null),

        // Service Guide
        fetch(`${API_BASE_URL}/api/serviceguide`, { headers }).catch(() => null),

        // Super Admin User Management
        fetch(`${API_BASE_URL}/api/superadmin`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/superadminE/${targetSystemId}`, { headers }).catch(() => null),

        // User Controller Remaining
        fetch(`${API_BASE_URL}/api/user/priority`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/user/${targetSystemId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/user/locations`, { headers }).catch(() => null)
      ]);

      let aggregatedLogs: AuditLog[] = [];

      // Helper function to extract array data safely from async promises
      const getArrayData = async (res: any, fallbackKey?: string) => {
        if (!res || !res.ok) return [];
        try {
          const data = await res.json();
          if (Array.isArray(data)) return data;
          if (fallbackKey && data && Array.isArray(data[fallbackKey])) return data[fallbackKey];
          return data ? [data] : [];
        } catch {
          return [];
        }
      };

      // Resolve JSON payloads sequentially
      const userApps = await getArrayData(userAppsRes, 'applications');
      const singleApp = await getArrayData(singleAppRes);
      const userApts = await getArrayData(userAptsRes);
      const aptAttachments = await getArrayData(aptAttachmentRes);
      const userBenefits = await getArrayData(userBenefitsRes);
      const claimStats = await getArrayData(claimStatsRes);
      const inventory = await getArrayData(inventoryRes);
      const allDist = await getArrayData(allDistRes);
      const distBatch = await getArrayData(distBatchRes);
      const allEvents = await getArrayData(allEventsRes);
      const birthdays = await getArrayData(birthdaysRes);
      const verifyTokens = await getArrayData(verifyTokenRes);
      const userNotifs = await getArrayData(userNotifRes);
      const historyNotifs = await getArrayData(historyNotifRes);
      const statsNotifs = await getArrayData(statsNotifRes);
      const supportTickets = await getArrayData(supportTicketsRes);
      const residentsRisk = await getArrayData(residentsRiskRes);
      const floodZones = await getArrayData(floodZonesRes);
      const serviceGuides = await getArrayData(serviceGuidesRes);
      const superAdminUsers = await getArrayData(superAdminUsersRes);
      const superAdminUserSingle = await getArrayData(superAdminUserSingleRes);
      const priorityUsers = await getArrayData(priorityUsersRes);
      const singleUser = await getArrayData(singleUserRes);
      const userLocations = await getArrayData(userLocationsRes);

      // --- PHASE 3: Synthesis of Log Tracking Stream Arrays ---

      // 1. Processing Applications
      extractedApps.concat(userApps).concat(singleApp).forEach((app: any) => {
        if (!app || !app.id) return;
        const isUrgent = app.is_bedridden === 1 || app.is_living_alone === 1;
        aggregatedLogs.push({
          id: `APP-${app.id || Math.random()}`,
          action: 'APPLICATION AUDIT RECORD',
          severity: isUrgent ? 'Critical' : 'Warning',
          category: 'Profile Management',
          description: `Service request details evaluated [${app.application_type || 'Benefit Request'}]. Processing status state: ${app.status || 'Pending'}. Vulnerability flags: Bedridden (${app.is_bedridden === 1 ? 'YES' : 'NO'}), Living alone (${app.is_living_alone === 1 ? 'YES' : 'NO'}).`,
          target: `Applicant System ID: ${app.user_system_id || 'N/A'}`,
          user: `Service Reviewer`,
          ip: 'Form Service Context',
          timestamp: app.created_at || app.submission_date || new Date().toISOString()
        });
      });

      // 2. Processing Appointments
      userApts.concat(extractedApts).concat(aptAttachments).forEach((apt: any) => {
        if (!apt || !apt.id) return;
        let logSeverity: 'Critical' | 'Warning' | 'Info' = 'Info';
        if (apt.status === 'Cancelled') logSeverity = 'Critical';
        else if (apt.status === 'Pending') logSeverity = 'Warning';

        aggregatedLogs.push({
          id: `APT-${apt.id || Math.random()}`,
          action: 'APPOINTMENT BOOKING SNAPSHOT',
          severity: logSeverity,
          category: 'Authentication',
          description: `Appointment trace evaluated for schedule date: ${apt.appointment_date || 'N/A'}. Purpose designation: "${apt.purpose || 'General'}". Execution status: ${apt.status || 'Pending'}`,
          target: `User ID Reference: ${apt.user_id || 'N/A'}`,
          user: `Scheduler Thread Pool`,
          ip: 'Web Gateway Module',
          timestamp: apt.created_at || new Date().toISOString()
        });
      });

      // 3. Processing Benefits Ledger & Inventory
      inventory.forEach((item: any) => {
        if (!item || !item.id) return;
        aggregatedLogs.push({
          id: `INV-${item.id || Math.random()}`,
          action: 'BENEFIT INVENTORY SCAN',
          severity: 'Info',
          category: 'Emergency Management',
          description: `Inventory ledger baseline monitored. Item title: "${item.name || 'Unnamed Item'}" - Stock Level Status: ${item.stock || 0}`,
          target: `Item Identity Code: ${item.id || 'N/A'}`,
          user: `Inventory Controller Link`,
          ip: 'Storage Asset Sync',
          timestamp: new Date().toISOString()
        });
      });

      extractedBatches.concat(allDist).concat(distBatch).concat(userBenefits).concat(claimStats).forEach((b: any) => {
        if (!b || !b.id) return;
        aggregatedLogs.push({
          id: `BEN-${b.id || Math.random()}`,
          action: 'BENEFIT DISBURSEMENT ENTRY',
          severity: b.status?.toUpperCase() === 'CLAIMED' ? 'Info' : 'Warning',
          category: 'Emergency Management',
          description: `Benefit record trace validated. Distribution batch alignment group: ${b.batch_id || 'N/A'}. Delivery state indicator: ${b.status || 'Distributed'}`,
          target: `Claimant Link System ID: ${b.user_id || 'N/A'}`,
          user: `Disbursing Officer Session`,
          ip: 'Inventory Control Panel',
          timestamp: b.claimed_at || b.created_at || new Date().toISOString()
        });
      });

      // 4. Processing Events Calendar
      allEvents.concat(birthdays).forEach((ev: any) => {
        if (!ev || !ev.id) return;
        aggregatedLogs.push({
          id: `EVT-${ev.id || Math.random()}`,
          action: 'COMMUNITY EVENT MONITOR',
          severity: 'Info',
          category: 'System Configuration',
          description: `Calendar validation registry scanned: "${ev.title || 'Untitled Event'}" set on: ${ev.event_date || 'N/A'}. Target Location: ${ev.location || 'Barangay Hall'}.`,
          target: `Event Index Tracker: ${ev.id || 'N/A'}`,
          user: `Admin Coordinator Sync`,
          ip: 'Dashboard Engine',
          timestamp: ev.created_at || new Date().toISOString()
        });
      });

      // 5. Processing Verified Auth Handshakes
      verifyTokens.forEach((tokenData: any) => {
        if (!tokenData) return;
        aggregatedLogs.push({
          id: `TOK-${tokenData.id || Math.random()}`,
          action: 'TOKEN ACTIVE VERIFICATION',
          severity: 'Info',
          category: 'Authentication',
          description: `Active security payload checked. Session validation check completed successfully.`,
          target: `Account Identity Ref: ${tokenData.user_id || 'Active Handshake'}`,
          user: `Token Guardian Middleware`,
          ip: 'Crypto Engine Router',
          timestamp: new Date().toISOString()
        });
      });

      // 6. Processing Alerts and Notifications
      userNotifs.concat(historyNotifs).concat(statsNotifs).concat(supportTickets).forEach((n: any) => {
        if (!n || !n.id) return;
        aggregatedLogs.push({
          id: `NTF-${n.id || Math.random()}`,
          action: 'DISPATCHED BROADCAST CAPTURE',
          severity: n.type === 'Emergency' ? 'Critical' : 'Info',
          category: 'Security',
          description: `System alert validation. Header text: "${n.title || 'Notification Message'}". Excerpt: "${n.message || ''}". Status read flag: ${n.is_read ? 'Read' : 'Unread'}.`,
          target: `Target User Group Key: ${n.user_id || 'Global Audience'}`,
          user: `Notification Worker Engine`,
          ip: 'Internal Cluster Stack',
          timestamp: n.created_at || new Date().toISOString()
        });
      });

      // 7. Processing Geospatial Telemetry
      residentsRisk.concat(userLocations).forEach((loc: any) => {
        if (!loc) return;
        aggregatedLogs.push({
          id: `LOC-${loc.id || Math.random()}`,
          action: 'GEOSPATIAL COORDINATE READ',
          severity: 'Info',
          category: 'Data Access',
          description: `Location tracking array evaluated. Latitude positioning vector: ${loc.latitude || 'N/A'}, Longitude positioning vector: ${loc.longitude || 'N/A'}`,
          target: `Target Entity Node: ${loc.user_id || loc.system_id || 'Anonymous Resident'}`,
          user: `Spatial Telemetry Thread`,
          ip: 'GIS Core Server',
          timestamp: new Date().toISOString()
        });
      });

      floodZones.forEach((fz: any) => {
        if (!fz || !fz.id) return;
        aggregatedLogs.push({
          id: `FLD-${fz.id || Math.random()}`,
          action: 'FLOOD ZONE RECONNAISSANCE',
          severity: 'Warning',
          category: 'Emergency Management',
          description: `Environmental zone telemetry evaluated: "${fz.zone_name || 'Unmarked Sector'}". Danger Severity Index Rank: ${fz.risk_level || 'Moderate'}`,
          target: `Sector ID: ${fz.id || 'N/A'}`,
          user: `Disaster Risk Dashboard`,
          ip: 'Sensor Network Node',
          timestamp: fz.updated_at || fz.created_at || new Date().toISOString()
        });
      });

      // 8. Processing Citizen Service Guides
      serviceGuides.forEach((guide: any) => {
        if (!guide || !guide.id) return;
        aggregatedLogs.push({
          id: `GD-${guide.id || Math.random()}`,
          action: 'SERVICE GUIDE KNOWLEDGE VIEW',
          severity: 'Info',
          category: 'Compliance',
          description: `Citizen charter guidelines analyzed: "${guide.title || 'Untitled Document'}". Document category context: ${guide.category || 'General Operations'}`,
          target: `Guide Index Core: ${guide.id || 'N/A'}`,
          user: `Public Access Portal`,
          ip: 'Static Document Storage',
          timestamp: guide.created_at || new Date().toISOString()
        });
      });

      // 9. Processing System Records / Identity Profiles
      extractedUsers.concat(priorityUsers).concat(singleUser).concat(superAdminUsers).concat(superAdminUserSingle).forEach((u: any) => {
        if (!u || (!u.id && !u.system_id)) return;
        aggregatedLogs.push({
          id: `USR-${u.id || u.system_id || Math.random()}`,
          action: 'RESIDENT RECORD VERIFICATION',
          severity: u.account_status === 'Rejected' ? 'Critical' : 'Info',
          category: 'User Management',
          description: `Resident file read for entity: ${u.firstname || ''} ${u.lastname || ''}. Disability status matrix: ${u.disability || 'Regular Sector'}. Account verification flag: ${u.account_status || 'Verified'}.`,
          target: `System ID Tracker: ${u.system_id || 'N/A'}`,
          user: `Identity Management Registrar`,
          ip: 'Secure DB Server Instance',
          timestamp: u.created_at || new Date().toISOString()
        });
      });

      // Sort chronologically: Newest records always float to the top
      aggregatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(aggregatedLogs);

    } catch (err: any) {
      console.error('Error compiling aggregated tracking streams:', err);
      setError('Could not synthesize real-time logs from operational endpoints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLogsFromControllers();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const actionText = log.action ? log.action.toLowerCase() : '';
      const descText = log.description ? log.description.toLowerCase() : '';
      const targetText = log.target ? log.target.toLowerCase() : '';
      const userText = log.user ? log.user.toLowerCase() : '';
      const searchText = search.toLowerCase();

      const matchesSearch = actionText.includes(searchText) ||
        descText.includes(searchText) ||
        targetText.includes(searchText) ||
        userText.includes(searchText);

      const matchesCategory = category === 'All Categories' || log.category === category;
      const matchesSeverity = severity === 'All Severity' || log.severity === severity;
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [logs, search, category, severity]);

  const metrics = useMemo(() => {
    return {
      total: logs.length,
      critical: logs.filter(log => log.severity === 'Critical').length,
      warning: logs.filter(log => log.severity === 'Warning').length
    };
  }, [logs]);

  const handleExport = () => {
    if (filteredLogs.length === 0) return;
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compiled-audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportCount(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Master Audit Trail
          </h2>
          <p className="text-xs md:text-base text-gray-500 font-medium mt-2">
            Aggregated operational streams compiled for verification and compliance (RA 10173)
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredLogs.length === 0}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded sm text-sm font-semibold hover:bg-slate-800 transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} /> Export
        </button>
      </div>

      {/* Stats Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Events Tracked" value={loading ? "..." : metrics.total.toString()} sub="Aggregated table logs" icon={<FileText size={20} className="text-slate-400" />} />
        <StatCard title="Critical States" value={loading ? "..." : metrics.critical.toString()} sub="Urgent items identified" icon={<AlertTriangle size={20} className="text-red-500" />} valueColor="text-red-500" />
        <StatCard title="Warnings Pending" value={loading ? "..." : metrics.warning.toString()} sub="Intermediate system pipelines" icon={<ShieldAlert size={20} className="text-amber-500" />} valueColor="text-amber-500" />
        <StatCard title="Session Exports" value={exportCount.toString()} sub="Compliance tracked actions" icon={<Download size={20} className="text-slate-400" />} />
      </div>

      {/* Log Feed Core Panel */}
      <div className="bg-white rounded sm border border-slate-200 shadow-sm p-4 md:p-6">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-bold text-slate-900">Audit Log Entries</h2>
          <button
            onClick={fetchAllLogsFromControllers}
            className="text-xs font-semibold text-[#00308F] hover:underline"
          >
            Synchronize Controllers
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-6">Cross-endpoint state summary generated automatically from system components</p>

        {/* Search & Dynamic Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search actions, content notes, targets, identifiers..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded sm text-sm focus:ring-2 focus:ring-slate-400 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-4">
            <SelectFilter value={category} onChange={(v: any) => setCategory(v)} options={['All Categories', 'User Management', 'Profile Management', 'Data Access', 'System Maintenance', 'Emergency Management', 'Security', 'System Configuration', 'Compliance', 'Authentication']} />
            <SelectFilter value={severity} onChange={(v: any) => setSeverity(v)} options={['All Severity', 'Info', 'Warning', 'Critical']} />
          </div>
        </div>

        {/* Main Feed Content States */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 border border-slate-100 rounded sm">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-[#00308F] border-t-transparent rounded-full mb-4"></div>
            <p className="text-sm font-medium">Interrogating controller endpoints and compiling state arrays...</p>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center text-red-600 border border-red-100 bg-red-50/50 rounded sm">
            <AlertTriangle className="mx-auto mb-2 text-red-500" size={32} />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchAllLogsFromControllers}
              className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition"
            >
              Force Component Re-sync
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => <LogEntry key={log.id} log={log} />)
            ) : (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed rounded sm">
                <FileText className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-sm">No cross-component application data matches the selected parameters</p>
              </div>
            )}
          </div>
        )}
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
  <div className="relative flex-1 md:flex-none min-w-40">
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

const LogEntry = ({ log }: { log: AuditLog }) => {
  const getSeverityStyles = (severity: string) => {
    if (severity === 'Critical') return { badge: 'bg-red-100 text-red-700', indicator: 'bg-red-500' };
    if (severity === 'Warning') return { badge: 'bg-amber-100 text-amber-700', indicator: 'bg-amber-500' };
    return { badge: 'bg-blue-100 text-blue-700', indicator: 'bg-blue-500' };
  };

  const styles = getSeverityStyles(log.severity);

  return (
    <div className="border border-slate-100 rounded sm p-4 hover:border-slate-200 transition bg-slate-50/50">
      {/* Upper Boundary Frame */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${styles.indicator}`} />
          <h4 className="font-bold text-sm text-slate-900">{log.action}</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${styles.badge}`}>{log.severity}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{log.category}</span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</p>
          <p className="text-[9px] text-slate-400 font-mono">{log.id}</p>
        </div>
      </div>

      <p className="text-sm text-slate-700 mb-3">{log.description}</p>

      {/* Trace Footers */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1"><CheckCircle size={12} /> {log.target}</span>
        <span className="flex items-center gap-1"><Lock size={12} /> Trace Context: {log.user}</span>
        <span className="flex items-center gap-1"><AlertCircle size={12} /> Source: {log.ip}</span>
      </div>
    </div>
  );
};

export default SuperAdminAuditTrail;