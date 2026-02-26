import React, { useState, useEffect } from 'react';
import { User as UserIcon, Bell, ShieldAlert, ArrowRight, MapPin, Phone, Heart, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL, type User } from '../interfaces';
import ViewUserDetails from './UserComponents/UserDetails';

// Branding Constants (Uniqlo/Azure Palette)
const BRAND_BLUE = "text-[#00308F]";
const BRAND_ORANGE = "text-[#FF9800]";
const BRAND_BG_ORANGE = "bg-[#FF9800]";

const UserProfile: React.FC = () => {
  const { token, user } = useAuth();

  // 1. Correct State Destructuring
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      // Check for system_id in both normal and nested auth objects
      const sid = user?.system_id || (user as any)?.system_id;

      if (sid && token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };
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
  }, [user, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className={`animate-spin ${BRAND_BLUE}`} size={48} />
      </div>
    );
  }

  // Fallback to auth user if API details haven't loaded yet
  const displayData = profileData || (user as unknown as User);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 bg-white min-h-screen font-sans">
      {/* Modal - Passing state correctly */}
      <ViewUserDetails
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        user={selectedUser}
      />

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
          <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
            Your resident profile is fully verified. You have <span className={`${BRAND_BLUE} font-bold`}>5 community benefits</span> awaiting your claim.
          </p>
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
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t-2 border-l-2 border-[#00308F]">
              <div className="border-r-2 border-b-2 border-[#00308F]"><StatTile title="Claimed" value="00" subtext="Benefits used" /></div>
              <div className="border-r-2 border-b-2 border-[#00308F]"><StatTile title="Eligible" value="05" subtext="Available now" isPrimary={true} /></div>
              <div className="border-r-2 border-b-2 border-[#00308F]"><StatTile title="Messages" value="02" subtext="Unread alerts" /></div>
              <div className="border-r-2 border-b-2 border-[#00308F]"><StatTile title="Status" value={displayData?.status === 'active' ? 'ACTV' : 'LIVE'} subtext="Account State" /></div>
            </div>
          </section>

          <section>
            <SectionHeader title="Recent Communications" icon={Bell} />
            <div className="divide-y divide-slate-100 border-x border-slate-50">
              <NotificationItem
                type="warning"
                title="ID Renewal Check"
                message={`Your ${displayData?.type} identification expiry is approaching (${displayData?.id_expiry_date || 'N/A'}).`}
                date="SYSTEM UPDATE"
                isNew={true}
              />
              <NotificationItem
                type="info"
                title="Welcome to Portal"
                message="Access your digital benefits ledger and emergency mapping directly from your dashboard."
                date="RECENT"
              />
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="bg-slate-50 p-8 border-t-4 border-[#00308F]">
            <div className="flex justify-between items-start mb-6">
              <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${BRAND_BLUE}`}>Account Details</h3>
            </div>

            <div className="space-y-8">
              <DetailItem label="Full Name" value={`${displayData?.firstname} ${displayData?.lastname}`} />
              <DetailItem label="Primary Address" value={displayData?.address} icon={MapPin} />
              <DetailItem label="Phone Number" value={displayData?.contact_number} icon={Phone} />
              <DetailItem
                label="Emergency Contact"
                value={displayData?.emergencyContact ? `${displayData.emergencyContact.name}` : "Not Set"}
                icon={Heart}
              />
            </div>

            {/* Uniqlo-style CTA Button */}
            <button
              onClick={() => {
                setSelectedUser(displayData);
                setIsViewDetailsOpen(true);
              }}
              className="w-full mt-10 py-4 bg-[#00308F] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all"
            >
              View Full Credentials
            </button>
          </section>

          <div className="border-2 border-[#FF9800] p-6 bg-orange-50/30">
            <h4 className={`text-[11px] font-black uppercase tracking-widest mb-2 ${BRAND_ORANGE}`}>Need Assistance?</h4>
            <p className="text-xs text-slate-600 mb-4 font-medium italic">Support team available 24/7 for community-related queries.</p>
            <p className={`text-sm font-bold underline cursor-pointer hover:${BRAND_BLUE} transition-colors uppercase tracking-tighter`}>
              Contact Barangay Office
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

/* --- Refined Sub-components --- */

const SectionHeader = ({ title, icon: Icon }: any) => (
  <div className="flex items-center justify-between border-b-2 border-[#00308F] pb-2 mb-6">
    <div className="flex items-center gap-2">
      <Icon size={18} strokeWidth={2} className="text-[#00308F]" />
      <h2 className={`text-sm font-bold tracking-[0.15em] uppercase ${BRAND_BLUE}`}>{title}</h2>
    </div>
    <button className={`text-[10px] font-extrabold underline hover:no-underline uppercase tracking-tighter ${BRAND_BLUE}`}>
      View History
    </button>
  </div>
);

const StatTile = ({ title, value, subtext, isPrimary = false }: any) => (
  <div className="group cursor-pointer">
    <div className={`p-6 transition-all duration-300 group-hover:bg-slate-100 h-full flex flex-col justify-between ${isPrimary ? 'bg-blue-50/50' : 'bg-white'}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{title}</p>
        <p className={`text-4xl font-black tracking-tighter ${isPrimary ? BRAND_BLUE : 'text-slate-800'}`}>{value}</p>
      </div>
      <p className="text-[10px] mt-4 text-gray-400 font-bold uppercase tracking-tight">{subtext}</p>
    </div>
  </div>
);

const NotificationItem = ({ type, title, message, date, isNew }: any) => (
  <div className="group p-6 hover:bg-slate-50 transition-colors cursor-pointer">
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {isNew && <span className={`w-2 h-2 rounded-full ${BRAND_BG_ORANGE}`} />}
          <h4 className={`text-sm font-black uppercase tracking-tight ${type === 'warning' ? BRAND_ORANGE : BRAND_BLUE}`}>
            {title}
          </h4>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed max-w-xl font-medium">{message}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] pt-1">{date}</p>
      </div>
      <ArrowRight size={18} className={`opacity-0 group-hover:opacity-100 transition-all ${BRAND_BLUE}`} />
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