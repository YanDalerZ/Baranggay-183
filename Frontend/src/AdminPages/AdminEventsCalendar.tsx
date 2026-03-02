import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Plus, Gift, Clock, MapPin, Info, X, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL, type Event } from '../interfaces';

const AdminEventsCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [birthdays, setBirthdays] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewDate, setViewDate] = useState(new Date());
  const { token } = useAuth();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data' // Required for file uploads
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    type: 'Community Event',
    date: '',
    time: '',
    location: '',
    attendees: 'BOTH',
    description: ''
  });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    setViewDate(new Date());
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const fetchData = async () => {
    try {
      if (!token) return;
      const authConfig = { headers: { Authorization: `Bearer ${token}` } };
      const [eventsRes, birthdayRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/events`, authConfig),
        axios.get(`${API_BASE_URL}/api/events/birthdays`, authConfig)
      ]);
      setEvents(eventsRes.data);
      setBirthdays(birthdayRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;

      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('location', formData.location);
      data.append('attendees', formData.attendees);
      data.append('description', formData.description);
      if (selectedFile) {
        data.append('event_bg', selectedFile);
      }

      await axios.post(`${API_BASE_URL}/api/events/create`, data, config);

      setIsModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({
        title: '',
        type: 'Community Event',
        date: '',
        time: '',
        location: '',
        attendees: 'BOTH',
        description: ''
      });
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Error creating event. Check console.");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const today = new Date();
  const celebrantsToday = birthdays.filter(b => {
    const bDate = new Date(b.event_date);
    return bDate.getDate() === today.getDate() && bDate.getMonth() === today.getMonth();
  });

  const totalDays = daysInMonth(currentYear, currentMonth);
  const startDay = firstDayOfMonth(currentYear, currentMonth);
  const blanks = Array.from({ length: startDay });
  const dayNodes = Array.from({ length: totalDays });

  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.event_date) >= today).length,
    thisMonth: events.filter(e => {
      const d = new Date(e.event_date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length,
    birthdaysToday: celebrantsToday.length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          Events & Calendar
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-35">
          <span className="text-sm font-bold text-gray-900">Total Events</span>
          <span className="text-4xl font-black text-black">{stats.total}</span>
        </div>
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-35">
          <span className="text-sm font-bold text-gray-900">Upcoming Events</span>
          <span className="text-4xl font-black text-blue-600">{stats.upcoming}</span>
        </div>
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-35">
          <span className="text-sm font-bold text-gray-900">This Month</span>
          <span className="text-4xl font-black text-green-600">{stats.thisMonth}</span>
        </div>
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-35">
          <span className="text-sm font-bold text-gray-900">Birthdays Today</span>
          <span className="text-4xl font-black text-pink-500">{stats.birthdaysToday}</span>
        </div>
      </div>

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 xl:col-span-9 bg-white border border-gray-100 shadow-sm p-4 md:p-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-black text-gray-900">{monthName} {currentYear}</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex bg-gray-50 p-1 border border-gray-100">
                  <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white hover:shadow-sm transition-all"><ChevronLeft size={18} /></button>
                  <button onClick={handleGoToToday} className="px-4 py-1.5 text-xs font-bold hover:bg-white hover:shadow-sm transition-all">Today</button>
                  <button onClick={handleNextMonth} className="p-1.5 hover:bg-white hover:shadow-sm transition-all"><ChevronRight size={18} /></button>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 sm:flex-none bg-black text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
                >
                  <Plus size={16} /> Add Event
                </button>
              </div>
            </header>

            <div className="hidden md:grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 py-3 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">{day}</div>
              ))}
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="bg-gray-50/50 min-h-30" />
              ))}
              {dayNodes.map((_, i) => {
                const dayNumber = i + 1;
                const dayEvents = events.filter(e => {
                  const d = new Date(e.event_date);
                  return d.getDate() === dayNumber && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });
                const dayBirthdays = birthdays.filter(b => {
                  const d = new Date(b.event_date);
                  return d.getDate() === dayNumber && d.getMonth() === currentMonth;
                });
                const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, dayNumber).toDateString();

                return (
                  <div key={dayNumber} className={`bg-white min-h-30 p-2 relative transition-colors hover:bg-gray-50/50 ${isToday ? 'bg-blue-50/30' : ''}`}>
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded' : 'text-gray-900'}`}>
                      {dayNumber}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayBirthdays.map(b => (
                        <div key={b.id} className="p-1 bg-pink-100 text-pink-700 text-[8px] font-bold truncate">
                          🎂 {b.title}
                        </div>
                      ))}
                      {dayEvents.map(ev => (
                        <div key={ev.id} className={`p-1 text-[8px] font-bold truncate ${ev.type === 'Health Mission' ? 'bg-green-100 text-green-700' :
                          ev.type === 'Vaccination' ? 'bg-purple-100 text-purple-700' :
                            ev.type === 'Relief Distribution' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase mb-4">Events for {monthName}</p>
              {events.filter(e => new Date(e.event_date).getMonth() === currentMonth).length > 0 ? (
                events.filter(e => new Date(e.event_date).getMonth() === currentMonth).map(e => (
                  <div key={e.id} className="p-4 bg-white border border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{formatDate(e.event_date)}: {e.title}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No events scheduled this month.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Gift className="text-pink-500" size={18} />
                <h3 className="text-sm font-bold text-gray-900">Birthdays Today</h3>
              </div>
              {celebrantsToday.length > 0 ? (
                <div className="space-y-3">
                  {celebrantsToday.map(b => (
                    <div key={b.id} className="text-xs font-bold text-gray-700 p-2 bg-pink-50 border border-pink-100">
                      🎂 {b.title}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200">
                  <p className="text-xs font-medium text-gray-400">No birthdays today</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {events.filter(e => new Date(e.event_date) >= today).slice(0, 5).map((event) => (
                  <div key={event.id} className="group relative pl-4 border-l-2 border-transparent hover:border-blue-500 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${event.type === 'Health Mission' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {event.type}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{formatDate(event.event_date)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">{event.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400 mt-2">
                      <div className="flex items-center gap-1"><Clock size={12} /> {event.event_time.substring(0, 5)}</div>
                      <div className="flex items-center gap-1"><MapPin size={12} /> {event.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white w-full max-w-[40vw] max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto">
            <div className="px-8 pt-8 pb-4 relative">
              <button onClick={() => { setIsModalOpen(false); setPreviewUrl(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold text-gray-900">Create New Event</h3>
              <p className="text-gray-500 text-sm mt-1 font-medium">Fill in the details to create a new community event.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">Event Background Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="text-gray-400 mb-2" size={24} />
                      <span className="text-xs font-medium text-gray-500">Click to upload image</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">Event Title</label>
                <input
                  required name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 outline-none placeholder:text-gray-400"
                  placeholder="Enter event title"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">Event Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 outline-none text-gray-700 font-medium appearance-none"
                >
                  <option>Community Event</option>
                  <option>Health Mission</option>
                  <option>Relief Distribution</option>
                  <option>Vaccination</option>
                  <option>Birthday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">Date</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">Time</label>
                  <input required type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">Location</label>
                <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 outline-none placeholder:text-gray-400" placeholder="Enter location" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 outline-none placeholder:text-gray-400 resize-none"
                  placeholder="Enter event description"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">Target Audience</label>
                <select
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleInputChange}
                  className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 outline-none text-gray-700 font-medium"
                >
                  <option value="BOTH">Both (SC & PWD)</option>
                  <option value="SC">Senior Citizens (SC)</option>
                  <option value="PWD">Persons with Disabilities (PWD)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" className="bg-[#0D1117] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50/50 border border-blue-100 p-6 flex gap-4">
        <div className="w-10 h-10 bg-blue-100 flex items-center justify-center shrink-0">
          <Info className="text-blue-600" size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">Dynamic Schedule Syncing</h4>
          <p className="text-xs text-blue-800 leading-relaxed">
            When an event is created with a background image, it will be displayed on the user's mobile dashboard and notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminEventsCalendar;