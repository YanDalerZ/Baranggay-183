import React, { useState } from 'react';
import {
  MapPin, Clock, Phone, ChevronRight,
  FileText, CreditCard, HeartPulse
} from 'lucide-react';

interface Service {
  id: string;
  category: 'ID Application' | 'Medical Assistance';
  title: string;
  processingTime: string;
  availability: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const UserServiceGuide: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const services: Service[] = [
    {
      id: '1',
      category: 'ID Application',
      title: 'PWD ID Application',
      processingTime: '5-7 business days',
      availability: 'Monday to Friday, 8:00 AM - 5:00 PM',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      id: '2',
      category: 'ID Application',
      title: 'Senior Citizen ID Application',
      processingTime: '3-5 business days',
      availability: 'Monday to Friday, 8:00 AM - 5:00 PM',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      id: '3',
      category: 'Medical Assistance',
      title: 'Medical Assistance Application',
      processingTime: '3-5 business days',
      availability: 'Monday to Friday, 8:00 AM - 5:00 PM',
      icon: HeartPulse,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
  ];

  const filteredServices = activeFilter === 'All'
    ? services
    : services.filter(s => s.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          Services Guide</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Guide for barangay services online.
        </p>
      </div>

      {/* Office Information Card */}
      <div className="bg-blue-50 border border-blue-100  p-6">
        <div className="flex items-center gap-2 text-blue-800 font-bold mb-4">
          <FileText size={18} />
          <span>Barangay 183 Office Information</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <MapPin className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Address</p>
              <p className="text-sm text-gray-800">Barangay 183 Hall<br />Camarin, Caloocan City</p>
            </div>
          </div>

          <div className="flex gap-3 border-l-0 md:border-l border-blue-200 md:pl-6">
            <Clock className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Office Hours</p>
              <p className="text-sm text-gray-800">Monday to Friday<br />8:00 AM - 5:00 PM</p>
            </div>
          </div>

          <div className="flex gap-3 border-l-0 md:border-l border-blue-200 md:pl-6">
            <Phone className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Contact</p>
              <p className="text-sm text-gray-800">Phone: (02) 8123-4567<br />Email: barangay183@gov.ph</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'ID Application', 'Medical Assistance'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5  text-sm font-bold transition-colors ${activeFilter === filter
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="group bg-white border border-gray-200  p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-2.5  ${service.iconBg} ${service.iconColor}`}>
                <service.icon size={24} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5  ${service.category === 'ID Application' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {service.category}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1">{service.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <Clock size={14} />
                    <span>Processing: {service.processingTime}</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={14} className="text-blue-500" />
                  <span>{service.availability}</span>
                </div>
              </div>
            </div>

            <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-green-50 border border-green-100  p-6">
        <h4 className="font-bold text-green-800 text-sm">Need Additional Help?</h4>
        <p className="text-sm text-green-700 mt-1">
          If you have questions about any service, please reach out to our office.
        </p>
        <div className="flex gap-3 mt-4">
          <button className="px-5 py-2 bg-green-600 text-white text-sm font-bold  hover:bg-green-700">
            Contact Us
          </button>
          <button className="px-5 py-2 bg-white border border-green-200 text-green-600 text-sm font-bold  hover:bg-green-50">
            Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserServiceGuide;