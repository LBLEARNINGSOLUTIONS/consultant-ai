import { Lightbulb, Edit2, Trash2, Clock, Zap, Calendar, TrendingUp, GraduationCap, Wrench, Users, Shield, ClipboardList } from 'lucide-react';
import { RecommendationProfile } from '../../../types/analysis';

interface RecommendationListRowProps {
  profile: RecommendationProfile;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToScope?: () => void;
  canEdit?: boolean;
  isInScope?: boolean;
}

const categoryIcons: Record<RecommendationProfile['category'], typeof Lightbulb> = {
  process: TrendingUp,
  training: GraduationCap,
  technology: Wrench,
  organization: Users,
  'risk-mitigation': Shield,
};

const categoryLabels: Record<RecommendationProfile['category'], string> = {
  process: 'Process',
  training: 'Training',
  technology: 'Technology',
  organization: 'Organization',
  'risk-mitigation': 'Risk Mitigation',
};

const categoryColors: Record<RecommendationProfile['category'], string> = {
  process: 'bg-blue-100 text-blue-700',
  training: 'bg-purple-100 text-purple-700',
  technology: 'bg-cyan-100 text-cyan-700',
  organization: 'bg-amber-100 text-amber-700',
  'risk-mitigation': 'bg-rose-100 text-rose-700',
};

const phaseColors: Record<RecommendationProfile['phase'], string> = {
  immediate: 'bg-red-100 text-red-700',
  'short-term': 'bg-amber-100 text-amber-700',
  'long-term': 'bg-green-100 text-green-700',
};

const phaseLabels: Record<RecommendationProfile['phase'], string> = {
  immediate: '0-30d',
  'short-term': '30-90d',
  'long-term': '90+d',
};

const phaseIcons: Record<RecommendationProfile['phase'], typeof Zap> = {
  immediate: Zap,
  'short-term': Clock,
  'long-term': Calendar,
};

const priorityColors: Record<RecommendationProfile['priority'], string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

const effortColors: Record<RecommendationProfile['levelOfEffort'], string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export function RecommendationListRow({
  profile,
  onClick,
  onEdit,
  onDelete,
  onAddToScope,
  canEdit = false,
  isInScope = false,
}: RecommendationListRowProps) {
  const CategoryIcon = categoryIcons[profile.category];
  const PhaseIcon = phaseIcons[profile.phase];
  const isHighPriority = profile.priority === 'high';

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-4 p-3 bg-white border rounded-lg hover:shadow-sm cursor-pointer transition-colors ${
        isHighPriority
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
        <div className="font-medium text-slate-900 truncate">{profile.title}</div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded ${categoryColors[profile.category]}`}>
            {categoryLabels[profile.category]}
          </span>
          <span className="hidden sm:inline">
            {profile.levelOfEffort.charAt(0).toUpperCase() + profile.levelOfEffort.slice(1)} effort
          </span>
        </div>
      </div>

      {/* Phase badge */}
      <div className={`hidden md:flex items-center gap-1 px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${phaseColors[profile.phase]}`}>
        <PhaseIcon className="w-3 h-3" />
        <span>{phaseLabels[profile.phase]}</span>
      </div>

      {/* Effort badge */}
      <span className={`hidden lg:inline px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${effortColors[profile.levelOfEffort]}`}>
        {profile.levelOfEffort.charAt(0).toUpperCase() + profile.levelOfEffort.slice(1)}
      </span>

      {/* Priority badge */}
      <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${priorityColors[profile.priority]}`}>
        {profile.priority.toUpperCase()}
      </span>

      {/* Count badge */}
      {profile.count > 0 && (
        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-emerald-700">{profile.count}</span>
        </div>
      )}

      {/* Actions */}
      {canEdit && (
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {onAddToScope && (
            <button
              onClick={() => { if (!isInScope) onAddToScope(); }}
              className={`p-1.5 rounded transition-colors ${
                isInScope
                  ? 'text-emerald-600 bg-emerald-50 cursor-default'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title={isInScope ? 'Already in scope' : 'Add to scope of work'}
            >
              <ClipboardList className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit recommendation"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete recommendation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
