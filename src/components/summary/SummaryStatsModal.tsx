import { useState } from 'react';
import { X, Plus, Trash2, FileText, TrendingUp, AlertTriangle, Wrench } from 'lucide-react';
import { CompanySummaryData } from '../../types/analysis';

type TabType = 'interviews' | 'workflows' | 'painPoints' | 'tools';

interface SummaryStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CompanySummaryData;
  onUpdate: (updates: Partial<CompanySummaryData>) => Promise<void>;
  linkedInterviews?: Array<{ id: string; title: string }>;
}

export function SummaryStatsModal({
  isOpen,
  onClose,
  data,
  onUpdate,
  linkedInterviews = [],
}: SummaryStatsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('workflows');
  const [isSaving, setIsSaving] = useState(false);

  // Local state for edits
  const [workflows, setWorkflows] = useState(data.topWorkflows || []);
  const [painPoints, setPainPoints] = useState(data.criticalPainPoints || []);
  const [tools, setTools] = useState(data.commonTools || []);

  // New item forms
  const [newWorkflow, setNewWorkflow] = useState({ name: '', frequency: 1 });
  const [newPainPoint, setNewPainPoint] = useState({ description: '', severity: 'high' as 'high' | 'critical' });
  const [newTool, setNewTool] = useState({ name: '' });

  if (!isOpen) return null;

  const tabs: Array<{ id: TabType; label: string; count: number; icon: typeof FileText }> = [
    { id: 'interviews', label: 'Interviews', count: data.totalInterviews, icon: FileText },
    { id: 'workflows', label: 'Workflows', count: workflows.length, icon: TrendingUp },
    { id: 'painPoints', label: 'Pain Points', count: painPoints.length, icon: AlertTriangle },
    { id: 'tools', label: 'Tools', count: tools.length, icon: Wrench },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        topWorkflows: workflows,
        criticalPainPoints: painPoints,
        commonTools: tools,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save stats:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addWorkflow = () => {
    if (!newWorkflow.name.trim()) return;
    setWorkflows([...workflows, { name: newWorkflow.name.trim(), frequency: newWorkflow.frequency, mentions: 1 }]);
    setNewWorkflow({ name: '', frequency: 1 });
  };

  const removeWorkflow = (index: number) => {
    setWorkflows(workflows.filter((_, i) => i !== index));
  };

  const addPainPoint = () => {
    if (!newPainPoint.description.trim()) return;
    setPainPoints([...painPoints, { description: newPainPoint.description.trim(), severity: newPainPoint.severity, affectedCount: 1 }]);
    setNewPainPoint({ description: '', severity: 'high' });
  };

  const removePainPoint = (index: number) => {
    setPainPoints(painPoints.filter((_, i) => i !== index));
  };

  const addTool = () => {
    if (!newTool.name.trim()) return;
    setTools([...tools, { name: newTool.name.trim(), userCount: 1, roles: [] }]);
    setNewTool({ name: '' });
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const frequencyLabels: Record<number, string> = {
    1: 'Daily',
    2: 'Weekly',
    3: 'Monthly',
    4: 'Ad-hoc',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Edit Summary Stats</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Interviews Tab */}
          {activeTab === 'interviews' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 mb-4">
                Interviews are linked at summary generation time and cannot be modified here.
              </p>
              {linkedInterviews.length > 0 ? (
                <div className="space-y-2">
                  {linkedInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{interview.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No interviews linked to this summary</p>
                </div>
              )}
            </div>
          )}

          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-4">
              {workflows.length > 0 ? (
                <div className="space-y-2">
                  {workflows.map((workflow, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group"
                    >
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="flex-1 text-sm text-slate-700">{workflow.name}</span>
                      <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-200 rounded">
                        {frequencyLabels[workflow.frequency] || 'Unknown'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {workflow.mentions} mention{workflow.mentions !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => removeWorkflow(index)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No workflows added yet</p>
                </div>
              )}

              {/* Add workflow form */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="Workflow name..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && addWorkflow()}
                />
                <select
                  value={newWorkflow.frequency}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, frequency: parseInt(e.target.value) })}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={1}>Daily</option>
                  <option value={2}>Weekly</option>
                  <option value={3}>Monthly</option>
                  <option value={4}>Ad-hoc</option>
                </select>
                <button
                  onClick={addWorkflow}
                  disabled={!newWorkflow.name.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Pain Points Tab */}
          {activeTab === 'painPoints' && (
            <div className="space-y-4">
              {painPoints.length > 0 ? (
                <div className="space-y-2">
                  {painPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group"
                    >
                      <AlertTriangle className={`w-4 h-4 ${point.severity === 'critical' ? 'text-red-600' : 'text-amber-500'}`} />
                      <span className="flex-1 text-sm text-slate-700">{point.description}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        point.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {point.severity}
                      </span>
                      <span className="text-xs text-slate-400">
                        {point.affectedCount} affected
                      </span>
                      <button
                        onClick={() => removePainPoint(index)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pain points added yet</p>
                </div>
              )}

              {/* Add pain point form */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={newPainPoint.description}
                  onChange={(e) => setNewPainPoint({ ...newPainPoint, description: e.target.value })}
                  placeholder="Pain point description..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && addPainPoint()}
                />
                <select
                  value={newPainPoint.severity}
                  onChange={(e) => setNewPainPoint({ ...newPainPoint, severity: e.target.value as 'high' | 'critical' })}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <button
                  onClick={addPainPoint}
                  disabled={!newPainPoint.description.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              {tools.length > 0 ? (
                <div className="space-y-2">
                  {tools.map((tool, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group"
                    >
                      <Wrench className="w-4 h-4 text-slate-500" />
                      <span className="flex-1 text-sm text-slate-700">{tool.name}</span>
                      <span className="text-xs text-slate-400">
                        {tool.userCount} user{tool.userCount !== 1 ? 's' : ''}
                      </span>
                      {tool.roles.length > 0 && (
                        <span className="text-xs text-slate-400">
                          ({tool.roles.slice(0, 2).join(', ')}{tool.roles.length > 2 ? '...' : ''})
                        </span>
                      )}
                      <button
                        onClick={() => removeTool(index)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tools added yet</p>
                </div>
              )}

              {/* Add tool form */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={newTool.name}
                  onChange={(e) => setNewTool({ name: e.target.value })}
                  placeholder="Tool name..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && addTool()}
                />
                <button
                  onClick={addTool}
                  disabled={!newTool.name.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
