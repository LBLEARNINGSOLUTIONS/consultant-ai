import { useState, useMemo } from 'react';
import { FileSearch, ChevronDown, ChevronRight, Users, GitBranch, AlertTriangle, Wrench, Search, Info, Eye, EyeOff } from 'lucide-react';
import { Interview } from '../../../types/database';
import { Workflow, PainPoint, Tool, Role, TrainingGap, HandoffRisk } from '../../../types/analysis';
import { EvidenceCard } from './EvidenceCard';

interface EvidenceSectionProps {
  interviews: Interview[];
  onViewInterview?: (interview: Interview) => void;
}

interface AggregatedEvidence {
  totalRoles: number;
  totalWorkflows: number;
  totalIssues: number;
  totalTools: number;
  uniqueRoles: string[];
  uniqueWorkflows: string[];
}

export function EvidenceSection({ interviews, onViewInterview }: EvidenceSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandAll, setExpandAll] = useState(false);
  const [showSection, setShowSection] = useState(false); // Hidden by default

  const completedInterviews = useMemo(() =>
    interviews.filter(i => i.analysis_status === 'completed'),
    [interviews]
  );

  // Aggregate evidence across all interviews
  const aggregatedEvidence = useMemo<AggregatedEvidence>(() => {
    const roleSet = new Set<string>();
    const workflowSet = new Set<string>();
    let totalRoles = 0;
    let totalWorkflows = 0;
    let totalIssues = 0;
    let totalTools = 0;

    completedInterviews.forEach(interview => {
      const roles = (interview.roles as unknown as Role[]) || [];
      const workflows = (interview.workflows as unknown as Workflow[]) || [];
      const painPoints = (interview.pain_points as unknown as PainPoint[]) || [];
      const tools = (interview.tools as unknown as Tool[]) || [];
      const trainingGaps = (interview.training_gaps as unknown as TrainingGap[]) || [];
      const handoffRisks = (interview.handoff_risks as unknown as HandoffRisk[]) || [];

      roles.forEach(r => roleSet.add(r.title));
      workflows.forEach(w => workflowSet.add(w.name));

      totalRoles += roles.length;
      totalWorkflows += workflows.length;
      totalTools += tools.length;
      totalIssues += painPoints.length + trainingGaps.length + handoffRisks.length;
    });

    return {
      totalRoles,
      totalWorkflows,
      totalIssues,
      totalTools,
      uniqueRoles: Array.from(roleSet),
      uniqueWorkflows: Array.from(workflowSet),
    };
  }, [completedInterviews]);

  // Filter interviews by search
  const filteredInterviews = useMemo(() => {
    if (!searchQuery.trim()) return completedInterviews;

    const query = searchQuery.toLowerCase();
    return completedInterviews.filter(interview => {
      // Search in title
      if (interview.title.toLowerCase().includes(query)) return true;

      // Search in roles
      const roles = (interview.roles as unknown as Role[]) || [];
      if (roles.some(r => r.title.toLowerCase().includes(query))) return true;

      // Search in workflows
      const workflows = (interview.workflows as unknown as Workflow[]) || [];
      if (workflows.some(w => w.name.toLowerCase().includes(query))) return true;

      // Search in transcript
      if (interview.transcript_text?.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [completedInterviews, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <FileSearch className="w-6 h-6 text-slate-600" />
          Supporting Evidence
        </h2>
        <p className="text-slate-600">
          Source data from {completedInterviews.length} interview{completedInterviews.length !== 1 ? 's' : ''} supporting this analysis.
        </p>
      </div>

      {/* Info Banner - Collapsed by default */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Transparency Layer</p>
            <p className="text-sm text-blue-700 mt-1">
              This section provides access to the underlying interview data and transcripts.
              It's designed for detailed review when needed, not required for executive-level understanding.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{aggregatedEvidence.uniqueRoles.length}</div>
            <div className="text-xs text-slate-500">Unique Roles</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{aggregatedEvidence.uniqueWorkflows.length}</div>
            <div className="text-xs text-slate-500">Unique Workflows</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-2">
              <Wrench className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{aggregatedEvidence.totalTools}</div>
            <div className="text-xs text-slate-500">Tools Identified</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{aggregatedEvidence.totalIssues}</div>
            <div className="text-xs text-slate-500">Issues Found</div>
          </div>
        </div>
      </div>

      {/* Interview List Section - Collapsed by default */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Section Toggle Header */}
        <button
          onClick={() => setShowSection(!showSection)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {showSection ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
            <span className="font-semibold text-slate-900">Interview Details</span>
            <span className="text-sm text-slate-500">({completedInterviews.length} interviews)</span>
          </div>
          <div className="flex items-center gap-2">
            {showSection ? (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5" /> Hide details
              </span>
            ) : (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Show details
              </span>
            )}
          </div>
        </button>

        {/* Expandable Content */}
        {showSection && (
          <div className="border-t border-slate-100">
            {/* Search and Controls */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search interviews, roles, workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Expand/Collapse All */}
              <button
                onClick={() => setExpandAll(!expandAll)}
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                {expandAll ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Expand All
                  </>
                )}
              </button>
            </div>

            {/* Interview List */}
            <div className="p-4 space-y-3">
              {filteredInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <FileSearch className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  {searchQuery ? (
                    <>
                      <p className="text-slate-500">No interviews match your search.</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                      >
                        Clear search
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-500">No interviews available.</p>
                      <p className="text-sm text-slate-400 mt-1">The source interviews may have been deleted.</p>
                    </>
                  )}
                </div>
              ) : (
                filteredInterviews.map((interview) => (
                  <EvidenceCard
                    key={interview.id}
                    interview={interview}
                    onViewAnalysis={onViewInterview ? () => onViewInterview(interview) : undefined}
                    defaultExpanded={expandAll}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Access - Roles and Workflows mentioned */}
      {!showSection && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Unique Roles */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Roles Identified ({aggregatedEvidence.uniqueRoles.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {aggregatedEvidence.uniqueRoles.slice(0, 10).map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-md"
                >
                  {role}
                </span>
              ))}
              {aggregatedEvidence.uniqueRoles.length > 10 && (
                <span className="px-2 py-1 text-xs text-slate-500">
                  +{aggregatedEvidence.uniqueRoles.length - 10} more
                </span>
              )}
            </div>
          </div>

          {/* Unique Workflows */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-600" />
              Workflows Documented ({aggregatedEvidence.uniqueWorkflows.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {aggregatedEvidence.uniqueWorkflows.slice(0, 10).map((workflow, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                >
                  {workflow}
                </span>
              ))}
              {aggregatedEvidence.uniqueWorkflows.length > 10 && (
                <span className="px-2 py-1 text-xs text-slate-500">
                  +{aggregatedEvidence.uniqueWorkflows.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
