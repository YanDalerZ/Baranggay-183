import React from 'react';
import { User, Bell, ShieldAlert, ArrowRight, MapPin, Phone, Heart } from 'lucide-react';

// --- Brand Constants based on uploaded palette ---
const BRAND_BLUE = "text-[#00308F]";
const BRAND_BG_BLUE = "bg-[#00308F]";
const BRAND_ORANGE = "text-[#FF9800]";
const BRAND_BG_ORANGE = "bg-[#FF9800]";

const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center justify-between border-b-2 border-[#00308F] pb-2 mb-6">
    <div className="flex items-center gap-2">
      <Icon size={18} strokeWidth={2} className="#00308F" />
      <h2 className={`text-sm font-bold tracking-[0.15em] uppercase ${BRAND_BLUE}`}>{title}</h2>
    </div>
    <button className={`text-[10px] font-extrabold underline hover:no-underline uppercase tracking-tighter ${BRAND_BLUE}`}>
      View All
    </button>
  </div>
);

const StatTile = ({ title, value, subtext, isPrimary = false }: any) => (
  <div className="group cursor-pointer">
    <div className={`border border-gray-200 p-6 transition-all duration-300 group-hover:border-[#00308F] h-full flex flex-col justify-between ${isPrimary ? 'bg-blue-50/30' : 'bg-white'}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{title}</p>
        <p className={`text-4xl font-bold tracking-tighter ${isPrimary ? BRAND_BLUE : 'text-slate-800'}`}>{value}</p>
      </div>
      <p className="text-[10px] mt-4 text-gray-400 font-semibold uppercase tracking-tight">{subtext}</p>
    </div>
  </div>
);

const NotificationItem = ({ type, title, message, date, isNew }: any) => {
  const isUrgent = type === 'typhoon' || type === 'warning';

  return (
    <div className="group border-b border-gray-100 p-6 last:border-0 hover:bg-slate-50 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isNew && <span className={`w-2 h-2 rounded-full ${BRAND_BG_ORANGE}`} />}
            <h4 className={`text-sm font-bold uppercase tracking-tight ${isUrgent ? BRAND_ORANGE : BRAND_BLUE}`}>
              {title}
            </h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xl font-medium">{message}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-1">{date}</p>
        </div>
        <button className={`p-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 ${BRAND_BLUE}`}>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

const UserProfile: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 bg-white min-h-screen font-['Visby_CF', 'Inter', sans-serif]">

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
            <span className={BRAND_BLUE}>System Access</span>
            <span className="text-gray-300">|</span>
            <span className={BRAND_ORANGE}>PWD-001</span>
          </div>
          <h1 className={`text-5xl md:text-7xl font-heavy tracking-tighter italic ${BRAND_BLUE}`}>
            Hello, Maria.
          </h1>
          <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
            Your resident profile is fully verified. You have <span className={`${BRAND_BLUE} font-bold`}>5 community benefits</span> awaiting your claim.
          </p>
        </div>

        <div className={`${BRAND_BG_ORANGE} text-white px-8 py-5 flex items-center gap-4 shadow-lg shadow-orange-200/50`}>
          <ShieldAlert size={24} strokeWidth={2} />
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase leading-none opacity-90">Safety Advisory</p>
            <p className="text-sm font-bold mt-1 uppercase tracking-tight">Flood-Prone Area: High Alert</p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t-2 border-l-2 border-[#00308F]">
              <div className="border-r-2 border-b-2 border-[#00308F]"><StatTile title="Claimed" value="02" subtext="Benefits used" /></div>
              <div className="border-r-2 border-b-2 border-[#00308F]"><StatTile title="Eligible" value="05" subtext="Available now" isPrimary={true} /></div>
              <div className="border-r-2 border-b-2 border-[#00308F]"><StatTile title="Messages" value="01" subtext="Unread alerts" /></div>
              <div className="border-r-2 border-b-2 border-[#00308F]"><StatTile title="Validity" value="25d" subtext="Until Renewal" color={BRAND_ORANGE} /></div>
            </div>
          </section>

          <section>
            <SectionHeader title="Recent Communications" icon={Bell} />
            <div className="divide-y divide-slate-100 border-x border-slate-50">
              <NotificationItem
                type="warning"
                title="ID Renewal Required"
                message="Your PWD Identification card is nearing expiry. Please schedule a visit to the local barangay hall before March 15th."
                date="FEB 08, 2026"
                isNew={true}
              />
              <NotificationItem
                type="typhoon"
                title="Weather Advisory"
                message="Typhoon warning Signal #2. Evacuation centers in Zone 4 are now open for residents in high-risk zones."
                date="JAN 28, 2026"
              />
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="bg-slate-50 p-8 border-t-4 border-[#00308F]">
            <SectionHeader title="Account Details" icon={User} />
            <div className="space-y-8 mt-8">
              <DetailItem label="Full Name" value="Maria Santos" />
              <DetailItem label="Primary Address" value="Blk 1 Lot 15, Camarin Rd" icon={MapPin} />
              <DetailItem label="Phone Number" value="+63 917 123 4567" icon={Phone} />
              <DetailItem label="Emergency Contact" value="Juan Santos (Son)" icon={Heart} />
            </div>

            <button className={`w-full mt-10 ${BRAND_BG_BLUE} text-white text-xs font-black uppercase tracking-[0.2em] py-4 hover:bg-blue-900 transition-all shadow-md active:scale-95`}>
              Update Profile
            </button>
          </section>

          {/* Support with Brand Colors */}
          <div className={`border-2 border-[#FF9800] p-6 bg-orange-50/30`}>
            <h4 className={`text-[11px] font-black uppercase tracking-widest mb-2 ${BRAND_ORANGE}`}>Need Assistance?</h4>
            <p className="text-xs text-slate-600 mb-4 font-medium italic">Our support team is available 24/7 for community-related queries.</p>
            <p className={`text-sm font-bold underline cursor-pointer hover:${BRAND_BLUE} transition-colors`}>
              Contact Barangay Office
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

const DetailItem = ({ label, value, icon: Icon }: any) => (
  <div className="flex gap-4 group">
    <div className={`mt-1 transition-colors group-hover:${BRAND_ORANGE}`}>
      {Icon && <Icon size={16} strokeWidth={2} className="text-slate-400" />}
    </div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800 tracking-tight leading-snug">{value}</p>
    </div>
  </div>
);

export default UserProfile;