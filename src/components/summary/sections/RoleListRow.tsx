import { Users, AlertTriangle, GraduationCap, Edit2, Trash2, GitMerge } from 'lucide-react';
import { RoleProfile } from '../../../types/analysis';

interface RoleListRowProps {
  profile: RoleProfile;
  onClick: () => void;
  onEdit?: () => void;
  onMerge?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function RoleListRow({
  profile,
  onClick,
  onEdit,
  onMerge,
  onDelete,
  canEdit = false,
}: RoleListRowProps) {
  const issueCount = profile.issuesDetected?.length || 0;
  const trainingCount = profile.trainingNeeds?.length || 0;

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-colors"
    >
      {/* Icon */}
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Users className="w-5 h-5 text-purple-600" />
      </div>

      {/* Title and meta */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 truncate">{profile.title}</div>
        <div className="text-xs text-slate-500">
          {profile.responsibilities?.length || 0} responsibilities
          {profile.workflows?.length ? ` • ${profile.workflows.length} workflows` : ''}
        </div>
      </div>

      {/* Tags - workflows */}
      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        {profile.workflows?.slice(0, 2).map((w, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded"
          >
            {w.length > 15 ? w.slice(0, 15) + '...' : w}
          </span>
        ))}
        {(profile.workflows?.length || 0) > 2 && (
          <span className="text-xs text-slate-400">
            +{profile.workflows!.length - 2}
          </span>
        )}
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {issueCount > 0 && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
            <AlertTriangle className="w-3 h-3" />
            {issueCount}
          </span>
        )}
        {trainingCount > 0 && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
            <GraduationCap className="w-3 h-3" />
            {trainingCount}
          </span>
        )}
      </div>

      {/* Count badge */}
      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-purple-700">{profile.count}</span>
      </div>

      {/* Actions */}
      {canEdit && (
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title="Edit role"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMerge}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Merge with another role"
          >
            <GitMerge className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete role"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
