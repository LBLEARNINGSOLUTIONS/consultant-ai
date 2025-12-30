import { Lightbulb, Edit2, Trash2, Clock, Zap, Calendar, TrendingUp, GraduationCap, Wrench, Users, Shield, Link } from 'lucide-react';
import { RecommendationProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface RecommendationCardProps {
  profile: RecommendationProfile;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
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
  immediate: 'bg-red-100 text-red-700 border-red-200',
  'short-term': 'bg-amber-100 text-amber-700 border-amber-200',
  'long-term': 'bg-green-100 text-green-700 border-green-200',
};

const phaseLabels: Record<RecommendationProfile['phase'], string> = {
  immediate: '0-30 days',
  'short-term': '30-90 days',
  'long-term': '90+ days',
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
  low: 'text-green-600',
  medium: 'text-amber-600',
  high: 'text-red-600',
};

export function RecommendationCard({ profile, onClick, onEdit, onDelete, canEdit }: RecommendationCardProps) {
  const CategoryIcon = categoryIcons[profile.category];
  const PhaseIcon = phaseIcons[profile.phase];
  const isHighPriority = profile.priority === 'high';

  // Count related items
  const relatedCount =
    (profile.relatedItems.roles?.length || 0) +
    (profile.relatedItems.workflows?.length || 0) +
    (profile.relatedItems.tools?.length || 0) +
    (profile.relatedItems.trainingGaps?.length || 0);

  return (
    <div
      className={`bg-white rounded-xl border transition-all cursor-pointer group ${
        isHighPriority
          ? 'border-red-200 hover:border-red-400 hover:shadow-md'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[profile.category]}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 line-clamp-2">{profile.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className={`px-1.5 py-0.5 rounded ${categoryColors[profile.category]}`}>
                  {categoryLabels[profile.category]}
                </span>
                <span>•</span>
                <span className={effortColors[profile.levelOfEffort]}>
                  {profile.levelOfEffort.charAt(0).toUpperCase() + profile.levelOfEffort.slice(1)} effort
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Phase badge */}
            <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${phaseColors[profile.phase]}`}>
              <PhaseIcon className="w-3 h-3" />
              <span>{phaseLabels[profile.phase]}</span>
            </div>
            {canEdit && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Edit recommendation"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete recommendation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Problem addressed */}
        {profile.problemAddressed && profile.problemAddressed !== 'Identified need for improvement' && (
          <div className="text-sm">
            <span className="font-medium text-slate-600">Problem:</span>{' '}
            <span className="text-slate-500 line-clamp-2">{profile.problemAddressed}</span>
          </div>
        )}

        {/* Expected impact */}
        {profile.expectedImpact && profile.expectedImpact !== 'Impact to be assessed' && (
          <div className="text-sm">
            <span className="font-medium text-slate-600">Impact:</span>{' '}
            <span className="text-slate-500 line-clamp-1">{profile.expectedImpact}</span>
          </div>
        )}

        {/* Scope */}
        {profile.scope && profile.scope !== 'Organization-wide' && (
          <div className="flex flex-wrap gap-1">
            {profile.relatedItems.roles?.slice(0, 3).map((role, idx) => (
              <Badge key={idx} variant="purple" className="text-[10px]">
                {role}
              </Badge>
            ))}
            {(profile.relatedItems.roles?.length || 0) > 3 && (
              <Badge variant="gray" className="text-[10px]">
                +{(profile.relatedItems.roles?.length || 0) - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* Priority */}
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[profile.priority]}`}>
              {profile.priority.toUpperCase()}
            </span>
            {/* Source indicator */}
            {profile.source === 'auto' && (
              <span className="text-xs text-slate-400">Auto</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {/* Dependencies count */}
            {profile.dependencies.length > 0 && (
              <span className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                {profile.dependencies.length}
              </span>
            )}
            {/* Related items count */}
            {relatedCount > 0 && (
              <span>{relatedCount} related</span>
            )}
            {/* Interview count */}
            {profile.count > 0 && (
              <span>{profile.count} mention{profile.count !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
