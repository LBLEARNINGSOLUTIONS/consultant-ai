import { Wrench, Edit2, Trash2, Merge, AlertTriangle, Users } from 'lucide-react';
import { ToolProfile } from '../../../types/analysis';

interface ToolListRowProps {
  profile: ToolProfile;
  onClick: () => void;
  onEdit?: () => void;
  onMerge?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

const categoryLabels: Record<ToolProfile['category'], string> = {
  crm: 'CRM',
  pm: 'Project Mgmt',
  spreadsheet: 'Spreadsheet',
  communication: 'Communication',
  erp: 'ERP',
  custom: 'Custom',
  other: 'Other',
};

const categoryColors: Record<ToolProfile['category'], string> = {
  crm: 'bg-blue-100 text-blue-700',
  pm: 'bg-purple-100 text-purple-700',
  spreadsheet: 'bg-green-100 text-green-700',
  communication: 'bg-yellow-100 text-yellow-700',
  erp: 'bg-red-100 text-red-700',
  custom: 'bg-indigo-100 text-indigo-700',
  other: 'bg-slate-100 text-slate-700',
};

export function ToolListRow({
  profile,
  onClick,
  onEdit,
  onMerge,
  onDelete,
  canEdit = false,
}: ToolListRowProps) {
  const hasGaps = profile.gaps.length > 0;
  const highSeverityGaps = profile.gaps.filter(g => g.severity === 'high').length;

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-4 p-3 bg-white border rounded-lg hover:shadow-sm cursor-pointer transition-colors ${
        hasGaps
          ? highSeverityGaps > 0
            ? 'border-red-200 hover:border-red-300'
            : 'border-amber-200 hover:border-amber-300'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[profile.category]}`}>
        <Wrench className="w-5 h-5" />
      </div>

      {/* Title and meta */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 truncate">{profile.name}</div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded ${categoryColors[profile.category]}`}>
            {categoryLabels[profile.category]}
          </span>
          {profile.usedBy.length > 0 && (
            <span className="hidden sm:inline">
              <Users className="w-3 h-3 inline mr-0.5" />
              {profile.usedBy.length} role{profile.usedBy.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tags - users */}
      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        {profile.usedBy.slice(0, 2).map((user, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded"
          >
            {user.role.length > 12 ? user.role.slice(0, 12) + '...' : user.role}
          </span>
        ))}
        {profile.usedBy.length > 2 && (
          <span className="text-xs text-slate-400">
            +{profile.usedBy.length - 2}
          </span>
        )}
      </div>

      {/* Gaps indicator */}
      {hasGaps && (
        <span className={`flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
          highSeverityGaps > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          <AlertTriangle className="w-3 h-3" />
          {profile.gaps.length}
        </span>
      )}

      {/* Count badge */}
      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-indigo-700">{profile.count}</span>
      </div>

      {/* Actions */}
      {canEdit && (
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit tool"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMerge}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Merge with another tool"
          >
            <Merge className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete tool"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
