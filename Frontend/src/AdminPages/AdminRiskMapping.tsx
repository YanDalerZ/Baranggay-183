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
    Trash2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../interfaces';
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

const AdminRiskMapping = () => {
    const { token } = useAuth();
    const [residents, setResidents] = useState<Resident[]>([]);
    const [floodPoints, setFloodPoints] = useState<FloodPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddMode, setIsAddMode] = useState(false);
    const [activePinningUser, setActivePinningUser] = useState<string | null>(null);

    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [resRes, zonesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/risk/residents`, config),
                axios.get(`${API_BASE_URL}/api/risk/flood-zones`, config)
            ]);
            // Ensure we filter out any malformed data from the database immediately
            const validZones = (zonesRes.data || []).filter((p: any) =>
                p.lat !== null && p.lng !== null && !isNaN(p.lat) && !isNaN(p.lng)
            );
            setResidents(resRes.data || []);
            setFloodPoints(validZones);
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
            // Post the new zone
            await axios.post(
                `${API_BASE_URL}/api/risk/flood-zones`,
                { lat, lng, radius: 100 },
                config
            );

            // Force full page refresh immediately after the request finishes successfully
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
            // Refresh the page immediately after a successful deletion
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
            await axios.put(
                `${API_BASE_URL}/api/user/id/${userId}/coordinates`,
                { coordinates: coordsString },
                config
            );
            // After manual pinning, we also refresh to ensure GIS logic recalculates on a clean slate
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

    // --- Real-time Risk Detection Logic ---
    const isInsideAnyZone = useCallback((resCoords: string | null) => {
        if (!resCoords || !floodPoints.length) return false;

        const coords = resCoords.split(',').map(Number);
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return false;

        const [rLat, rLng] = coords;
        const residentLatLng = L.latLng(rLat, rLng);

        return floodPoints.some(zone => {
            if (zone.lat == null || zone.lng == null || isNaN(zone.lat) || isNaN(zone.lng)) return false;

            try {
                const zoneLatLng = L.latLng(zone.lat, zone.lng);
                const distance = residentLatLng.distanceTo(zoneLatLng);
                return distance <= (zone.radius || 0);
            } catch {
                return false;
            }
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
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-[#00308F]" size={48} />
                <p className="font-bold text-gray-400 uppercase tracking-tighter italic">Validating Geo-Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter -skew-x-12 bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
                        GIS Risk Mapping
                    </h2>
                    <p className="text-gray-500 font-medium italic">Bgy 183 Real-time Safety Monitor</p>
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

            <main className="space-y-12">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 bg-white border border-gray-100 shadow-sm p-4">
                        <div className="aspect-video bg-blue-50 relative z-0 border overflow-hidden">
                            <MapContainer center={VILLAMOR_CENTER} zoom={16} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                <MapClickHandler
                                    activePinningUser={activePinningUser}
                                    isAddMode={isAddMode}
                                    onMapClick={handleMapClick}
                                />

                                <Circle
                                    center={BGY_183_BOUNDARY.center}
                                    radius={BGY_183_BOUNDARY.radius}
                                    pathOptions={{ color: '#22c55e', fillOpacity: 0.02, dashArray: '5, 10' }}
                                />

                                {floodPoints.map((point) => {
                                    if (point.lat == null || point.lng == null || isNaN(point.lat) || isNaN(point.lng)) return null;

                                    return (
                                        <Circle
                                            key={point.id}
                                            center={[point.lat, point.lng]}
                                            radius={point.radius || 100}
                                            pathOptions={{
                                                color: '#ef4444',
                                                fillColor: '#ef4444',
                                                fillOpacity: 0.35,
                                                weight: 2
                                            }}
                                        >
                                            <Popup>
                                                <div className="min-w-[200px] p-2">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-black text-[11px] uppercase text-red-600 tracking-tighter">Adjust Risk Radius</h4>
                                                        <button onClick={() => handleDeleteFloodZone(point.id)} className="text-gray-400 hover:text-red-600 transition">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase italic">
                                                            <span>Coverage</span>
                                                            <span className="text-red-600">{point.radius} Meters</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="20"
                                                            max="1500"
                                                            step="10"
                                                            value={point.radius}
                                                            onChange={(e) => handleUpdateRadius(point.id, parseInt(e.target.value))}
                                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                                        />
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Circle>
                                    );
                                })}

                                {residentsWithRisk.map((res) => {
                                    if (!res.coordinates) return null;
                                    const coords = res.coordinates.split(',').map(Number);
                                    if (isNaN(coords[0]) || isNaN(coords[1])) return null;

                                    return (
                                        <Marker key={res.id} position={[coords[0], coords[1]]}>
                                            <Popup>
                                                <div className="text-center p-1">
                                                    <p className="font-bold text-xs uppercase">{res.name}</p>
                                                    <p className="text-[9px] text-gray-400 mb-2 truncate max-w-[120px] mx-auto">{res.address}</p>
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
                        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-100">
                            <LegendItem color="border-2 border-dashed border-green-500" label="Boundary" />
                            <LegendItem color="bg-red-500" label="At Risk Resident" isDot />
                            <LegendItem color="bg-blue-600" label="Safe Resident" isDot />
                            <LegendItem color="bg-red-400/40 border border-red-500" label="Flood Danger Zone" />
                        </div>
                    </div>

                    <div className="w-full lg:w-[400px] space-y-6">
                        <div className="bg-white border border-gray-100 shadow-sm p-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Risk Analytics</h3>
                            <div className="space-y-4">
                                <SummaryRow label="Total Residents" value={residents.length.toString()} />
                                <SummaryRow label="Geolocated" value={residents.filter(r => r.coordinates).length.toString()} valueColor="text-blue-600" />
                                <SummaryRow label="Flood Hotspots" value={floodPoints.length.toString()} valueColor="text-orange-600" />
                                <SummaryRow label="Residents At Risk" value={floodCount.toString()} valueColor="text-red-600" />
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4 text-red-600">
                                <AlertTriangle size={18} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Evacuation Priority</h3>
                            </div>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                {residentsWithRisk.filter(r => r.isInFloodZone).map(r => (
                                    <div key={r.id} className="p-3 bg-red-50 border-l-4 border-red-600 flex justify-between items-center group cursor-pointer hover:bg-red-100 transition-colors">
                                        <div>
                                            <p className="font-black text-gray-900 text-[11px] uppercase">{r.name}</p>
                                            <p className="text-[10px] text-red-700 font-bold uppercase tracking-tighter">{r.vulnerability || 'High Vulnerability'}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-red-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ))}
                                {floodCount === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">All areas clear</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Geospatial Directory</h2>
                            <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 font-bold rounded-full">{residents.length}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {residentsWithRisk.map((resident) => (
                            <div key={resident.id} className={`p-5 border-2 transition-all duration-300 ${resident.isInFloodZone ? 'bg-red-50 border-red-200' : 'bg-white border-gray-50 shadow-sm hover:border-blue-100'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-black text-gray-900 uppercase text-sm leading-tight">{resident.name}</h4>
                                        <p className="text-[9px] text-gray-400 font-mono mt-1 italic">SYS_ID: {resident.system_id}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {!resident.coordinates ? (
                                            <span className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black uppercase tracking-tighter">Unmapped</span>
                                        ) : (
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter ${resident.isInFloodZone ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                                {resident.isInFloodZone ? 'In Zone' : 'Clear'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 mb-6">
                                    <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 italic">{resident.address}</p>
                                </div>

                                <div className="flex gap-2">
                                    {!resident.coordinates ? (
                                        <>
                                            <button
                                                onClick={() => autoLocateResident(resident)}
                                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#00308F] text-white text-[9px] font-black hover:bg-blue-800 transition uppercase tracking-widest"
                                            >
                                                <Search size={12} /> Auto
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActivePinningUser(resident.id);
                                                    setIsAddMode(false);
                                                }}
                                                className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-black border-2 transition uppercase tracking-widest ${activePinningUser === resident.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
                                            >
                                                <LocateFixed size={12} /> {activePinningUser === resident.id ? 'Pinning...' : 'Manual'}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setActivePinningUser(resident.id);
                                                setIsAddMode(false);
                                            }}
                                            className={`w-full flex items-center justify-center gap-1 py-2 border-2 text-[9px] font-black transition uppercase tracking-widest ${activePinningUser === resident.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200'}`}
                                        >
                                            <LocateFixed size={12} /> Re-Pin Location
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

const LegendItem = ({ color, label, isDot = false }: { color: string; label: string; isDot?: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`${color} ${isDot ? 'w-2.5 h-2.5 rounded-full' : 'w-5 h-3'}`} />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
    </div>
);

const SummaryRow = ({ label, value, valueColor = "text-gray-900" }: { label: string; value: string; valueColor?: string }) => (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{label}</span>
        <span className={`text-lg font-black ${valueColor}`}>{value}</span>
    </div>
);

export default AdminRiskMapping;