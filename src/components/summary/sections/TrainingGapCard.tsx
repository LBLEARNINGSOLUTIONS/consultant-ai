import { GraduationCap, Edit2, Trash2, AlertTriangle, Users, Wrench, TrendingUp, Brain, BookOpen, HelpCircle } from 'lucide-react';
import { TrainingGapProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface TrainingGapCardProps {
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
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const riskColors: Record<TrainingGapProfile['risk']['severity'], string> = {
  critical: 'text-red-700 bg-red-50',
  high: 'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-slate-500 bg-slate-50',
};

export function TrainingGapCard({ profile, onClick, onEdit, onDelete, canEdit }: TrainingGapCardProps) {
  const isCritical = profile.risk.severity === 'critical' || profile.risk.severity === 'high';
  const CategoryIcon = categoryIcons[profile.category];

  return (
    <div
      className={`bg-white rounded-xl border transition-all cursor-pointer group ${
        isCritical
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
              <h3 className="font-semibold text-slate-900 truncate">{profile.area}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className={`px-1.5 py-0.5 rounded ${categoryColors[profile.category]}`}>
                  {categoryLabels[profile.category]}
                </span>
                <span>•</span>
                <span>{profile.count} mention{profile.count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Priority badge */}
            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${priorityColors[profile.priority]}`}>
              {profile.priority.toUpperCase()}
            </span>
            {canEdit && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Edit gap"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete gap"
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
        {/* Current/Target states - condensed */}
        {(profile.currentState !== 'Not documented' || profile.desiredState !== 'Not specified') && (
          <div className="text-sm space-y-1">
            {profile.currentState !== 'Not documented' && (
              <p className="text-slate-500 line-clamp-1">
                <span className="font-medium text-slate-600">Current:</span> {profile.currentState}
              </p>
            )}
            {profile.desiredState !== 'Not specified' && (
              <p className="text-slate-500 line-clamp-1">
                <span className="font-medium text-slate-600">Target:</span> {profile.desiredState}
              </p>
            )}
          </div>
        )}

        {/* Affected roles */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">
            {profile.affectedRoles.length} role{profile.affectedRoles.length !== 1 ? 's' : ''}
          </span>
          {profile.affectedRoles.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-1">
              {profile.affectedRoles.slice(0, 2).map((role, idx) => (
                <Badge key={idx} variant="purple" className="text-[10px]">
                  {role.role}
                </Badge>
              ))}
              {profile.affectedRoles.length > 2 && (
                <Badge variant="gray" className="text-[10px]">
                  +{profile.affectedRoles.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Related systems */}
        {profile.relatedSystems.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-1">
              {profile.relatedSystems.slice(0, 2).map((system, idx) => (
                <Badge key={idx} variant="blue" className="text-[10px]">
                  {system}
                </Badge>
              ))}
              {profile.relatedSystems.length > 2 && (
                <Badge variant="gray" className="text-[10px]">
                  +{profile.relatedSystems.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Related workflows */}
        {profile.relatedWorkflows.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-1">
              {profile.relatedWorkflows.slice(0, 2).map((wf, idx) => (
                <Badge key={idx} variant="green" className="text-[10px]">
                  {wf}
                </Badge>
              ))}
              {profile.relatedWorkflows.length > 2 && (
                <Badge variant="gray" className="text-[10px]">
                  +{profile.relatedWorkflows.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Risk indicator */}
        <div className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 ${riskColors[profile.risk.severity]}`}>
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium capitalize">
            {profile.risk.severity} Risk
          </span>
          {profile.relatedWorkflows.length > 0 && (
            <span className="text-xs opacity-75">
              • Impacts {profile.relatedWorkflows[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
