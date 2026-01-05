import { memo } from 'react';
import { Pencil, DollarSign, Clock, Package } from 'lucide-react';
import { RecommendationProfile, DeliveryWorkType, DeliveryDomain, DeliverableType } from '../../../types/analysis';
import { formatCurrency } from '../../../utils/formatters';

interface SOWLineItemCardProps {
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

const domainLabels: Record<DeliveryDomain, string> = {
  'role-responsibility': 'Role & Responsibility',
  'workflow-process': 'Workflow & Process',
  'technology-systems': 'Technology & Systems',
  'risk-bottlenecks': 'Risk & Bottlenecks',
  'training-adoption': 'Training & Adoption',
};

const deliverableLabels: Record<DeliverableType, string> = {
  'sop-document': 'SOP Doc',
  'checklist': 'Checklist',
  'template': 'Template',
  'process-map': 'Process Map',
  'training-micro': 'Micro Training',
  'training-session': 'Training Session',
  'dashboard-report': 'Dashboard/Report',
  'raci-matrix': 'RACI Matrix',
  'job-aid': 'Job Aid',
  'other': 'Other',
};

const domainColors: Record<DeliveryDomain, string> = {
  'role-responsibility': 'bg-blue-100 text-blue-700',
  'workflow-process': 'bg-purple-100 text-purple-700',
  'technology-systems': 'bg-orange-100 text-orange-700',
  'risk-bottlenecks': 'bg-red-100 text-red-700',
  'training-adoption': 'bg-green-100 text-green-700',
};

export const SOWLineItemCard = memo(function SOWLineItemCard({ profile, defaultHourlyRate, currency, onClick, onEdit }: SOWLineItemCardProps) {
  const delivery = profile.deliveryProfile;

  if (!delivery || delivery.excludeFromEstimate) {
    return null;
  }

  const effectiveRate = delivery.hourlyRateOverride ?? defaultHourlyRate;
  const totalCost = delivery.estimatedHours * effectiveRate;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-900 line-clamp-2">{profile.title}</h3>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Work Type & Domain */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
          {workTypeLabels[delivery.workType]}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${domainColors[delivery.primaryDomain]}`}>
          {domainLabels[delivery.primaryDomain]}
        </span>
      </div>

      {/* Deliverables */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {delivery.deliverables.map((d, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded"
          >
            <Package className="w-3 h-3" />
            {deliverableLabels[d]}
          </span>
        ))}
      </div>

      {/* Pricing Row */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-slate-400" />
            {delivery.estimatedHours} hrs
          </span>
          <span className="text-slate-400">×</span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-slate-400" />
            {formatCurrency(effectiveRate, currency)}/hr
          </span>
        </div>
        <span className="font-semibold text-indigo-600">
          = {formatCurrency(totalCost, currency)}
        </span>
      </div>
    </div>
  );
});
