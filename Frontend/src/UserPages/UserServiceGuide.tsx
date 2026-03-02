import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Clock, Phone, ChevronRight,
  FileText, CreditCard, HeartPulse, Loader2, Info, X, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../interfaces';
import ViewGuideModal from './UserComponents/ViewGuide';

// Ensure this interface matches your appointments page logic
interface ServiceGuide {
  id: number;
  title: string;
  category: string;
  processing_time: string;
  requirements?: string | string[];
  steps: string | string[];
  last_updated: string;
  office_hours?: string;
  availability?: string;
}

const UserServiceGuide: React.FC = () => {
  const [guides, setGuides] = useState<ServiceGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState<ServiceGuide | null>(null);

  // Logic for the Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    purpose: '',
    priority: 'Normal',
    home_visit: false
  });

  const { token } = useAuth();

  const fetchGuides = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/serviceguide`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuides(response.data);
    } catch (err) {
      console.error("Error fetching service guides:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide || !token) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        service_id: selectedGuide.id,
        service_type: selectedGuide.title,
        appointment_date: formData.date,
        appointment_time: formData.time,
        purpose: formData.purpose,
        priority: formData.priority,
        home_visit: formData.home_visit
      }, config);

      setIsBookingModalOpen(false);
      alert("Appointment booked successfully!");
    } catch (err) {
      alert("Failed to book appointment");
    }
  };

  const categories = ['All', ...new Set(guides.map(g => g.category))];
  const filteredServices = activeFilter === 'All' ? guides : guides.filter(s => s.category === activeFilter);

  const getIconProps = (category: string) => {
    if (category.toLowerCase().includes('medical') || category.toLowerCase().includes('health')) {
      return { Icon: HeartPulse, color: 'text-red-600', bg: 'bg-red-100' };
    }
    return { Icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#00308F]" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Services...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          Services Guide
        </h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">Official guide for barangay services and applications.</p>
      </div>

      {/* Office Info */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
        <div className="flex items-center gap-2 text-blue-800 font-bold mb-4">
          <FileText size={18} />
          <span className="uppercase text-xs tracking-wider">Barangay 183 Office Information</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <MapPin className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Location</p>
              <p className="text-sm text-gray-800 font-bold">Barangay 183 Hall<br />Villamor, Pasay City</p>
            </div>
          </div>
          <div className="flex gap-3 border-l-0 md:border-l border-blue-200 md:pl-6">
            <Clock className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Standard Hours</p>
              <p className="text-sm text-gray-800 font-bold">Monday to Friday<br />8:00 AM - 5:00 PM</p>
            </div>
          </div>
          <div className="flex gap-3 border-l-0 md:border-l border-blue-200 md:pl-6">
            <Phone className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Contact Support</p>
              <p className="text-sm text-gray-800 font-bold">Phone: (02) 8123-4567<br />Email: barangay183@gov.ph</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-md border ${activeFilter === filter
              ? 'bg-[#00308F] text-white border-[#00308F] shadow-md'
              : 'bg-white border-gray-200 text-gray-500 hover:border-[#00308F] hover:text-[#00308F]'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => {
            const { Icon, color, bg } = getIconProps(service.category);
            return (
              <div
                key={service.id}
                onClick={() => setSelectedGuide(service)}
                className="group bg-white border border-gray-100 p-5 hover:border-[#00308F] hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer flex items-center justify-between rounded-xl"
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className={`p-3 rounded-lg ${bg} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${service.category.toLowerCase().includes('id') ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {service.category}
                      </span>
                      <h3 className="font-black text-gray-900 mt-1 uppercase text-sm tracking-tight">{service.title}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mt-1">
                        <Clock size={14} className="text-[#00308F]" />
                        <span>Processing: {service.processing_time}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-gray-400">
                      <Info size={14} className="text-blue-500" />
                      <span>Available: {service.office_hours || 'Mon-Fri, 8AM-5PM'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:block text-[9px] font-black uppercase text-[#00308F] opacity-0 group-hover:opacity-100 transition-opacity">View Steps</span>
                  <ChevronRight className="text-gray-300 group-hover:text-[#00308F] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No services found in this category.</p>
          </div>
        )}
      </div>

      {/* View Guide Modal */}
      {selectedGuide && !isBookingModalOpen && (
        <ViewGuideModal
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
          onProceed={() => {
            setIsBookingModalOpen(true);
            // Do not null selectedGuide here, we need it for the booking modal title
          }}
        />
      )}

      {/* Appointment Booking Modal */}
      {isBookingModalOpen && selectedGuide && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#00308F] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase -skew-x-12">New Appointment</h3>
                <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">{selectedGuide.title}</p>
              </div>
              <button onClick={() => { setIsBookingModalOpen(false); setSelectedGuide(null); }} className="hover:rotate-90 transition-transform"><X /></button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Preferred Date</label>
                  <input required type="date" className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none"
                    onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Preferred Time</label>
                  <input required type="time" className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none"
                    onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Purpose</label>
                <textarea required rows={3} className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none"
                  placeholder="Tell us more..." onChange={e => setFormData({ ...formData, purpose: e.target.value })}></textarea>
              </div>
              <div className="flex items-center justify-between py-2 border-y border-gray-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#00308F]" onChange={e => setFormData({ ...formData, home_visit: e.target.checked })} />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Request Home Visit</span>
                </label>
                <select className="text-[10px] font-black border-none bg-orange-50 text-orange-700 px-3 py-1 uppercase"
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="Normal">Normal Priority</option>
                  <option value="High Priority">High Priority</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#00308F] text-white py-4 font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2">
                Submit Application <ChevronRightIcon size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserServiceGuide;