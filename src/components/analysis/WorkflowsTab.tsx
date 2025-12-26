import { useState } from 'react';
import { Workflow, HandoffRisk } from '../../types/analysis';
import { Badge } from './Badge';
import { EditableField } from './EditableField';
import { ArrayFieldEditor } from './ArrayFieldEditor';
import { SelectField, frequencyOptions, riskLevelOptions } from './SelectField';
import { Users, Clock, AlertTriangle, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { nanoid } from 'nanoid';

interface WorkflowsTabProps {
  workflows: Workflow[];
  handoffRisks: HandoffRisk[];
  onUpdateWorkflows: (workflows: Workflow[]) => void;
  onUpdateHandoffRisks?: (handoffRisks: HandoffRisk[]) => void;
}

const emptyWorkflow: Omit<Workflow, 'id'> = {
  name: '',
  steps: [],
  frequency: 'weekly',
  participants: [],
  duration: '',
  notes: '',
};

const emptyHandoffRisk: Omit<HandoffRisk, 'id'> = {
  fromRole: '',
  toRole: '',
  process: '',
  riskLevel: 'medium',
  description: '',
  mitigation: '',
};

export function WorkflowsTab({
  workflows,
  handoffRisks,
  onUpdateWorkflows,
  onUpdateHandoffRisks,
}: WorkflowsTabProps) {
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [editWorkflow, setEditWorkflow] = useState<Workflow | null>(null);
  const [editRisk, setEditRisk] = useState<HandoffRisk | null>(null);
  const [isAddingWorkflow, setIsAddingWorkflow] = useState(false);
  const [isAddingRisk, setIsAddingRisk] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<Omit<Workflow, 'id'>>(emptyWorkflow);
  const [newRisk, setNewRisk] = useState<Omit<HandoffRisk, 'id'>>(emptyHandoffRisk);

  const frequencyColors: Record<string, 'blue' | 'green' | 'yellow' | 'purple'> = {
    daily: 'blue',
    weekly: 'green',
    monthly: 'yellow',
    'ad-hoc': 'purple',
  };

  // Workflow handlers
  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflowId(workflow.id);
    setEditWorkflow({ ...workflow });
  };

  const handleSaveWorkflow = () => {
    if (editWorkflow) {
      const updated = workflows.map((w) => (w.id === editWorkflow.id ? editWorkflow : w));
      onUpdateWorkflows(updated);
      setEditingWorkflowId(null);
      setEditWorkflow(null);
    }
  };

  const handleCancelEditWorkflow = () => {
    setEditingWorkflowId(null);
    setEditWorkflow(null);
  };

  const handleDeleteWorkflow = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      onUpdateWorkflows(workflows.filter((w) => w.id !== id));
    }
  };

  const handleAddWorkflow = () => {
    if (newWorkflow.name.trim()) {
      const workflow: Workflow = { ...newWorkflow, id: nanoid() };
      onUpdateWorkflows([...workflows, workflow]);
      setNewWorkflow(emptyWorkflow);
      setIsAddingWorkflow(false);
    }
  };

  // Handoff Risk handlers
  const handleEditRisk = (risk: HandoffRisk) => {
    setEditingRiskId(risk.id);
    setEditRisk({ ...risk });
  };

  const handleSaveRisk = () => {
    if (editRisk && onUpdateHandoffRisks) {
      const updated = handoffRisks.map((r) => (r.id === editRisk.id ? editRisk : r));
      onUpdateHandoffRisks(updated);
      setEditingRiskId(null);
      setEditRisk(null);
    }
  };

  const handleCancelEditRisk = () => {
    setEditingRiskId(null);
    setEditRisk(null);
  };

  const handleDeleteRisk = (id: string) => {
    if (window.confirm('Are you sure you want to delete this handoff risk?') && onUpdateHandoffRisks) {
      onUpdateHandoffRisks(handoffRisks.filter((r) => r.id !== id));
    }
  };

  const handleAddRisk = () => {
    if (newRisk.fromRole.trim() && newRisk.toRole.trim() && onUpdateHandoffRisks) {
      const risk: HandoffRisk = { ...newRisk, id: nanoid() };
      onUpdateHandoffRisks([...handoffRisks, risk]);
      setNewRisk(emptyHandoffRisk);
      setIsAddingRisk(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflows */}
      <div className="space-y-4">
        {workflows.map((workflow) =>
          editingWorkflowId === workflow.id && editWorkflow ? (
            // Edit mode
            <div
              key={workflow.id}
              className="bg-white rounded-xl border-2 border-indigo-500 p-6"
            >
              <div className="space-y-4">
                <EditableField
                  label="Workflow Name"
                  value={editWorkflow.name}
                  onChange={(v) => setEditWorkflow({ ...editWorkflow, name: v })}
                  required
                />
                <SelectField
                  label="Frequency"
                  value={editWorkflow.frequency}
                  onChange={(v) => setEditWorkflow({ ...editWorkflow, frequency: v as Workflow['frequency'] })}
                  options={frequencyOptions}
                />
                <ArrayFieldEditor
                  label="Steps"
                  values={editWorkflow.steps}
                  onChange={(v) => setEditWorkflow({ ...editWorkflow, steps: v })}
                  placeholder="Add step..."
                />
                <ArrayFieldEditor
                  label="Participants"
                  values={editWorkflow.participants}
                  onChange={(v) => setEditWorkflow({ ...editWorkflow, participants: v })}
                  placeholder="Add participant..."
                />
                <EditableField
                  label="Duration"
                  value={editWorkflow.duration || ''}
                  onChange={(v) => setEditWorkflow({ ...editWorkflow, duration: v })}
                  placeholder="e.g., 2-3 hours"
                />
                <EditableField
                  label="Notes"
                  value={editWorkflow.notes || ''}
                  onChange={(v) => setEditWorkflow({ ...editWorkflow, notes: v })}
                  multiline
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveWorkflow}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={handleCancelEditWorkflow}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // View mode
            <div
              key={workflow.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header with edit/delete buttons */}
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditWorkflow(workflow)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Steps */}
              {workflow.steps.length > 0 && (
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
              )}

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
          )
        )}

        {/* Add new workflow form */}
        {isAddingWorkflow ? (
          <div className="bg-white rounded-xl border-2 border-green-500 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Workflow</h3>
            <div className="space-y-4">
              <EditableField
                label="Workflow Name"
                value={newWorkflow.name}
                onChange={(v) => setNewWorkflow({ ...newWorkflow, name: v })}
                required
              />
              <SelectField
                label="Frequency"
                value={newWorkflow.frequency}
                onChange={(v) => setNewWorkflow({ ...newWorkflow, frequency: v as Workflow['frequency'] })}
                options={frequencyOptions}
              />
              <ArrayFieldEditor
                label="Steps"
                values={newWorkflow.steps}
                onChange={(v) => setNewWorkflow({ ...newWorkflow, steps: v })}
                placeholder="Add step..."
              />
              <ArrayFieldEditor
                label="Participants"
                values={newWorkflow.participants}
                onChange={(v) => setNewWorkflow({ ...newWorkflow, participants: v })}
                placeholder="Add participant..."
              />
              <EditableField
                label="Duration"
                value={newWorkflow.duration || ''}
                onChange={(v) => setNewWorkflow({ ...newWorkflow, duration: v })}
                placeholder="e.g., 2-3 hours"
              />
              <EditableField
                label="Notes"
                value={newWorkflow.notes || ''}
                onChange={(v) => setNewWorkflow({ ...newWorkflow, notes: v })}
                multiline
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddWorkflow}
                  disabled={!newWorkflow.name.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add Workflow
                </button>
                <button
                  onClick={() => {
                    setIsAddingWorkflow(false);
                    setNewWorkflow(emptyWorkflow);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingWorkflow(true)}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Workflow
          </button>
        )}
      </div>

      {/* Handoff Risks */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Handoff Risks
        </h3>
        <div className="space-y-3">
          {handoffRisks.map((risk) =>
            editingRiskId === risk.id && editRisk ? (
              // Edit mode for risk
              <div
                key={risk.id}
                className="bg-white rounded-lg border-2 border-indigo-500 p-4"
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <EditableField
                    label="From Role"
                    value={editRisk.fromRole}
                    onChange={(v) => setEditRisk({ ...editRisk, fromRole: v })}
                    required
                  />
                  <EditableField
                    label="To Role"
                    value={editRisk.toRole}
                    onChange={(v) => setEditRisk({ ...editRisk, toRole: v })}
                    required
                  />
                </div>
                <div className="space-y-4">
                  <EditableField
                    label="Process"
                    value={editRisk.process}
                    onChange={(v) => setEditRisk({ ...editRisk, process: v })}
                  />
                  <SelectField
                    label="Risk Level"
                    value={editRisk.riskLevel}
                    onChange={(v) => setEditRisk({ ...editRisk, riskLevel: v as HandoffRisk['riskLevel'] })}
                    options={riskLevelOptions}
                  />
                  <EditableField
                    label="Description"
                    value={editRisk.description}
                    onChange={(v) => setEditRisk({ ...editRisk, description: v })}
                    multiline
                  />
                  <EditableField
                    label="Mitigation"
                    value={editRisk.mitigation || ''}
                    onChange={(v) => setEditRisk({ ...editRisk, mitigation: v })}
                    multiline
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveRisk}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={handleCancelEditRisk}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode for risk
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
                    <span className="font-semibold text-slate-900">{risk.fromRole}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-slate-900">{risk.toRole}</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                    {onUpdateHandoffRisks && (
                      <>
                        <button
                          onClick={() => handleEditRisk(risk)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRisk(risk.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
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
            )
          )}

          {/* Add new risk */}
          {isAddingRisk && onUpdateHandoffRisks ? (
            <div className="bg-white rounded-lg border-2 border-green-500 p-4">
              <h4 className="font-semibold text-slate-900 mb-4">Add New Handoff Risk</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <EditableField
                  label="From Role"
                  value={newRisk.fromRole}
                  onChange={(v) => setNewRisk({ ...newRisk, fromRole: v })}
                  required
                />
                <EditableField
                  label="To Role"
                  value={newRisk.toRole}
                  onChange={(v) => setNewRisk({ ...newRisk, toRole: v })}
                  required
                />
              </div>
              <div className="space-y-4">
                <EditableField
                  label="Process"
                  value={newRisk.process}
                  onChange={(v) => setNewRisk({ ...newRisk, process: v })}
                />
                <SelectField
                  label="Risk Level"
                  value={newRisk.riskLevel}
                  onChange={(v) => setNewRisk({ ...newRisk, riskLevel: v as HandoffRisk['riskLevel'] })}
                  options={riskLevelOptions}
                />
                <EditableField
                  label="Description"
                  value={newRisk.description}
                  onChange={(v) => setNewRisk({ ...newRisk, description: v })}
                  multiline
                />
                <EditableField
                  label="Mitigation"
                  value={newRisk.mitigation || ''}
                  onChange={(v) => setNewRisk({ ...newRisk, mitigation: v })}
                  multiline
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddRisk}
                  disabled={!newRisk.fromRole.trim() || !newRisk.toRole.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add Risk
                </button>
                <button
                  onClick={() => {
                    setIsAddingRisk(false);
                    setNewRisk(emptyHandoffRisk);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : onUpdateHandoffRisks ? (
            <button
              onClick={() => setIsAddingRisk(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Handoff Risk
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
