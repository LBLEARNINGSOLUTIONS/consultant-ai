import { TrendingUp, AlertTriangle, Users, Edit2, Trash2, Merge } from 'lucide-react';
import { WorkflowProfile } from '../../../types/analysis';

interface WorkflowListRowProps {
  profile: WorkflowProfile;
  onClick: () => void;
  onEdit?: () => void;
  onMerge?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function WorkflowListRow({
  profile,
  onClick,
  onEdit,
  onMerge,
  onDelete,
  canEdit = false,
}: WorkflowListRowProps) {
  const hasFailurePoints = profile.failurePoints.length > 0;
  const hasUnclearSteps = profile.unclearSteps.length > 0;
  const criticalFailures = profile.failurePoints.filter(
    fp => fp.severity === 'critical' || fp.severity === 'high'
  ).length;

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'ad-hoc': return 'Ad-hoc';
      default: return freq;
    }
  };

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-colors"
    >
      {/* Icon */}
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <TrendingUp className="w-5 h-5 text-blue-600" />
      </div>

      {/* Title and meta */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 truncate">{profile.name}</div>
        <div className="text-xs text-slate-500">
          {profile.steps.length} step{profile.steps.length !== 1 ? 's' : ''}
          {' • '}
          {getFrequencyLabel(profile.frequency)}
          {profile.participants.length > 0 && (
            <span className="hidden sm:inline">
              {' • '}
              <Users className="w-3 h-3 inline mr-0.5" />
              {profile.participants.length}
            </span>
          )}
        </div>
      </div>

      {/* Tags - systems */}
      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        {profile.systems.slice(0, 2).map((system, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded"
          >
            {system.length > 12 ? system.slice(0, 12) + '...' : system}
          </span>
        ))}
        {profile.systems.length > 2 && (
          <span className="text-xs text-slate-400">
            +{profile.systems.length - 2}
          </span>
        )}
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasFailurePoints && (
          <span className={`flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded ${
            criticalFailures > 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            {profile.failurePoints.length}
          </span>
        )}
        {hasUnclearSteps && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
            {profile.unclearSteps.length} unclear
          </span>
        )}
      </div>

      {/* Count badge */}
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-blue-700">{profile.count}</span>
      </div>

      {/* Actions */}
      {canEdit && (
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit workflow"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMerge}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Merge with another workflow"
          >
            <Merge className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete workflow"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
