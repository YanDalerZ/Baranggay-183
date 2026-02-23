import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Gift,
  Clock,
  MapPin,
  Info
} from 'lucide-react';

// --- Types ---
interface Event {
  id: string;
  title: string;
  type: 'Health Mission' | 'Community Event' | 'Relief Distribution' | 'Vaccination' | 'Birthday';
  date: string;
  time: string;
  location: string;
  attendees: string;
  description: string;
}

const AdminEventsCalendar = () => {

  const events: Event[] = [
    { id: '1', title: 'Free Medical Mission', type: 'Health Mission', date: 'Feb 20', time: '08:00 AM', location: 'Barangay Health Center', attendees: 'PWD, Senior Citizen, Both', description: 'Free medical consultation and medicines.' },
    { id: '2', title: 'Flood Preparedness Seminar', type: 'Community Event', date: 'Feb 25', time: '02:00 PM', location: 'Barangay 183 Hall', attendees: 'PWD, Senior Citizen, Both', description: 'Emergency preparedness training.' },
    { id: '3', title: 'Relief Goods Distribution', type: 'Relief Distribution', date: 'Feb 28', time: '09:00 AM', location: 'Barangay 183 Hall', attendees: 'PWD, Senior Citizen, Both', description: 'Monthly relief goods distribution.' },
    { id: '4', title: 'COVID-19 Vaccination Drive', type: 'Vaccination', date: 'Mar 5', time: '08:00 AM', location: 'Barangay Health Center', attendees: 'PWD, Senior Citizen, Both', description: 'Free COVID-19 booster shots.' },
    { id: '5', title: 'Maria Santos Birthday', type: 'Birthday', date: 'Mar 15', time: '12:00 PM', location: 'Block 1, Lot 15', attendees: 'PWD, Senior Citizen', description: 'Birthday celebration.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
      <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
        Events & Calendar</h2>


      <main>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Calendar Section (8 columns on large screens) */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white  border border-gray-100 shadow-sm p-4 md:p-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-black text-gray-900">February 2026</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex bg-gray-50 p-1  border border-gray-100">
                  <button className="p-1.5 hover:bg-white hover:shadow-sm  transition-all"><ChevronLeft size={18} /></button>
                  <button className="px-4 py-1.5 text-xs font-bold hover:bg-white hover:shadow-sm  transition-all">Today</button>
                  <button className="p-1.5 hover:bg-white hover:shadow-sm  transition-all"><ChevronRight size={18} /></button>
                </div>
                <button className="flex-1 sm:flex-none bg-black text-white px-4 py-2  text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition">
                  <Plus size={16} /> Add Event
                </button>
              </div>
            </header>

            {/* Calendar Grid - Responsive Visibility */}
            <div className="hidden md:grid grid-cols-7 gap-px bg-gray-100 border border-gray-100  overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 py-3 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">{day}</div>
              ))}
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className={`bg-white min-h-[120px] p-2 relative transition-colors hover:bg-gray-50/50 ${i === 17 ? 'bg-blue-50/30' : ''}`}>
                  <span className={`text-xs font-bold ${i + 1 === 18 ? 'text-blue-600' : 'text-gray-900'}`}>{i + 1}</span>
                  {/* Mock Event Dot/Label */}
                  {i === 14 && <div className="mt-2 p-1 bg-blue-100 text-blue-700 text-[8px] font-bold  truncate">Senior Citizens Day</div>}
                  {i === 17 && <div className="mt-2 p-1 bg-green-100 text-green-700 text-[8px] font-bold  truncate">Community Health Check-up</div>}
                  {i === 19 && <div className="mt-2 p-1 bg-green-100 text-green-700 text-[8px] font-bold  truncate">Free Medical Mission</div>}
                  {i === 24 && <div className="mt-2 p-1 bg-blue-100 text-blue-700 text-[8px] font-bold  truncate">Flood Seminar</div>}
                  {i === 27 && <div className="mt-2 p-1 bg-orange-100 text-orange-700 text-[8px] font-bold  truncate">Relief Distribution</div>}
                </div>
              ))}
            </div>

            {/* Mobile Calendar View (Simple list of days with events) */}
            <div className="md:hidden space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase mb-4">Calendar List View</p>
              <div className="p-4 bg-blue-50/50 border border-blue-100  flex justify-between items-center">
                <span className="text-sm font-bold text-blue-700">Feb 18: Community Health Check-up</span>
                <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-1 ">Today</span>
              </div>
            </div>
          </div>

          {/* Sidebar (4 columns on large screens) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Birthdays Card */}
            <div className="bg-white  border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Gift className="text-pink-500" size={18} />
                <h3 className="text-sm font-bold text-gray-900">Birthdays Today</h3>
              </div>
              <div className="py-8 text-center bg-gray-50  border border-dashed border-gray-200">
                <p className="text-xs font-medium text-gray-400">No birthdays today</p>
              </div>
            </div>

            {/* Upcoming Events Card */}
            <div className="bg-white  border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="group relative pl-4 border-l-2 border-transparent hover:border-gray-200 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5  ${event.type === 'Health Mission' ? 'bg-green-100 text-green-700' :
                        event.type === 'Community Event' ? 'bg-blue-100 text-blue-700' :
                          event.type === 'Vaccination' ? 'bg-purple-100 text-purple-700' :
                            event.type === 'Relief Distribution' ? 'bg-orange-100 text-orange-700' :
                              'bg-pink-100 text-pink-700'
                        }`}>
                        {event.type}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{event.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-1 mb-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400">
                      <div className="flex items-center gap-1"><Clock size={12} /> {event.time}</div>
                      <div className="flex items-center gap-1"><MapPin size={12} /> {event.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Schedule Info Box */}
        <div className="bg-blue-50/50 border border-blue-100  p-6 flex gap-4">
          <div className="w-10 h-10 bg-blue-100  flex items-center justify-center shrink-0">
            <Info className="text-blue-600" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">Dynamic Schedule Syncing</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              When an event is created, the system automatically schedules reminder notifications to the relevant user group. For example, only Seniors receive Flu Vaccine event reminders. The Birthday Management Logic generates a daily list of celebrants, allowing automated greetings or community recognitions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminEventsCalendar;