import { useState, useEffect } from 'react';
import { 
  Save, RefreshCw, AlertTriangle, Settings, Map, 
  MessageSquare, HeartHandshake, ShieldCheck, Siren, CheckCircle2 
} from 'lucide-react';

// --- Types & Constants ---
interface ConfigState {
  idExpiration: number;
  autoArchive: number;
  sessionTimeout: number;
  maintenanceMode: string;
  floodRiskRadius: number;
  mapZoom: number;
  gisApiKey: string;
  smsGatewayUrl: string;
  smsApiKey: string;
  messengerBridgeUrl: string;
  messengerApiKey: string;
  maxNotificationRetries: number;
  notificationBatchSize: number;
  defaultBenefitAmount: number;
  reliefDistributionCycle: string;
  vulnerabilityScoreWeight: number;
  dataRetentionPeriod: number;
  consentRenewalPeriod: number;
  auditLogRetention: number;
  emergencyContact: string;
  emergencyEmail: string;
  autoEscalationTime: number;
}

const DEFAULT_CONFIG: ConfigState = {
  idExpiration: 90,
  autoArchive: 365,
  sessionTimeout: 30,
  maintenanceMode: 'Disabled',
  floodRiskRadius: 500,
  mapZoom: 15,
  gisApiKey: '****************',
  smsGatewayUrl: 'https://api.sms-gateway.example.com',
  smsApiKey: '****************',
  messengerBridgeUrl: 'https://api.messenger.example.com',
  messengerApiKey: '****************',
  maxNotificationRetries: 3,
  notificationBatchSize: 50,
  defaultBenefitAmount: 1500,
  reliefDistributionCycle: 'Monthly',
  vulnerabilityScoreWeight: 0.7,
  dataRetentionPeriod: 5,
  consentRenewalPeriod: 12,
  auditLogRetention: 730,
  emergencyContact: '+63-917-123-4567',
  emergencyEmail: 'emergency@b183.gov.ph',
  autoEscalationTime: 30,
};

export const SuperAdminConfiguration = () => {
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInputChange = (field: keyof ConfigState, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log('Saving Configuration:', config);
    setHasUnsavedChanges(false);
    setToast({ message: 'Changes saved successfully!' });
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setHasUnsavedChanges(false);
    setToast({ message: 'Reset to default configuration' });
  };

  return (
    <div /*className="p-4 md:p-8 bg-slate-50 min-h-screen"*/>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded sm shadow-2xl z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <p className="font-medium">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-gradient-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            Global Configuration
          </h1>
          <p className="text-xs md:text-base text-gray-500 font-medium mt-2">
            Define system-wide rules and parameters that govern platform behavior
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded sm text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
            <RefreshCw size={16} /> Reset
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded sm text-sm font-semibold hover:bg-slate-800 transition">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 flex items-center gap-3 rounded-r-lg shadow-sm">
          <AlertTriangle />
          <p className="text-sm font-medium">You have unsaved changes. Click "Save Changes" to apply configuration.</p>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigSection title="System Settings" sub="Core system parameters and thresholds" icon={<Settings size={20}/>}>
          <Input label="ID Expiration Threshold (days)" type="number" value={config.idExpiration} onChange={(v: any) => handleInputChange('idExpiration', v)} hint="Number of days before PWD/SC IDs expire" />
          <Input label="Auto-Archive Period (days)" type="number" value={config.autoArchive} onChange={(v: any) => handleInputChange('autoArchive', v)} hint="Inactive records archive after this period" />
          <Input label="Session Timeout (minutes)" type="number" value={config.sessionTimeout} onChange={(v: any) => handleInputChange('sessionTimeout', v)} hint="Admin/staff sessions expire after inactivity" />
          <Select label="Maintenance Mode" value={config.maintenanceMode} onChange={(v: any) => handleInputChange('maintenanceMode', v)} options={['Disabled', 'Enabled']} />
        </ConfigSection>

        <ConfigSection title="GIS & Risk Mapping" sub="Geospatial settings and flood risk parameters" icon={<Map size={20}/>}>
          <Input label="Flood Risk Radius (meters)" type="number" value={config.floodRiskRadius} onChange={(v: any) => handleInputChange('floodRiskRadius', v)} />
          <Input label="Default Map Zoom Level" type="number" value={config.mapZoom} onChange={(v: any) => handleInputChange('mapZoom', v)} />
          <Input label="GIS Service API Key" type="password" value={config.gisApiKey} onChange={(v: any) => handleInputChange('gisApiKey', v)} />
        </ConfigSection>

        <ConfigSection title="Multi-Channel Notifications" sub="SMS and Messenger gateway configuration" icon={<MessageSquare size={20}/>}>
          <Input label="SMS Gateway URL" value={config.smsGatewayUrl} onChange={(v: any) => handleInputChange('smsGatewayUrl', v)} />
          <Input label="SMS API Key" type="password" value={config.smsApiKey} onChange={(v: any) => handleInputChange('smsApiKey', v)} />
          <Input label="Messenger Bridge URL" value={config.messengerBridgeUrl} onChange={(v: any) => handleInputChange('messengerBridgeUrl', v)} />
          <Input label="Messenger API Key" type="password" value={config.messengerApiKey} onChange={(v: any) => handleInputChange('messengerApiKey', v)} />
          <Input label="Max Notification Retries" type="number" value={config.maxNotificationRetries} onChange={(v: any) => handleInputChange('maxNotificationRetries', v)} />
        </ConfigSection>

        <ConfigSection title="Benefits & Relief Settings" sub="Default values and distribution rules" icon={<HeartHandshake size={20}/>}>
          <Input label="Default Benefit Amount (PHP)" type="number" value={config.defaultBenefitAmount} onChange={(v: any) => handleInputChange('defaultBenefitAmount', v)} />
          <Select label="Relief Distribution Cycle" value={config.reliefDistributionCycle} onChange={(v: any) => handleInputChange('reliefDistributionCycle', v)} options={['Weekly', 'Monthly', 'Quarterly']} />
          <Input label="Vulnerability Score Weight (0-1)" type="number" value={config.vulnerabilityScoreWeight} onChange={(v: any) => handleInputChange('vulnerabilityScoreWeight', v)} />
        </ConfigSection>

        <ConfigSection title="Compliance & Data Governance" sub="RA 10173 (Data Privacy Act) compliance" icon={<ShieldCheck size={20}/>}>
          <Input label="Data Retention Period (years)" type="number" value={config.dataRetentionPeriod} onChange={(v: any) => handleInputChange('dataRetentionPeriod', v)} />
          <Input label="Consent Renewal Period (months)" type="number" value={config.consentRenewalPeriod} onChange={(v: any) => handleInputChange('consentRenewalPeriod', v)} />
          <Input label="Audit Log Retention (days)" type="number" value={config.auditLogRetention} onChange={(v: any) => handleInputChange('auditLogRetention', v)} />
        </ConfigSection>

        <ConfigSection title="Emergency Alert System" sub="Emergency contact and escalation settings" icon={<Siren size={20}/>}>
          <Input label="Emergency Contact Number" value={config.emergencyContact} onChange={(v: any) => handleInputChange('emergencyContact', v)} />
          <Input label="Emergency Email Recipient" value={config.emergencyEmail} onChange={(v: any) => handleInputChange('emergencyEmail', v)} />
          <Input label="Auto-Escalation Time (minutes)" type="number" value={config.autoEscalationTime} onChange={(v: any) => handleInputChange('autoEscalationTime', v)} />
        </ConfigSection>
      </div>
    </div>
  );
};

// --- Sub-components ---

const ConfigSection = ({ title, sub, icon, children }: any) => (
  <div className="bg-white p-6 rounded sm border border-slate-200 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="text-slate-600">{icon}</div>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{sub}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, type = "text", value, onChange, hint }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      className="w-full px-3 py-2 border border-slate-200 rounded sm text-sm focus:ring-2 focus:ring-slate-400 outline-none transition"
    />
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Select = ({ label, value, onChange, options }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-slate-200 bg-white rounded sm text-sm focus:ring-2 focus:ring-slate-400 outline-none transition cursor-pointer"
    >
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default SuperAdminConfiguration;