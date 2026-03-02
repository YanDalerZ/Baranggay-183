import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    MapPin,
    AlertTriangle,
    ChevronRight,
    Plus,
    Settings2,
    Loader2,
    LocateFixed,
    Search,
    Trash2,
    Send,
    History,
    Smartphone,
    Mail,
    Globe,
    Users
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL, NotificationHistoryItem, NotificationStats } from '../interfaces';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Types ---
interface Resident {
    id: string;
    system_id: string;
    name: string;
    address: string;
    coordinates: string | null;
    vulnerability: string;
    isHighRisk: boolean;
}

interface FloodPoint {
    id: number;
    lat: number;
    lng: number;
    radius: number;
}

interface AffectedResident {
    id: string;
    name: string;
    address: string;
    phone: string;
    priority: number;
    priorityLabel: string;
    tags: string[];
}

const VILLAMOR_CENTER: [number, number] = [14.525414314830792, 121.01265088448672];
const BGY_183_BOUNDARY = { center: VILLAMOR_CENTER, radius: 850 };

// --- Sub-Component: Map Click Handler ---
const MapClickHandler = ({
    onMapClick,
    activePinningUser,
    isAddMode
}: {
    onMapClick: (e: any) => void,
    activePinningUser: string | null,
    isAddMode: boolean
}) => {
    useMapEvents({
        click: (e) => {
            if (activePinningUser || isAddMode) {
                onMapClick(e);
            }
        },
    });
    return null;
};

const UnifiedEmergencyDashboard = () => {
    const { token, user } = useAuth();

    // GIS States
    const [residents, setResidents] = useState<Resident[]>([]);
    const [floodPoints, setFloodPoints] = useState<FloodPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddMode, setIsAddMode] = useState(false);
    const [activePinningUser, setActivePinningUser] = useState<string | null>(null);

    // Alert States
    const [hazardType, setHazardType] = useState('Flood');
    const [severity, setSeverity] = useState('High');
    const [message, setMessage] = useState('');
    const [channels, setChannels] = useState(['Web', 'SMS']);
    const [isSending, setIsSending] = useState(false);
    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
    const [priorityResidents, setPriorityResidents] = useState<AffectedResident[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);

    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [resRes, zonesRes, histRes, statsRes, prioRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/risk/residents`, config),
                axios.get(`${API_BASE_URL}/api/risk/flood-zones`, config),
                axios.get(`${API_BASE_URL}/api/notifications/history?type=emergency`, config),
                axios.get(`${API_BASE_URL}/api/notifications/stats`, config),
                axios.get(`${API_BASE_URL}/api/user/priority`, config)
            ]);

            const validZones = (zonesRes.data || []).filter((p: any) =>
                p.lat !== null && p.lng !== null && !isNaN(p.lat) && !isNaN(p.lng)
            );

            setResidents(resRes.data || []);
            setFloodPoints(validZones);
            setHistory(Array.isArray(histRes.data) ? histRes.data : []);
            setStats(statsRes.data);
            setPriorityResidents(prioRes.data || []);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [token, config]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Flood Zone Actions ---
    const handleAddFloodZone = async (lat: number, lng: number) => {
        try {
            await axios.post(`${API_BASE_URL}/api/risk/flood-zones`, { lat, lng, radius: 100 }, config);
            window.location.reload();
        } catch (err) {
            console.error("Add Flood Zone Error:", err);
            alert("Failed to add flood zone.");
        }
    };

    const handleUpdateRadius = async (id: number, newRadius: number) => {
        setFloodPoints(prev => prev.map(p => p.id === id ? { ...p, radius: newRadius } : p));
        try {
            await axios.put(`${API_BASE_URL}/api/risk/flood-zones/${id}`, { radius: newRadius }, config);
        } catch (err) {
            console.error("Radius Update Error:", err);
        }
    };

    const handleDeleteFloodZone = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this flood zone?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/risk/flood-zones/${id}`, config);
            window.location.reload();
        } catch (err) {
            console.error("Delete Zone Error:", err);
        }
    };

    // --- Resident Actions ---
    const autoLocateResident = async (resident: Resident) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(resident.address)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                handleManualPin(resident.id, parseFloat(lat), parseFloat(lon));
            } else {
                alert("Address not found. Please pin manually.");
                setActivePinningUser(resident.id);
            }
        } catch (err) {
            console.error("Geocoding error:", err);
        }
    };

    const handleManualPin = async (userId: string, lat: number, lng: number) => {
        try {
            const coordsString = `${lat},${lng}`;
            await axios.put(`${API_BASE_URL}/api/user/id/${userId}/coordinates`, { coordinates: coordsString }, config);
            window.location.reload();
        } catch (err) {
            console.error("Update Coordinates Error:", err);
            alert("Failed to save location.");
        }
    };

    const handleMapClick = (e: any) => {
        if (activePinningUser) {
            handleManualPin(activePinningUser, e.latlng.lat, e.latlng.lng);
        } else if (isAddMode) {
            handleAddFloodZone(e.latlng.lat, e.latlng.lng);
        }
    };

    // --- Broadcast Actions ---
    const handleBroadcast = async () => {
        if (!message) return alert("Please enter a message");
        setIsSending(true);
        try {
            await axios.post(`${API_BASE_URL}/api/notifications/broadcast`, {
                sender_id: user?.id || 'admin',
                title: `${hazardType.toUpperCase()} ALERT: ${severity}`,
                message: message,
                target_groups: ['flood_prone'],
                channels: channels,
            }, config);
            setMessage('');
            alert("Emergency Alert Broadcasted Successfully!");
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to broadcast alert");
        } finally {
            setIsSending(false);
        }
    };

    const toggleChannel = (channel: string) => {
        setChannels(prev => prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]);
    };

    // --- Risk Detection Logic ---
    const isInsideAnyZone = useCallback((resCoords: string | null) => {
        if (!resCoords || !floodPoints.length) return false;
        const coords = resCoords.split(',').map(Number);
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return false;
        const residentLatLng = L.latLng(coords[0], coords[1]);
        return floodPoints.some(zone => {
            if (zone.lat == null || zone.lng == null || isNaN(zone.lat) || isNaN(zone.lng)) return false;
            try {
                const zoneLatLng = L.latLng(zone.lat, zone.lng);
                return residentLatLng.distanceTo(zoneLatLng) <= (zone.radius || 0);
            } catch { return false; }
        });
    }, [floodPoints]);

    const residentsWithRisk = useMemo(() => {
        return residents.map(res => ({
            ...res,
            isInFloodZone: isInsideAnyZone(res.coordinates)
        }));
    }, [residents, isInsideAnyZone]);

    const floodCount = residentsWithRisk.filter(r => r.isInFloodZone).length;

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-red-600" size={48} />
                <p className="font-bold text-gray-400 uppercase tracking-tighter italic">Initializing Command Center...</p>
            </div>
        );
    }

    return (
        <div className="max-w-400 mx-auto px-4 pt-4 pb-12 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter -skew-x-12 bg-linear-to-r from-red-600 to-[#00308F] bg-clip-text text-transparent">
                        Emergency Command Center
                    </h2>
                    <p className="text-gray-500 font-medium italic">GIS Mapping & Disaster Response Protocol</p>
                </div>

                <div className="flex gap-2">
                    {(activePinningUser || isAddMode) && (
                        <div className="bg-orange-100 border border-orange-500 text-orange-700 px-4 py-2 text-xs font-black animate-pulse flex items-center">
                            {activePinningUser ? 'MODE: PINNING RESIDENT' : 'MODE: ADDING FLOOD ZONE'}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setIsAddMode(!isAddMode);
                            setActivePinningUser(null);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 font-black uppercase tracking-widest transition-all shadow-lg ${isAddMode ? 'bg-orange-500 text-white' : 'bg-[#00308F] text-white hover:bg-blue-800'}`}
                    >
                        {isAddMode ? <><Settings2 size={18} /> Exit Edit</> : <><Plus size={18} /> Add Flood Zone</>}
                    </button>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Population" value={stats?.totalRecipients || residents.length.toString()} icon={<Users className="text-gray-400" size={20} />} />
                <StatCard title="Active Hotspots" value={floodPoints.length.toString()} valueColor="text-orange-600" />
                <StatCard title="Residents at Risk" value={floodCount.toString()} valueColor="text-red-600" icon={<AlertTriangle className="text-red-600" size={20} />} />
                <StatCard title="Alerts (Today)" value={stats?.sentToday || "0"} valueColor="text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Alert Controls */}
                <aside className="lg:col-span-3 space-y-6">
                    <section className="bg-white border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-2">
                            <Send className="text-red-600" size={20} />
                            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tighter">Broadcast Alert</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Hazard</label>
                                <select value={hazardType} onChange={(e) => setHazardType(e.target.value)} className="w-full bg-gray-50 border-none py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none">
                                    <option>Flood</option>
                                    <option>Fire</option>
                                    <option>Typhoon</option>
                                    <option>Earthquake</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Severity</label>
                                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full bg-gray-50 border-none py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none">
                                    <option>Critical</option>
                                    <option>High</option>
                                    <option>Moderate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Message</label>
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Emergency instructions..." className="w-full bg-gray-50 border-none py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-25 resize-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Channels</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <ChannelCheckbox icon={<Globe size={14} />} label="Web" checked={channels.includes('Web')} onChange={() => toggleChannel('Web')} />
                                    <ChannelCheckbox icon={<Mail size={14} />} label="Email" checked={channels.includes('Email')} onChange={() => toggleChannel('Email')} />
                                    <ChannelCheckbox icon={<Smartphone size={14} />} label="SMS" checked={channels.includes('SMS')} onChange={() => toggleChannel('SMS')} />
                                </div>
                            </div>

                            <button onClick={handleBroadcast} disabled={isSending} className="w-full bg-red-600 disabled:bg-red-400 text-white py-3 font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest">
                                {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                Broadcast
                            </button>
                        </div>
                    </section>
                </aside>

                {/* Middle Column: Map & Analytics */}
                <main className="lg:col-span-6 space-y-6">
                    <div className="bg-white border border-gray-100 shadow-sm p-4">
                        <div className="aspect-video bg-blue-50 relative z-0 border overflow-hidden rounded-sm" >
                            <MapContainer center={VILLAMOR_CENTER} zoom={16} style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}>                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapClickHandler activePinningUser={activePinningUser} isAddMode={isAddMode} onMapClick={handleMapClick} />

                                <Circle center={BGY_183_BOUNDARY.center} radius={BGY_183_BOUNDARY.radius} pathOptions={{ color: '#22c55e', fillOpacity: 0.02, dashArray: '5, 10' }} />

                                {floodPoints.map((point) => (
                                    <Circle key={point.id} center={[point.lat, point.lng]} radius={point.radius || 100}
                                        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.35, weight: 2 }}>
                                        <Popup>
                                            <div className="min-w-50 p-2">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-black text-[11px] uppercase text-red-600 tracking-tighter">Adjust Risk Radius</h4>
                                                    <button onClick={() => handleDeleteFloodZone(point.id)} className="text-gray-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase italic">
                                                        <span>Coverage</span>
                                                        <span className="text-red-600">{point.radius}m</span>
                                                    </div>
                                                    <input type="range" min="20" max="1500" step="10" value={point.radius} onChange={(e) => handleUpdateRadius(point.id, parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
                                                </div>
                                            </div>
                                        </Popup>
                                    </Circle>
                                ))}

                                {residentsWithRisk.map((res) => {
                                    if (!res.coordinates) return null;
                                    const coords = res.coordinates.split(',').map(Number);
                                    return (
                                        <Marker key={res.id} position={[coords[0], coords[1]]}>
                                            <Popup>
                                                <div className="text-center p-1">
                                                    <p className="font-bold text-xs uppercase">{res.name}</p>
                                                    <p className="text-[9px] text-gray-400 mb-2">{res.address}</p>
                                                    <div className={`px-2 py-1 rounded-full text-[9px] font-black text-white ${res.isInFloodZone ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}>
                                                        {res.isInFloodZone ? '🚨 CRITICAL RISK' : '🛡️ SECURE'}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        </div>
                        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-gray-100">
                            <LegendItem color="border-2 border-dashed border-green-500" label="Boundary" />
                            <LegendItem color="bg-red-500" label="At Risk Resident" isDot />
                            <LegendItem color="bg-blue-600" label="Safe Resident" isDot />
                            <LegendItem color="bg-red-400/40 border border-red-500" label="Flood Danger Zone" />
                        </div>
                    </div>
                </main>

                {/* Right Column: Priority Queue & History */}
                <aside className="lg:col-span-3 space-y-6">
                    <section className="bg-white border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4 text-red-600">
                            <AlertTriangle size={18} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Evacuation Priority</h3>
                        </div>
                        <div className="space-y-3 max-h-87.5 overflow-y-auto custom-scrollbar pr-2">
                            {priorityResidents.map(res => (
                                <div key={res.id} className="p-3 bg-red-50 border-l-4 border-red-600 flex justify-between items-center group cursor-pointer hover:bg-red-100 transition-colors">
                                    <div className="space-y-0.5">
                                        <p className="font-black text-gray-900 text-[11px] uppercase">{res.name}</p>
                                        <p className="text-[9px] text-red-700 font-bold uppercase">{res.priorityLabel}</p>
                                        <p className="text-[8px] text-gray-400 font-mono">{res.phone}</p>
                                    </div>
                                    <ChevronRight size={14} className="text-red-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            ))}
                            {priorityResidents.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">All areas clear</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center gap-2">
                            <History size={16} className="text-gray-400" />
                            <h2 className="text-xs font-black uppercase tracking-widest">Recent Alerts</h2>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-75 overflow-y-auto">
                            {history.length > 0 ? history.map(item => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <p className="text-[10px] font-black text-gray-900 uppercase truncate">{item.title}</p>
                                    <p className="text-[9px] text-gray-500 line-clamp-2 mt-1">{item.desc}</p>
                                    <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-400 uppercase">
                                        <span>{item.date}</span>
                                        <span className="text-blue-600">{item.recipients} Sent</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="p-6 text-center text-[10px] text-gray-400 font-bold uppercase italic">No history</p>
                            )}
                        </div>
                    </section>
                </aside>
            </div>

            {/* Bottom Section: Directory */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Geospatial Directory</h2>
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 font-bold rounded-full">{residents.length} Residents</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {residentsWithRisk.map((resident) => (
                        <div key={resident.id} className={`p-4 border-2 transition-all duration-300 ${resident.isInFloodZone ? 'bg-red-50 border-red-200' : 'bg-white border-gray-50 shadow-sm hover:border-blue-100'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-black text-gray-900 uppercase text-xs leading-tight">{resident.name}</h4>
                                    <p className="text-[8px] text-gray-400 font-mono mt-0.5">ID: {resident.system_id}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter ${!resident.coordinates ? 'bg-gray-900 text-white' : resident.isInFloodZone ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                    {!resident.coordinates ? 'Unmapped' : resident.isInFloodZone ? 'In Zone' : 'Clear'}
                                </span>
                            </div>

                            <div className="flex items-start gap-2 mb-4">
                                <MapPin size={10} className="text-gray-400 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-gray-600 leading-tight line-clamp-1 italic">{resident.address}</p>
                            </div>

                            <div className="flex gap-1">
                                {!resident.coordinates ? (
                                    <>
                                        <button onClick={() => autoLocateResident(resident)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#00308F] text-white text-[8px] font-black hover:bg-blue-800 transition uppercase tracking-widest">
                                            <Search size={10} /> Auto
                                        </button>
                                        <button onClick={() => { setActivePinningUser(resident.id); setIsAddMode(false); }}
                                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[8px] font-black border-2 transition uppercase tracking-widest ${activePinningUser === resident.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}>
                                            <LocateFixed size={10} /> {activePinningUser === resident.id ? 'Pinning...' : 'Manual'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => { setActivePinningUser(resident.id); setIsAddMode(false); }}
                                        className={`w-full flex items-center justify-center gap-1 py-1.5 border-2 text-[8px] font-black transition uppercase tracking-widest ${activePinningUser === resident.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-100 text-gray-400 hover:text-gray-900'}`}>
                                        <LocateFixed size={10} /> Re-Pin Location
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// --- Helper Components ---

const LegendItem = ({ color, label, isDot = false }: { color: string; label: string; isDot?: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`${color} ${isDot ? 'w-2.5 h-2.5 rounded-full' : 'w-5 h-3'}`} />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
    </div>
);

const StatCard = ({ title, value, valueColor = "text-gray-900", icon }: any) => (
    <div className="bg-white p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
        </div>
        {icon}
    </div>
);

const ChannelCheckbox = ({ icon, label, checked, onChange }: { icon: any, label: string, checked: boolean, onChange: () => void }) => (
    <label className="flex items-center gap-2 p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
        <input type="checkbox" checked={checked} onChange={onChange} className="w-3 h-3 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
        <span className={checked ? "text-red-600" : "text-gray-400"}>{icon}</span>
        <span className="text-[10px] font-bold text-gray-700 uppercase">{label}</span>
    </label>
);

export default UnifiedEmergencyDashboard;