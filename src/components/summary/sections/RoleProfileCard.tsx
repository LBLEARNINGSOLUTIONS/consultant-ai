import { Users, AlertTriangle, GraduationCap, ArrowRight, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { RoleProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface RoleProfileCardProps {
  profile: RoleProfile;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function RoleProfileCard({ profile, onClick, onEdit, onDelete, canEdit }: RoleProfileCardProps) {
  const hasIssues = profile.issuesDetected.length > 0;
  const hasTrainingNeeds = profile.trainingNeeds.length > 0;
  const hasDependencies = profile.inputsFrom.length > 0 || profile.outputsTo.length > 0;

  // Count high severity issues
  const criticalIssues = profile.issuesDetected.filter(
    issue => issue.severity === 'critical' || issue.severity === 'high'
  ).length;

  // Count high priority training needs
  const highPriorityTraining = profile.trainingNeeds.filter(
    need => need.priority === 'high'
  ).length;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">
              {profile.title}
            </h3>
            <p className="text-xs text-slate-500">
              {profile.count} interview{profile.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {/* Edit/Delete buttons */}
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick}
              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Edit role"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Responsibilities preview */}
      {profile.responsibilities.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Responsibilities
          </p>
          <ul className="text-xs text-slate-600 space-y-0.5">
            {profile.responsibilities.slice(0, 2).map((resp, idx) => (
              <li key={idx} className="truncate">• {resp}</li>
            ))}
            {profile.responsibilities.length > 2 && (
              <li className="text-slate-400">
                +{profile.responsibilities.length - 2} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Workflows & Tools */}
      {(profile.workflows.length > 0 || profile.tools.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {profile.workflows.slice(0, 2).map((workflow, idx) => (
            <Badge key={`w-${idx}`} variant="indigo" className="text-[10px]">
              {workflow}
            </Badge>
          ))}
          {profile.tools.slice(0, 2).map((tool, idx) => (
            <Badge key={`t-${idx}`} variant="blue" className="text-[10px]">
              {tool}
            </Badge>
          ))}
          {(profile.workflows.length + profile.tools.length) > 4 && (
            <Badge variant="gray" className="text-[10px]">
              +{profile.workflows.length + profile.tools.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Dependencies summary */}
      {hasDependencies && (
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          {profile.inputsFrom.length > 0 && (
            <div className="flex items-center gap-1 text-slate-600">
              <ArrowLeft className="w-3 h-3 text-slate-400" />
              <span className="truncate">
                {profile.inputsFrom.length} input{profile.inputsFrom.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {profile.outputsTo.length > 0 && (
            <div className="flex items-center gap-1 text-slate-600">
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="truncate">
                {profile.outputsTo.length} output{profile.outputsTo.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Issues & Training needs footer */}
      {(hasIssues || hasTrainingNeeds) && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          {hasIssues && (
            <div className="flex items-center gap-1">
              <AlertTriangle className={`w-3.5 h-3.5 ${criticalIssues > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
              <span className={`text-xs font-medium ${criticalIssues > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                {profile.issuesDetected.length} issue{profile.issuesDetected.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {hasTrainingNeeds && (
            <div className="flex items-center gap-1">
              <GraduationCap className={`w-3.5 h-3.5 ${highPriorityTraining > 0 ? 'text-orange-500' : 'text-blue-500'}`} />
              <span className={`text-xs font-medium ${highPriorityTraining > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                {profile.trainingNeeds.length} training need{profile.trainingNeeds.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Click hint */}
      {onClick && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-xs text-center text-purple-500 font-medium">
            Click for details
          </p>
        </div>
      )}
    </div>
  );
}
