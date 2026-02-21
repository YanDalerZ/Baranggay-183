import React, { useState } from 'react';
import { 
  Calendar, Clock, Home, Info, 
  CheckCircle2, AlertCircle, ChevronRight,
  MessageSquare, User
} from 'lucide-react';
import Navbar from '../components/Navbar';

interface Appointment {
  id: string;
  type: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  priority: 'High Priority' | 'Normal';
  requestDate: string;
  appointmentDate: string;
  appointmentTime: string;
  purpose: string;
  adminNotes?: string;
}

const AppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'request'>('my');

  // Sample data based on your image
  const myAppointments: Appointment[] = [
    {
      id: 'apt-001',
      type: 'Medical Assistance',
      status: 'Confirmed',
      priority: 'High Priority',
      requestDate: 'February 8, 2026',
      appointmentDate: 'February 15, 2026',
      appointmentTime: '10:00 AM',
      purpose: 'Request financial assistance for eye surgery',
      adminNotes: 'Patient has visual impairment and needs urgent care'
    }
  ];

  return (
    <Navbar pageTitle="Appointments">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500">Schedule appointments and track your service requests</p>
        </header>

        {/* Home Visit Eligibility Alert */}
        <div className="bg-[#fffbeb] border border-orange-200 rounded-xl p-5 flex gap-4">
          <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
            <Home className="text-orange-500" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-orange-900 text-sm">Home Visit Available</h3>
            <p className="text-sm text-orange-700 mt-1">
              Based on your profile, you may be eligible for home visit services. 
              Check the "Request Home Visit" option when booking an appointment.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'my' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Appointments ({myAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('request')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'request' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Request Appointment
            </button>
          </nav>
        </div>

        {/* My Appointments List */}
        {activeTab === 'my' && (
          <div className="space-y-4">
            {myAppointments.map((apt) => (
              <div key={apt.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                  
                  {/* Status & Title Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                      <CheckCircle2 size={14} />
                      <span className="text-xs font-bold">{apt.status}</span>
                    </div>
                    {apt.priority === 'High Priority' && (
                      <div className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-100 text-xs font-bold">
                        {apt.priority}
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 ml-2">{apt.type}</h2>
                    <span className="text-xs text-gray-400 font-medium ml-auto">Requested on {apt.requestDate}</span>
                  </div>

                  {/* Purpose Section */}
                  <div className="bg-gray-50/50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Purpose:</p>
                    <p className="text-sm text-gray-800 font-medium">{apt.purpose}</p>
                  </div>

                  {/* Date & Time Row */}
                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                        <p className="text-sm font-bold text-gray-800">{apt.appointmentDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Time</p>
                        <p className="text-sm font-bold text-gray-800">{apt.appointmentTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes Section */}
                  {apt.adminNotes && (
                    <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-blue-600" />
                        <span className="text-xs font-bold text-blue-800">Admin Notes:</span>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">{apt.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State / Request Placeholder */}
        {activeTab === 'request' && (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Book a New Appointment</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              Select a service and preferred schedule to visit the barangay office.
            </p>
            <button className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
              Start Request
            </button>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default AppointmentsPage;