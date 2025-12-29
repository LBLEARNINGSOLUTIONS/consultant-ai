import { useState } from 'react';
import { CompanySummaryData } from '../../types/analysis';
import { CompanySummary, Interview, Json } from '../../types/database';
import { Badge } from '../analysis/Badge';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Users,
  GraduationCap,
  GitMerge,
  Lightbulb,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  PieChart,
  FileText,
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatters';
import { generateCompanySummaryPDF, downloadPDF } from '../../services/pdfService';
import { useToast } from '../../contexts/ToastContext';
import { useAnalyticsDashboard } from '../../hooks/useAnalyticsDashboard';
import { PainPointsChart } from '../dashboard/PainPointsChart';
import { WorkflowsChart } from '../dashboard/WorkflowsChart';
import { TrainingGapsPanel } from '../dashboard/TrainingGapsPanel';
import { HandoffRisksPanel } from '../dashboard/HandoffRisksPanel';
import { ToolUsageGrid } from '../dashboard/ToolUsageGrid';
import { DashboardOverview } from '../dashboard/DashboardOverview';

interface CompanySummaryViewProps {
  summary: CompanySummary;
  interviews: Interview[];
  onBack: () => void;
  onUpdate?: (id: string, updates: { summary_data?: Json }) => Promise<{ error: string | null }>;
}

type RecommendationPriority = 'high' | 'medium' | 'low';

export function CompanySummaryView({ summary, interviews, onBack, onUpdate }: CompanySummaryViewProps) {
  const data = summary.summary_data as any as CompanySummaryData;
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'analytics'>('summary');
  const { addToast } = useToast();

  // Analytics data from interviews
  const { metrics } = useAnalyticsDashboard(interviews);

  // Editable section states
  const [workflows, setWorkflows] = useState(data.topWorkflows || []);
  const [painPoints, setPainPoints] = useState(data.criticalPainPoints || []);
  const [tools, setTools] = useState(data.commonTools || []);
  const [trainingGaps, setTrainingGaps] = useState(data.priorityTrainingGaps || []);
  const [handoffs, setHandoffs] = useState(data.highRiskHandoffs || []);
  const [recommendations, setRecommendations] = useState(data.recommendations || []);

  // Editing states for each section
  const [editingWorkflowIdx, setEditingWorkflowIdx] = useState<number | null>(null);
  const [editingPainPointIdx, setEditingPainPointIdx] = useState<number | null>(null);
  const [editingToolIdx, setEditingToolIdx] = useState<number | null>(null);
  const [editingTrainingGapIdx, setEditingTrainingGapIdx] = useState<number | null>(null);
  const [editingHandoffIdx, setEditingHandoffIdx] = useState<number | null>(null);

  // Adding states
  const [isAddingWorkflow, setIsAddingWorkflow] = useState(false);
  const [isAddingPainPoint, setIsAddingPainPoint] = useState(false);
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [isAddingTrainingGap, setIsAddingTrainingGap] = useState(false);
  const [isAddingHandoff, setIsAddingHandoff] = useState(false);
  const [isAddingRec, setIsAddingRec] = useState(false);

  // Form states
  const [newRecText, setNewRecText] = useState('');
  const [newRecPriority, setNewRecPriority] = useState<RecommendationPriority>('medium');
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [editingRecText, setEditingRecText] = useState('');
  const [editingRecPriority, setEditingRecPriority] = useState<RecommendationPriority>('medium');

  // Generic save function for any section
  const saveSection = async <T,>(
    sectionKey: keyof CompanySummaryData,
    newData: T[],
    setLocalState: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (!onUpdate) return;

    const updatedData = { ...data, [sectionKey]: newData };
    const { error } = await onUpdate(summary.id, { summary_data: updatedData as unknown as Json });

    if (error) {
      addToast('Failed to save changes', 'error');
    } else {
      setLocalState(newData);
      addToast('Changes saved', 'success');
    }
  };

  const saveRecommendations = async (newRecs: typeof recommendations) => {
    if (!onUpdate) return;

    const updatedData = { ...data, recommendations: newRecs };
    const { error } = await onUpdate(summary.id, { summary_data: updatedData as unknown as Json });

    if (error) {
      addToast('Failed to save recommendations', 'error');
    } else {
      setRecommendations(newRecs);
      addToast('Recommendations saved', 'success');
    }
  };

  const handleAddRecommendation = async () => {
    if (!newRecText.trim()) return;

    const newRec = {
      id: `rec-${Date.now()}`,
      text: newRecText.trim(),
      priority: newRecPriority,
    };

    await saveRecommendations([...recommendations, newRec]);
    setNewRecText('');
    setNewRecPriority('medium');
    setIsAddingRec(false);
  };

  const handleEditRecommendation = async (id: string) => {
    if (!editingRecText.trim()) return;

    const updated = recommendations.map(rec =>
      rec.id === id ? { ...rec, text: editingRecText.trim(), priority: editingRecPriority } : rec
    );

    await saveRecommendations(updated);
    setEditingRecId(null);
    setEditingRecText('');
  };

  const handleDeleteRecommendation = async (id: string) => {
    const updated = recommendations.filter(rec => rec.id !== id);
    await saveRecommendations(updated);
  };

  const startEditing = (rec: { id: string; text: string; priority: RecommendationPriority }) => {
    setEditingRecId(rec.id);
    setEditingRecText(rec.text);
    setEditingRecPriority(rec.priority);
  };

  const priorityColors = {
    high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/\s+/g, '_')}_summary.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const blob = await generateCompanySummaryPDF(summary);
      const filename = `${summary.title.replace(/\s+/g, '_')}_summary.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-indigo-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Interviews
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{summary.title}</h1>
              <p className="text-indigo-100">
                Generated {formatDate(summary.created_at)} • {data.totalInterviews} interviews analyzed
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExportingPDF ? 'Generating...' : 'PDF'}
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Executive Summary
          </h2>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Interviews</p>
              <p className="text-2xl font-bold text-slate-900">{data.totalInterviews}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Workflows</p>
              <p className="text-2xl font-bold text-blue-600">{data.topWorkflows.length}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{data.criticalPainPoints.length}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Tools</p>
              <p className="text-2xl font-bold text-indigo-600">{data.commonTools.length}</p>
            </div>
          </div>

          {/* Critical Findings */}
          {data.criticalPainPoints.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Critical Findings
              </h3>
              <ul className="space-y-1">
                {data.criticalPainPoints.slice(0, 3).map((pp, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{pp.description}</span>
                  </li>
                ))}
                {data.criticalPainPoints.length > 3 && (
                  <li className="text-sm text-slate-500 italic ml-4">
                    +{data.criticalPainPoints.length - 3} more critical issues
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* High-Risk Handoffs */}
          {data.highRiskHandoffs.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-orange-500" />
                High-Risk Handoffs
              </h3>
              <p className="text-sm text-slate-600">
                {data.highRiskHandoffs.length} high-risk handoff{data.highRiskHandoffs.length !== 1 ? 's' : ''} identified between roles
              </p>
            </div>
          )}

          {/* Top Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                Top Recommendations
              </h3>
              <ul className="space-y-1">
                {recommendations
                  .filter(r => r.priority === 'high')
                  .slice(0, 3)
                  .map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{rec.text}</span>
                    </li>
                  ))}
                {recommendations.filter(r => r.priority === 'high').length === 0 && (
                  <li className="text-sm text-slate-500 italic">
                    No high-priority recommendations yet
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <div className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'summary'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Summary
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {interviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <PieChart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No interview data available for analytics.</p>
                <p className="text-sm text-slate-400 mt-1">
                  The original interviews may have been deleted.
                </p>
              </div>
            ) : (
              <>
                {/* Overview Stats */}
                <DashboardOverview
                  totalInterviews={metrics.totalInterviews}
                  completedInterviews={metrics.completedInterviews}
                  totalWorkflows={metrics.totalWorkflows}
                  totalPainPoints={metrics.totalPainPoints}
                  totalTools={metrics.totalTools}
                  totalRoles={metrics.totalRoles}
                  criticalPainPoints={metrics.criticalPainPoints}
                  highRiskHandoffs={metrics.highRiskHandoffs}
                />

                {/* Pain Points Charts */}
                <PainPointsChart
                  bySeverity={metrics.painPointsBySeverity}
                  byCategory={metrics.painPointsByCategory}
                />

                {/* Top Workflows */}
                <WorkflowsChart workflows={metrics.workflows} />

                {/* Training Gaps & Handoff Risks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrainingGapsPanel trainingGaps={metrics.trainingGaps} />
                  <HandoffRisksPanel handoffRisks={metrics.handoffRisks} />
                </div>

                {/* Tool Usage Grid */}
                <ToolUsageGrid tools={metrics.tools} />
              </>
            )}
          </div>
        )}

        {/* Summary Tab Content */}
        {activeTab === 'summary' && (
          <>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Workflows</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.topWorkflows.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Critical Issues</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.criticalPainPoints.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Wrench className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Tools</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.commonTools.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Roles</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {Object.keys(data.roleDistribution).length}
            </p>
          </div>
        </div>

        {/* Top Workflows */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top Workflows
            </h2>
            {onUpdate && !isAddingWorkflow && (
              <button
                onClick={() => setIsAddingWorkflow(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Workflow
              </button>
            )}
          </div>

          {/* Add new workflow form */}
          {isAddingWorkflow && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Workflow name"
                  id="new-workflow-name"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Mentions"
                  id="new-workflow-mentions"
                  defaultValue={1}
                  min={1}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingWorkflow(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const nameInput = document.getElementById('new-workflow-name') as HTMLInputElement;
                    const mentionsInput = document.getElementById('new-workflow-mentions') as HTMLInputElement;
                    if (nameInput?.value.trim()) {
                      const newWorkflow = {
                        name: nameInput.value.trim(),
                        frequency: 1,
                        mentions: parseInt(mentionsInput?.value) || 1,
                      };
                      saveSection('topWorkflows', [...workflows, newWorkflow], setWorkflows);
                      setIsAddingWorkflow(false);
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {workflows.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No workflows yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow, idx) => (
                <div key={idx} className="group">
                  {editingWorkflowIdx === idx ? (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          defaultValue={workflow.name}
                          id={`edit-workflow-name-${idx}`}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          defaultValue={workflow.mentions}
                          id={`edit-workflow-mentions-${idx}`}
                          min={1}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingWorkflowIdx(null)}
                          className="p-1.5 text-slate-500 hover:bg-white rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const nameInput = document.getElementById(`edit-workflow-name-${idx}`) as HTMLInputElement;
                            const mentionsInput = document.getElementById(`edit-workflow-mentions-${idx}`) as HTMLInputElement;
                            const updated = workflows.map((w, i) =>
                              i === idx
                                ? { ...w, name: nameInput.value.trim(), mentions: parseInt(mentionsInput.value) || 1 }
                                : w
                            );
                            saveSection('topWorkflows', updated, setWorkflows);
                            setEditingWorkflowIdx(null);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-white rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-900">{workflow.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="blue">{workflow.mentions} mentions</Badge>
                        {onUpdate && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingWorkflowIdx(idx)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const updated = workflows.filter((_, i) => i !== idx);
                                saveSection('topWorkflows', updated, setWorkflows);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Critical Pain Points */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Critical Pain Points
            </h2>
            {onUpdate && !isAddingPainPoint && (
              <button
                onClick={() => setIsAddingPainPoint(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Pain Point
              </button>
            )}
          </div>

          {/* Add new pain point form */}
          {isAddingPainPoint && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="space-y-3 mb-3">
                <textarea
                  placeholder="Description of the pain point"
                  id="new-painpoint-desc"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    id="new-painpoint-severity"
                    defaultValue="high"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Affected count"
                    id="new-painpoint-count"
                    defaultValue={1}
                    min={1}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingPainPoint(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const descInput = document.getElementById('new-painpoint-desc') as HTMLTextAreaElement;
                    const severityInput = document.getElementById('new-painpoint-severity') as HTMLSelectElement;
                    const countInput = document.getElementById('new-painpoint-count') as HTMLInputElement;
                    if (descInput?.value.trim()) {
                      const newPainPoint = {
                        description: descInput.value.trim(),
                        severity: severityInput.value as 'high' | 'critical',
                        affectedCount: parseInt(countInput?.value) || 1,
                      };
                      saveSection('criticalPainPoints', [...painPoints, newPainPoint], setPainPoints);
                      setIsAddingPainPoint(false);
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {painPoints.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No pain points yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {painPoints.map((painPoint, idx) => (
                <div key={idx} className="group">
                  {editingPainPointIdx === idx ? (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="space-y-3 mb-3">
                        <textarea
                          defaultValue={painPoint.description}
                          id={`edit-painpoint-desc-${idx}`}
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            id={`edit-painpoint-severity-${idx}`}
                            defaultValue={painPoint.severity}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                          <input
                            type="number"
                            defaultValue={painPoint.affectedCount}
                            id={`edit-painpoint-count-${idx}`}
                            min={1}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingPainPointIdx(null)} className="p-1.5 text-slate-500 hover:bg-white rounded">
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const descInput = document.getElementById(`edit-painpoint-desc-${idx}`) as HTMLTextAreaElement;
                            const severityInput = document.getElementById(`edit-painpoint-severity-${idx}`) as HTMLSelectElement;
                            const countInput = document.getElementById(`edit-painpoint-count-${idx}`) as HTMLInputElement;
                            const updated = painPoints.map((pp, i) =>
                              i === idx
                                ? { ...pp, description: descInput.value.trim(), severity: severityInput.value as 'high' | 'critical', affectedCount: parseInt(countInput.value) || 1 }
                                : pp
                            );
                            saveSection('criticalPainPoints', updated, setPainPoints);
                            setEditingPainPointIdx(null);
                          }}
                          className="p-1.5 text-red-600 hover:bg-white rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg border-l-4 ${painPoint.severity === 'critical' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'}`}>
                      <div className="flex items-start justify-between">
                        <p className="text-slate-900 font-medium flex-1">{painPoint.description}</p>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={painPoint.severity === 'critical' ? 'red' : 'yellow'}>{painPoint.severity}</Badge>
                          <Badge variant="gray">{painPoint.affectedCount} affected</Badge>
                          {onUpdate && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingPainPointIdx(idx)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const updated = painPoints.filter((_, i) => i !== idx);
                                  saveSection('criticalPainPoints', updated, setPainPoints);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Common Tools */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              Common Tools & Software
            </h2>
            {onUpdate && !isAddingTool && (
              <button
                onClick={() => setIsAddingTool(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Tool
              </button>
            )}
          </div>

          {/* Add new tool form */}
          {isAddingTool && (
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="space-y-3 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tool name"
                    id="new-tool-name"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="User count"
                    id="new-tool-usercount"
                    defaultValue={1}
                    min={1}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Roles (comma-separated)"
                  id="new-tool-roles"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddingTool(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button
                  onClick={() => {
                    const nameInput = document.getElementById('new-tool-name') as HTMLInputElement;
                    const userCountInput = document.getElementById('new-tool-usercount') as HTMLInputElement;
                    const rolesInput = document.getElementById('new-tool-roles') as HTMLInputElement;
                    if (nameInput?.value.trim()) {
                      const newTool = {
                        name: nameInput.value.trim(),
                        userCount: parseInt(userCountInput?.value) || 1,
                        roles: rolesInput?.value.split(',').map(r => r.trim()).filter(Boolean) || [],
                      };
                      saveSection('commonTools', [...tools, newTool], setTools);
                      setIsAddingTool(false);
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {tools.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No tools yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((tool, idx) => (
                <div key={idx} className="group">
                  {editingToolIdx === idx ? (
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="space-y-3 mb-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" defaultValue={tool.name} id={`edit-tool-name-${idx}`} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          <input type="number" defaultValue={tool.userCount} id={`edit-tool-usercount-${idx}`} min={1} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <input type="text" defaultValue={tool.roles.join(', ')} id={`edit-tool-roles-${idx}`} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingToolIdx(null)} className="p-1.5 text-slate-500 hover:bg-white rounded"><X className="w-4 h-4" /></button>
                        <button
                          onClick={() => {
                            const nameInput = document.getElementById(`edit-tool-name-${idx}`) as HTMLInputElement;
                            const userCountInput = document.getElementById(`edit-tool-usercount-${idx}`) as HTMLInputElement;
                            const rolesInput = document.getElementById(`edit-tool-roles-${idx}`) as HTMLInputElement;
                            const updated = tools.map((t, i) =>
                              i === idx ? { ...t, name: nameInput.value.trim(), userCount: parseInt(userCountInput.value) || 1, roles: rolesInput.value.split(',').map(r => r.trim()).filter(Boolean) } : t
                            );
                            saveSection('commonTools', updated, setTools);
                            setEditingToolIdx(null);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-white rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-lg relative">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="indigo">{tool.userCount} users</Badge>
                          {onUpdate && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingToolIdx(idx)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => { saveSection('commonTools', tools.filter((_, i) => i !== idx), setTools); }} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tool.roles.slice(0, 5).map((role, roleIdx) => (
                          <Badge key={roleIdx} variant="purple" className="text-xs">{role}</Badge>
                        ))}
                        {tool.roles.length > 5 && <Badge variant="gray" className="text-xs">+{tool.roles.length - 5} more</Badge>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Distribution */}
        {Object.keys(data.roleDistribution).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Role Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(data.roleDistribution)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([role, count]) => (
                  <div key={role} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-semibold text-purple-900">{role}</p>
                    <p className="text-2xl font-bold text-purple-600">{count as number}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Training Gaps */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              Priority Training Gaps
            </h2>
            {onUpdate && !isAddingTrainingGap && (
              <button
                onClick={() => setIsAddingTrainingGap(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Training Gap
              </button>
            )}
          </div>

          {/* Add new training gap form */}
          {isAddingTrainingGap && (
            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="space-y-3 mb-3">
                <input
                  type="text"
                  placeholder="Training area"
                  id="new-traininggap-area"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Affected roles (comma-separated)"
                    id="new-traininggap-roles"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="number"
                    placeholder="Frequency"
                    id="new-traininggap-frequency"
                    defaultValue={1}
                    min={1}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddingTrainingGap(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button
                  onClick={() => {
                    const areaInput = document.getElementById('new-traininggap-area') as HTMLInputElement;
                    const rolesInput = document.getElementById('new-traininggap-roles') as HTMLInputElement;
                    const frequencyInput = document.getElementById('new-traininggap-frequency') as HTMLInputElement;
                    if (areaInput?.value.trim()) {
                      const newGap = {
                        area: areaInput.value.trim(),
                        affectedRoles: rolesInput?.value.split(',').map(r => r.trim()).filter(Boolean) || [],
                        frequency: parseInt(frequencyInput?.value) || 1,
                      };
                      saveSection('priorityTrainingGaps', [...trainingGaps, newGap], setTrainingGaps);
                      setIsAddingTrainingGap(false);
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {trainingGaps.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No training gaps yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trainingGaps.slice(0, 10).map((gap, idx) => (
                <div key={idx} className="group">
                  {editingTrainingGapIdx === idx ? (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="space-y-3 mb-3">
                        <input
                          type="text"
                          defaultValue={gap.area}
                          id={`edit-traininggap-area-${idx}`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            defaultValue={gap.affectedRoles.join(', ')}
                            id={`edit-traininggap-roles-${idx}`}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <input
                            type="number"
                            defaultValue={gap.frequency}
                            id={`edit-traininggap-frequency-${idx}`}
                            min={1}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingTrainingGapIdx(null)} className="p-1.5 text-slate-500 hover:bg-white rounded"><X className="w-4 h-4" /></button>
                        <button
                          onClick={() => {
                            const areaInput = document.getElementById(`edit-traininggap-area-${idx}`) as HTMLInputElement;
                            const rolesInput = document.getElementById(`edit-traininggap-roles-${idx}`) as HTMLInputElement;
                            const frequencyInput = document.getElementById(`edit-traininggap-frequency-${idx}`) as HTMLInputElement;
                            const updated = trainingGaps.map((g, i) =>
                              i === idx ? { ...g, area: areaInput.value.trim(), affectedRoles: rolesInput.value.split(',').map(r => r.trim()).filter(Boolean), frequency: parseInt(frequencyInput.value) || 1 } : g
                            );
                            saveSection('priorityTrainingGaps', updated, setTrainingGaps);
                            setEditingTrainingGapIdx(null);
                          }}
                          className="p-1.5 text-amber-600 hover:bg-white rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{gap.area}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="red">{gap.frequency} mentions</Badge>
                          {onUpdate && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingTrainingGapIdx(idx)} className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => { saveSection('priorityTrainingGaps', trainingGaps.filter((_, i) => i !== idx), setTrainingGaps); }} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {gap.affectedRoles.map((role, roleIdx) => (
                          <Badge key={roleIdx} variant="yellow" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High-Risk Handoffs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-orange-600" />
              High-Risk Handoffs
            </h2>
            {onUpdate && !isAddingHandoff && (
              <button
                onClick={() => setIsAddingHandoff(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Handoff
              </button>
            )}
          </div>

          {/* Add new handoff form */}
          {isAddingHandoff && (
            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="space-y-3 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="From role"
                    id="new-handoff-from"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="To role"
                    id="new-handoff-to"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Process description"
                  id="new-handoff-process"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="number"
                  placeholder="Occurrences"
                  id="new-handoff-occurrences"
                  defaultValue={1}
                  min={1}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddingHandoff(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button
                  onClick={() => {
                    const fromInput = document.getElementById('new-handoff-from') as HTMLInputElement;
                    const toInput = document.getElementById('new-handoff-to') as HTMLInputElement;
                    const processInput = document.getElementById('new-handoff-process') as HTMLInputElement;
                    const occurrencesInput = document.getElementById('new-handoff-occurrences') as HTMLInputElement;
                    if (fromInput?.value.trim() && toInput?.value.trim()) {
                      const newHandoff = {
                        fromRole: fromInput.value.trim(),
                        toRole: toInput.value.trim(),
                        process: processInput?.value.trim() || '',
                        occurrences: parseInt(occurrencesInput?.value) || 1,
                      };
                      saveSection('highRiskHandoffs', [...handoffs, newHandoff], setHandoffs);
                      setIsAddingHandoff(false);
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {handoffs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <GitMerge className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No handoffs yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {handoffs.slice(0, 10).map((handoff, idx) => (
                <div key={idx} className="group">
                  {editingHandoffIdx === idx ? (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="space-y-3 mb-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            defaultValue={handoff.fromRole}
                            id={`edit-handoff-from-${idx}`}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <input
                            type="text"
                            defaultValue={handoff.toRole}
                            id={`edit-handoff-to-${idx}`}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <input
                          type="text"
                          defaultValue={handoff.process}
                          id={`edit-handoff-process-${idx}`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          defaultValue={handoff.occurrences}
                          id={`edit-handoff-occurrences-${idx}`}
                          min={1}
                          className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingHandoffIdx(null)} className="p-1.5 text-slate-500 hover:bg-white rounded"><X className="w-4 h-4" /></button>
                        <button
                          onClick={() => {
                            const fromInput = document.getElementById(`edit-handoff-from-${idx}`) as HTMLInputElement;
                            const toInput = document.getElementById(`edit-handoff-to-${idx}`) as HTMLInputElement;
                            const processInput = document.getElementById(`edit-handoff-process-${idx}`) as HTMLInputElement;
                            const occurrencesInput = document.getElementById(`edit-handoff-occurrences-${idx}`) as HTMLInputElement;
                            const updated = handoffs.map((h, i) =>
                              i === idx ? { ...h, fromRole: fromInput.value.trim(), toRole: toInput.value.trim(), process: processInput.value.trim(), occurrences: parseInt(occurrencesInput.value) || 1 } : h
                            );
                            saveSection('highRiskHandoffs', updated, setHandoffs);
                            setEditingHandoffIdx(null);
                          }}
                          className="p-1.5 text-orange-600 hover:bg-white rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{handoff.fromRole}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold text-slate-900">{handoff.toRole}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="red">{handoff.occurrences} occurrences</Badge>
                          {onUpdate && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingHandoffIdx(idx)} className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-100 rounded"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => { saveSection('highRiskHandoffs', handoffs.filter((_, i) => i !== idx), setHandoffs); }} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{handoff.process}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
              Recommendations
            </h2>
            {onUpdate && !isAddingRec && (
              <button
                onClick={() => setIsAddingRec(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Recommendation
              </button>
            )}
          </div>

          {/* Add new recommendation form */}
          {isAddingRec && (
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <textarea
                value={newRecText}
                onChange={(e) => setNewRecText(e.target.value)}
                placeholder="Enter your recommendation..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Priority:</span>
                  <select
                    value={newRecPriority}
                    onChange={(e) => setNewRecPriority(e.target.value as RecommendationPriority)}
                    className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsAddingRec(false);
                      setNewRecText('');
                      setNewRecPriority('medium');
                    }}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddRecommendation}
                    disabled={!newRecText.trim()}
                    className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations list */}
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No recommendations yet.</p>
              {onUpdate && (
                <p className="text-sm mt-1">Add your first recommendation to get started.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => {
                const colors = priorityColors[rec.priority];
                const isEditing = editingRecId === rec.id;

                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                  >
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editingRecText}
                          onChange={(e) => setEditingRecText(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Priority:</span>
                            <select
                              value={editingRecPriority}
                              onChange={(e) => setEditingRecPriority(e.target.value as RecommendationPriority)}
                              className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingRecId(null);
                                setEditingRecText('');
                              }}
                              className="p-1.5 text-slate-500 hover:bg-white/50 rounded transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditRecommendation(rec.id)}
                              className="p-1.5 text-emerald-600 hover:bg-white/50 rounded transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-slate-900">{rec.text}</p>
                          <Badge
                            variant={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}
                            className="mt-2"
                          >
                            {rec.priority} priority
                          </Badge>
                        </div>
                        {onUpdate && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditing(rec)}
                              className={`p-1.5 ${colors.text} hover:bg-white/50 rounded transition-colors`}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecommendation(rec.id)}
                              className="p-1.5 text-red-500 hover:bg-white/50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
