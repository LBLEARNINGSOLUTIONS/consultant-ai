import { useState } from 'react';
import { X, TrendingUp, Users, Wrench, AlertTriangle, ChevronDown, ChevronRight, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { WorkflowProfile, WorkflowStep } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';
import { ProcessMap } from './ProcessMap';

interface WorkflowDetailModalProps {
  profile: WorkflowProfile;
  onClose: () => void;
}

export function WorkflowDetailModal({ profile, onClose }: WorkflowDetailModalProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const failurePointStepIds = profile.failurePoints
    .filter(fp => fp.stepId)
    .map(fp => fp.stepId as string);

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleStepClick = (stepId: string) => {
    setSelectedStepId(stepId);
    // Also expand the step details
    const newExpanded = new Set(expandedSteps);
    newExpanded.add(stepId);
    setExpandedSteps(newExpanded);

    // Scroll to the step in the list
    const element = document.getElementById(`step-${stepId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (failurePointStepIds.includes(step.id)) return 'failure';
    if (profile.unclearSteps.some(name => name.toLowerCase() === step.name.toLowerCase())) return 'unclear';
    return 'ok';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'failure':
        return <Badge variant="red" className="text-[10px]">Issue</Badge>;
      case 'unclear':
        return <Badge variant="yellow" className="text-[10px]">Unclear</Badge>;
      default:
        return null;
    }
  };

  // Get failure points for a specific step
  const getStepFailurePoints = (stepId: string) => {
    return profile.failurePoints.filter(fp => fp.stepId === stepId);
  };

  // Get failure points not linked to any step
  const generalFailurePoints = profile.failurePoints.filter(fp => !fp.stepId);

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'ad-hoc': return 'Ad-hoc';
      default: return freq;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <div className="flex items-center gap-3 text-blue-100 text-sm">
                <span>{getFrequencyLabel(profile.frequency)}</span>
                <span>•</span>
                <span>{profile.steps.length} steps</span>
                <span>•</span>
                <span>{profile.count} interview{profile.count !== 1 ? 's' : ''}</span>
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
          {/* Process Map */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Process Flow</h3>
            <ProcessMap
              steps={profile.steps}
              failurePointStepIds={failurePointStepIds}
              unclearStepNames={profile.unclearSteps}
              onStepClick={handleStepClick}
              selectedStepId={selectedStepId || undefined}
            />
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Participants */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Participants</span>
              </div>
              {profile.participants.length === 0 ? (
                <p className="text-sm text-slate-400">No participants identified</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {profile.participants.map((participant, idx) => (
                    <Badge key={idx} variant="indigo" className="text-xs">
                      {participant}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Systems */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">Systems Used</span>
              </div>
              {profile.systems.length === 0 ? (
                <p className="text-sm text-slate-400">No systems identified</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {profile.systems.map((system, idx) => (
                    <Badge key={idx} variant="blue" className="text-xs">
                      {system}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Issues Summary */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Issues</span>
              </div>
              <div className="space-y-1 text-sm">
                {profile.failurePoints.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-medium">{profile.failurePoints.length}</span>
                    <span className="text-slate-600">failure point{profile.failurePoints.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {profile.unclearSteps.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-medium">{profile.unclearSteps.length}</span>
                    <span className="text-slate-600">unclear step{profile.unclearSteps.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {profile.failurePoints.length === 0 && profile.unclearSteps.length === 0 && (
                  <p className="text-green-600">No issues detected</p>
                )}
              </div>
            </div>
          </div>

          {/* Step Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Step Details</h3>
            {profile.steps.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-8 text-center">
                <p className="text-slate-500">No steps defined for this workflow.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.steps.map((step, idx) => {
                  const isExpanded = expandedSteps.has(step.id);
                  const isSelected = selectedStepId === step.id;
                  const status = getStepStatus(step);
                  const stepFailures = getStepFailurePoints(step.id);

                  return (
                    <div
                      key={step.id}
                      id={`step-${step.id}`}
                      className={`border rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-400 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => toggleStepExpanded(step.id)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-900 flex-1">{step.name}</span>
                        {getStatusBadge(status)}
                        {step.owner && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {step.owner}
                          </span>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-slate-100 mt-0">
                          <div className="pt-3 space-y-3">
                            {/* Description */}
                            {step.description && (
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                                <p className="text-sm text-slate-700">{step.description}</p>
                              </div>
                            )}

                            {/* Owner, Duration */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">Owner</p>
                                <p className="text-sm text-slate-700">
                                  {step.owner || <span className="text-slate-400 italic">Not assigned</span>}
                                </p>
                              </div>
                              {step.duration && (
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Duration
                                  </p>
                                  <p className="text-sm text-slate-700">{step.duration}</p>
                                </div>
                              )}
                            </div>

                            {/* Inputs / Outputs */}
                            <div className="grid grid-cols-2 gap-4">
                              {step.inputs && step.inputs.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" /> Inputs
                                  </p>
                                  <ul className="text-sm text-slate-700 space-y-0.5">
                                    {step.inputs.map((input, i) => (
                                      <li key={i} className="truncate">• {input}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {step.outputs && step.outputs.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                    <ArrowLeft className="w-3 h-3" /> Outputs
                                  </p>
                                  <ul className="text-sm text-slate-700 space-y-0.5">
                                    {step.outputs.map((output, i) => (
                                      <li key={i} className="truncate">• {output}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Systems */}
                            {step.systems && step.systems.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                  <Wrench className="w-3 h-3" /> Systems
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {step.systems.map((system, i) => (
                                    <Badge key={i} variant="blue" className="text-xs">
                                      {system}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Failure Points */}
                            {stepFailures.length > 0 && (
                              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                <p className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Failure Points
                                </p>
                                <ul className="space-y-1">
                                  {stepFailures.map((fp, i) => (
                                    <li key={i} className="text-sm text-red-700">
                                      <Badge
                                        variant={fp.severity === 'critical' || fp.severity === 'high' ? 'red' : 'yellow'}
                                        className="text-[10px] mr-2"
                                      >
                                        {fp.severity}
                                      </Badge>
                                      {fp.description}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Issues from step.issues */}
                            {step.issues && step.issues.length > 0 && (
                              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                <p className="text-xs font-medium text-amber-700 mb-2">Issues Detected</p>
                                <ul className="space-y-1">
                                  {step.issues.map((issue, i) => (
                                    <li key={i} className="text-sm text-amber-800">
                                      <Badge
                                        variant={issue.severity === 'critical' || issue.severity === 'high' ? 'red' : 'yellow'}
                                        className="text-[10px] mr-2"
                                      >
                                        {issue.severity}
                                      </Badge>
                                      {issue.description}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* General Failure Points (not linked to specific steps) */}
          {generalFailurePoints.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">General Issues</h3>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <ul className="space-y-2">
                  {generalFailurePoints.map((fp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <Badge
                          variant={fp.severity === 'critical' || fp.severity === 'high' ? 'red' : 'yellow'}
                          className="text-[10px] mr-2"
                        >
                          {fp.severity}
                        </Badge>
                        <span className="text-sm text-red-800">{fp.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
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
