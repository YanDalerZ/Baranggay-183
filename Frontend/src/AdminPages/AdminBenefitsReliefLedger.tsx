import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import {
  Plus, CheckCircle, Clock, Lock, X, Search, Users, Loader2, ChevronRight, ArrowLeft, Layers, Info, Edit2, Trash2
} from 'lucide-react';
import { API_BASE_URL, type InventoryItem, type Batch, type DistributionRecord, type BatchData } from '../interfaces';


const BenefitsReliefLedger = () => {
  const [activeTab, setActiveTab] = useState<'quantity' | 'distribution'>('quantity');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [allDistributionRecords, setAllDistributionRecords] = useState<DistributionRecord[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [residentsInBatch, setResidentsInBatch] = useState<DistributionRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  const [newItem, setNewItem] = useState({ name: '', category: 'Food', total: 0, unit: 'pcs' });
  const { token, user } = useAuth();

  const [batchData, setBatchData] = useState<BatchData>({
    batchName: '',
    targetGroup: 'SC',
    selectedItems: []
  });
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (!token) return;
      const [invRes, batchRes, distRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/benefits/inventory`, config),
        axios.get(`${API_BASE_URL}/api/benefits/batches`, config),
        axios.get(`${API_BASE_URL}/api/benefits/distribution/all`, config)
      ]);
      setInventory(Array.isArray(invRes.data) ? invRes.data : []);
      setBatches(Array.isArray(batchRes.data) ? batchRes.data : []);
      setAllDistributionRecords(Array.isArray(distRes.data) ? distRes.data : []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInitialData(); }, []);

  const viewBatchDetails = async (batchId: string) => {
    setLoading(true);
    try {
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/api/benefits/distribution/${batchId}`, config);
      setResidentsInBatch(res.data);
      setSelectedBatchId(batchId);
    } catch (error) {
      alert("Failed to load residents for this batch");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      if (editingItem) {
        await axios.put(`${API_BASE_URL}/api/benefits/inventory/${editingItem.id}`, newItem, config);
      } else {
        await axios.post(`${API_BASE_URL}/api/benefits/inventory`, newItem, config);
      }
      setIsAddingItem(false);
      setEditingItem(null);
      setNewItem({ name: '', category: 'Food', total: 0, unit: 'pcs' });
      loadInitialData();
    } catch (error) {
      alert("Failed to save inventory item.");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item? This may affect distribution records.")) return;
    try {
      if (!token) return;

      await axios.delete(`${API_BASE_URL}/api/benefits/inventory/${id}`, config);
      loadInitialData();
    } catch (error) {
      alert("Failed to delete item.");
    }
  };

  const handleGenerateBatch = async () => {
    if (!batchData.batchName.trim()) {
      alert("Please enter a name for this distribution batch.");
      return;
    }
    if (batchData.selectedItems.length === 0) {
      alert("Please select at least one item to distribute.");
      return;
    }

    try {
      if (!token) return;

      const response = await axios.post(
        `${API_BASE_URL}/api/benefits/distribution/batch-generate`,
        {
          batchName: batchData.batchName,
          targetGroup: batchData.targetGroup,
          selectedItems: batchData.selectedItems
        }, config);

      alert(`Success ${user?.fullname}! ${response.data.message}`);

      setIsGeneratingBatch(false);
      setBatchData({ batchName: '', targetGroup: 'SC', selectedItems: [] });
      loadInitialData();

    } catch (error: any) {
      console.error("Axios error:", error);
    }
  };

  const handleClaim = async (residentId: string) => {
    if (!selectedBatchId) return;

    const currentBatch = batches.find(b => b.id === selectedBatchId);

    const itemsToClaim = currentBatch?.items_summary || [];

    if (!confirm("Confirm claim? This will deduct stocks from inventory.")) return;

    try {

      await axios.patch(`${API_BASE_URL}/api/benefits/claim`, {
        batchId: selectedBatchId,
        residentId: residentId,
        selectedItems: itemsToClaim
      }, config);

      viewBatchDetails(selectedBatchId);
      loadInitialData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Claim processing failed.");
    }
  };

  const filteredResidents = residentsInBatch.filter(r =>
    r.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.resident_id.toString().includes(searchTerm)
  );

  const totalStock = inventory.reduce((a, b) => a + (Number(b.total) || 0), 0);
  const totalAllocated = inventory.reduce((a, b) => a + (Number(b.allocated) || 0), 0);
  const remainingStock = totalStock - totalAllocated;
  const pendingClaimsCount = allDistributionRecords.filter(r => r.status === 'To Claim').length;
  const completedClaimsCount = allDistributionRecords.filter(r => r.status === 'Claimed').length;

  if (loading && !selectedBatchId && inventory.length === 0) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
      <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
        Benefits & Relief Goods Ledger
      </h2>
      <p className="text-gray-500 text-sm sm:text-base">
        Review and manage Benefits and Relief Goods
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Stock</p>
          <p className="text-2xl font-bold mt-1">{totalStock}</p>
          <p className="text-[10px] text-gray-400">Total volume across all items</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Allocated</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{totalAllocated}</p>
          <p className="text-[10px] text-gray-400">Available for distribution</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Remaining Stock</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{remainingStock}</p>
          <p className="text-[10px] text-gray-400">Available for distribution</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Pending Claims</p>
          <p className="text-2xl font-bold mt-1 text-orange-500">{pendingClaimsCount}</p>
          <p className="text-[10px] text-gray-400">Beneficiaries yet to claim</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Completed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{completedClaimsCount}</p>
          <p className="text-[10px] text-gray-400">Successfully released</p>
        </div>
      </div>

      <div className="bg-gray-100 p-1 flex w-full rounded-lg border border-gray-200">
        <button
          onClick={() => { setActiveTab('quantity'); setSelectedBatchId(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'quantity' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Quantity Management
        </button>
        <button
          onClick={() => setActiveTab('distribution')}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'distribution' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Distribution Tracking
        </button>
      </div>

      {activeTab === 'quantity' ? (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest flex items-center gap-2">
              <Layers size={14} />Current inventory levels with automatic balance calculation
            </h3>
            <button onClick={() => { setEditingItem(null); setNewItem({ name: '', category: 'Food', total: 0, unit: 'pcs' }); setIsAddingItem(true); }} className="bg-black text-white px-4 py-2 text-xs font-bold rounded flex items-center gap-2 hover:bg-gray-800 transition">
              <Plus size={14} /> Add New Item
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
            <Info className="text-blue-500 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-blue-900">Anti-Duplicate Logic</p>
              <p className="text-xs text-blue-700">When a resident's claim is marked as "Claimed", the system automatically decrements the "Current Balance" and increments "Allocated". Low stock alerts trigger when balance drops below 20%.</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Total Stock</th>
                    <th className="px-6 py-4">Allocated</th>
                    <th className="px-6 py-4">Current Balance</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inventory.map(item => {
                    const balance = item.total - item.allocated;
                    const percent = item.total > 0 ? (item.allocated / item.total) * 100 : 0;
                    return (
                      <tr key={item.id} className="text-sm hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-gray-500">{item.category}</td>
                        <td className="px-6 py-4">{item.total}</td>
                        <td className="px-6 py-4 text-blue-600">{item.allocated}</td>
                        <td className="px-6 py-4 font-bold">{balance}</td>
                        <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                        <td className="px-6 py-4 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold">{Math.round(percent)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setNewItem({ name: item.name, category: item.category, total: item.total, unit: item.unit });
                                setIsAddingItem(true);
                              }}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 overflow-y-auto h-[400px]">
          {!selectedBatchId ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest flex items-center gap-2">
                  <Layers size={14} /> Active Batch Records
                </h3>
                <button
                  onClick={() => setIsGeneratingBatch(true)}
                  className="bg-blue-600 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                  <Users size={14} /> Generate Multi-Batch
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                <Info className="text-blue-500 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-blue-900">Anti-Duplicate Logic</p>
                  <p className="text-xs text-blue-700">When a resident's claim is marked as "Claimed", the system automatically decrements the "Current Balance" and increments "Allocated". Low stock alerts trigger when balance drops below 20%.</p>
                </div>
              </div>
              <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Batch Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Items Included</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Target Group</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Beneficiaries</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {batches.map((batch) => (
                      <tr
                        key={batch.id}
                        onClick={() => viewBatchDetails(batch.id)}
                        className="group hover:bg-blue-50/30 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="bg-gray-900 text-white text-[9px] px-2 py-0.5 font-black rounded-full">
                            #{batch.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                            {batch.batch_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-400 italic truncate max-w-[200px]">
                            {batch.items_summary}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            {batch.target_group}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-gray-900">
                            {batch.total_eligible} pax
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {batches.length === 0 && (
                  <div className="p-10 text-center text-gray-400 text-sm italic">
                    No active batches found.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                <button onClick={() => setSelectedBatchId(null)} className="text-xs font-black flex items-center gap-1 text-blue-600 hover:underline uppercase">
                  <ArrowLeft size={14} /> Back to Batches
                </button>
                <div className="flex items-center gap-3 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm w-full md:w-auto">
                  <Search size={14} className="text-gray-400" />
                  <input
                    placeholder="Filter by Resident Name or ID..."
                    className="bg-transparent text-xs font-bold outline-none w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase font-black text-gray-400 bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4">Resident Information</th>
                      <th className="px-6 py-4">Package Content</th>
                      <th className="px-6 py-4">Current Status</th>
                      <th className="px-6 py-4">Date Claimed</th>
                      <th className="px-6 py-4 text-right">Process</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredResidents.length > 0 ? filteredResidents.map((r, i) => (
                      <tr key={i} className="text-sm hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{r.resident}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{r.resident_type}</span>
                            <span className="text-[12px] text-gray-800 font-mono">ID: {r.system_id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs italic text-gray-600 max-w-xs">{r.item_description}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${r.status === 'Claimed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {r.status === 'Claimed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-500">{r.status === 'Claimed' ? r.date_claimed : '—'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {r.status === 'Claimed' ? (
                            <div className="flex items-center justify-end gap-1 text-[10px] text-gray-300 font-black uppercase">
                              <Lock size={12} /> Locked
                            </div>
                          ) : (
                            <button onClick={() => handleClaim(r.resident_id)} className="bg-black text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-600 transition shadow-sm">
                              Release All
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">No matching residents found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          )}
        </div>

      )}

      {/* MODAL: ADD/EDIT ITEM */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddItem} className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl space-y-5 border-t-8 border-black">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase italic">{editingItem ? 'Edit Stock' : 'Warehouse Stock'}</h3>
              <button type="button" onClick={() => setIsAddingItem(false)}><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Description</label>
                <input required placeholder="e.g. Premium Rice 25kg" className="w-full border-b-2 py-2 outline-none font-bold text-lg" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Category</label>
                  <select className="w-full border-b-2 py-2 outline-none font-bold" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                    <option>Food</option><option>Medical</option><option>Hygiene</option><option>Non-food</option>
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Unit</label>
                  <input required placeholder="kg/pcs" className="w-full border-b-2 py-2 outline-none font-bold" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Stock Level</label>
                <input type="number" required className="w-full border-b-2 py-2 outline-none font-bold text-xl" value={newItem.total} onChange={e => setNewItem({ ...newItem, total: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsAddingItem(false)} className="flex-1 text-xs font-black uppercase py-4 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" className="flex-1 text-xs font-black uppercase py-4 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition">Save Record</button>
            </div>
          </form>
        </div>

      )}

      {/* MODAL: BATCH GENERATION */}
      {isGeneratingBatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl space-y-6 border-t-8 border-blue-600 relative">

            <button
              onClick={() => setIsGeneratingBatch(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-2xl font-black uppercase italic">Create Distribution</h3>
              <p className="text-[10px] font-bold text-gray-400">Set up a new relief distribution event</p>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distribution Name</label>
              <input
                type="text"
                placeholder="e.g., Q1 Supplemental Relief 2026"
                className="w-full mt-2 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all"
                value={batchData.batchName}
                onChange={(e) => setBatchData({ ...batchData, batchName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Beneficiary Group</label>
              <div className="flex gap-2 mt-2">
                {['SC', 'PWD', 'BOTH'].map(t => (
                  <button
                    key={t}
                    onClick={() => setBatchData({ ...batchData, targetGroup: t as any })}
                    className={`flex-1 py-3 text-xs font-black rounded-xl border-2 transition-all ${batchData.targetGroup === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign Goods per Resident</label>
              <div className="max-h-60 overflow-y-auto space-y-2 mt-2 pr-2 custom-scrollbar">
                {inventory.map(item => {
                  const selected = batchData.selectedItems.find(i => i.id === item.id);
                  const available = item.total - item.allocated;
                  return (
                    <div key={item.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${selected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-50'}`}>
                      <div>
                        <span className={`text-sm font-bold block ${selected ? 'text-blue-700' : 'text-gray-700'}`}>{item.name}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase">Stock: {available} {item.unit} available</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {selected && (
                          <div className="flex items-center bg-white border border-blue-200 rounded-lg px-2 py-1">
                            <input
                              type="number" min="1" max={available}
                              className="w-10 text-center text-xs font-black outline-none bg-transparent"
                              value={selected.qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setBatchData({ ...batchData, selectedItems: batchData.selectedItems.map(i => i.id === item.id ? { ...i, qty: val } : i) });
                              }}
                            />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (selected) setBatchData({ ...batchData, selectedItems: batchData.selectedItems.filter(i => i.id !== item.id) });
                            else setBatchData({ ...batchData, selectedItems: [...batchData.selectedItems, { id: item.id, name: item.name, qty: 1 }] });
                          }}
                          className={`p-2 rounded-lg transition-all ${selected ? 'bg-blue-600 text-white rotate-45' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsGeneratingBatch(false)}
                className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateBatch}
                className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Finalize & Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC DISTRIBUTION SUMMARY & RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 mb-6">Distribution Summary</h4>
          <div className="space-y-6">
            {inventory.length > 0 ? inventory.slice(0, 4).map(item => {
              // 1. Get actual claims for this item name
              const claimedCount = allDistributionRecords.filter(r =>
                r.item_description.includes(item.name) &&
                r.status === 'Claimed'
              ).length;

              // 2. Sum up the "Total Potential" from all batches containing this item
              // We check items_summary to see if this inventory item is part of that batch
              const totalPotential = batches
                .filter(b => b.items_summary.includes(item.name))
                .reduce((sum, b) => sum + (Number(b.total_eligible) || 0), 0);

              // 3. Pending = Total who COULD claim - Total who HAVE claimed
              const pendingCount = Math.max(0, totalPotential - claimedCount);

              return (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-gray-700">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.allocated} {item.unit} released to residents
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    {/* Claimed Stat */}
                    <div className="flex flex-col items-end">
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} /> {claimedCount}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase">Claimed</span>
                    </div>

                    {/* Pending Stat */}
                    <div className="flex flex-col items-end">
                      <span className="text-orange-500 flex items-center gap-1">
                        <Clock size={14} /> {pendingCount}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase">To Claim</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-gray-400 italic">No inventory data available.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">Recent Activities</h4>
          <div className="space-y-4">
            {allDistributionRecords.filter(r => r.status === 'Claimed').slice(0, 3).map((act, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-0.5">{act.batch_name || 'Relief Batch'}</p>
                  <p className="text-sm font-bold text-gray-900">{act.resident}</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{act.item_description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Claimed</span>
                  <p className="text-[9px] text-gray-400 mt-1">{act.date_claimed}</p>
                </div>
              </div>
            ))}
            {allDistributionRecords.filter(r => r.status === 'Claimed').length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-4">No recent claims recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsReliefLedger;