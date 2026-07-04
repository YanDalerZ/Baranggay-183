import { useState, useEffect } from 'react';
import {
  Save, RefreshCw, AlertTriangle, Settings, CheckCircle2, Loader2, Eye, EyeOff
} from 'lucide-react';
import { API_BASE_URL } from '../interfaces';
import { useAuth } from '../context/AuthContext';

// Dynamic type definition accommodating arbitrary key-value pairs fetched from the DB
type DynamicConfigState = Record<string, string | number>;

const API_CONFIG_URL = `${API_BASE_URL}/api/config`;

// Utility helper to turn database camelCase keys into clean, readable labels
const formatLabel = (key: string): string => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const SuperAdminConfiguration = () => {
  const { token } = useAuth();
  const [config, setConfig] = useState<DynamicConfigState>({});
  const [initialConfig, setInitialConfig] = useState<DynamicConfigState>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 1. Fetch live dynamic configurations from backend table on mount
  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        setIsLoading(true);
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(API_CONFIG_URL, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch system configurations.');
        }
        const data = await response.json();
        setConfig(data);
        setInitialConfig(data);
      } catch (error) {
        console.error('Error fetching configuration:', error);
        setToast({ message: 'Error loading settings from server.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfiguration();
  }, [token]);

  // Auto-dismiss toast messages
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInputChange = (field: string, value: string | number) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      // Check if current modified configuration state mismatches the baseline server load
      const differences = Object.keys(updated).some(k => updated[k] !== initialConfig[k]);
      setHasUnsavedChanges(differences);
      return updated;
    });
  };

  // 2. Persist modified configurations back to database
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch(API_CONFIG_URL, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to update system configurations.');
      }

      setInitialConfig(config);
      setHasUnsavedChanges(false);
      setToast({ message: 'Changes saved successfully to database!', type: 'success' });
    } catch (error) {
      console.error('Error saving configuration:', error);
      setToast({ message: 'Failed to save updates to server.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(initialConfig);
    setHasUnsavedChanges(false);
    setToast({ message: 'Reset changes back to last fetched state.', type: 'success' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-slate-700" size={32} />
        <p className="text-sm font-medium text-slate-500">Retrieving runtime configurations...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 text-white px-6 py-4 rounded sm shadow-2xl z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 ${toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'}`}>
          <CheckCircle2 className={toast.type === 'error' ? 'text-rose-200' : 'text-emerald-400'} size={20} />
          <p className="font-medium">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase leading-[0.9] tracking-tighter -skew-x-12 inline-block bg-linear-to-r from-[#00308F] to-[#00308F] bg-clip-text text-transparent">
            System Environment
          </h1>
          <p className="text-xs md:text-base text-gray-500 font-medium mt-2">
            Runtime configurations loaded directly from the database schema
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded sm text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <RefreshCw size={16} /> Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded sm text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 flex items-center gap-3 rounded-r-lg shadow-sm">
          <AlertTriangle />
          <p className="text-sm font-medium">You have unsaved runtime shifts. Click "Save Changes" to overwrite settings.</p>
        </div>
      )}

      {/* Main Container - Dynamically looping over table key entries */}
      <div className="bg-white p-6 rounded sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="text-slate-600"><Settings size={20} /></div>
          <div>
            <h3 className="font-bold text-slate-900">Active Database Properties</h3>
            <p className="text-sm text-slate-500">Modifying fields executes dynamic database updates runtime mapping.</p>
          </div>
        </div>

        {Object.keys(config).length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 font-medium">
            No active properties detected inside global_configurations table.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {Object.entries(config).map(([key, value]) => {
              const isNumberType = typeof value === 'number';
              const isSensitive = key.toLowerCase().includes('password') || key.toLowerCase().includes('apikey');

              return (
                <div key={key} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {formatLabel(key)}
                  </label>

                  {isSensitive ? (
                    <PasswordField
                      value={value}
                      onChange={(nextVal) => handleInputChange(key, nextVal)}
                    />
                  ) : (
                    <input
                      type={isNumberType ? 'number' : 'text'}
                      value={value ?? ''}
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        const nextValue = isNumberType ? (rawVal === '' ? 0 : Number(rawVal)) : rawVal;
                        handleInputChange(key, nextValue);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded sm text-sm focus:ring-2 focus:ring-slate-400 outline-none transition"
                    />
                  )}

                  <span className="text-[10px] font-mono text-slate-400 block tracking-tight">
                    DB Key Reference: {key}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Per-Field Sensitive Input Box Sub-component ---
interface PasswordFieldProps {
  value: string | number;
  onChange: (value: string) => void;
}

const PasswordField = ({ value, onChange }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-center">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 pr-10 border border-slate-200 rounded sm text-sm focus:ring-2 focus:ring-slate-400 outline-none transition"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 text-slate-400 hover:text-slate-600 transition"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

export default SuperAdminConfiguration;