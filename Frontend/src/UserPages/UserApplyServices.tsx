import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileText, Send, ChevronDown, Clock, Loader2, CheckCircle, Paperclip, List, Eye, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, User } from '../interfaces';
import ApplicationDetails from './UserComponents/ApplicationDetails';

type ApplicationType = 'PWD' | 'SC';
type ViewMode = 'form' | 'history';

const UserApplyServices: React.FC = () => {
  const { token, user: authUser } = useAuth();
  const [fullProfile, setFullProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ApplicationType>('PWD');
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Application History State
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Field States
  const [formData, setFormData] = useState<any>({
    disability_type: '',
    medical_condition: '',
    gsis_sss_number: '',
    maintenance_meds: '',
    healthcare_provider: '',
    employment_status: '',
    blood_type: '',
    expiry_date: '', // Added Expiry Date field
    is_living_alone: false,
    is_bedridden: false,
  });

  // Binary File States
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    medical_cert: null,
    id_proof: null,
    psa_birth: null
  });

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const fetchFullProfile = useCallback(async () => {
    if (!token || !authUser?.system_id) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/user/${authUser.system_id}`, config);
      if (response.data) {
        const u = response.data;
        setFullProfile(u);
        setFormData((prev: any) => ({
          ...prev,
          disability_type: u.disability || '',
          medical_condition: u.disability || '',
          gsis_sss_number: u.tcic_id || '',
          maintenance_meds: u.medical_history || '',
          employment_status: u.occupation ? 'Employed' : 'Unemployed',
          blood_type: u.blood_type || '',
        }));
      }
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [token, authUser?.system_id]);

  const fetchApplications = useCallback(async () => {
    if (!token || !authUser?.system_id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications/user/${authUser.system_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (err) {
      console.error("Failed to fetch applications");
    }
  }, [token, authUser?.system_id]);

  useEffect(() => {
    fetchFullProfile();
    fetchApplications();
  }, [fetchFullProfile, fetchApplications]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  // Inside UserApplyServices component
  const openDetails = async (appId: number) => {
    setIsModalOpen(true); // 1. Immediately show the modal (it will show the loader)
    setDetailsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications/${appId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedApp(response.data); // 2. Set the fetched data
    } catch (err) {
      alert("Error loading application details.");
      setIsModalOpen(false); // 3. Close on error
    } finally {
      setDetailsLoading(false); // 4. Stop loader
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !fullProfile) return;
    setError(null);

    if (activeTab === 'PWD') {
      if (!formData.disability_type || !formData.medical_condition || !formData.employment_status) {
        setError("Please fill in all required PWD information fields.");
        return;
      }
      if (!files.medical_cert || !files.id_proof) {
        setError("Please upload the required Medical Certificate and ID Proof.");
        return;
      }
    }

    if (activeTab === 'SC') {
      if (!formData.healthcare_provider) {
        setError("Please specify your Primary Healthcare Provider.");
        return;
      }
      if (!files.psa_birth) {
        setError("Please upload your PSA Birth Certificate.");
        return;
      }
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('user_system_id', fullProfile.system_id || '');
      data.append('application_type', activeTab);
      data.append('emergency_contact_id', fullProfile.emergencyContact?.id?.toString() || '');

      Object.keys(formData).forEach(key => {
        const val = formData[key];
        data.append(key, val !== undefined && val !== null ? val.toString() : '');
      });

      if (files.medical_cert) data.append('medical_cert', files.medical_cert);
      if (files.id_proof) data.append('id_proof', files.id_proof);
      if (files.psa_birth) data.append('psa_birth', files.psa_birth);

      await axios.post(`${API_BASE_URL}/api/applications/apply`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      fetchApplications();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const isPWD = fullProfile?.type === 'PWD' || fullProfile?.type === 'Both' || !!fullProfile?.disability;
  const isSenior = fullProfile?.type === 'Senior Citizen' || fullProfile?.type === 'Both' || (fullProfile?.birthday ? calculateAge(fullProfile.birthday) >= 60 : false);

  if (loading && !isModalOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-black">
        <Loader2 className="animate-spin mb-4 text-[#00308F]" size={40} />
        <p className="font-bold uppercase tracking-widest text-xs">Processing Request...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white border-4 border-black text-center mt-20">
        <CheckCircle className="mx-auto mb-6 text-green-600" size={64} />
        <h2 className="text-3xl font-black uppercase mb-2">Application Received</h2>
        <p className="font-bold text-gray-600 mb-8">Your request is now pending review by the barangay office.</p>
        <button onClick={() => { setSuccess(false); setViewMode('history'); }} className="px-8 py-3 bg-black text-white font-black uppercase hover:opacity-80 transition-all">
          View My Applications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 text-black">
      {error && (
        <div className="bg-red-50 border-2 border-red-600 text-red-900 p-4 font-black uppercase text-xs">
          {error}
        </div>
      )}

      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Services Portal
          </h2>
          <p className="text-sm text-black mt-1 font-bold">Manage your barangay service requests and ID applications.</p>
        </div>

        <div className="flex bg-gray-200 p-1 rounded-sm">
          <button
            onClick={() => setViewMode('form')}
            className={`px-4 py-2 text-xs font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'form' ? 'bg-black text-white' : 'text-black hover:bg-gray-300'}`}
          >
            <FileText size={14} /> New Application
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-2 text-xs font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'history' ? 'bg-black text-white' : 'text-black hover:bg-gray-300'}`}
          >
            <List size={14} /> Application History
          </button>
        </div>
      </section>

      {viewMode === 'form' ? (
        <>
          {/* Form Selection Tabs */}
          <div className="flex flex-wrap bg-gray-300 p-1 w-fit gap-1">
            <TabButton active={activeTab === 'PWD'} onClick={() => setActiveTab('PWD')} label={isPWD ? "PWD ID Renewal" : "PWD ID Application"} />
            <TabButton active={activeTab === 'SC'} onClick={() => setActiveTab('SC')} label={isSenior ? "Senior Citizen Renewal" : "Senior Citizen ID"} />
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 shadow-md overflow-hidden">
            <div className="p-8 md:p-12">
              {activeTab === 'PWD' && (
                <PWDApplicationForm
                  user={fullProfile || undefined}
                  isRenewal={isPWD}
                  formData={formData}
                  onChange={handleInputChange}
                  onFileChange={handleFileChange}
                />
              )}

              {activeTab === 'SC' && (
                <SeniorCitizenForm
                  user={fullProfile || undefined}
                  isRenewal={isSenior}
                  formatDate={formatDateForInput}
                  formData={formData}
                  onChange={handleInputChange}
                  onFileChange={handleFileChange}
                />
              )}

              <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-12 mt-12 border-t border-gray-300">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-black text-white bg-[#05051e] hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  {submitting ? "Processing..." : "Submit Application"}
                </button>
              </div>
            </div>
          </form>
        </>
      ) : (
        <div className="bg-white border border-gray-300 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-[10px] uppercase tracking-widest">
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Date Filed</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.length > 0 ? applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-black text-xs">#{app.id}</td>
                    <td className="p-4 text-sm font-bold uppercase">{app.application_type}</td>
                    <td className="p-4 text-sm font-medium">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetails(app.id)}
                        className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all"
                      >
                        <Eye size={12} /> View Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 font-bold uppercase text-xs tracking-widest">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HELP SECTION FOOTER */}
      <section className="bg-white border border-gray-300 shadow-md p-8">
        <h4 className="font-black text-black uppercase text-sm tracking-widest mb-6">Need Help?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-xs font-black text-black uppercase mb-1">Office Hours</p>
            <p className="text-sm text-gray-600 font-bold">Monday to Friday<br />8:00 AM - 5:00 PM</p>
          </div>
          <div>
            <p className="text-xs font-black text-black uppercase mb-1">Contact Number</p>
            <p className="text-sm text-[#00308F] font-black underline">(02) 8123-4567</p>
          </div>
          <div>
            <p className="text-xs font-black text-black uppercase mb-1">Email</p>
            <p className="text-sm text-[#00308F] font-black underline">info@barangay183.gov.ph</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-[11px] text-gray-500 leading-relaxed font-bold">
            <span className="font-black text-black uppercase">Accessibility Note:</span> This portal is optimized for screen readers and keyboard navigation. All forms are WCAG 2.1 compliant. Use Tab to navigate between fields.
          </p>
        </div>
      </section>

      <ApplicationDetails
        isOpen={isModalOpen}
        loading={detailsLoading}
        data={selectedApp}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApp(null);
        }}
      />
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    Pending: "bg-amber-100 text-amber-700 border-amber-300",
    Approved: "bg-green-100 text-green-700 border-green-300",
    Denied: "bg-red-100 text-red-700 border-red-300",
  };
  const icons: any = {
    Pending: <Clock size={12} />,
    Approved: <CheckCircle size={12} />,
    Denied: <XCircle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-black uppercase rounded-full ${styles[status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
      {icons[status]} {status}
    </span>
  );
};

const PWDApplicationForm = ({ user, isRenewal, formData, onChange, onFileChange }: any) => (
  <div className="space-y-12">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-black text-black uppercase tracking-tight">
          {isRenewal ? "PWD ID Renewal" : "PWD ID Application"}
        </h3>
        <p className="text-sm text-black mt-1 font-bold">Official registration for disability benefits.</p>
      </div>
      {isRenewal && <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-wider">Renewal Mode</span>}
    </div>

    <FormSection title="Disability Information">
      <Select
        label="Type of Disability *"
        options={['Visual Impairment', 'Hearing Impairment', 'Mobility Impairment', 'Psychosocial']}
        value={formData.disability_type}
        onChange={(e: any) => onChange('disability_type', e.target.value)}
        required
      />
      <div className="mt-4">
        <TextArea
          label="Medical Condition/Diagnosis *"
          value={formData.medical_condition}
          onChange={(e: any) => onChange('medical_condition', e.target.value)}
          required
        />
      </div>
    </FormSection>

    <FormSection title="Caregiver/Guardian Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
        <Input label="Guardian Name" value={user?.emergencyContact?.name} disabled />
        <Input label="Relationship to Resident" value={user?.emergencyContact?.relationship} disabled />
      </div>
    </FormSection>

    <FormSection title="Employment & Health Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Employment Status *"
          options={['Employed', 'Unemployed', 'Student', 'Self-employed']}
          value={formData.employment_status}
          onChange={(e: any) => onChange('employment_status', e.target.value)}
          required
        />
        <Select
          label="Blood Type *"
          options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
          value={formData.blood_type}
          onChange={(e: any) => onChange('blood_type', e.target.value)}
          required
        />
      </div>
    </FormSection>

    <FormSection title="Renewal Details">
      <div className="max-w-md">
        <Input
          label="Current ID Expiry Date (If Renewal)"
          type="date"
          value={formData.expiry_date}
          onChange={(e: any) => onChange('expiry_date', e.target.value)}
        />
      </div>
    </FormSection>

    <FormSection title="Required Documents">
      <FileUpload label="Upload Medical Certificate *" sub="Medical certificate from a licensed physician" onChange={(file: File) => onFileChange('medical_cert', file)} required />
      <FileUpload label="Upload Valid Government ID *" sub="Birth certificate or voter's ID" onChange={(file: File) => onFileChange('id_proof', file)} required />
    </FormSection>

    <FormSection title="Consent">
      <div className="flex gap-3">
        <input type="checkbox" className="mt-1 w-4 h-4 border-black cursor-pointer" defaultChecked required />
        <p className="text-sm text-black font-black leading-tight">
          I consent to the collection and processing of my personal data *
        </p>
      </div>
    </FormSection>
  </div>
);

const SeniorCitizenForm = ({ user, isRenewal, formatDate, formData, onChange, onFileChange }: any) => (
  <div className="space-y-12">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-black text-black uppercase tracking-tight">
          {isRenewal ? "Senior Citizen ID Renewal" : "Senior Citizen ID Application"}
        </h3>
        <p className="text-sm text-black mt-1 font-bold">Automated age-verification for citizens 60+.</p>
      </div>
      {isRenewal && <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-wider">Renewal Mode</span>}
    </div>

    <FormSection title="Personal Information">
      <div className="max-w-md space-y-4">
        <Input
          label="Date of Birth *"
          type="date"
          value={formatDate(user?.birthday)}
          disabled
        />
        <p className="text-[11px] text-black font-black italic">Pre-filled from official records</p>
        <Input label="GSIS/SSS Number (Optional)" value={formData.gsis_sss_number} onChange={(e: any) => onChange('gsis_sss_number', e.target.value)} />
      </div>
    </FormSection>

    <FormSection title="Health Profile">
      <TextArea
        label="Maintenance Medications *"
        placeholder="e.g., Amlodipine for hypertension"
        value={formData.maintenance_meds}
        onChange={(e: any) => onChange('maintenance_meds', e.target.value)}
        required
      />
      <Input label="Primary Healthcare Provider *" placeholder="e.g., Bagong Silang Health Center" value={formData.healthcare_provider} onChange={(e: any) => onChange('healthcare_provider', e.target.value)} required />
    </FormSection>

    <FormSection title="Vulnerability Assessment">
      <div className="space-y-3">
        <Checkbox label="I am living alone" checked={formData.is_living_alone} onChange={(e: any) => onChange('is_living_alone', e.target.checked)} />
        <Checkbox label="I am bedridden or have limited mobility" checked={formData.is_bedridden} onChange={(e: any) => onChange('is_bedridden', e.target.checked)} />
      </div>
    </FormSection>

    <FormSection title="Required Documents">
      <FileUpload label="Upload PSA Birth Certificate *" sub="Must show date of birth clearly" onChange={(file: File) => onFileChange('psa_birth', file)} required />
      <FileUpload label="Upload Another Valid ID (Optional)" sub="Voter's ID, Postal ID, etc." onChange={(file: File) => onFileChange('id_proof', file)} />
    </FormSection>
  </div>
);

const TabButton = ({ active, onClick, label }: any) => (
  <button type="button" onClick={onClick} className={`flex items-center gap-2 px-8 py-2.5 text-sm font-black transition-all ${active ? 'bg-white shadow-sm text-black border-b-4 border-blue-600' : 'text-black opacity-60 hover:opacity-100'}`}>
    <FileText size={16} /> {label}
  </button>
);

const FormSection = ({ title, children }: any) => (
  <div className="space-y-4">
    <h4 className="text-sm font-black text-black uppercase tracking-widest border-l-4 border-blue-600 pl-3">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, placeholder, value, type = "text", disabled = false, onChange, required = false }: any) => (
  <div className="space-y-1.5 flex-1 w-full">
    <label className="text-[13px] font-black text-black uppercase tracking-tight">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value || ''}
      disabled={disabled}
      onChange={onChange}
      required={required}
      className={`w-full p-2.5 border-2 border-transparent text-sm text-black font-bold outline-none focus:border-black ${disabled ? 'bg-gray-200' : 'bg-gray-100'}`}
    />
  </div>
);

const Select = ({ label, options, value, onChange, required = false }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[13px] font-black text-black uppercase tracking-tight">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-2.5 bg-gray-100 border-2 border-transparent text-sm text-black font-bold appearance-none outline-none focus:border-black"
      >
        <option value="" className="text-black font-bold">Select Option</option>
        {options.map((o: string) => <option key={o} value={o} className="text-black font-bold">{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3 text-black" size={16} />
    </div>
  </div>
);

const TextArea = ({ label, value, placeholder, onChange, required = false }: any) => (
  <div className="space-y-1.5">
    <label className="text-[13px] font-black text-black uppercase tracking-tight">{label}</label>
    <textarea
      rows={3}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      required={required}
      className="w-full p-3 bg-gray-100 border-2 border-transparent text-sm text-black font-bold outline-none focus:border-black"
    />
  </div>
);

const FileUpload = ({ label, sub, onChange, required = false }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("No file chosen");

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-black text-black uppercase tracking-tight">{label}</label>
      <div className={`w-full p-2 bg-gray-100 border-2 border-black flex items-center ${required && fileName === "No file chosen" ? "border-dashed" : "border-solid"}`}>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleInternalChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <button
          type="button"
          onClick={handleFileClick}
          className="bg-black text-white px-3 py-1 text-xs font-black shadow-sm mr-3 flex items-center gap-1"
        >
          <Paperclip size={12} /> Choose File
        </button>
        <span className="text-xs text-black font-bold uppercase truncate">{fileName}</span>
      </div>
      <p className="text-[11px] text-black font-black italic">{sub}</p>
    </div>
  );
};

const Checkbox = ({ label, checked, onChange, required = false }: any) => (
  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      required={required}
      className="w-4 h-4 border-2 border-black cursor-pointer"
    />
    <span className="text-sm font-bold text-black">{label}</span>
  </div>
);

export default UserApplyServices;