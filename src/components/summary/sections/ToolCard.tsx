import { Wrench, Edit2, Trash2, Merge, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { ToolProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface ToolCardProps {
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

export function ToolCard({ profile, onClick, onEdit, onMerge, onDelete, canEdit }: ToolCardProps) {
  const hasGaps = profile.gaps.length > 0;
  const highSeverityGaps = profile.gaps.filter(g => g.severity === 'high').length;

  return (
    <div
      className={`bg-white rounded-xl border transition-all cursor-pointer group ${
        hasGaps
          ? highSeverityGaps > 0
            ? 'border-red-200 hover:border-red-400 hover:shadow-md'
            : 'border-amber-200 hover:border-amber-400 hover:shadow-md'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[profile.category]}`}>
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{profile.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className={`px-1.5 py-0.5 rounded ${categoryColors[profile.category]}`}>
                  {categoryLabels[profile.category]}
                </span>
                <span>•</span>
                <span>{profile.count} interview{profile.count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Edit tool"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onMerge && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMerge(); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Merge with another tool"
                >
                  <Merge className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete tool"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Users */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">
            {profile.usedBy.length} role{profile.usedBy.length !== 1 ? 's' : ''}
          </span>
          {profile.usedBy.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-1">
              {profile.usedBy.slice(0, 2).map((user, idx) => (
                <Badge key={idx} variant="purple" className="text-[10px]">
                  {user.role}
                </Badge>
              ))}
              {profile.usedBy.length > 2 && (
                <Badge variant="gray" className="text-[10px]">
                  +{profile.usedBy.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Workflows */}
        {profile.workflows.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-1">
              {profile.workflows.slice(0, 2).map((wf, idx) => (
                <Badge key={idx} variant="blue" className="text-[10px]">
                  {wf.name}
                </Badge>
              ))}
              {profile.workflows.length > 2 && (
                <Badge variant="gray" className="text-[10px]">
                  +{profile.workflows.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Gaps indicator */}
        {hasGaps && (
          <div className={`flex items-center gap-2 text-sm ${
            highSeverityGaps > 0 ? 'text-red-600' : 'text-amber-600'
          }`}>
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">
              {profile.gaps.length} gap{profile.gaps.length !== 1 ? 's' : ''} identified
            </span>
          </div>
        )}

        {/* Purpose preview */}
        {profile.intendedPurpose && profile.intendedPurpose !== 'Not specified' && (
          <p className="text-xs text-slate-500 line-clamp-2">
            {profile.intendedPurpose}
          </p>
        )}
      </div>
    </div>
  );
}
