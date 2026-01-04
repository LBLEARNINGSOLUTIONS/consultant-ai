import { useState, useEffect } from 'react';
import { X, Package, Clock, DollarSign, Target, Check } from 'lucide-react';
import {
  DeliveryProfile,
  DeliveryWorkType,
  DeliveryDomain,
  DeliverableType,
  DeliveryWorkMode,
} from '../../../types/analysis';

interface DeliveryProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DeliveryProfile | undefined;
  recommendationTitle: string;
  defaultHourlyRate: number;
  onSave: (profile: DeliveryProfile) => Promise<void>;
}

// Labels for work types
const workTypeLabels: Record<DeliveryWorkType, string> = {
  'workflow-mapping': 'Workflow Mapping',
  'sop-creation': 'SOP / Standard Creation',
  'role-clarity-raci': 'Role Clarity / RACI',
  'system-configuration': 'System Configuration',
  'automation-build': 'Automation Build',
  'training-development': 'Training Development',
  'training-delivery': 'Training Delivery',
  'assessment-audit': 'Assessment / Audit',
  'change-management': 'Change Management',
  'other': 'Other',
};

// Labels for domains
const domainLabels: Record<DeliveryDomain, string> = {
  'role-responsibility': 'Role & Responsibility',
  'workflow-process': 'Workflow & Process',
  'technology-systems': 'Technology & Systems',
  'risk-bottlenecks': 'Risk & Bottlenecks',
  'training-adoption': 'Training & Adoption',
};

// Labels for deliverable types
const deliverableLabels: Record<DeliverableType, string> = {
  'sop-document': 'SOP Document',
  'checklist': 'Checklist',
  'template': 'Template',
  'process-map': 'Process Map',
  'training-micro': 'Training (Micro: 5-10 min)',
  'training-session': 'Training (Session: 30-60 min)',
  'dashboard-report': 'Dashboard / Report',
  'raci-matrix': 'RACI Matrix',
  'job-aid': 'Job Aid (1-pager)',
  'other': 'Other',
};

// Labels for work modes
const workModeLabels: Record<DeliveryWorkMode, string> = {
  'document-only': 'Document Only',
  'configure-existing': 'Configure Existing',
  'build-new': 'Build New',
  'hybrid': 'Hybrid',
};

const defaultProfile: DeliveryProfile = {
  workType: 'sop-creation',
  primaryDomain: 'workflow-process',
  deliverables: [],
  estimatedHours: 0,
  workMode: 'document-only',
  excludeFromEstimate: false,
};

export function DeliveryProfileEditModal({
  isOpen,
  onClose,
  profile,
  recommendationTitle,
  defaultHourlyRate,
  onSave,
}: DeliveryProfileEditModalProps) {
  const [formData, setFormData] = useState<DeliveryProfile>(profile || defaultProfile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else {
      setFormData(defaultProfile);
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (formData.deliverables.length === 0 || formData.estimatedHours <= 0) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save delivery profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDeliverable = (type: DeliverableType) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.includes(type)
        ? prev.deliverables.filter(d => d !== type)
        : [...prev.deliverables, type],
    }));
  };

  const effectiveRate = formData.hourlyRateOverride || defaultHourlyRate;
  const estimatedCost = formData.estimatedHours * effectiveRate;

  const isValid = formData.deliverables.length > 0 && formData.estimatedHours > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Delivery Profile</h2>
              <p className="text-sm text-slate-600 truncate max-w-md">{recommendationTitle}</p>
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
          {/* Classification Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Target className="w-4 h-4" />
              Classification
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Work Type *
                </label>
                <select
                  value={formData.workType}
                  onChange={(e) => setFormData({ ...formData, workType: e.target.value as DeliveryWorkType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {Object.entries(workTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Primary Domain *
                </label>
                <select
                  value={formData.primaryDomain}
                  onChange={(e) => setFormData({ ...formData, primaryDomain: e.target.value as DeliveryDomain })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {Object.entries(domainLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Deliverables Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Package className="w-4 h-4" />
              Deliverables *
            </h3>

            <div className="flex flex-wrap gap-2">
              {Object.entries(deliverableLabels).map(([value, label]) => {
                const isSelected = formData.deliverables.includes(value as DeliverableType);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDeliverable(value as DeliverableType)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {label}
                  </button>
                );
              })}
            </div>
            {formData.deliverables.length === 0 && (
              <p className="text-sm text-amber-600">Select at least one deliverable</p>
            )}
          </div>

          {/* Effort & Estimation Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Effort & Estimation
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estimated Hours *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hourly Rate Override
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.hourlyRateOverride || ''}
                    onChange={(e) => setFormData({ ...formData, hourlyRateOverride: parseFloat(e.target.value) || undefined })}
                    className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={`${defaultHourlyRate} (default)`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Work Mode
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value as DeliveryWorkMode })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {Object.entries(workModeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cost Preview */}
            {formData.estimatedHours > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Estimated Cost</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-700">
                      ${estimatedCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-emerald-600">
                      {formData.estimatedHours} hrs × ${effectiveRate}/hr
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Exclude from Estimate */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.excludeFromEstimate}
                onChange={(e) => setFormData({ ...formData, excludeFromEstimate: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">Exclude from scope of work estimate</span>
            </label>
          </div>

          {/* Outcome Section (Optional) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Outcome (Optional)
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Outcome Statement
              </label>
              <textarea
                value={formData.outcomeStatement || ''}
                onChange={(e) => setFormData({ ...formData, outcomeStatement: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="e.g., Standardize install handoffs so the office receives complete, verified job packets."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Behavior Before
                </label>
                <input
                  type="text"
                  value={formData.behaviorChangeBefore || ''}
                  onChange={(e) => setFormData({ ...formData, behaviorChangeBefore: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Current observable behavior"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Behavior After
                </label>
                <input
                  type="text"
                  value={formData.behaviorChangeAfter || ''}
                  onChange={(e) => setFormData({ ...formData, behaviorChangeAfter: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Future observable behavior"
                />
              </div>
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
            disabled={isSaving || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Delivery Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
