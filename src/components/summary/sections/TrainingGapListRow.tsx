import { GraduationCap, Edit2, Trash2, AlertTriangle, Users, Brain, Wrench, TrendingUp, BookOpen, HelpCircle } from 'lucide-react';
import { TrainingGapProfile } from '../../../types/analysis';

interface TrainingGapListRowProps {
  profile: TrainingGapProfile;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

const categoryLabels: Record<TrainingGapProfile['category'], string> = {
  skill: 'Skill',
  system: 'System',
  process: 'Process',
  knowledge: 'Knowledge',
  other: 'Other',
};

const categoryColors: Record<TrainingGapProfile['category'], string> = {
  skill: 'bg-purple-100 text-purple-700',
  system: 'bg-blue-100 text-blue-700',
  process: 'bg-green-100 text-green-700',
  knowledge: 'bg-amber-100 text-amber-700',
  other: 'bg-slate-100 text-slate-700',
};

const categoryIcons: Record<TrainingGapProfile['category'], typeof GraduationCap> = {
  skill: Brain,
  system: Wrench,
  process: TrendingUp,
  knowledge: BookOpen,
  other: HelpCircle,
};

const priorityColors: Record<TrainingGapProfile['priority'], string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

export function TrainingGapListRow({
  profile,
  onClick,
  onEdit,
  onDelete,
  canEdit = false,
}: TrainingGapListRowProps) {
  const isCritical = profile.risk.severity === 'critical' || profile.risk.severity === 'high';
  const CategoryIcon = categoryIcons[profile.category];

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-4 p-3 bg-white border rounded-lg hover:shadow-sm cursor-pointer transition-colors ${
        isCritical
          ? 'border-red-200 hover:border-red-300'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[profile.category]}`}>
        <CategoryIcon className="w-5 h-5" />
      </div>

      {/* Title and meta */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 truncate">{profile.area}</div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded ${categoryColors[profile.category]}`}>
            {categoryLabels[profile.category]}
          </span>
          {profile.affectedRoles.length > 0 && (
            <span className="hidden sm:inline">
              <Users className="w-3 h-3 inline mr-0.5" />
              {profile.affectedRoles.length} role{profile.affectedRoles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tags - affected roles */}
      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        {profile.affectedRoles.slice(0, 2).map((role, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded"
          >
            {role.role.length > 12 ? role.role.slice(0, 12) + '...' : role.role}
          </span>
        ))}
        {profile.affectedRoles.length > 2 && (
          <span className="text-xs text-slate-400">
            +{profile.affectedRoles.length - 2}
          </span>
        )}
      </div>

      {/* Priority badge */}
      <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${priorityColors[profile.priority]}`}>
        {profile.priority.toUpperCase()}
      </span>

      {/* Risk indicator */}
      {isCritical && (
        <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded flex-shrink-0">
          <AlertTriangle className="w-3 h-3" />
          {profile.risk.severity}
        </span>
      )}

      {/* Count badge */}
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-amber-700">{profile.count}</span>
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
            title="Edit gap"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete gap"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
