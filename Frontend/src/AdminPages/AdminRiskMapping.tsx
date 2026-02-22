import {
    MapPin,
    AlertTriangle,
    Info,
    ChevronRight
} from 'lucide-react';

// --- Types ---
interface ResidentLocation {
    id: string;
    name: string;
    address: string;
    coordinates: string;
    vulnerability: string;
    isHighRisk: boolean;
}

// --- Mock Data ---
const residentLocations: ResidentLocation[] = [
    { id: 'PWD-001', name: 'Maria Santos', address: 'Block 1, Lot 15, Camarin Road', coordinates: '14.7329, 121.0206', vulnerability: 'Visual Impairment', isHighRisk: true },
    { id: 'SC-001', name: 'Pedro Reyes', address: 'Block 2, Lot 8, Bagong Silang Avenue', coordinates: '14.7335, 121.0215', vulnerability: 'None', isHighRisk: false },
    { id: 'PWD-002', name: 'Rosa Cruz', address: 'Block 3, Lot 22, Camarin Street', coordinates: '14.7340, 121.0220', vulnerability: 'Orthopedic Disability', isHighRisk: true },
    { id: 'SC-002', name: 'Jose Mendoza', address: 'Block 1, Lot 30, Bagong Silang Road', coordinates: '14.7325, 121.0200', vulnerability: 'None', isHighRisk: false },
    { id: 'PWD-003', name: 'Carmen Gonzales', address: 'Block 4, Lot 12, Camarin Avenue', coordinates: '14.7345, 121.0225', vulnerability: 'Hearing Impairment', isHighRisk: true },
    { id: 'PWD-004', name: 'Roberto Dela Cruz', address: 'Block 2, Lot 5, Camarin Road', coordinates: '14.7338, 121.0212', vulnerability: 'Mobility Impairment', isHighRisk: true },
];

const AdminRiskMapping = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        GIS Interactive Risk Mapping</h2>
                    <p className="text-sm md:text-base text-gray-500 font-medium">
                        Location mapping with social vulnerability layers</p>
                </div>

            </header>

            <main className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6 space-y-6">

                {/* Main Map and Summary Section */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Interactive Map View */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

                        <div className="aspect-video bg-blue-50 rounded-xl relative overflow-hidden flex items-center justify-center border border-blue-100">
                            <div className="text-center p-8 max-w-md bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl z-10">
                                <MapPin size={48} className="text-blue-600 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 mb-2">Interactive Map View</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Interactive GIS mapping feature showing resident locations and flood-prone areas.
                                    In production, this would display a fully interactive map with real-time data.
                                </p>
                            </div>

                            {/* Decorative Map Elements */}
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-200/40 rounded-full blur-2xl" />
                            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-red-200/40 rounded-full blur-3xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600/20">
                                <MapPin size={300} strokeWidth={0.5} />
                            </div>
                        </div>

                        {/* Map Legend */}
                        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-50">
                            <LegendItem color="bg-red-200/50" label="Flood-Prone Zone" />
                            <LegendItem color="bg-red-500" label="High Risk Resident" isDot />
                            <LegendItem color="bg-blue-500" label="Low Risk Resident" isDot />
                        </div>
                    </div>

                    {/* Sidebar: Risk Summary and High Priority */}
                    <div className="w-full lg:w-[400px] space-y-6">
                        {/* Risk Summary Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Risk Summary</h3>
                            <div className="space-y-4">
                                <SummaryRow label="Total Residents" value="6" />
                                <SummaryRow label="Flood-Prone" value="4" valueColor="text-red-500" />
                                <SummaryRow label="With Disabilities" value="4" />
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-sm font-bold text-gray-500 mb-1">Risk Percentage</p>
                                    <p className="text-4xl font-black text-orange-600">67%</p>
                                </div>
                            </div>
                        </div>

                        {/* High Priority Alerts */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4 text-red-600">
                                <AlertTriangle size={18} />
                                <h3 className="text-sm font-bold uppercase tracking-wider">High Priority</h3>
                            </div>
                            <div className="space-y-3">
                                {residentLocations.filter(r => r.isHighRisk).slice(0, 2).map(r => (
                                    <div key={r.id} className="p-4 bg-red-50 rounded-xl border border-red-100 relative group cursor-pointer hover:bg-red-100 transition">
                                        <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                                        <p className="text-[11px] text-gray-500 mb-2">{r.id}</p>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-0.5 bg-white text-red-600 text-[10px] font-bold rounded border border-red-200">Flood Risk</span>
                                            <span className="px-2 py-0.5 bg-white text-gray-600 text-[10px] font-bold rounded border border-gray-200 truncate">{r.vulnerability}</span>
                                        </div>
                                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resident Locations Grid */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Resident Locations</h2>
                        <Info size={16} className="text-gray-400" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {residentLocations.map((resident) => (
                            <div
                                key={resident.id}
                                className={`p-5 rounded-2xl border transition group cursor-pointer ${resident.isHighRisk
                                        ? 'bg-red-50/50 border-red-100 hover:bg-red-50'
                                        : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{resident.name}</h4>
                                        <p className="text-xs text-gray-400 font-mono">{resident.id}</p>
                                    </div>
                                    {resident.isHighRisk && (
                                        <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded tracking-tighter shadow-sm">
                                            High Risk
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={14} className="mt-1 shrink-0 text-gray-400" />
                                        <span>{resident.address}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 pl-6">Coordinates: {resident.coordinates}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100/50">
                                    <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 shadow-sm group-hover:border-gray-300">
                                        {resident.vulnerability === 'None' ? 'Standard Profile' : resident.vulnerability}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};

// --- Helper Components ---

const LegendItem = ({ color, label, isDot = false }: { color: string; label: string; isDot?: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`${color} ${isDot ? 'w-3 h-3 rounded-full shadow-sm' : 'w-6 h-4 rounded shadow-sm'}`} />
        <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
    </div>
);

const SummaryRow = ({ label, value, valueColor = "text-gray-900" }: { label: string; value: string; valueColor?: string }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className={`text-xl font-black ${valueColor}`}>{value}</span>
    </div>
);

export default AdminRiskMapping;