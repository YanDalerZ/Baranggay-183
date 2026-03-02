import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Clock, Home, CheckCircle2, MessageSquare,
  X, Loader2, ChevronRight,
  Info, ChevronDown, ClipboardList, Timer, Plus
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../interfaces';
import ViewGuideModal from './UserComponents/ViewGuide';
import CustomRequestModal from './UserComponents/RequestAppointment';

interface ServiceGuide {
  id: number;
  title: string;
  category: string;
  processing_time: string;
  requirements?: string | string[];
  steps: string | string[];
  last_updated: string;
  office_hours?: string;
}

interface Appointment {
  id: number;
  service_type: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  priority: 'High Priority' | 'Normal';
  created_at: string;
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  admin_notes?: string;
  home_visit: boolean;
}

const AppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'request'>('my');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceGuide[]>([]);
  const [loading, setLoading] = useState(true);

  // Accordion & Modal States
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceGuide | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    purpose: '',
    priority: 'Normal',
    home_visit: false
  });

  const { token } = useAuth();

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const [aptRes, svcRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/appointments`, config),
        axios.get(`${API_BASE_URL}/api/serviceguide`, config)
      ]);
      setAppointments(aptRes.data);
      setServices(svcRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !token) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        service_id: selectedService.id,
        service_type: selectedService.title,
        appointment_date: formData.date,
        appointment_time: formData.time,
        purpose: formData.purpose,
        priority: formData.priority,
        home_visit: formData.home_visit
      }, config);

      setIsModalOpen(false);
      setActiveTab('my');
      fetchData();
    } catch (err) {
      alert("Failed to book appointment");
    }
  };

  const handleCustomBooking = async (customData: any) => {
    if (!token) return;

    try {
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        service_id: null,
        service_type: customData.service_type,
        appointment_date: customData.date,
        appointment_time: customData.time,
        purpose: customData.purpose,
        priority: 'Normal',
        home_visit: customData.home_visit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsCustomModalOpen(false);
      setActiveTab('my');
      fetchData();
    } catch (err: any) {
      console.error("Booking Error:", err.response?.data || err.message);
      alert("Submission failed. Check console for details.");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Appointments
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Schedule appointments and track your service requests</p>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="flex items-center gap-2 bg-[#00308F] text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg"
        >
          <Plus size={16} /> New Custom Request
        </button>
      </header>

      <div className="bg-[#fffbeb] border border-orange-200 p-5 flex gap-4">
        <div className="p-2 bg-white shadow-sm h-fit"><Home className="text-orange-500" size={20} /></div>
        <div>
          <h3 className="font-bold text-orange-900 text-sm uppercase tracking-tighter">Home Visit Available</h3>
          <p className="text-xs text-orange-700 mt-1">Check the "Request Home Visit" option when booking if you have mobility issues or urgent medical needs.</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button onClick={() => setActiveTab('my')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'my' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
            My Appointments ({appointments.length})
          </button>
          <button onClick={() => setActiveTab('request')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'request' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
            Browse Services
          </button>
        </nav>
      </div>

      {activeTab === 'my' && (
        <div className="space-y-4">
          {appointments.length > 0 ? appointments.map((apt) => (
            <div key={apt.id} className="bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1 ${apt.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'} border`}>
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-bold uppercase">{apt.status}</span>
                  </div>
                  {apt.priority === 'High Priority' && <div className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 text-xs font-bold uppercase">{apt.priority}</div>}
                  <h2 className="text-xl font-bold text-gray-900 ml-2 uppercase tracking-tight">{apt.service_type}</h2>
                  <span className="text-[10px] text-gray-400 font-black uppercase ml-auto">Applied: {new Date(apt.created_at).toLocaleDateString()}</span>
                </div>
                <div className="bg-gray-50/50 p-4 border-l-4 border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Purpose:</p>
                  <p className="text-sm text-gray-800 font-medium">{apt.purpose}</p>
                </div>
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600"><Calendar size={18} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase">Date</p><p className="text-sm font-bold text-gray-800">{new Date(apt.appointment_date).toLocaleDateString()}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600"><Clock size={18} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase">Time</p><p className="text-sm font-bold text-gray-800">{apt.appointment_time}</p></div>
                  </div>
                </div>
                {apt.admin_notes && (
                  <div className="bg-blue-50/40 border border-blue-100 p-4">
                    <div className="flex items-center gap-2 mb-2"><MessageSquare size={14} className="text-blue-600" /><span className="text-xs font-bold text-blue-800 uppercase tracking-tighter">Admin Response:</span></div>
                    <p className="text-sm text-blue-700 font-medium italic">"{apt.admin_notes}"</p>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 uppercase font-black text-gray-400 text-xs tracking-widest">No existing appointments.</div>
          )}
        </div>
      )}

      {activeTab === 'request' && (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="col-span-6 md:col-span-5">Service Details</div>
            <div className="hidden md:block col-span-3">Category</div>
            <div className="hidden md:block col-span-2">Avg. Time</div>
            <div className="col-span-6 md:col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-gray-100">
            {services.map((service) => (
              <div key={service.id} className="group hover:bg-blue-50/30 transition-all">
                <div className="grid grid-cols-12 items-center p-4 md:p-6">
                  <div className="col-span-6 md:col-span-5">
                    <h4 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-tight group-hover:text-[#00308F] transition-colors">{service.title}</h4>
                    <button
                      onClick={() => setExpandedServiceId(expandedServiceId === service.id ? null : service.id)}
                      className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase hover:underline">
                      {expandedServiceId === service.id ? 'Hide Details' : 'View Quick Info'}
                      <ChevronDown size={12} className={`transition-transform ${expandedServiceId === service.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <div className="hidden md:block col-span-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded">{service.category}</span>
                  </div>
                  <div className="hidden md:block col-span-2 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Timer size={14} className="text-blue-400" />
                      {service.processing_time}
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-2 flex justify-end">
                    <button
                      onClick={() => { setSelectedService(service); setIsModalOpen(true); }}
                      className="px-4 py-2 bg-[#00308F] text-white text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-blue-800 transition-all active:scale-95">
                      Book Now
                    </button>
                  </div>
                </div>

                {expandedServiceId === service.id && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border border-gray-100 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#00308F] uppercase">
                          <ClipboardList size={14} /> Requirements Overview
                        </div>
                        <ul className="space-y-1">
                          {Array.isArray(service.requirements) ? service.requirements.slice(0, 3).map((req, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-blue-300 mt-1.5" /> {req}
                            </li>
                          )) : (
                            <li className="text-xs text-gray-600 italic">Check guide for full list...</li>
                          )}
                        </ul>
                      </div>
                      <div className="flex flex-col justify-end gap-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase italic">*Please prepare all documents before your visit.</p>
                        <button
                          onClick={() => { setSelectedService(service); setIsGuideOpen(true); }}
                          className="w-fit flex items-center gap-2 text-xs font-black bg-[#00308F] p-2 rounded-2xl text-white cursor-pointer uppercase tracking-tighter transition-colors">
                          <Info size={14} /> Read Full Application Guide
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#00308F] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase -skew-x-12">New Appointment</h3>
                <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">{selectedService.title}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X /></button>
            </div>

            <form onSubmit={handleBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Preferred Date</label>
                  <input required type="date" className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none transition-colors"
                    onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Preferred Time</label>
                  <input required type="time" className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none transition-colors"
                    onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Purpose / Additional Info</label>
                <textarea required rows={3} className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none transition-colors"
                  placeholder="Tell us more about your request..." onChange={e => setFormData({ ...formData, purpose: e.target.value })}></textarea>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-gray-50">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-[#00308F]" onChange={e => setFormData({ ...formData, home_visit: e.target.checked })} />
                  <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 uppercase tracking-tighter">Request Home Visit</span>
                </label>
                <select className="text-[10px] font-black border-none bg-orange-50 text-orange-700 px-3 py-1 uppercase outline-none"
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="Normal">Normal Priority</option>
                  <option value="High Priority">High Priority</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-[#00308F] text-white py-4 font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                Submit Application <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {isGuideOpen && selectedService && (
        <ViewGuideModal
          guide={selectedService}
          onClose={() => setIsGuideOpen(false)}
          onProceed={() => {
            setIsGuideOpen(false);
            setIsModalOpen(true);
          }}
        />
      )}

      <CustomRequestModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleCustomBooking}
      />
    </div>
  );
};

export default AppointmentsPage;