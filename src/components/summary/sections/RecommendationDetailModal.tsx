import { X, Lightbulb, Clock, Zap, Calendar, TrendingUp, GraduationCap, Wrench, Users, Shield, Target, AlertTriangle, Gauge, Link, FileText } from 'lucide-react';
import { RecommendationProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface RecommendationDetailModalProps {
  profile: RecommendationProfile;
  onClose: () => void;
}

const categoryIcons: Record<RecommendationProfile['category'], typeof Lightbulb> = {
  process: TrendingUp,
  training: GraduationCap,
  technology: Wrench,
  organization: Users,
  'risk-mitigation': Shield,
};

const categoryLabels: Record<RecommendationProfile['category'], string> = {
  process: 'Process Improvement',
  training: 'Training & Development',
  technology: 'Technology Enhancement',
  organization: 'Organizational Change',
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
  immediate: 'Immediate (0-30 days)',
  'short-term': 'Short-term (30-90 days)',
  'long-term': 'Long-term (90+ days)',
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
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

const effortLabels: Record<RecommendationProfile['levelOfEffort'], string> = {
  low: 'Low Effort',
  medium: 'Medium Effort',
  high: 'High Effort',
};

export function RecommendationDetailModal({ profile, onClose }: RecommendationDetailModalProps) {
  const CategoryIcon = categoryIcons[profile.category];
  const PhaseIcon = phaseIcons[profile.phase];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.title}</h2>
              <div className="flex items-center gap-3 text-emerald-100 text-sm mt-1">
                <span className={`px-2 py-0.5 rounded ${categoryColors[profile.category]}`}>
                  {categoryLabels[profile.category]}
                </span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded ${priorityColors[profile.priority]}`}>
                  {profile.priority.toUpperCase()} Priority
                </span>
                <span>•</span>
                <span>{profile.count} mention{profile.count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Phase indicator */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${phaseColors[profile.phase]}`}>
            <PhaseIcon className="w-6 h-6" />
            <div>
              <div className="font-semibold">{phaseLabels[profile.phase]}</div>
              <div className="text-sm opacity-75">
                {profile.phase === 'immediate' && 'Quick wins that can be started right away'}
                {profile.phase === 'short-term' && 'Planned initiatives for the next quarter'}
                {profile.phase === 'long-term' && 'Strategic improvements requiring more planning'}
              </div>
            </div>
          </div>

          {/* Full description */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
            <p className="text-slate-600">{profile.description}</p>
          </div>

          {/* Structured info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Problem Addressed */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Problem Addressed
              </h3>
              <p className="text-red-600">
                {profile.problemAddressed}
              </p>
            </div>

            {/* Expected Impact */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Expected Impact
              </h3>
              <p className="text-green-600">
                {profile.expectedImpact}
              </p>
            </div>

            {/* Scope */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Scope
              </h3>
              <p className="text-blue-600">
                {profile.scope}
              </p>
            </div>

            {/* Level of Effort */}
            <div className={`rounded-lg p-4 border ${effortColors[profile.levelOfEffort]}`}>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Level of Effort
              </h3>
              <p className="font-semibold">{effortLabels[profile.levelOfEffort]}</p>
              {profile.effortDetails && (
                <p className="text-sm mt-1 opacity-75">{profile.effortDetails}</p>
              )}
            </div>
          </div>

          {/* Category info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <CategoryIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Category</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{categoryLabels[profile.category]}</p>
          </div>

          {/* Dependencies */}
          {profile.dependencies.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Link className="w-4 h-4" />
                Dependencies ({profile.dependencies.length})
              </h3>
              <div className="space-y-2">
                {profile.dependencies.map((dep, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                    <span className="text-sm">{dep}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Items */}
          {(profile.relatedItems.roles?.length || 0) +
           (profile.relatedItems.workflows?.length || 0) +
           (profile.relatedItems.tools?.length || 0) +
           (profile.relatedItems.trainingGaps?.length || 0) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Related Items</h3>
              <div className="space-y-3">
                {profile.relatedItems.roles && profile.relatedItems.roles.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Roles</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.relatedItems.roles.map((role, idx) => (
                        <Badge key={idx} variant="purple" className="text-sm px-3 py-1.5">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.relatedItems.workflows && profile.relatedItems.workflows.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Workflows</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.relatedItems.workflows.map((wf, idx) => (
                        <Badge key={idx} variant="blue" className="text-sm px-3 py-1.5">
                          {wf}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.relatedItems.tools && profile.relatedItems.tools.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tools</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.relatedItems.tools.map((tool, idx) => (
                        <Badge key={idx} variant="green" className="text-sm px-3 py-1.5">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.relatedItems.trainingGaps && profile.relatedItems.trainingGaps.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Training Gaps</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.relatedItems.trainingGaps.map((gap, idx) => (
                        <Badge key={idx} variant="yellow" className="text-sm px-3 py-1.5">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source Information */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Source Information
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${profile.source === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {profile.source === 'auto' ? 'Auto-generated' : 'Manually added'}
                </span>
              </div>
              {profile.sourceDescription && (
                <p>{profile.sourceDescription}</p>
              )}
              <p>
                Identified in {profile.interviewIds.length} interview{profile.interviewIds.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
