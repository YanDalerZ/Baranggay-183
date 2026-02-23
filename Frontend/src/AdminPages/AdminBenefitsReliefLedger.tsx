import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  CheckCircle, 
  Clock, 
  Lock, 
  ShieldAlert
} from 'lucide-react';

// --- Types ---
interface InventoryItem {
  name: string;
  category: string;
  total: number;
  allocated: number;
  unit: string;
}

interface DistributionBatch {
  resident: string;
  id: string;
  item: string;
  qty: string;
  status: 'Claimed' | 'To Claim';
  date: string;
}

const BenefitsReliefLedger = () => {
  const [activeTab, setActiveTab] = useState<'quantity' | 'distribution'>('quantity');

  const inventory: InventoryItem[] = [
    { name: 'Rice', category: 'Food', total: 150, allocated: 10, unit: 'kg' },
    { name: 'Canned Goods', category: 'Food', total: 200, allocated: 10, unit: 'cans' },
    { name: 'Bottled Water', category: 'Beverage', total: 100, allocated: 3, unit: 'liters' },
    { name: 'Blankets', category: 'Non-food', total: 50, allocated: 0, unit: 'pcs' },
    { name: 'Hygiene Kits', category: 'Non-food', total: 75, allocated: 0, unit: 'sets' },
  ];

  const distributionBatch: DistributionBatch[] = [
    { resident: 'Maria Santos', id: 'PWD-001', item: 'Rice', qty: '5 kg', status: 'Claimed', date: '2026-02-01' },
    { resident: 'Pedro Reyes', id: 'SC-001', item: 'Rice', qty: '5 kg', status: 'To Claim', date: '-' },
    { resident: 'Rosa Cruz', id: 'PWD-002', item: 'Canned Goods', qty: '10 cans', status: 'Claimed', date: '2026-02-01' },
    { resident: 'Jose Mendoza', id: 'SC-002', item: 'Bottled Water', qty: '3 liters', status: 'To Claim', date: '-' },
  ];

  return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">

                    <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Benefits & Relief Goods Ledger</h2>


      <main>
        
        {/* Top Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Stock" value="575" subtext="Combined items" />
          <StatCard title="Allocated" value="15" subtext="Claimed items" valueColor="text-blue-600" />
          <StatCard title="Pending Claims" value="2" subtext="To be claimed" valueColor="text-orange-500" />
          <StatCard title="Completed" value="2" subtext="Successfully claimed" valueColor="text-green-600" />
        </div>

        {/* Main Ledger Card */}
        <section className="bg-white  border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package size={20} className="text-gray-900" />
              <h2 className="text-base font-bold text-gray-900">Benefits & Relief Goods Ledger</h2>
            </div>

            {/* Tab Toggle */}
            <div className="bg-gray-100 p-1  flex mb-6 max-w-2xl">
              <button 
                onClick={() => setActiveTab('quantity')}
                className={`flex-1 py-2 text-sm font-bold  transition-all ${activeTab === 'quantity' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Quantity Management
              </button>
              <button 
                onClick={() => setActiveTab('distribution')}
                className={`flex-1 py-2 text-sm font-bold  transition-all ${activeTab === 'distribution' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Distribution Tracking
              </button>
            </div>

            {activeTab === 'quantity' ? (
              /* Quantity Management Table */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-gray-500">Current inventory levels with automatic balance calculation</p>
                  <button className="bg-black text-white px-4 py-2  text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition">
                    <Plus size={16} /> Add New Item
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold text-gray-500 border-b border-gray-50">
                        <th className="pb-3">Item Name</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Total Stock</th>
                        <th className="pb-3">Allocated</th>
                        <th className="pb-3">Current Balance</th>
                        <th className="pb-3">Unit</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {inventory.map((item) => (
                        <tr key={item.name} className="text-sm">
                          <td className="py-4 font-bold text-gray-900">{item.name}</td>
                          <td className="py-4 text-gray-600">{item.category}</td>
                          <td className="py-4 font-bold">{item.total}</td>
                          <td className="py-4 font-bold text-blue-600">{item.allocated}</td>
                          <td className="py-4 font-bold">{item.total - item.allocated}</td>
                          <td className="py-4 text-gray-500">{item.unit}</td>
                          <td className="py-4 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100  overflow-hidden">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ width: `${(item.allocated / item.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">
                                {Math.round((item.allocated / item.total) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Distribution Tracking Table */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Distribution Batch: BATCH-2026-02</p>
                    <p className="text-xs text-gray-500">Track claim status with anti-duplicate protection</p>
                  </div>
                  <button className="bg-black text-white px-4 py-2  text-sm font-bold flex items-center gap-2">
                    Create New Batch
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold text-gray-500 border-b border-gray-50">
                        <th className="pb-3">Resident Name</th>
                        <th className="pb-3">System ID</th>
                        <th className="pb-3">Item</th>
                        <th className="pb-3">Quantity</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Claim Date</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {distributionBatch.map((claim) => (
                        <tr key={claim.id} className="text-sm">
                          <td className="py-4 font-bold text-gray-900">{claim.resident}</td>
                          <td className="py-4 text-gray-500 font-mono text-xs">{claim.id}</td>
                          <td className="py-4 text-gray-600">{claim.item}</td>
                          <td className="py-4 font-medium">{claim.qty}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1  text-[10px] font-bold flex items-center gap-1 w-fit ${
                              claim.status === 'Claimed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {claim.status === 'Claimed' ? <CheckCircle size={10}/> : <Clock size={10}/>}
                              {claim.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-400">{claim.date}</td>
                          <td className="py-4 text-right">
                            {claim.status === 'Claimed' ? (
                              <span className="text-xs font-bold text-gray-300 flex items-center justify-end gap-1">
                                <Lock size={12}/> Locked
                              </span>
                            ) : (
                              <button className="bg-black text-white px-3 py-1  text-xs font-bold hover:bg-gray-800 transition">
                                Mark as Claimed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Logic Warning Footer */}
          <div className="bg-purple-50 border-t border-purple-100 p-6 flex gap-4">
            <ShieldAlert className="text-purple-600 shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-purple-900">Anti-Duplicate Logic</h4>
              <p className="text-xs text-purple-800 leading-relaxed max-w-4xl">
                Once a resident is marked as "Claimed" for a specific item in a distribution batch, the status is locked to prevent duplicate claims. 
                The same resident cannot claim the same goods twice within the same batch, ensuring fair distribution.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution Summary */}
          <div className="bg-white  border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Distribution Summary</h3>
            <div className="space-y-4">
              <SummaryItem label="Rice" subtext="10 kg distributed" claimed={1} pending={1} />
              <SummaryItem label="Canned Goods" subtext="10 cans distributed" claimed={1} pending={0} />
              <SummaryItem label="Bottled Water" subtext="3 liters distributed" claimed={0} pending={1} />
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white  border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Recent Activities</h3>
            <div className="space-y-4">
              <ActivityItem name="Maria Santos" action="Claimed 5 Rice" date="2026-02-01" />
              <ActivityItem name="Rosa Cruz" action="Claimed 10 Canned Goods" date="2026-02-01" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ title, value, subtext, valueColor = "text-gray-900" }: any) => (
  <div className="bg-white p-5 border border-gray-100  shadow-sm">
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
    <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
    <p className="text-[10px] text-gray-400 font-medium mt-1">{subtext}</p>
  </div>
);

const SummaryItem = ({ label, subtext, claimed, pending }: any) => (
  <div className="flex items-center justify-between group cursor-default">
    <div>
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <p className="text-xs text-gray-400">{subtext}</p>
    </div>
    <div className="flex gap-4">
      <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
        <CheckCircle size={14}/> {claimed}
      </div>
      <div className="flex items-center gap-1.5 text-orange-500 font-bold text-xs">
        <Clock size={14}/> {pending}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ name, action, date }: any) => (
  <div className="flex items-center justify-between p-3  hover:bg-gray-50 transition-colors">
    <div>
      <p className="text-sm font-bold text-gray-900">{name}</p>
      <p className="text-xs text-gray-500 font-medium">{action}</p>
    </div>
    <div className="text-right">
      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold  flex items-center gap-1 mb-1">
        <CheckCircle size={10}/> Claimed
      </span>
      <p className="text-[10px] text-gray-400 font-mono">{date}</p>
    </div>
  </div>
);

export default BenefitsReliefLedger;