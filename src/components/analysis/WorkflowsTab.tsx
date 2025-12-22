import { Workflow, HandoffRisk } from '../../types/analysis';
import { Badge } from './Badge';
import { Users, Clock, AlertTriangle } from 'lucide-react';

interface WorkflowsTabProps {
  workflows: Workflow[];
  handoffRisks: HandoffRisk[];
  onUpdateWorkflows: (workflows: Workflow[]) => void;
}

export function WorkflowsTab({ workflows, handoffRisks, onUpdateWorkflows }: WorkflowsTabProps) {
  const frequencyColors: Record<string, 'blue' | 'green' | 'yellow' | 'purple'> = {
    daily: 'blue',
    weekly: 'green',
    monthly: 'yellow',
    'ad-hoc': 'purple',
  };

  if (workflows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No workflows identified in this interview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflows */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {workflow.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={frequencyColors[workflow.frequency]}>
                    {workflow.frequency}
                  </Badge>
                  {workflow.duration && (
                    <Badge variant="gray">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {workflow.duration}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Steps:</h4>
              <ol className="space-y-2">
                {workflow.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 leading-6">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Participants */}
            {workflow.participants.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participants:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {workflow.participants.map((participant, idx) => (
                    <Badge key={idx} variant="purple">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {workflow.notes && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 italic">{workflow.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Handoff Risks */}
      {handoffRisks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            High-Risk Handoffs
          </h3>
          <div className="space-y-3">
            {handoffRisks.map((risk) => (
              <div
                key={risk.id}
                className={`p-4 rounded-lg border-l-4 ${
                  risk.riskLevel === 'high'
                    ? 'bg-red-50 border-red-500'
                    : risk.riskLevel === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {risk.fromRole}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-slate-900">
                      {risk.toRole}
                    </span>
                  </div>
                  <Badge
                    variant={
                      risk.riskLevel === 'high'
                        ? 'red'
                        : risk.riskLevel === 'medium'
                        ? 'yellow'
                        : 'blue'
                    }
                  >
                    {risk.riskLevel} risk
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-1">
                  <span className="font-medium">Process:</span> {risk.process}
                </p>
                <p className="text-sm text-slate-600">{risk.description}</p>
                {risk.mitigation && (
                  <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Suggested Mitigation:
                    </p>
                    <p className="text-xs text-slate-600">{risk.mitigation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
