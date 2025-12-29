import { X, Users, Briefcase, GitBranch, Wrench, ArrowRight, ArrowLeft, AlertTriangle, GraduationCap } from 'lucide-react';
import { RoleProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface RoleDetailModalProps {
  profile: RoleProfile;
  onClose: () => void;
}

export function RoleDetailModal({ profile, onClose }: RoleDetailModalProps) {
  const severityColors = {
    critical: 'red',
    high: 'red',
    medium: 'yellow',
    low: 'green',
  } as const;

  const priorityColors = {
    high: 'red',
    medium: 'yellow',
    low: 'green',
  } as const;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.title}</h2>
              <p className="text-purple-100 text-sm">
                Mentioned in {profile.count} interview{profile.count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Responsibilities */}
          {profile.responsibilities.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                <Briefcase className="w-4 h-4 text-purple-500" />
                Responsibilities
              </h3>
              <ul className="space-y-2">
                {profile.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                    {resp}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Workflows */}
          {profile.workflows.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                <GitBranch className="w-4 h-4 text-indigo-500" />
                Workflows Involved
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.workflows.map((workflow, idx) => (
                  <Badge key={idx} variant="indigo">
                    {workflow}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Tools */}
          {profile.tools.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                <Wrench className="w-4 h-4 text-blue-500" />
                Tools & Systems Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.tools.map((tool, idx) => (
                  <Badge key={idx} variant="blue">
                    {tool}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Dependencies */}
          {(profile.inputsFrom.length > 0 || profile.outputsTo.length > 0) && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                Role Dependencies
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Inputs From */}
                {profile.inputsFrom.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
                      <ArrowLeft className="w-4 h-4 text-green-500" />
                      Receives From
                    </h4>
                    <ul className="space-y-2">
                      {profile.inputsFrom.map((dep, idx) => (
                        <li key={idx} className="text-sm">
                          <span className="font-medium text-slate-800">{dep.role}</span>
                          <span className="text-slate-500 ml-1">({dep.process})</span>
                          {dep.count > 1 && (
                            <Badge variant="gray" className="ml-2 text-[10px]">
                              ×{dep.count}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Outputs To */}
                {profile.outputsTo.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                      Hands Off To
                    </h4>
                    <ul className="space-y-2">
                      {profile.outputsTo.map((dep, idx) => (
                        <li key={idx} className="text-sm">
                          <span className="font-medium text-slate-800">{dep.role}</span>
                          <span className="text-slate-500 ml-1">({dep.process})</span>
                          {dep.count > 1 && (
                            <Badge variant="gray" className="ml-2 text-[10px]">
                              ×{dep.count}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Issues Detected */}
          {profile.issuesDetected.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Issues Affecting This Role
              </h3>
              <div className="space-y-2">
                {profile.issuesDetected.map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Badge
                      variant={severityColors[issue.severity as keyof typeof severityColors] || 'gray'}
                      className="flex-shrink-0"
                    >
                      {issue.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{issue.description}</p>
                      {issue.count > 1 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Mentioned {issue.count} times
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Training Needs */}
          {profile.trainingNeeds.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                <GraduationCap className="w-4 h-4 text-orange-500" />
                Training Needs
              </h3>
              <div className="space-y-2">
                {profile.trainingNeeds.map((need, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Badge
                      variant={priorityColors[need.priority as keyof typeof priorityColors] || 'gray'}
                      className="flex-shrink-0"
                    >
                      {need.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{need.area}</p>
                      {need.count > 1 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Identified in {need.count} interviews
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {profile.responsibilities.length === 0 &&
            profile.workflows.length === 0 &&
            profile.tools.length === 0 &&
            profile.inputsFrom.length === 0 &&
            profile.outputsTo.length === 0 &&
            profile.issuesDetected.length === 0 &&
            profile.trainingNeeds.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No detailed information available for this role.</p>
                <p className="text-sm text-slate-400 mt-1">
                  This role was identified but no specific details were captured.
                </p>
              </div>
            )}
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
