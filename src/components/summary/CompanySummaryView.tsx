import { useState } from 'react';
import { CompanySummaryData } from '../../types/analysis';
import { CompanySummary, Json } from '../../types/database';
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
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatters';
import { generateCompanySummaryPDF, downloadPDF } from '../../services/pdfService';
import { useToast } from '../../contexts/ToastContext';

interface CompanySummaryViewProps {
  summary: CompanySummary;
  onBack: () => void;
  onUpdate?: (id: string, updates: { summary_data?: Json }) => Promise<{ error: string | null }>;
}

type RecommendationPriority = 'high' | 'medium' | 'low';

export function CompanySummaryView({ summary, onBack, onUpdate }: CompanySummaryViewProps) {
  const data = summary.summary_data as any as CompanySummaryData;
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const { addToast } = useToast();

  // Recommendations state
  const [recommendations, setRecommendations] = useState(data.recommendations || []);
  const [isAddingRec, setIsAddingRec] = useState(false);
  const [newRecText, setNewRecText] = useState('');
  const [newRecPriority, setNewRecPriority] = useState<RecommendationPriority>('medium');
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [editingRecText, setEditingRecText] = useState('');
  const [editingRecPriority, setEditingRecPriority] = useState<RecommendationPriority>('medium');

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
        {data.topWorkflows.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top Workflows
            </h2>
            <div className="space-y-3">
              {data.topWorkflows.slice(0, 10).map((workflow, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-900">{workflow.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="blue">{workflow.mentions} mentions</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Pain Points */}
        {data.criticalPainPoints.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Critical Pain Points
            </h2>
            <div className="space-y-3">
              {data.criticalPainPoints.slice(0, 10).map((painPoint, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    painPoint.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-orange-50 border-orange-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-slate-900 font-medium flex-1">{painPoint.description}</p>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={painPoint.severity === 'critical' ? 'red' : 'yellow'}>
                        {painPoint.severity}
                      </Badge>
                      <Badge variant="gray">{painPoint.affectedCount} affected</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Tools */}
        {data.commonTools.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              Common Tools & Software
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.commonTools.slice(0, 10).map((tool, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                    <Badge variant="indigo">{tool.userCount} users</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.roles.slice(0, 5).map((role, roleIdx) => (
                      <Badge key={roleIdx} variant="purple" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                    {tool.roles.length > 5 && (
                      <Badge variant="gray" className="text-xs">
                        +{tool.roles.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
        {data.priorityTrainingGaps.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              Priority Training Gaps
            </h2>
            <div className="space-y-3">
              {data.priorityTrainingGaps.slice(0, 10).map((gap, idx) => (
                <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{gap.area}</h3>
                    <Badge variant="red">{gap.frequency} mentions</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {gap.affectedRoles.map((role, roleIdx) => (
                      <Badge key={roleIdx} variant="yellow" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High-Risk Handoffs */}
        {data.highRiskHandoffs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-orange-600" />
              High-Risk Handoffs
            </h2>
            <div className="space-y-3">
              {data.highRiskHandoffs.slice(0, 10).map((handoff, idx) => (
                <div key={idx} className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{handoff.fromRole}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-slate-900">{handoff.toRole}</span>
                    </div>
                    <Badge variant="red">{handoff.occurrences} occurrences</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{handoff.process}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
