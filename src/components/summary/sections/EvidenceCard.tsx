import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, Calendar, Users, GitBranch, AlertTriangle, Wrench, FileText, MessageSquare } from 'lucide-react';
import { Interview } from '../../../types/database';
import { Workflow, PainPoint, Tool, Role, TrainingGap, HandoffRisk } from '../../../types/analysis';
import { formatDate } from '../../../utils/dateFormatters';
import { Badge } from '../../analysis/Badge';

interface EvidenceCardProps {
  interview: Interview;
  onViewAnalysis?: () => void;
  defaultExpanded?: boolean;
}

interface LinkedEvidence {
  roles: Role[];
  workflows: Workflow[];
  painPoints: PainPoint[];
  tools: Tool[];
  trainingGaps: TrainingGap[];
  handoffRisks: HandoffRisk[];
}

export function EvidenceCard({ interview, onViewAnalysis, defaultExpanded = false }: EvidenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'workflows' | 'issues'>('overview');

  // Extract linked evidence from interview
  const evidence: LinkedEvidence = {
    roles: (interview.roles as unknown as Role[]) || [],
    workflows: (interview.workflows as unknown as Workflow[]) || [],
    painPoints: (interview.pain_points as unknown as PainPoint[]) || [],
    tools: (interview.tools as unknown as Tool[]) || [],
    trainingGaps: (interview.training_gaps as unknown as TrainingGap[]) || [],
    handoffRisks: (interview.handoff_risks as unknown as HandoffRisk[]) || [],
  };

  // Count totals
  const totalIssues = evidence.painPoints.length + evidence.handoffRisks.length + evidence.trainingGaps.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 truncate">{interview.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              {interview.analyzed_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(interview.analyzed_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-2">
          {evidence.roles.length > 0 && (
            <Badge variant="purple" className="text-xs">
              {evidence.roles.length} role{evidence.roles.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {evidence.workflows.length > 0 && (
            <Badge variant="blue" className="text-xs">
              {evidence.workflows.length} workflow{evidence.workflows.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {totalIssues > 0 && (
            <Badge variant="red" className="text-xs">
              {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* View Analysis button */}
        {onViewAnalysis && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewAnalysis(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'roles'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Roles ({evidence.roles.length})
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'workflows'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Workflows ({evidence.workflows.length})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'issues'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Issues ({totalIssues})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-700">{evidence.roles.length}</div>
                    <div className="text-xs text-purple-600">Roles</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <GitBranch className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-700">{evidence.workflows.length}</div>
                    <div className="text-xs text-blue-600">Workflows</div>
                  </div>
                  <div className="bg-cyan-50 rounded-lg p-3 text-center">
                    <Wrench className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-cyan-700">{evidence.tools.length}</div>
                    <div className="text-xs text-cyan-600">Tools</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-red-700">{totalIssues}</div>
                    <div className="text-xs text-red-600">Issues</div>
                  </div>
                </div>

                {/* Transcript Toggle */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FileText className="w-4 h-4" />
                      Original Transcript
                    </span>
                    {showTranscript ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {showTranscript && (
                    <div className="p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                        {interview.transcript_text || 'No transcript available.'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-3">
                {evidence.roles.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No roles identified in this interview.</p>
                  </div>
                ) : (
                  evidence.roles.map((role) => (
                    <div key={role.id} className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">{role.title}</h4>
                      {role.responsibilities.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Responsibilities</span>
                          <ul className="mt-1 space-y-1">
                            {role.responsibilities.slice(0, 3).map((resp, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-slate-400 mt-1">•</span>
                                {resp}
                              </li>
                            ))}
                            {role.responsibilities.length > 3 && (
                              <li className="text-xs text-slate-400">+{role.responsibilities.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {role.workflows.slice(0, 3).map((wf, idx) => (
                          <Badge key={idx} variant="blue" className="text-xs">{wf}</Badge>
                        ))}
                        {role.tools.slice(0, 3).map((tool, idx) => (
                          <Badge key={idx} variant="green" className="text-xs">{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'workflows' && (
              <div className="space-y-3">
                {evidence.workflows.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No workflows identified in this interview.</p>
                  </div>
                ) : (
                  evidence.workflows.map((workflow) => (
                    <div key={workflow.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{workflow.name}</h4>
                        <Badge variant="gray" className="text-xs capitalize">{workflow.frequency}</Badge>
                      </div>
                      {workflow.steps.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Steps</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {workflow.steps.slice(0, 5).map((step, idx) => (
                              <span key={idx} className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-600">
                                {idx + 1}. {step}
                              </span>
                            ))}
                            {workflow.steps.length > 5 && (
                              <span className="text-xs text-slate-400 self-center">+{workflow.steps.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}
                      {workflow.participants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {workflow.participants.map((p, idx) => (
                            <Badge key={idx} variant="purple" className="text-xs">{p}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'issues' && (
              <div className="space-y-4">
                {totalIssues === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No issues identified in this interview.</p>
                  </div>
                ) : (
                  <>
                    {/* Pain Points */}
                    {evidence.painPoints.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Pain Points ({evidence.painPoints.length})
                        </h5>
                        <div className="space-y-2">
                          {evidence.painPoints.map((pp) => (
                            <div key={pp.id} className={`rounded-lg p-3 border ${
                              pp.severity === 'critical' ? 'bg-red-50 border-red-200' :
                              pp.severity === 'high' ? 'bg-amber-50 border-amber-200' :
                              'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-slate-700">{pp.description}</p>
                                <Badge
                                  variant={pp.severity === 'critical' || pp.severity === 'high' ? 'red' : 'yellow'}
                                  className="text-xs capitalize flex-shrink-0"
                                >
                                  {pp.severity}
                                </Badge>
                              </div>
                              {pp.affectedRoles.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {pp.affectedRoles.map((role, idx) => (
                                    <span key={idx} className="text-xs text-slate-500">
                                      {role}{idx < pp.affectedRoles.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Handoff Risks */}
                    {evidence.handoffRisks.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Handoff Risks ({evidence.handoffRisks.length})
                        </h5>
                        <div className="space-y-2">
                          {evidence.handoffRisks.map((hr) => (
                            <div key={hr.id} className={`rounded-lg p-3 border ${
                              hr.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
                              hr.riskLevel === 'medium' ? 'bg-amber-50 border-amber-200' :
                              'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                                <span>{hr.fromRole}</span>
                                <span className="text-slate-400">→</span>
                                <span>{hr.toRole}</span>
                                <Badge
                                  variant={hr.riskLevel === 'high' ? 'red' : hr.riskLevel === 'medium' ? 'yellow' : 'gray'}
                                  className="text-xs capitalize ml-auto"
                                >
                                  {hr.riskLevel}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600">{hr.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Training Gaps */}
                    {evidence.trainingGaps.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Training Gaps ({evidence.trainingGaps.length})
                        </h5>
                        <div className="space-y-2">
                          {evidence.trainingGaps.map((tg) => (
                            <div key={tg.id} className={`rounded-lg p-3 border ${
                              tg.priority === 'high' ? 'bg-amber-50 border-amber-200' :
                              'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-slate-700">{tg.area}</p>
                                <Badge
                                  variant={tg.priority === 'high' ? 'red' : tg.priority === 'medium' ? 'yellow' : 'gray'}
                                  className="text-xs capitalize flex-shrink-0"
                                >
                                  {tg.priority}
                                </Badge>
                              </div>
                              {tg.affectedRoles.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tg.affectedRoles.map((role, idx) => (
                                    <Badge key={idx} variant="purple" className="text-xs">{role}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
