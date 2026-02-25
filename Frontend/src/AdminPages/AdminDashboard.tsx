import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Users,
  CreditCard,
  AlertTriangle,
  Calendar,
  Loader2
} from 'lucide-react';
import { type User, API_BASE_URL, type DistributionRecord } from '../interfaces';

// --- Types ---
interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconColor?: string;
  valueColor?: string;
}


// --- Components ---
const StatCard = ({ title, value, subtext, icon: Icon, iconColor = "text-gray-400", valueColor = "text-gray-900" }: StatCardProps) => (
  <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-700 font-semibold">{title}</h3>
      <Icon className={iconColor} size={20} />
    </div>
    <div className={`text-3xl font-bold mb-1 ${valueColor}`}>{value}</div>
    <div className="text-sm text-gray-400">{subtext}</div>
  </div>
);

const AdminDashboard = () => {
  const [residents, setResidents] = useState<User[]>([]);
  const [allDistributionRecords, setAllDistributionRecords] = useState<DistributionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using Promise.all to fetch both endpoints simultaneously
        const [usersRes, benefitsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/user/`),
          axios.get(`${API_BASE_URL}/api/benefits/distribution/all`)
        ]);

        setResidents(usersRes.data);
        setAllDistributionRecords(benefitsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Dynamic Calculations ---
  const stats = useMemo(() => {
    const now = new Date();
    const sixtyDays = new Date();
    sixtyDays.setDate(now.getDate() + 60);

    return residents.reduce((acc, curr) => {
      // 1. Total & Category Counts
      acc.total++;

      // Normalize type check
      const userType = curr.type?.toUpperCase();
      if (userType === 'SC' || curr.disability === 'Senior Citizen') acc.sc++;
      if (userType === 'PWD') acc.pwd++;
      if (userType === 'BOTH') { acc.sc++; acc.pwd++; }

      // 2. ID Expiration Logic
      if (curr.id_expiry_date) {
        const expDate = new Date(curr.id_expiry_date);
        if (expDate > now && expDate <= sixtyDays) {
          acc.expiringSoon.push({
            name: `${curr.firstname} ${curr.lastname}`,
            id: curr.system_id || 'N/A',
            date: curr.id_expiry_date.split('T')[0],
            days: Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          });
        }
      }

      // 3. Flood Prone
      if (curr.is_flood_prone) acc.floodProne++;

      return acc;
    }, {
      total: 0, sc: 0, pwd: 0, floodProne: 0,
      expiringSoon: [] as any[]
    });
  }, [residents]);

  // Helper to format claim dates
  const formatClaimDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-2" size={48} />
        <p className="font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
      {/* Top Header */}
      <header>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          Admin Dashboard
        </h2>
        <p className="text-sm md:text-base text-gray-500 font-medium">
          Management overview and system alerts for Barangay 183.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Residents"
          value={stats.total}
          subtext={`PWD: ${stats.pwd} | SC: ${stats.sc}`}
          icon={Users}
        />
        <StatCard
          title="IDs Expiring Soon"
          value={stats.expiringSoon.length}
          subtext="Within 60 days"
          icon={CreditCard}
          iconColor="text-orange-400"
          valueColor="text-orange-500"
        />
        <StatCard
          title="Flood-Prone Residents"
          value={stats.floodProne}
          subtext="High priority alerts"
          icon={AlertTriangle}
          iconColor="text-red-500"
          valueColor="text-red-600"
        />
        <StatCard
          title="Upcoming Events"
          value="7"
          subtext="This month"
          icon={Calendar}
        />
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Dynamic ID Expiration Alerts */}
        <section className="bg-white p-8 border border-gray-100 shadow-sm h-full rounded-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="text-orange-500" size={20} />
            ID Expiration Alerts
          </h2>
          <div className="space-y-4">
            {stats.expiringSoon.length > 0 ? (
              stats.expiringSoon.slice(0, 5).map((alert, i) => (
                <div key={i} className="flex justify-between items-center p-5 bg-orange-50/50 border border-orange-100 rounded-sm">
                  <div>
                    <div className="font-bold text-gray-900">{alert.name}</div>
                    <div className="text-sm text-gray-500">{alert.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{alert.days} days left</div>
                    <div className="text-sm text-gray-400">{alert.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100">
                <p className="text-gray-400 text-sm">No IDs expiring within 60 days.</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Claims Section */}
        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm h-full">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
            Recent Activities
          </h4>
          <div className="space-y-4">
            {allDistributionRecords && allDistributionRecords.filter(r => r.status === 'Claimed').length > 0 ? (
              allDistributionRecords
                .filter(r => r.status === 'Claimed')
                .slice(0, 5) // Increased to 5 for better visibility
                .map((act, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-sm border-l-4 border-green-500">
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-0.5">
                        {act.batch_name || 'Relief Batch'}
                      </p>
                      <p className="text-sm font-bold text-gray-900">{act.resident}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[200px]">
                        {act.item_description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                        Claimed
                      </span>
                      <p className="text-[9px] text-gray-400 mt-2">
                        {formatClaimDate(act.date_claimed)}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100">
                <p className="text-xs text-gray-400 italic">No recent claims recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;