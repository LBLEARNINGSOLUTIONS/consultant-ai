import { useState } from 'react';
import { AlertTriangle, GitMerge, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Badge } from '../../analysis/Badge';
import { PainPointsChart } from '../../dashboard/PainPointsChart';

interface PainPoint {
  description: string;
  severity: 'high' | 'critical';
  affectedCount: number;
}

interface Handoff {
  fromRole: string;
  toRole: string;
  process: string;
  occurrences: number;
}

interface RisksSectionProps {
  painPoints: PainPoint[];
  handoffs: Handoff[];
  painPointsBySeverity?: Record<string, number>;
  painPointsByCategory?: Record<string, number>;
  onUpdatePainPoints?: (painPoints: PainPoint[]) => Promise<void>;
  onUpdateHandoffs?: (handoffs: Handoff[]) => Promise<void>;
}

export function RisksSection({
  painPoints,
  handoffs,
  painPointsBySeverity,
  painPointsByCategory,
  onUpdatePainPoints,
  onUpdateHandoffs,
}: RisksSectionProps) {
  const [isAddingPainPoint, setIsAddingPainPoint] = useState(false);
  const [isAddingHandoff, setIsAddingHandoff] = useState(false);
  const [editingPainPointIdx, setEditingPainPointIdx] = useState<number | null>(null);
  const [editingHandoffIdx, setEditingHandoffIdx] = useState<number | null>(null);

  // Pain Point handlers
  const handleAddPainPoint = async () => {
    if (!onUpdatePainPoints) return;
    const descInput = document.getElementById('new-painpoint-desc') as HTMLTextAreaElement;
    const severityInput = document.getElementById('new-painpoint-severity') as HTMLSelectElement;
    const countInput = document.getElementById('new-painpoint-count') as HTMLInputElement;
    if (!descInput?.value.trim()) return;

    const newPainPoint = {
      description: descInput.value.trim(),
      severity: severityInput.value as 'high' | 'critical',
      affectedCount: parseInt(countInput?.value) || 1,
    };
    await onUpdatePainPoints([...painPoints, newPainPoint]);
    setIsAddingPainPoint(false);
  };

  const handleEditPainPoint = async (idx: number) => {
    if (!onUpdatePainPoints) return;
    const descInput = document.getElementById(`edit-painpoint-desc-${idx}`) as HTMLTextAreaElement;
    const severityInput = document.getElementById(`edit-painpoint-severity-${idx}`) as HTMLSelectElement;
    const countInput = document.getElementById(`edit-painpoint-count-${idx}`) as HTMLInputElement;

    const updated = painPoints.map((pp, i) =>
      i === idx
        ? { ...pp, description: descInput.value.trim(), severity: severityInput.value as 'high' | 'critical', affectedCount: parseInt(countInput.value) || 1 }
        : pp
    );
    await onUpdatePainPoints(updated);
    setEditingPainPointIdx(null);
  };

  const handleDeletePainPoint = async (idx: number) => {
    if (!onUpdatePainPoints) return;
    await onUpdatePainPoints(painPoints.filter((_, i) => i !== idx));
  };

  // Handoff handlers
  const handleAddHandoff = async () => {
    if (!onUpdateHandoffs) return;
    const fromInput = document.getElementById('new-handoff-from') as HTMLInputElement;
    const toInput = document.getElementById('new-handoff-to') as HTMLInputElement;
    const processInput = document.getElementById('new-handoff-process') as HTMLInputElement;
    const occurrencesInput = document.getElementById('new-handoff-occurrences') as HTMLInputElement;
    if (!fromInput?.value.trim() || !toInput?.value.trim()) return;

    const newHandoff = {
      fromRole: fromInput.value.trim(),
      toRole: toInput.value.trim(),
      process: processInput?.value.trim() || '',
      occurrences: parseInt(occurrencesInput?.value) || 1,
    };
    await onUpdateHandoffs([...handoffs, newHandoff]);
    setIsAddingHandoff(false);
  };

  const handleEditHandoff = async (idx: number) => {
    if (!onUpdateHandoffs) return;
    const fromInput = document.getElementById(`edit-handoff-from-${idx}`) as HTMLInputElement;
    const toInput = document.getElementById(`edit-handoff-to-${idx}`) as HTMLInputElement;
    const processInput = document.getElementById(`edit-handoff-process-${idx}`) as HTMLInputElement;
    const occurrencesInput = document.getElementById(`edit-handoff-occurrences-${idx}`) as HTMLInputElement;

    const updated = handoffs.map((h, i) =>
      i === idx
        ? { ...h, fromRole: fromInput.value.trim(), toRole: toInput.value.trim(), process: processInput.value.trim(), occurrences: parseInt(occurrencesInput.value) || 1 }
        : h
    );
    await onUpdateHandoffs(updated);
    setEditingHandoffIdx(null);
  };

  const handleDeleteHandoff = async (idx: number) => {
    if (!onUpdateHandoffs) return;
    await onUpdateHandoffs(handoffs.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Risk, Friction, & Bottlenecks
        </h2>
        <p className="text-slate-600">
          Critical issues and high-risk handoffs identified across interviews.
        </p>
      </div>

      {/* Analytics Chart */}
      {painPointsBySeverity && painPointsByCategory && (
        <PainPointsChart bySeverity={painPointsBySeverity} byCategory={painPointsByCategory} />
      )}

      {/* Critical Pain Points */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Critical Pain Points
          </h3>
          {onUpdatePainPoints && !isAddingPainPoint && (
            <button
              onClick={() => setIsAddingPainPoint(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Pain Point
            </button>
          )}
        </div>

        {isAddingPainPoint && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="space-y-3 mb-3">
              <textarea
                placeholder="Description of the pain point"
                id="new-painpoint-desc"
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                autoFocus
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
              <button onClick={() => setIsAddingPainPoint(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddPainPoint} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Add</button>
            </div>
          </div>
        )}

        {painPoints.length === 0 ? (
          <p className="text-slate-500 italic">No critical pain points identified.</p>
        ) : (
          <div className="space-y-3">
            {painPoints.map((pp, idx) => (
              <div key={idx} className="group">
                {editingPainPointIdx === idx ? (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="space-y-3 mb-3">
                      <textarea
                        defaultValue={pp.description}
                        id={`edit-painpoint-desc-${idx}`}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        autoFocus
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          id={`edit-painpoint-severity-${idx}`}
                          defaultValue={pp.severity}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                        <input
                          type="number"
                          defaultValue={pp.affectedCount}
                          id={`edit-painpoint-count-${idx}`}
                          min={1}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingPainPointIdx(null)} className="p-1.5 text-slate-500 hover:bg-white rounded"><X className="w-4 h-4" /></button>
                      <button onClick={() => handleEditPainPoint(idx)} className="p-1.5 text-red-600 hover:bg-white rounded"><Check className="w-4 h-4" /></button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg border-l-4 ${pp.severity === 'critical' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'}`}>
                    <div className="flex items-start justify-between">
                      <p className="text-slate-900 font-medium flex-1">{pp.description}</p>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={pp.severity === 'critical' ? 'red' : 'yellow'}>{pp.severity}</Badge>
                        <Badge variant="gray">{pp.affectedCount} affected</Badge>
                        {onUpdatePainPoints && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingPainPointIdx(idx)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeletePainPoint(idx)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
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

      {/* High-Risk Handoffs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-orange-500" />
            High-Risk Handoffs
          </h3>
          {onUpdateHandoffs && !isAddingHandoff && (
            <button
              onClick={() => setIsAddingHandoff(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Handoff
            </button>
          )}
        </div>

        {isAddingHandoff && (
          <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="space-y-3 mb-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="From role" id="new-handoff-from" className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
                <input type="text" placeholder="To role" id="new-handoff-to" className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <input type="text" placeholder="Process description" id="new-handoff-process" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <input type="number" placeholder="Occurrences" id="new-handoff-occurrences" defaultValue={1} min={1} className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAddingHandoff(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddHandoff} className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">Add</button>
            </div>
          </div>
        )}

        {handoffs.length === 0 ? (
          <p className="text-slate-500 italic">No high-risk handoffs identified.</p>
        ) : (
          <div className="space-y-3">
            {handoffs.map((handoff, idx) => (
              <div key={idx} className="group">
                {editingHandoffIdx === idx ? (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="space-y-3 mb-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" defaultValue={handoff.fromRole} id={`edit-handoff-from-${idx}`} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
                        <input type="text" defaultValue={handoff.toRole} id={`edit-handoff-to-${idx}`} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <input type="text" defaultValue={handoff.process} id={`edit-handoff-process-${idx}`} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      <input type="number" defaultValue={handoff.occurrences} id={`edit-handoff-occurrences-${idx}`} min={1} className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingHandoffIdx(null)} className="p-1.5 text-slate-500 hover:bg-white rounded"><X className="w-4 h-4" /></button>
                      <button onClick={() => handleEditHandoff(idx)} className="p-1.5 text-orange-600 hover:bg-white rounded"><Check className="w-4 h-4" /></button>
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
                        {onUpdateHandoffs && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingHandoffIdx(idx)} className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-100 rounded"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteHandoff(idx)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-3 h-3" /></button>
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
    </div>
  );
}
