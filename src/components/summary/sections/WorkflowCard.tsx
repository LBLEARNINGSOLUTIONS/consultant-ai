import { TrendingUp, AlertTriangle, Users, Wrench, Edit2, Trash2, Merge } from 'lucide-react';
import { WorkflowProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface WorkflowCardProps {
  profile: WorkflowProfile;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMerge?: () => void;
  canEdit?: boolean;
}

export function WorkflowCard({ profile, onClick, onEdit, onDelete, onMerge, canEdit }: WorkflowCardProps) {
  const hasFailurePoints = profile.failurePoints.length > 0;
  const hasUnclearSteps = profile.unclearSteps.length > 0;

  // Count critical/high severity failure points
  const criticalFailures = profile.failurePoints.filter(
    fp => fp.severity === 'critical' || fp.severity === 'high'
  ).length;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleMergeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMerge?.();
  };

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
      className={`bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">
              {profile.name}
            </h3>
            <p className="text-xs text-slate-500">
              {profile.count} interview{profile.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {/* Edit/Merge/Delete buttons */}
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit workflow"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleMergeClick}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Merge with another workflow"
            >
              <Merge className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete workflow"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        <Badge variant="blue" className="text-[10px]">
          {getFrequencyLabel(profile.frequency)}
        </Badge>
        <span>•</span>
        <span>{profile.steps.length} step{profile.steps.length !== 1 ? 's' : ''}</span>
        {profile.participants.length > 0 && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{profile.participants.length}</span>
            </div>
          </>
        )}
      </div>

      {/* Systems used */}
      {profile.systems.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Wrench className="w-3 h-3" />
            <span>Systems</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.systems.slice(0, 3).map((system, idx) => (
              <Badge key={idx} variant="gray" className="text-[10px]">
                {system}
              </Badge>
            ))}
            {profile.systems.length > 3 && (
              <Badge variant="gray" className="text-[10px]">
                +{profile.systems.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Participants preview */}
      {profile.participants.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {profile.participants.slice(0, 3).map((participant, idx) => (
              <Badge key={idx} variant="indigo" className="text-[10px]">
                {participant}
              </Badge>
            ))}
            {profile.participants.length > 3 && (
              <Badge variant="gray" className="text-[10px]">
                +{profile.participants.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Issues footer */}
      {(hasFailurePoints || hasUnclearSteps) && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          {hasFailurePoints && (
            <div className="flex items-center gap-1">
              <AlertTriangle className={`w-3.5 h-3.5 ${criticalFailures > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
              <span className={`text-xs font-medium ${criticalFailures > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                {profile.failurePoints.length} failure point{profile.failurePoints.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {hasUnclearSteps && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-amber-600">
                {profile.unclearSteps.length} unclear step{profile.unclearSteps.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Click hint */}
      {onClick && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-xs text-center text-blue-500 font-medium">
            Click for process map
          </p>
        </div>
      )}
    </div>
  );
}
