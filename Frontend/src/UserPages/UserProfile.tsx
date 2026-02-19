import React from 'react';
import { User, Gift, Bell, Calendar, AlertTriangle, ShieldAlert } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color = "text-gray-900" }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase mb-3">
      <Icon size={16} />
      <span>{title}</span>
    </div>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="text-[11px] text-gray-400 mt-1 font-medium">{subtext}</div>
  </div>
);

const NotificationRow = ({ type, title, message, date, isNew }: any) => {
  const styles: any = {
    warning: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-100' },
    pension: { bg: 'bg-green-50', icon: 'text-green-500', border: 'border-green-100' },
    typhoon: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-100' }
  };
  const style = styles[type] || styles.warning;

  return (
    <div className={`p-4 rounded-xl border ${style.border} bg-white flex gap-3 md:gap-4 items-start mb-3`}>
      <div className={`p-2 rounded-lg flex-shrink-0 ${style.bg} ${style.icon}`}>
        {type === 'typhoon' ? <ShieldAlert size={18} /> : <Bell size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-gray-800 truncate">{title}</h4>
          {isNew && <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded ml-2">NEW</span>}
        </div>
        <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">{date}</p>
      </div>
    </div>
  );
};

const UserMainPage: React.FC = () => {
  return (

    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">

      {/* Welcome Card */}
      <section className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 md:gap-5 w-full">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border-2 border-white shadow-sm flex-shrink-0">
            <User size={28} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg md:text-2xl font-black text-gray-900 truncate">Welcome, Maria!</h3>
            <p className="text-xs md:text-sm text-gray-500 font-bold tracking-wide">PWD-001 • BOTH</p>
          </div>
        </div>
        <span className="w-full md:w-auto bg-red-500 text-white text-[10px] font-black px-3 py-2 rounded-lg flex items-center justify-center md:justify-start gap-1.5 shadow-sm">
          <AlertTriangle size={14} /> FLOOD-PRONE AREA
        </span>
      </section>

      {/* Metrics Grid - Stacks on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <StatCard title="Benefits" value="2" subtext="Total claimed" icon={Gift} />
        <StatCard title="Available" value="5" subtext="Eligible" icon={Gift} />
        <StatCard title="Alerts" value="1" subtext="Unread" icon={Bell} />
        <StatCard title="ID Validity" value="25d" subtext="Until expiry" icon={Calendar} color="text-red-600" />
      </div>

      {/* Yellow ID Reminder */}
      <div className="bg-amber-50 border border-amber-200 p-4 md:p-5 rounded-2xl flex gap-3 items-start">
        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
        <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
          Your ID will expire in <span className="font-bold underline">25 days</span> (2026-03-15). Visit the barangay office to renew.
        </p>
      </div>

      {/* Information Section */}
      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm text-left">
        <h3 className="text-base md:text-lg font-black text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
          <User size={20} className="text-blue-600" /> Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div className="space-y-4">
            <Detail label="Full Name" value="Maria Santos" />
            <Detail label="System ID" value="PWD-001" />
            <Detail label="Birthday" value="1965-03-15" />
          </div>
          <div className="space-y-4">
            <Detail label="Address" value="Blk 1 Lot 15, Camarin Rd" />
            <Detail label="Contact" value="09171234567" />
            <Detail label="Emergency" value="Juan Santos (Son)" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm text-left">
        <h3 className="text-base md:text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" /> Notifications
        </h3>
        <NotificationRow
          type="warning" title="ID Expiration"
          message="Your PWD ID will expire on March 15." date="2026-02-08" isNew={true}
        />
        <NotificationRow
          type="typhoon" title="Typhoon Warning"
          message="Signal #2 raised. Stay safe." date="2026-01-28"
        />
      </div>

    </div>

  );
};

const Detail = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-[10px] text-gray-400 font-bold uppercase">{label}</p>
    <p className="text-sm font-bold text-gray-800 leading-tight">{value}</p>
  </div>
);

export default UserMainPage;