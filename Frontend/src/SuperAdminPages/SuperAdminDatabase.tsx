import { useState, useEffect } from 'react';
import {
    Database, HardDrive, RefreshCw, AlertTriangle, CloudLightning, Cpu, Server, Table, Activity
} from 'lucide-react';
import { API_BASE_URL } from "../interfaces";

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

export const SuperAdminDatabase = () => {
    const [toast, setToast] = useState<string | null>(null);
    const [aivenData, setAivenData] = useState<AivenStatus | null>(null);
    const [loadingAiven, setLoadingAiven] = useState<boolean>(true);
    const [aivenError, setAivenError] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAivenStatus = async () => {
        setLoadingAiven(true);
        setAivenError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/database/aiven-status`);
            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }
            const data = await response.json();
            setAivenData(data);
            triggerToast("Database metrics updated successfully.");
        } catch (error: any) {
            console.error("Error fetching Aiven metrics:", error);
            setAivenError(error.message || "Failed to load database status metrics.");
            triggerToast("Failed to fetch latest cloud status metrics.");
        } finally {
            setLoadingAiven(false);
        }
    };

    useEffect(() => {
        fetchAivenStatus();
    }, []);

    const diskTotal = aivenData?.disk_total_mb || 0;
    const diskUsed = aivenData?.database_tables.reduce((sum, table) => {
        return sum + parseFloat(table.size_mb.toString() || "0");
    }, 0).toFixed(2) || "0.00"; const usagePercent = diskTotal > 0 ? Math.round((parseFloat(diskUsed) / diskTotal) * 100) : 0;

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
            {/* Toast Alerts */}
            {toast && (
                <div className="fixed bottom-6 right-4 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 transition-all duration-300">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-sm font-medium">{toast}</span>
                </div>
            )}

            {/* Header section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter bg-linear-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent flex items-center gap-2">
                        <Database className="text-blue-800" size={28} /> Database Maintenance
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Live infrastructure metrics and query optimization data.</p>
                </div>
                <button
                    onClick={fetchAivenStatus}
                    disabled={loadingAiven}
                    className="flex items-center gap-2 px-4 py-2 border bg-white rounded-md font-semibold text-sm text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
                >
                    <RefreshCw size={16} className={loadingAiven ? "animate-spin text-blue-600" : ""} /> Refresh Status
                </button>
            </div>

            {aivenError && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-3">
                    <AlertTriangle size={18} />
                    <span><strong>Error:</strong> {aivenError}</span>
                </div>
            )}

            {/* Metrics Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatusCard
                    title="Instance State"
                    value={loadingAiven ? "Loading..." : (aivenData?.state || "Unknown")}
                    sub={`Plan: ${aivenData?.plan || 'N/A'}`}
                    icon={<CloudLightning size={18} />}
                    statusColor={aivenData?.state === "RUNNING" ? "text-emerald-600" : "text-blue-600"}
                />

                <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Storage Usage</span>
                        <HardDrive size={18} className="text-slate-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">
                            {loadingAiven ? "..." : `${diskUsed.toLocaleString()} / ${diskTotal.toLocaleString()} MB`}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">{usagePercent}% Dedicated Allocated Capacity Used</div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${usagePercent > 85 ? 'bg-red-500' : usagePercent > 65 ? 'bg-amber-500' : 'bg-blue-600'}`}
                            style={{ width: `${usagePercent}%` }}
                        ></div>
                    </div>
                </div>

                <StatusCard
                    title="Resources Assigned"
                    value={loadingAiven ? "..." : `${aivenData?.cpu || 0} vCPU`}
                    sub={`${aivenData?.memory_mb ? (aivenData.memory_mb / 1024).toFixed(1) : 0} GB RAM Allocated`}
                    icon={<Cpu size={18} />}
                />

                <StatusCard
                    title="High Availability"
                    value={loadingAiven ? "..." : `${aivenData?.nodes || 0} Active Nodes`}
                    sub={aivenData?.backup_enabled ? "Backups Automated & Secure" : "Backups Inactive Configuration"}
                    icon={<Server size={18} />}
                    statusColor={aivenData?.backup_enabled ? "text-emerald-600" : "text-slate-900"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Database Tables Size Report */}
                <div className="bg-white rounded-md border border-slate-200 p-6 shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-base">
                        <Table size={18} className="text-slate-500" /> Dynamic Tables Footprint
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider">
                                    <th className="pb-3 font-bold">Table Name</th>
                                    <th className="pb-3 font-bold text-right">Rows Count</th>
                                    <th className="pb-3 font-bold text-right">Storage Footprint</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {!loadingAiven && aivenData?.database_tables && aivenData.database_tables.length > 0 ? (
                                    aivenData.database_tables.map((tbl) => (
                                        <tr key={tbl.table_name} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 font-semibold text-slate-800">{tbl.table_name}</td>
                                            <td className="py-3 text-right font-mono">{Number(tbl.table_rows).toLocaleString()}</td>
                                            <td className="py-3 text-right font-mono font-medium text-slate-900">{Number(tbl.size_mb).toFixed(2)} MB</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-6 text-center text-slate-400 text-xs">
                                            {loadingAiven ? "Analyzing Schema Sizes..." : "No Table Schema Statistics Found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Query Performance Analytics Panel */}
                <div className="bg-white rounded-md border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-base">
                        <Activity size={18} className="text-slate-500" /> Latency Diagnosis
                    </h3>
                    <div className="space-y-4">
                        {!loadingAiven && aivenData?.query_performance && aivenData.query_performance.length > 0 ? (
                            aivenData.query_performance.map((queryItem, index) => (
                                <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                                    <div className="font-mono text-slate-700 break-all bg-white p-2 rounded border border-slate-200 line-clamp-2 mb-2">
                                        {queryItem.query}
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                                        <span>Executions: <strong className="text-slate-700">{queryItem.exec_count}</strong></span>
                                        <span>Avg Latency: <strong className="text-red-600">{(Number(queryItem.avg_latency) / 1000).toFixed(2)}s</strong></span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                                {loadingAiven ? "Evaluating Engine Analytica..." : "Performance insight logs clean or inaccessible."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface CardProps {
    title: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    statusColor?: string;
}

const StatusCard = ({ title, value, sub, icon, statusColor = "text-slate-900" }: CardProps) => (
    <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between min-h-28.75">
        <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
            <div className="text-slate-400">{icon}</div>
        </div>
        <div className="mt-2">
            <div className={`text-2xl font-black tracking-tight ${statusColor}`}>{value}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{sub}</div>
        </div>
    </div>
);

export default SuperAdminDatabase;