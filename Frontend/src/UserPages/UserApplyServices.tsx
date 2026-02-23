import React, { useState } from 'react';
import { FileText, Send, ChevronDown } from 'lucide-react';

type ApplicationType = 'RBI' | 'PWD' | 'Senior';

const UserApplyServices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ApplicationType>('RBI');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header Section */}
      <section>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
          Services Application Portal</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Apply for barangay services online. All forms are WCAG 2.1 compliant and optimized for accessibility.
        </p>
      </section>

      {/* Form Selection Tabs */}
      <div className="flex flex-wrap bg-gray-200/60 p-1  w-fit gap-1">
        <TabButton active={activeTab === 'RBI'} onClick={() => setActiveTab('RBI')} label="RBI Registration" />
        <TabButton active={activeTab === 'PWD'} onClick={() => setActiveTab('PWD')} label="PWD ID Application" />
        <TabButton active={activeTab === 'Senior'} onClick={() => setActiveTab('Senior')} label="Senior Citizen ID" />
      </div>

      {/* Main Form Container */}
      <div className="bg-white  border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12">
          {activeTab === 'RBI' && <RBIRegistrationForm />}
          {activeTab === 'PWD' && <PWDApplicationForm />}
          {activeTab === 'Senior' && <SeniorCitizenForm />}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-12 mt-12 border-t border-gray-100">
            <button className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200  hover:bg-gray-50 transition-all">
              Save as Draft
            </button>
            <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#05051e]  hover:opacity-90 transition-all flex items-center gap-2">
              <Send size={16} /> Submit Application
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <section className="bg-white  border border-gray-100 shadow-sm p-8">
        <h4 className="font-bold text-gray-900 mb-6">Need Help?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-xs font-bold text-gray-900 mb-1">Office Hours</p>
            <p className="text-sm text-gray-500">Monday to Friday<br />8:00 AM - 5:00 PM</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 mb-1">Contact Number</p>
            <p className="text-sm text-blue-600 font-medium">(02) 8123-4567</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 mb-1">Email</p>
            <p className="text-sm text-blue-600 font-medium">info@barangay183.gov.ph</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-bold text-gray-600">Accessibility Note:</span> This portal is optimized for screen readers and keyboard navigation. Use Tab to navigate between fields, and use the High Contrast mode and Text Size controls in the top toolbar if needed.
          </p>
        </div>
      </section>
    </div>
  );
};

// --- APPLICATION FORMS (FORMATTED PER IMAGES) ---

const RBIRegistrationForm = () => (
  <div className="space-y-12">
    <div>
      <h3 className="text-base font-bold text-gray-900">RBI (Registry of Barangay Inhabitants) Registration</h3>
      <p className="text-sm text-gray-500 mt-1">The foundation for all barangay records. Complete this form to be registered as a resident of Barangay 183.</p>
    </div>

    <FormSection title="Personal Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input label="First Name *" />
        <Input label="Middle Name *" />
        <Input label="Last Name *" />
        <Input label="Suffix" placeholder="Jr., Sr., III, etc." />
        <Select label="Sex *" options={['Male', 'Female']} />
        <Input label="Birthplace *" />
        <Input label="Nationality *" defaultValue="Filipino" />
      </div>
    </FormSection>

    <FormSection title="Residence Details">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="House No. *" />
        <Input label="Street *" />
        <Input label="Purok *" placeholder="e.g., Purok 1" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Select label="Ownership Type *" options={['Owned', 'Rented', 'Living with Relatives']} />
        <Input label="Years of Residency *" />
      </div>
    </FormSection>

    <FormSection title="Household Data">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Occupation *" />
        <Select label="Monthly Income *" options={['Below 10,000', '10,000 - 20,000', 'Above 20,000']} />
        <Select label="Civil Status *" options={['Single', 'Married', 'Widowed', 'Separated']} />
      </div>
    </FormSection>

    <FormSection title="Emergency Information">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-5 bg-gray-200  relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white "></div></div>
        <span className="text-sm font-medium text-gray-700">Located in Flood-Prone Area?</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Emergency Contact Person *" />
        <Input label="Emergency Contact Number *" placeholder="09XXXXXXXXX" />
      </div>
    </FormSection>

    <FormSection title="Verification Documents">
      <FileUpload label="Upload 2x2 Photo *" sub="Recent 2x2 photo with white background" />
      <FileUpload label="Upload Proof of Residency *" sub="Utility bill, tax declaration, or barangay clearance" />
    </FormSection>
  </div>
);

const PWDApplicationForm = () => (
  <div className="space-y-12">
    <div>
      <h3 className="text-base font-bold text-gray-900">PWD ID Application</h3>
      <p className="text-sm text-gray-500 mt-1">Official registration for disability benefits and 20% discount privileges.</p>
    </div>

    <FormSection title="Disability Information">
      <Select label="Type of Disability *" options={['Visual Impairment', 'Hearing Impairment', 'Mobility Impairment']} />
      <div className="mt-4">
        <TextArea label="Medical Condition/Diagnosis *" placeholder="Describe your medical condition or diagnosis" />
      </div>
    </FormSection>

    <FormSection title="Caregiver/Guardian Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Guardian Name" />
        <Input label="Relationship to Resident" placeholder="e.g., Mother, Father, Spouse" />
      </div>
      <div className="mt-4">
        <Input label="Caregiver Contact Details" placeholder="09XXXXXXXXX" />
      </div>
    </FormSection>

    <FormSection title="Employment & Health Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select label="Employment Status *" options={['Employed', 'Unemployed', 'Student', 'Self-employed']} />
        <Select label="Blood Type" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
      </div>
    </FormSection>

    <FormSection title="Required Documents">
      <FileUpload label="Upload Medical Certificate *" sub="Medical certificate from a licensed physician indicating your disability" />
      <FileUpload label="Upload Valid Government ID *" sub="Birth certificate, voter's ID, or barangay clearance" />
    </FormSection>

    <FormSection title="Consent">
      <div className="flex gap-3">
        <input type="checkbox" className="mt-1 w-4 h-4  border-gray-300" />
        <p className="text-sm text-gray-700 font-medium leading-tight">
          I consent to the collection and processing of my personal data in accordance with the Data Privacy Act of 2012 * <br />
          <span className="text-blue-600 text-xs font-bold cursor-pointer hover:underline">Read the Data Privacy Policy</span>
        </p>
      </div>
    </FormSection>
  </div>
);

const SeniorCitizenForm = () => (
  <div className="space-y-12">
    <div>
      <h3 className="text-base font-bold text-gray-900">Senior Citizen ID Application</h3>
      <p className="text-sm text-gray-500 mt-1">Automated age-verification and benefit enrollment for senior citizens (60 years old and above).</p>
    </div>

    <FormSection title="Personal Information">
      <div className="max-w-md space-y-4">
        <Input label="Date of Birth *" placeholder="dd/mm/yyyy" />
        <p className="text-[11px] text-gray-400 italic">Must be 60 years old or above to qualify</p>
        <Input label="GSIS/SSS Number (Optional)" placeholder="e.g., SSS-03-1234567-8" />
      </div>
    </FormSection>

    <FormSection title="Health Profile">
      <TextArea label="Maintenance Medications" placeholder="List any regular medications you take (e.g., Amlodipine for hypertension)" />
      <p className="text-[11px] text-gray-400 italic mb-4">This helps us prepare for medical emergencies</p>
      <Input label="Primary Healthcare Provider" placeholder="e.g., Bagong Silang Health Center" />
    </FormSection>

    <FormSection title="Vulnerability Assessment">
      <p className="text-xs text-gray-400 mb-4">These markers help us prioritize assistance during emergencies</p>
      <div className="space-y-3">
        <Checkbox label="I am living alone" />
        <Checkbox label="I am bedridden or have limited mobility" />
      </div>
    </FormSection>

    <FormSection title="Required Documents">
      <FileUpload label="Upload PSA Birth Certificate or Valid Government ID *" sub="Document must clearly show your date of birth" />
      <FileUpload label="Upload Another Valid ID (Optional)" sub="Additional proof of identity (Voter's ID, Postal ID, etc.)" />
    </FormSection>
  </div>
);

// --- REUSABLE UI ATOMS ---

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-8 py-2.5  text-sm font-bold transition-all ${active ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
    <FileText size={16} /> {label}
  </button>
);

const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-gray-900">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, placeholder, defaultValue }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[13px] font-bold text-gray-800">{label}</label>
    <input type="text" placeholder={placeholder} defaultValue={defaultValue} className="w-full p-2.5 bg-[#f3f4f6] border-none  text-sm text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none" />
  </div>
);

const Select = ({ label, options }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[13px] font-bold text-gray-800">{label}</label>
    <div className="relative">
      <select className="w-full p-2.5 bg-[#f3f4f6] border-none  text-sm text-gray-500 appearance-none outline-none">
        <option>Select {label.toLowerCase().replace('*', '').trim()}</option>
        {options.map((opt: string) => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3 text-gray-400" size={16} />
    </div>
  </div>
);

const TextArea = ({ label, placeholder }: any) => (
  <div className="space-y-1.5">
    <label className="text-[13px] font-bold text-gray-800">{label}</label>
    <textarea rows={3} placeholder={placeholder} className="w-full p-3 bg-[#f3f4f6] border-none  text-sm text-gray-600 outline-none" />
  </div>
);

const FileUpload = ({ label, sub }: any) => (
  <div className="space-y-1.5">
    <label className="text-[13px] font-bold text-gray-800">{label}</label>
    <div className="w-full p-2 bg-[#f3f4f6]  border-none flex items-center">
      <button className="bg-white px-3 py-1 text-xs font-bold border border-gray-200  shadow-sm mr-3">Choose File</button>
      <span className="text-xs text-gray-400">No file chosen</span>
    </div>
    <p className="text-[11px] text-gray-400 italic">{sub}</p>
  </div>
);

const Checkbox = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <input type="checkbox" className="w-4 h-4 border-gray-300 " />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </div>
);

export default UserApplyServices;