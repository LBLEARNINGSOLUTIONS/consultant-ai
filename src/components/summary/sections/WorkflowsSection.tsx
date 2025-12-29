import { useState } from 'react';
import { TrendingUp, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Badge } from '../../analysis/Badge';
import { WorkflowsChart } from '../../dashboard/WorkflowsChart';
import { WorkflowAggregation } from '../../../types/dashboard';

interface Workflow {
  name: string;
  frequency: number;
  mentions: number;
}

interface WorkflowsSectionProps {
  workflows: Workflow[];
  analyticsWorkflows?: WorkflowAggregation[];
  onUpdate?: (workflows: Workflow[]) => Promise<void>;
}

export function WorkflowsSection({ workflows, analyticsWorkflows, onUpdate }: WorkflowsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!onUpdate) return;
    const nameInput = document.getElementById('new-workflow-name') as HTMLInputElement;
    const mentionsInput = document.getElementById('new-workflow-mentions') as HTMLInputElement;
    if (!nameInput?.value.trim()) return;

    const newWorkflow = {
      name: nameInput.value.trim(),
      frequency: 1,
      mentions: parseInt(mentionsInput?.value) || 1,
    };
    await onUpdate([...workflows, newWorkflow]);
    setIsAdding(false);
  };

  const handleEdit = async (idx: number) => {
    if (!onUpdate) return;
    const nameInput = document.getElementById(`edit-workflow-name-${idx}`) as HTMLInputElement;
    const mentionsInput = document.getElementById(`edit-workflow-mentions-${idx}`) as HTMLInputElement;

    const updated = workflows.map((w, i) =>
      i === idx
        ? { ...w, name: nameInput.value.trim(), mentions: parseInt(mentionsInput.value) || 1 }
        : w
    );
    await onUpdate(updated);
    setEditingIdx(null);
  };

  const handleDelete = async (idx: number) => {
    if (!onUpdate) return;
    await onUpdate(workflows.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Workflow & Process Analysis
          </h2>
          <p className="text-slate-600">
            {workflows.length} key workflows identified across interviews.
          </p>
        </div>
        {onUpdate && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Workflow
          </button>
        )}
      </div>

      {/* Analytics Chart */}
      {analyticsWorkflows && analyticsWorkflows.length > 0 && (
        <WorkflowsChart workflows={analyticsWorkflows} />
      )}

      {/* Add new workflow form */}
      {isAdding && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Workflow name"
              id="new-workflow-name"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
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
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Workflows list */}
      {workflows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No workflows identified yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="space-y-3">
            {workflows.map((workflow, idx) => (
              <div key={idx} className="group">
                {editingIdx === idx ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        defaultValue={workflow.name}
                        id={`edit-workflow-name-${idx}`}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
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
                        onClick={() => setEditingIdx(null)}
                        className="p-1.5 text-slate-500 hover:bg-white rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(idx)}
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
                            onClick={() => setEditingIdx(idx)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(idx)}
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
        </div>
      )}
    </div>
  );
}
