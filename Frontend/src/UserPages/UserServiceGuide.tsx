import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapPin, Clock, Phone, ChevronRight,
  FileText, CreditCard, HeartPulse, Loader2, Info, X, ChevronRight as ChevronRightIcon,
  Search, RotateCcw, ArrowUpDown, Eye
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../interfaces';
import ViewGuideModal from './UserComponents/ViewGuide';

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
  views?: number; // Added to support sort by most/least viewed
}

const UserServiceGuide: React.FC = () => {
  const [guides, setGuides] = useState<ServiceGuide[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'most_viewed' | 'least_viewed'>('latest');

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
      setSelectedGuide(null);
      setFormData({
        date: '',
        time: '',
        purpose: '',
        priority: 'Normal',
        home_visit: false
      });
      alert("Appointment booked successfully!");
    } catch (err) {
      alert("Failed to book appointment");
    }
  };

  // Dynamic Options
  const categories = useMemo(() => ['All', ...Array.from(new Set(guides.map(g => g.category)))], [guides]);
  const availabilityOptions = useMemo(() => {
    const opts = Array.from(new Set(guides.map(g => g.availability || g.office_hours).filter(Boolean))) as string[];
    return ['All', ...opts];
  }, [guides]);

  // Combined Filtering & Sorting Logic
  const filteredAndSortedServices = useMemo(() => {
    const filtered = guides.filter((service) => {
      // 1. Search Query Filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' ||
        service.title.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        (service.processing_time && service.processing_time.toLowerCase().includes(query));

      // 2. Category Filter
      const matchesCategory = activeCategory === 'All' || service.category === activeCategory;

      // 3. Availability Filter
      const serviceAvail = service.availability || service.office_hours || '';
      const matchesAvailability = availabilityFilter === 'All' || serviceAvail === availabilityFilter;

      return matchesSearch && matchesCategory && matchesAvailability;
    });

    // Sort Results
    return filtered.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.last_updated || 0).getTime() - new Date(b.last_updated || 0).getTime();
      } else if (sortBy === 'most_viewed') {
        return (b.views || 0) - (a.views || 0);
      } else if (sortBy === 'least_viewed') {
        return (a.views || 0) - (b.views || 0);
      }
      return 0;
    });
  }, [guides, searchQuery, activeCategory, availabilityFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setAvailabilityFilter('All');
    setSortBy('latest');
  };

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
          Benefits Guide
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

      {/* Filters, Sorting & Search Control Panel */}
      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-xs space-y-4">
        {/* Search, Availability, Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative sm:col-span-5">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00308F] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Availability Select Filter */}
          <div className="sm:col-span-3">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 uppercase focus:outline-none focus:border-[#00308F]"
            >
              <option value="All">All Availability</option>
              {availabilityOptions.filter(opt => opt !== 'All').map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Select Dropdown (Latest, Oldest, Most/Least Viewed) */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ArrowUpDown size={14} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 uppercase focus:outline-none focus:border-[#00308F]"
              >
                <option value="latest">Sort: Latest Updated</option>
                <option value="oldest">Sort: Oldest Updated</option>
              </select>
            </div>

            {/* Clear All Filters Button */}
            {(searchQuery || activeCategory !== 'All' || availabilityFilter !== 'All' || sortBy !== 'latest') && (
              <button
                onClick={resetFilters}
                title="Reset Filters"
                className="flex items-center justify-center p-2.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all shrink-0"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Buttons */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-2">Category:</span>
          {categories.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveCategory(filter)}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-md border ${activeCategory === filter
                ? 'bg-[#00308F] text-white border-[#00308F] shadow-xs'
                : 'bg-white border-gray-200 text-gray-500 hover:border-[#00308F] hover:text-[#00308F]'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredAndSortedServices.length > 0 ? (
          filteredAndSortedServices.map((service) => {
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-center">
                    <div className="md:col-span-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${service.category.toLowerCase().includes('id') ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {service.category}
                      </span>
                      <h3 className="font-black text-gray-900 mt-1 uppercase text-sm tracking-tight">{service.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-gray-400 mt-1">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#00308F]" />
                          Processing: {service.processing_time}
                        </span>
                        {service.views !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye size={13} className="text-gray-400" />
                            {service.views} views
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col gap-1 text-[11px] font-bold text-gray-400">
                      <span className="flex items-center gap-1">
                        <Info size={13} className="text-blue-500" />
                        {service.office_hours || service.availability || 'Mon-Fri, 8AM-5PM'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Updated: {service.last_updated ? new Date(service.last_updated).toLocaleDateString() : 'N/A'}
                      </span>
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
          <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 space-y-3">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No services match your active filters.</p>
            <button
              onClick={resetFilters}
              className="text-xs font-black uppercase tracking-wider text-[#00308F] hover:underline"
            >
              Clear all filters
            </button>
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
          }}
        />
      )}

      {/* Appointment Booking Modal */}
      {isBookingModalOpen && selectedGuide && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden rounded-xl">
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
                  <input required type="date" className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none rounded-lg"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Preferred Time</label>
                  <input required type="time" className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none rounded-lg"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Purpose</label>
                <textarea required rows={3} className="w-full border-2 border-gray-100 p-3 font-bold text-sm focus:border-blue-600 outline-none rounded-lg"
                  placeholder="Tell us more..." value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })}></textarea>
              </div>
              <div className="flex items-center justify-between py-2 border-y border-gray-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#00308F]" checked={formData.home_visit} onChange={e => setFormData({ ...formData, home_visit: e.target.checked })} />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Request Home Visit</span>
                </label>
                <select className="text-[10px] font-black border-none bg-orange-50 text-orange-700 px-3 py-1 uppercase rounded-md"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="Normal">Normal Priority</option>
                  <option value="High Priority">High Priority</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#00308F] text-white py-4 font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2 rounded-lg">
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