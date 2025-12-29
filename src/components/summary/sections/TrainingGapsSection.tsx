import { useState } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Badge } from '../../analysis/Badge';
import { TrainingGapsPanel } from '../../dashboard/TrainingGapsPanel';
import { TrainingGapAggregation } from '../../../types/dashboard';

interface TrainingGap {
  area: string;
  affectedRoles: string[];
  priority?: 'high';  // optional for flexibility
  frequency: number;
}

interface TrainingGapsSectionProps {
  trainingGaps: TrainingGap[];
  analyticsTrainingGaps?: TrainingGapAggregation[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate?: (trainingGaps: any[]) => Promise<void>;
}

export function TrainingGapsSection({ trainingGaps, analyticsTrainingGaps, onUpdate }: TrainingGapsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!onUpdate) return;
    const areaInput = document.getElementById('new-traininggap-area') as HTMLInputElement;
    const rolesInput = document.getElementById('new-traininggap-roles') as HTMLInputElement;
    const frequencyInput = document.getElementById('new-traininggap-frequency') as HTMLInputElement;
    if (!areaInput?.value.trim()) return;

    const newGap = {
      area: areaInput.value.trim(),
      affectedRoles: rolesInput?.value.split(',').map(r => r.trim()).filter(Boolean) || [],
      frequency: parseInt(frequencyInput?.value) || 1,
    };
    await onUpdate([...trainingGaps, newGap]);
    setIsAdding(false);
  };

  const handleEdit = async (idx: number) => {
    if (!onUpdate) return;
    const areaInput = document.getElementById(`edit-traininggap-area-${idx}`) as HTMLInputElement;
    const rolesInput = document.getElementById(`edit-traininggap-roles-${idx}`) as HTMLInputElement;
    const frequencyInput = document.getElementById(`edit-traininggap-frequency-${idx}`) as HTMLInputElement;

    const updated = trainingGaps.map((g, i) =>
      i === idx
        ? { ...g, area: areaInput.value.trim(), affectedRoles: rolesInput.value.split(',').map(r => r.trim()).filter(Boolean), frequency: parseInt(frequencyInput.value) || 1 }
        : g
    );
    await onUpdate(updated);
    setEditingIdx(null);
  };

  const handleDelete = async (idx: number) => {
    if (!onUpdate) return;
    await onUpdate(trainingGaps.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <GraduationCap className="w-6 h-6 text-amber-600" />
            Training & Capability Gaps
          </h2>
          <p className="text-slate-600">
            {trainingGaps.length} training gaps identified that need attention.
          </p>
        </div>
        {onUpdate && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Training Gap
          </button>
        )}
      </div>

      {/* Analytics Chart */}
      {analyticsTrainingGaps && analyticsTrainingGaps.length > 0 && (
        <TrainingGapsPanel trainingGaps={analyticsTrainingGaps} />
      )}

      {/* Add new training gap form */}
      {isAdding && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="space-y-3 mb-3">
            <input type="text" placeholder="Training area" id="new-traininggap-area" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Affected roles (comma-separated)" id="new-traininggap-roles" className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <input type="number" placeholder="Frequency" id="new-traininggap-frequency" defaultValue={1} min={1} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={handleAdd} className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">Add</button>
          </div>
        </div>
      )}

      {/* Training gaps list */}
      {trainingGaps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No training gaps identified yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="space-y-3">
            {trainingGaps.map((gap, idx) => (
              <div key={idx} className="group">
                {editingIdx === idx ? (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="space-y-3 mb-3">
                      <input type="text" defaultValue={gap.area} id={`edit-traininggap-area-${idx}`} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" autoFocus />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" defaultValue={gap.affectedRoles.join(', ')} id={`edit-traininggap-roles-${idx}`} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        <input type="number" defaultValue={gap.frequency} id={`edit-traininggap-frequency-${idx}`} min={1} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingIdx(null)} className="p-1.5 text-slate-500 hover:bg-white rounded"><X className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(idx)} className="p-1.5 text-amber-600 hover:bg-white rounded"><Check className="w-4 h-4" /></button>
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
                            <button onClick={() => setEditingIdx(idx)} className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(idx)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {gap.affectedRoles.map((role, roleIdx) => (
                        <Badge key={roleIdx} variant="yellow" className="text-xs">{role}</Badge>
                      ))}
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
