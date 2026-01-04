import { Pencil, Package } from 'lucide-react';
import { RecommendationProfile, DeliveryWorkType, DeliverableType } from '../../../types/analysis';

interface SOWLineItemListRowProps {
  profile: RecommendationProfile;
  defaultHourlyRate: number;
  currency: string;
  onClick?: () => void;
  onEdit?: () => void;
}

const workTypeLabels: Record<DeliveryWorkType, string> = {
  'workflow-mapping': 'Workflow Mapping',
  'sop-creation': 'SOP Creation',
  'role-clarity-raci': 'Role Clarity / RACI',
  'system-configuration': 'System Configuration',
  'automation-build': 'Automation Build',
  'training-development': 'Training Development',
  'training-delivery': 'Training Delivery',
  'assessment-audit': 'Assessment / Audit',
  'change-management': 'Change Management',
  'other': 'Other',
};

const deliverableLabels: Record<DeliverableType, string> = {
  'sop-document': 'SOP',
  'checklist': 'Checklist',
  'template': 'Template',
  'process-map': 'Process Map',
  'training-micro': 'Micro Training',
  'training-session': 'Training',
  'dashboard-report': 'Dashboard',
  'raci-matrix': 'RACI',
  'job-aid': 'Job Aid',
  'other': 'Other',
};

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
  };
  return `${symbols[currency] || '$'}${amount.toLocaleString()}`;
}

export function SOWLineItemListRow({ profile, defaultHourlyRate, currency, onClick, onEdit }: SOWLineItemListRowProps) {
  const delivery = profile.deliveryProfile;

  if (!delivery || delivery.excludeFromEstimate) {
    return null;
  }

  const effectiveRate = delivery.hourlyRateOverride ?? defaultHourlyRate;
  const totalCost = delivery.estimatedHours * effectiveRate;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg px-4 py-3 hover:shadow-sm transition-shadow cursor-pointer group flex items-center gap-4"
    >
      {/* Title & Work Type */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-900 truncate">{profile.title}</h3>
        <span className="text-xs text-slate-500">{workTypeLabels[delivery.workType]}</span>
      </div>

      {/* Deliverables */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {delivery.deliverables.slice(0, 3).map((d, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded"
          >
            <Package className="w-3 h-3" />
            {deliverableLabels[d]}
          </span>
        ))}
        {delivery.deliverables.length > 3 && (
          <span className="text-xs text-slate-400">+{delivery.deliverables.length - 3}</span>
        )}
      </div>

      {/* Hours */}
      <div className="text-right text-sm text-slate-600 w-16 flex-shrink-0">
        {delivery.estimatedHours} hrs
      </div>

      {/* Rate */}
      <div className="text-right text-sm text-slate-500 w-20 flex-shrink-0 hidden sm:block">
        {formatCurrency(effectiveRate, currency)}/hr
      </div>

      {/* Total */}
      <div className="text-right font-semibold text-indigo-600 w-24 flex-shrink-0">
        {formatCurrency(totalCost, currency)}
      </div>

      {/* Edit button */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
