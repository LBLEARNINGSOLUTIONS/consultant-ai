import { useState } from 'react';
import { PainPoint, TrainingGap } from '../../types/analysis';
import { Badge } from './Badge';
import { AlertCircle, GraduationCap, Filter, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { EditableField } from './EditableField';
import { ArrayFieldEditor } from './ArrayFieldEditor';
import { SelectField, severityOptions, categoryOptions, priorityOptions } from './SelectField';
import { nanoid } from 'nanoid';

interface PainPointsTabProps {
  painPoints: PainPoint[];
  trainingGaps: TrainingGap[];
  onUpdatePainPoints: (painPoints: PainPoint[]) => void;
  onUpdateTrainingGaps: (trainingGaps: TrainingGap[]) => void;
}

export function PainPointsTab({
  painPoints,
  trainingGaps,
  onUpdatePainPoints,
  onUpdateTrainingGaps
}: PainPointsTabProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Edit state for pain points
  const [editingPainPointId, setEditingPainPointId] = useState<string | null>(null);
  const [editedPainPoint, setEditedPainPoint] = useState<PainPoint | null>(null);
  const [isAddingPainPoint, setIsAddingPainPoint] = useState(false);
  const [newPainPoint, setNewPainPoint] = useState<PainPoint>({
    id: '',
    category: 'inefficiency',
    description: '',
    severity: 'medium',
    affectedRoles: [],
    frequency: '',
    impact: '',
  });

  // Edit state for training gaps
  const [editingGapId, setEditingGapId] = useState<string | null>(null);
  const [editedGap, setEditedGap] = useState<TrainingGap | null>(null);
  const [isAddingGap, setIsAddingGap] = useState(false);
  const [newGap, setNewGap] = useState<TrainingGap>({
    id: '',
    area: '',
    affectedRoles: [],
    priority: 'medium',
    currentState: '',
    desiredState: '',
  });

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const severityColors = {
    critical: { badge: 'red' as const, bg: 'bg-red-50', border: 'border-red-500' },
    high: { badge: 'red' as const, bg: 'bg-orange-50', border: 'border-orange-500' },
    medium: { badge: 'yellow' as const, bg: 'bg-yellow-50', border: 'border-yellow-500' },
    low: { badge: 'blue' as const, bg: 'bg-blue-50', border: 'border-blue-500' },
  };

  const categoryColors: Record<string, 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
    inefficiency: 'purple',
    bottleneck: 'red',
    'error-prone': 'red',
    manual: 'yellow',
    communication: 'blue',
    other: 'gray',
  };

  // Filter pain points
  const filteredPainPoints = painPoints
    .filter(p => severityFilter === 'all' || p.severity === severityFilter)
    .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const categories = ['all', ...Array.from(new Set(painPoints.map(p => p.category)))];
  const severities = ['all', 'critical', 'high', 'medium', 'low'];

  // Pain Point handlers
  const handleEditPainPoint = (painPoint: PainPoint) => {
    setEditingPainPointId(painPoint.id);
    setEditedPainPoint({ ...painPoint });
  };

  const handleSavePainPoint = () => {
    if (!editedPainPoint) return;
    const updated = painPoints.map(p =>
      p.id === editedPainPoint.id ? editedPainPoint : p
    );
    onUpdatePainPoints(updated);
    setEditingPainPointId(null);
    setEditedPainPoint(null);
  };

  const handleDeletePainPoint = (id: string) => {
    if (confirm('Are you sure you want to delete this pain point?')) {
      onUpdatePainPoints(painPoints.filter(p => p.id !== id));
    }
  };

  const handleAddPainPoint = () => {
    const painPointToAdd = { ...newPainPoint, id: nanoid() };
    onUpdatePainPoints([...painPoints, painPointToAdd]);
    setIsAddingPainPoint(false);
    setNewPainPoint({
      id: '',
      category: 'inefficiency',
      description: '',
      severity: 'medium',
      affectedRoles: [],
      frequency: '',
      impact: '',
    });
  };

  // Training Gap handlers
  const handleEditGap = (gap: TrainingGap) => {
    setEditingGapId(gap.id);
    setEditedGap({ ...gap });
  };

  const handleSaveGap = () => {
    if (!editedGap) return;
    const updated = trainingGaps.map(g =>
      g.id === editedGap.id ? editedGap : g
    );
    onUpdateTrainingGaps(updated);
    setEditingGapId(null);
    setEditedGap(null);
  };

  const handleDeleteGap = (id: string) => {
    if (confirm('Are you sure you want to delete this training gap?')) {
      onUpdateTrainingGaps(trainingGaps.filter(g => g.id !== id));
    }
  };

  const handleAddGap = () => {
    const gapToAdd = { ...newGap, id: nanoid() };
    onUpdateTrainingGaps([...trainingGaps, gapToAdd]);
    setIsAddingGap(false);
    setNewGap({
      id: '',
      area: '',
      affectedRoles: [],
      priority: 'medium',
      currentState: '',
      desiredState: '',
    });
  };

  // Pain Point Form component
  const PainPointForm = ({
    painPoint,
    onChange,
    onSave,
    onCancel,
    isNew = false
  }: {
    painPoint: PainPoint;
    onChange: (p: PainPoint) => void;
    onSave: () => void;
    onCancel: () => void;
    isNew?: boolean;
  }) => (
    <div className="bg-white p-5 rounded-xl border-2 border-indigo-300 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Category"
          value={painPoint.category}
          onChange={(value) => onChange({ ...painPoint, category: value as PainPoint['category'] })}
          options={categoryOptions}
          required
        />
        <SelectField
          label="Severity"
          value={painPoint.severity}
          onChange={(value) => onChange({ ...painPoint, severity: value as PainPoint['severity'] })}
          options={severityOptions}
          required
        />
      </div>

      <EditableField
        label="Description"
        value={painPoint.description}
        onChange={(value) => onChange({ ...painPoint, description: value })}
        placeholder="Describe the pain point..."
        multiline
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="Frequency"
          value={painPoint.frequency}
          onChange={(value) => onChange({ ...painPoint, frequency: value })}
          placeholder="How often does this occur?"
        />
        <EditableField
          label="Impact"
          value={painPoint.impact}
          onChange={(value) => onChange({ ...painPoint, impact: value })}
          placeholder="What is the business impact?"
        />
      </div>

      <ArrayFieldEditor
        label="Affected Roles"
        values={painPoint.affectedRoles}
        onChange={(values) => onChange({ ...painPoint, affectedRoles: values })}
        placeholder="Add affected role..."
      />

      <EditableField
        label="Suggested Solution"
        value={painPoint.suggestedSolution || ''}
        onChange={(value) => onChange({ ...painPoint, suggestedSolution: value })}
        placeholder="Optional recommendation..."
        multiline
      />

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!painPoint.description.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isNew ? 'Add Pain Point' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  // Training Gap Form component
  const TrainingGapForm = ({
    gap,
    onChange,
    onSave,
    onCancel,
    isNew = false
  }: {
    gap: TrainingGap;
    onChange: (g: TrainingGap) => void;
    onSave: () => void;
    onCancel: () => void;
    isNew?: boolean;
  }) => (
    <div className="bg-white p-5 rounded-xl border-2 border-indigo-300 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="Area"
          value={gap.area}
          onChange={(value) => onChange({ ...gap, area: value })}
          placeholder="Training area name..."
          required
        />
        <SelectField
          label="Priority"
          value={gap.priority}
          onChange={(value) => onChange({ ...gap, priority: value as TrainingGap['priority'] })}
          options={priorityOptions}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="Current State"
          value={gap.currentState}
          onChange={(value) => onChange({ ...gap, currentState: value })}
          placeholder="Describe current situation..."
          multiline
        />
        <EditableField
          label="Desired State"
          value={gap.desiredState}
          onChange={(value) => onChange({ ...gap, desiredState: value })}
          placeholder="Describe target state..."
          multiline
        />
      </div>

      <ArrayFieldEditor
        label="Affected Roles"
        values={gap.affectedRoles}
        onChange={(values) => onChange({ ...gap, affectedRoles: values })}
        placeholder="Add affected role..."
      />

      <EditableField
        label="Suggested Training"
        value={gap.suggestedTraining || ''}
        onChange={(value) => onChange({ ...gap, suggestedTraining: value })}
        placeholder="Optional training recommendation..."
        multiline
      />

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!gap.area.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isNew ? 'Add Training Gap' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      {painPoints.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {severities.map(severity => (
                  <option key={severity} value={severity}>
                    {severity === 'all' ? 'All Severities' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Pain Points */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Pain Points ({painPoints.length})
          </h3>
          {!isAddingPainPoint && (
            <button
              onClick={() => setIsAddingPainPoint(true)}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Pain Point
            </button>
          )}
        </div>

        {/* Add new pain point form */}
        {isAddingPainPoint && (
          <PainPointForm
            painPoint={newPainPoint}
            onChange={setNewPainPoint}
            onSave={handleAddPainPoint}
            onCancel={() => setIsAddingPainPoint(false)}
            isNew
          />
        )}

        {filteredPainPoints.length === 0 && !isAddingPainPoint ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">No pain points found. Add one to get started.</p>
          </div>
        ) : (
          filteredPainPoints.map((painPoint) => (
            editingPainPointId === painPoint.id && editedPainPoint ? (
              <PainPointForm
                key={painPoint.id}
                painPoint={editedPainPoint}
                onChange={setEditedPainPoint}
                onSave={handleSavePainPoint}
                onCancel={() => {
                  setEditingPainPointId(null);
                  setEditedPainPoint(null);
                }}
              />
            ) : (
              <div
                key={painPoint.id}
                className={`p-5 rounded-xl border-l-4 ${severityColors[painPoint.severity].bg} ${severityColors[painPoint.severity].border}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={severityColors[painPoint.severity].badge}>
                        {painPoint.severity}
                      </Badge>
                      <Badge variant={categoryColors[painPoint.category]}>
                        {painPoint.category}
                      </Badge>
                    </div>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {painPoint.description}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => handleEditPainPoint(painPoint)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePainPoint(painPoint.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">Frequency:</span>{' '}
                    <span className="text-slate-600">{painPoint.frequency}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Impact:</span>{' '}
                    <span className="text-slate-600">{painPoint.impact}</span>
                  </div>
                </div>

                {painPoint.affectedRoles.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-semibold text-slate-700 block mb-2">
                      Affected Roles:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {painPoint.affectedRoles.map((role, idx) => (
                        <Badge key={idx} variant="purple">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {painPoint.suggestedSolution && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Suggested Solution:
                    </p>
                    <p className="text-sm text-slate-600">{painPoint.suggestedSolution}</p>
                  </div>
                )}
              </div>
            )
          ))
        )}
      </div>

      {/* Training Gaps */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            Training Gaps ({trainingGaps.length})
          </h3>
          {!isAddingGap && (
            <button
              onClick={() => setIsAddingGap(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Training Gap
            </button>
          )}
        </div>

        {/* Add new training gap form */}
        {isAddingGap && (
          <TrainingGapForm
            gap={newGap}
            onChange={setNewGap}
            onSave={handleAddGap}
            onCancel={() => setIsAddingGap(false)}
            isNew
          />
        )}

        {trainingGaps.length === 0 && !isAddingGap ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">No training gaps identified. Add one to get started.</p>
          </div>
        ) : (
          trainingGaps.map((gap) => (
            editingGapId === gap.id && editedGap ? (
              <TrainingGapForm
                key={gap.id}
                gap={editedGap}
                onChange={setEditedGap}
                onSave={handleSaveGap}
                onCancel={() => {
                  setEditingGapId(null);
                  setEditedGap(null);
                }}
              />
            ) : (
              <div
                key={gap.id}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 text-lg">{gap.area}</h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        gap.priority === 'high' ? 'red' : gap.priority === 'medium' ? 'yellow' : 'blue'
                      }
                    >
                      {gap.priority} priority
                    </Badge>
                    <button
                      onClick={() => handleEditGap(gap)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGap(gap.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Current State:</p>
                    <p className="text-sm text-slate-600">{gap.currentState}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Desired State:</p>
                    <p className="text-sm text-slate-600">{gap.desiredState}</p>
                  </div>
                </div>

                {gap.affectedRoles.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-semibold text-slate-700 block mb-2">
                      Affected Roles:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {gap.affectedRoles.map((role, idx) => (
                        <Badge key={idx} variant="indigo">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {gap.suggestedTraining && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-xs font-semibold text-indigo-900 mb-1">
                      Suggested Training:
                    </p>
                    <p className="text-sm text-indigo-700">{gap.suggestedTraining}</p>
                  </div>
                )}
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
}
