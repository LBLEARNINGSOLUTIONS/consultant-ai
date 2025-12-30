import { X, GraduationCap, Users, Wrench, TrendingUp, AlertTriangle, BookOpen, Brain, HelpCircle, ArrowRight, ArrowLeft, Target } from 'lucide-react';
import { TrainingGapProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface TrainingGapDetailModalProps {
  profile: TrainingGapProfile;
  onClose: () => void;
}

const categoryLabels: Record<TrainingGapProfile['category'], string> = {
  skill: 'Skill Gap',
  system: 'System Training',
  process: 'Process Understanding',
  knowledge: 'Knowledge Gap',
  other: 'Training Need',
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

const riskSeverityColors: Record<TrainingGapProfile['risk']['severity'], string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function TrainingGapDetailModal({ profile, onClose }: TrainingGapDetailModalProps) {
  const CategoryIcon = categoryIcons[profile.category];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.area}</h2>
              <div className="flex items-center gap-3 text-indigo-100 text-sm">
                <span className={`px-2 py-0.5 rounded ${categoryColors[profile.category]}`}>
                  {categoryLabels[profile.category]}
                </span>
                <span>•</span>
                <span>{profile.count} interview{profile.count !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded ${priorityColors[profile.priority]}`}>
                  {profile.priority.toUpperCase()} Priority
                </span>
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
          {/* Current vs Desired State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Current State
              </h3>
              <p className="text-red-600">
                {profile.currentState}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Desired State
              </h3>
              <p className="text-green-600">
                {profile.desiredState}
              </p>
            </div>
          </div>

          {/* Suggested Training */}
          {profile.suggestedTraining && profile.suggestedTraining !== 'Training approach to be determined' && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="text-sm font-medium text-indigo-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Suggested Training Approach
              </h3>
              <p className="text-indigo-600">
                {profile.suggestedTraining}
              </p>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Category */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <CategoryIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Category</span>
              </div>
              <p className="text-lg font-semibold text-slate-900">{categoryLabels[profile.category]}</p>
            </div>

            {/* Affected Roles Count */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Affected Roles</span>
              </div>
              <p className="text-lg font-semibold text-slate-900">{profile.affectedRoles.length}</p>
            </div>

            {/* Related Systems Count */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">Related Systems</span>
              </div>
              <p className="text-lg font-semibold text-slate-900">{profile.relatedSystems.length}</p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className={`rounded-lg p-4 border ${riskSeverityColors[profile.risk.severity]}`}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Assessment - {profile.risk.severity.toUpperCase()}
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Risk Factors:</span> {profile.risk.description}
              </p>
              <p className="text-sm">
                <span className="font-medium">Business Impact:</span> {profile.risk.businessImpact}
              </p>
            </div>
          </div>

          {/* Affected Roles Details */}
          {profile.affectedRoles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Affected Roles</h3>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Role</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Impact</th>
                      <th className="text-right px-4 py-2 font-medium text-slate-600">Mentions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profile.affectedRoles.map((role, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-700">{role.role}</td>
                        <td className="px-4 py-2 text-slate-600">{role.impact}</td>
                        <td className="px-4 py-2 text-right text-slate-500">{role.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Related Systems */}
          {profile.relatedSystems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Related Systems
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.relatedSystems.map((system, idx) => (
                  <Badge key={idx} variant="blue" className="text-sm px-3 py-1.5">
                    {system}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Workflows */}
          {profile.relatedWorkflows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Impacted Workflows
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.relatedWorkflows.map((wf, idx) => (
                  <Badge key={idx} variant="green" className="text-sm px-3 py-1.5">
                    {wf}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interview Evidence */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Interview Evidence</h3>
            <p className="text-sm text-slate-600">
              Identified in {profile.interviewIds.length} interview{profile.interviewIds.length !== 1 ? 's' : ''}.
            </p>
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
