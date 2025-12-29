import { useState } from 'react';
import { Lightbulb, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Badge } from '../../analysis/Badge';

type Priority = 'high' | 'medium' | 'low';

interface Recommendation {
  id: string;
  text: string;
  priority: Priority;
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  onUpdate?: (recommendations: Recommendation[]) => Promise<void>;
}

const priorityColors: Record<Priority, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
};

export function RecommendationsSection({ recommendations, onUpdate }: RecommendationsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');

  const handleAdd = async () => {
    if (!onUpdate || !newText.trim()) return;
    const newRec = {
      id: `rec-${Date.now()}`,
      text: newText.trim(),
      priority: newPriority,
    };
    await onUpdate([...recommendations, newRec]);
    setNewText('');
    setNewPriority('medium');
    setIsAdding(false);
  };

  const startEditing = (rec: Recommendation) => {
    setEditingId(rec.id);
    setEditText(rec.text);
    setEditPriority(rec.priority);
  };

  const handleEdit = async (id: string) => {
    if (!onUpdate || !editText.trim()) return;
    const updated = recommendations.map(rec =>
      rec.id === id ? { ...rec, text: editText.trim(), priority: editPriority } : rec
    );
    await onUpdate(updated);
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (id: string) => {
    if (!onUpdate) return;
    await onUpdate(recommendations.filter(rec => rec.id !== id));
  };

  // Group by priority
  const highPriority = recommendations.filter(r => r.priority === 'high');
  const mediumPriority = recommendations.filter(r => r.priority === 'medium');
  const lowPriority = recommendations.filter(r => r.priority === 'low');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Lightbulb className="w-6 h-6 text-emerald-600" />
            Recommendations & Roadmap
          </h2>
          <p className="text-slate-600">
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} for improvement, generated from interview analysis.
          </p>
        </div>
        {onUpdate && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Recommendation
          </button>
        )}
      </div>

      {/* Add new recommendation form */}
      {isAdding && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter your recommendation..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Priority:</span>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsAdding(false); setNewText(''); setNewPriority('medium'); }}
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newText.trim()}
                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations list */}
      {recommendations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No recommendations yet.</p>
          <p className="text-sm text-slate-400 mt-1">
            Recommendations will be auto-generated when interviews are analyzed.
            {onUpdate && ' You can also add recommendations manually.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* High Priority */}
          {highPriority.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3">High Priority</h3>
              <div className="space-y-3">
                {highPriority.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    isEditing={editingId === rec.id}
                    editText={editText}
                    editPriority={editPriority}
                    onEditTextChange={setEditText}
                    onEditPriorityChange={setEditPriority}
                    onStartEdit={() => startEditing(rec)}
                    onSave={() => handleEdit(rec.id)}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(rec.id)}
                    canEdit={!!onUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {mediumPriority.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-3">Medium Priority</h3>
              <div className="space-y-3">
                {mediumPriority.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    isEditing={editingId === rec.id}
                    editText={editText}
                    editPriority={editPriority}
                    onEditTextChange={setEditText}
                    onEditPriorityChange={setEditPriority}
                    onStartEdit={() => startEditing(rec)}
                    onSave={() => handleEdit(rec.id)}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(rec.id)}
                    canEdit={!!onUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {lowPriority.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">Low Priority</h3>
              <div className="space-y-3">
                {lowPriority.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    isEditing={editingId === rec.id}
                    editText={editText}
                    editPriority={editPriority}
                    onEditTextChange={setEditText}
                    onEditPriorityChange={setEditPriority}
                    onStartEdit={() => startEditing(rec)}
                    onSave={() => handleEdit(rec.id)}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(rec.id)}
                    canEdit={!!onUpdate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface RecommendationCardProps {
  rec: Recommendation;
  isEditing: boolean;
  editText: string;
  editPriority: Priority;
  onEditTextChange: (text: string) => void;
  onEditPriorityChange: (priority: Priority) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  canEdit: boolean;
}

function RecommendationCard({
  rec,
  isEditing,
  editText,
  editPriority,
  onEditTextChange,
  onEditPriorityChange,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  canEdit,
}: RecommendationCardProps) {
  const colors = priorityColors[rec.priority];

  if (isEditing) {
    return (
      <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
        <textarea
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white"
          rows={3}
          autoFocus
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Priority:</span>
            <select
              value={editPriority}
              onChange={(e) => onEditPriorityChange(e.target.value as Priority)}
              className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="p-1.5 text-slate-500 hover:bg-white/50 rounded"><X className="w-4 h-4" /></button>
            <button onClick={onSave} className="p-1.5 text-emerald-600 hover:bg-white/50 rounded"><Check className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border} group`}>
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
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onStartEdit} className={`p-1.5 ${colors.text} hover:bg-white/50 rounded`}><Edit2 className="w-4 h-4" /></button>
            <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-white/50 rounded"><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
