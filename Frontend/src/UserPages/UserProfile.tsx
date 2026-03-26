import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bell, ShieldAlert, ArrowRight, MapPin, Phone, Heart, Loader2, MessageSquare, X, Calendar, Share2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL, type User } from '../interfaces';
import ViewUserDetails from './UserComponents/UserDetails';
import { useNavigate } from 'react-router-dom';
import SupportModal from './UserComponents/ContactSupport';

const BRAND_BLUE = "text-[#00308F]";
const BRAND_ORANGE = "text-[#FF9800]";
const BRAND_BG_ORANGE = "bg-[#FF9800]";

// Helper function to determine notification type based on title keywords
const determineType = (title: string): 'Warning' | 'Emergency' | 'Benefit' => {
  const t = title?.toUpperCase() || '';
  if (t.includes('EMERGENCY') || t.includes('CRITICAL') || t.includes('TYPHOON') || t.includes('FLOOD')) {
    return 'Emergency';
  }
  if (t.includes('BENEFIT') || t.includes('PENSION') || t.includes('GIFT') || t.includes('CLAIM')) {
    return 'Benefit';
  }
  return 'Warning';
};

const UserProfile: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Data States
  const [benefits, setBenefits] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  error;
  // Modal States
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // Fetch User Profile
  useEffect(() => {
    const fetchUserData = async () => {
      const sid = user?.system_id || (user as any)?.system_id;
      if (sid && token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/user/${sid}`, config);
          setProfileData(response.data);
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      } else if (!token) {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user, token, config]);

  // Fetch All Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    if (!token || !user?.id) return;

    try {
      const [benefitRes, notifRes, supportRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/benefits/getBenefit/${user.id}`, config),
        axios.get(`${API_BASE_URL}/api/notifications/user/${user.id}`, config),
        axios.get(`${API_BASE_URL}/api/notifications/support/${user.id}`, config)
      ]);

      setBenefits(Array.isArray(benefitRes.data) ? benefitRes.data : []);

      setNotifications(notifRes.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        isNew: item.status === 'unread',
        type: determineType(item.title),
        message: item.desc || item.message,
        date: item.date || item.created_at,
        channels: Array.isArray(item.channels) ? item.channels : ['Web']
      })));

      setSupportTickets(supportRes.data);
    } catch (err) {
      console.error(err);
      setError("Could not load dashboard data.");
    }
  }, [token, user?.id, config]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle clicking a notification (Open Modal + Mark as Read)
  const handleNotificationClick = async (n: any) => {
    setSelectedNotification(n);

    if (!n.isNew) return;

    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-read`, {
        notification_id: n.id,
        user_id: user?.id
      }, config);

      setNotifications(prev => prev.map(notif =>
        notif.id === n.id ? { ...notif, isNew: false } : notif
      ));
    } catch (error) {
      console.error("Error marking specific notification as read", error);
    }
  };

  // Filters: Only show UNREAD, Max 3
  const priorityNotifications = useMemo(() => {
    return notifications.filter(n => n.isNew).slice(0, 3);
  }, [notifications]);

  const stats = useMemo(() => ({
    total: benefits.length,
    claimed: benefits.filter(b => b.status === 'Claimed').length,
    pending: benefits.filter(b => b.status !== 'Claimed').length,
    unread: notifications.filter(n => n.isNew).length
  }), [benefits, notifications]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className={`animate-spin ${BRAND_BLUE}`} size={48} />
      </div>
    );
  }

  const displayData = profileData || (user as unknown as User);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 bg-white min-h-screen font-sans relative">
      <ViewUserDetails isOpen={isViewDetailsOpen} onClose={() => setIsViewDetailsOpen(false)} user={selectedUser} />

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl shadow-2xl border-t-4 border-[#00308F] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start p-6 border-b border-gray-100">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase mb-2 inline-block
                                    ${selectedNotification.type === 'Emergency' ? 'bg-red-100 text-red-700 border-red-200' :
                    selectedNotification.type === 'Benefit' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      'bg-amber-100 text-amber-700 border-amber-200'}`}>
                  {selectedNotification.type}
                </span>
                <h3 className="text-xl font-black uppercase text-gray-900 leading-tight">{selectedNotification.title}</h3>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="p-2 hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-lg leading-relaxed mb-8">{selectedNotification.message}</p>
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3 text-gray-500">
                  <Calendar size={18} />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Date Received</span>
                    <span className="text-sm font-medium">{new Date(selectedNotification.date).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Share2 size={18} />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Delivered Via</span>
                    <span className="text-sm font-medium">{selectedNotification.channels.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedNotification(null)} className="px-6 py-2 bg-[#00308F] text-white font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors">
                Close Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg border-t-4 border-[#FF9800] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase flex items-center gap-2">
                <MessageSquare size={20} className="text-[#FF9800]" />
                Support Ticket Details
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-100"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Your Message</label>
                <div className="mt-2 p-4 bg-slate-50 border-l-4 border-orange-400 italic text-slate-800 font-medium">
                  "{selectedTicket.message}"
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400">Inquiry Channel</label>
                  <p className="font-bold text-slate-900">{selectedTicket.channel || 'Web Portal'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400">Submission Date</label>
                  <p className="font-bold text-slate-900">{new Date(selectedTicket.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedTicket(null)} className="px-6 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest">Close Ticket</button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
            <span className={BRAND_BLUE}>System Access</span>
            <span className="text-gray-300">|</span>
            <span className={BRAND_ORANGE}>{displayData?.system_id || 'ID-PENDING'}</span>
          </div>
          <h1 className={`text-5xl md:text-7xl font-black tracking-tighter italic ${BRAND_BLUE}`}>
            Hello, {displayData?.firstname || 'Resident'}.
          </h1>
          <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">Your resident profile is fully verified.</p>
        </div>

        {displayData?.is_flood_prone && (
          <div className={`${BRAND_BG_ORANGE} text-white px-8 py-5 flex items-center gap-4 shadow-xl shadow-orange-100`}>
            <ShieldAlert size={24} strokeWidth={2} />
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase leading-none opacity-90">Safety Advisory</p>
              <p className="text-sm font-bold mt-1 uppercase tracking-tight">Flood-Prone Area: High Alert</p>
            </div>
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Stats Grid */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t-2 border-l-2 border-[#00308F]">
              <div className="border-r-2 border-b-2 border-[#00308F]">
                <StatTile title="Claimed" value={stats.claimed.toString().padStart(2, '0')} subtext="Benefits used" />
              </div>
              <div className="border-r-2 border-b-2 border-[#00308F]">
                <StatTile title="Eligible" value={stats.pending.toString().padStart(2, '0')} subtext="Available now" isPrimary={true} />
              </div>
              <div className="border-r-2 border-b-2 border-[#00308F]">
                <StatTile title="Messages" value={stats.unread.toString().padStart(2, '0')} subtext="Unread alerts" />
              </div>
              <div className="border-r-2 border-b-2 border-[#00308F]">
                <StatTile title="Status" value={displayData?.status === 'active' ? 'ACTV' : 'LIVE'} subtext="Account State" />
              </div>
            </div>
          </section>

          {/* Unread Notifications (Max 3) */}
          <section>
            <SectionHeader title="Priority Notifications" icon={Bell} onHistoryClick={() => navigate('/UserAlerts')} />
            <div className="divide-y divide-slate-100 border-x border-slate-50">
              {priorityNotifications.length > 0 ? (
                priorityNotifications.map((notif) => (
                  <div key={notif.id} onClick={() => handleNotificationClick(notif)} className="group p-6 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-[#00308F]">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${BRAND_BG_ORANGE}`} />
                          <h4 className={`text-sm font-black uppercase tracking-tight ${notif.type === 'Emergency' ? 'text-red-600' : BRAND_BLUE}`}>
                            {notif.title}
                          </h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed max-w-xl font-medium line-clamp-1">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] pt-1">
                          {new Date(notif.date).toLocaleDateString()}
                        </p>
                      </div>
                      <ArrowRight size={18} className={`opacity-0 group-hover:opacity-100 transition-all ${BRAND_BLUE}`} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-sm text-slate-500 font-medium text-center bg-slate-50/50 border border-dashed italic">
                  No new priority alerts. Check history for older messages.
                </div>
              )}
            </div>
          </section>

          {/* Support Tickets Section */}
          <section>
            <div className="flex items-center gap-2 border-b-2 border-[#00308F] pb-2 mb-6 mt-12">
              <MessageSquare size={18} strokeWidth={2} className="text-[#00308F]" />
              <h2 className={`text-sm font-bold tracking-[0.15em] uppercase ${BRAND_BLUE}`}>Support History</h2>
            </div>
            <div className="divide-y divide-slate-100 border-x border-slate-50">
              {supportTickets.length > 0 ? (
                supportTickets.map((ticket) => (
                  <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="p-6 hover:bg-slate-50 transition-colors border-l-4 border-transparent hover:border-[#FF9800] cursor-pointer">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between w-full">
                          <h4 className={`text-[11px] font-black uppercase tracking-widest text-gray-400`}>Ticket #{ticket.id}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-slate-100 px-2 py-1 text-slate-500">Via {ticket.channel || 'Portal'}</span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium mt-2 line-clamp-2">"{ticket.message}"</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] pt-2">{new Date(ticket.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-slate-500 font-medium text-center bg-slate-50/50">No previous support requests found.</div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="bg-slate-50 p-8 border-t-4 border-[#00308F]">
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${BRAND_BLUE} mb-6`}>Account Details</h3>
            <div className="space-y-8">
              <DetailItem label="Full Name" value={`${displayData?.firstname} ${displayData?.lastname}`} />
              <DetailItem label="Primary Address" value={displayData?.address} icon={MapPin} />
              <DetailItem label="Phone Number" value={displayData?.contact_number} icon={Phone} />
              <DetailItem label="Emergency Contact" value={displayData?.emergencyContact ? `${displayData.emergencyContact.name}` : "Not Set"} icon={Heart} />
            </div>
            <button onClick={() => { setSelectedUser(displayData); setIsViewDetailsOpen(true); }} className="w-full mt-10 py-4 bg-[#00308F] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all">
              View Full Credentials
            </button>
          </section>

          <div className="border-2 border-[#FF9800] p-6 bg-orange-50/30">
            <h4 className={`text-[11px] font-black uppercase tracking-widest mb-2 ${BRAND_ORANGE}`}>Need Assistance?</h4>
            <p className="text-xs text-slate-600 mb-4 font-medium italic">Support team available 24/7 for community-related queries.</p>
            <p onClick={() => setIsSupportOpen(true)} className={`text-sm font-bold underline cursor-pointer hover:${BRAND_BLUE} transition-colors uppercase tracking-tighter`}>Contact Barangay Office</p>
          </div>
          {isSupportOpen && (
            <SupportModal
              userId={user!.id}
              onClose={() => setIsSupportOpen(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

/* --- Refined Sub-components --- */

const SectionHeader = ({ title, icon: Icon, onHistoryClick }: any) => (
  <div className="flex items-center justify-between border-b-2 border-[#00308F] pb-2 mb-6">
    <div className="flex items-center gap-2">
      <Icon size={18} strokeWidth={2} className="text-[#00308F]" />
      <h2 className={`text-sm font-bold tracking-[0.15em] uppercase ${BRAND_BLUE}`}>{title}</h2>
    </div>
    <button onClick={onHistoryClick} className={`text-[10px] font-extrabold underline hover:no-underline uppercase tracking-tighter ${BRAND_BLUE}`}>
      View History
    </button>
  </div>
);

const StatTile = ({ title, value, subtext, isPrimary = false }: any) => (
  <div className="group cursor-pointer h-full">
    <div className={`p-6 transition-all duration-300 group-hover:bg-slate-100 h-full flex flex-col justify-between ${isPrimary ? 'bg-blue-50/50' : 'bg-white'}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{title}</p>
        <p className={`text-4xl font-black tracking-tighter ${isPrimary ? BRAND_BLUE : 'text-slate-800'}`}>{value}</p>
      </div>
      <p className="text-[10px] mt-4 text-gray-400 font-bold uppercase tracking-tight">{subtext}</p>
    </div>
  </div>
);

const DetailItem = ({ label, value, icon: Icon }: any) => (
  <div className="flex gap-4 group">
    <div className="mt-1 transition-colors group-hover:text-[#FF9800]">
      {Icon && <Icon size={16} strokeWidth={2} className="text-slate-300" />}
    </div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800 tracking-tight leading-snug">{value || '---'}</p>
    </div>
  </div>
);

export default UserProfile;