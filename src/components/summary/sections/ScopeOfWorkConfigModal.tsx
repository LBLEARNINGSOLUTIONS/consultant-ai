import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText } from 'lucide-react';
import { SummarySOWConfig } from '../../../types/analysis';

interface ScopeOfWorkConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SummarySOWConfig | null;
  onSave: (config: SummarySOWConfig) => Promise<void>;
}

const defaultConfig: SummarySOWConfig = {
  defaultHourlyRate: 150,
  currency: 'USD',
  clientName: '',
  projectName: '',
  validUntil: '',
  termsAndConditions: '',
  disclaimerText: '',
};

const currencySymbols: Record<SummarySOWConfig['currency'], string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

export function ScopeOfWorkConfigModal({
  isOpen,
  onClose,
  config,
  onSave,
}: ScopeOfWorkConfigModalProps) {
  const [formData, setFormData] = useState<SummarySOWConfig>(config || defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData(config);
    } else {
      setFormData(defaultConfig);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (formData.defaultHourlyRate <= 0) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save SOW config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Scope of Work Settings</h2>
              <p className="text-sm text-slate-500">Configure pricing and document details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Pricing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Default Hourly Rate *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {currencySymbols[formData.currency]}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.defaultHourlyRate}
                    onChange={(e) => setFormData({ ...formData, defaultHourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as SummarySOWConfig['currency'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Client Information</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={formData.clientName || ''}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={formData.projectName || ''}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Process Optimization Initiative"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Valid Until
              </label>
              <input
                type="date"
                value={formData.validUntil || ''}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Document Text Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              <FileText className="w-4 h-4 inline mr-1" />
              Document Text
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={formData.termsAndConditions || ''}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Payment terms, delivery expectations, change request policies..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Disclaimer
              </label>
              <textarea
                value={formData.disclaimerText || ''}
                onChange={(e) => setFormData({ ...formData, disclaimerText: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="This estimate is based on information provided during discovery..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || formData.defaultHourlyRate <= 0}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
