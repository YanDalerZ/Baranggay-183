import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Users,
  CreditCard,
  AlertTriangle,
  Calendar,
  Loader2
} from 'lucide-react';
import { type User, API_BASE_URL } from '../interfaces';

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
  <div className="bg-white p-6 border border-gray-100 shadow-sm">
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/user/`);
        setResidents(response.data);
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
      if (curr.type === 'SC' || curr.disability === 'Senior Citizen') acc.sc++;
      if (curr.type === 'PWD') acc.pwd++;
      if (curr.type === 'Both') { acc.sc++; acc.pwd++; }

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

      if (curr.is_flood_prone) acc.floodProne++;

      return acc;
    }, {
      total: 0, sc: 0, pwd: 0, floodProne: 0,
      expiringSoon: [] as any[]
    });
  }, [residents]);

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
        <section className="bg-white p-8 border border-gray-100 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ID Expiration Alerts</h2>
          <div className="space-y-4">
            {stats.expiringSoon.length > 0 ? (
              stats.expiringSoon.slice(0, 5).map((alert, i) => (
                <div key={i} className="flex justify-between items-center p-5 bg-orange-50/50 border border-orange-100">
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
              <p className="text-gray-400 text-sm py-4 text-center">No IDs expiring within 60 days.</p>
            )}
          </div>
        </section>

        {/* Recent Claims - Note: Connect this to your 'approvals' table next */}
        <section className="bg-white p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Claims</h2>
          <div className="space-y-4">
            {/* You can replace this dummy data by fetching your /api/claims or /api/approvals endpoint */}
            {[
              { name: "Maria Santos", type: "Senior Citizen Monthly Pension", status: "Claimed", color: "bg-green-100 text-green-700" },
              { name: "Maria Santos", type: "Relief Goods Package", status: "Claimed", color: "bg-green-100 text-green-700" },
              { name: "Pedro Reyes", type: "Senior Citizen Monthly Pension", status: "Claimed", color: "bg-green-100 text-green-700" },
              { name: "Rosa Cruz", type: "PWD Discount Card", status: "Approved", color: "bg-blue-100 text-blue-700" },
            ].map((claim, i) => (
              <div key={i} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition ">
                <div>
                  <div className="font-bold text-gray-900">{claim.name}</div>
                  <div className="text-sm text-gray-500">{claim.type}</div>
                </div>
                <span className={`px-4 py-1 text-xs font-bold ${claim.color}`}>
                  {claim.status}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;