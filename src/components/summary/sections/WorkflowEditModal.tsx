import { useState } from 'react';
import { X, TrendingUp, Plus, Trash2, GripVertical, AlertTriangle } from 'lucide-react';
import { WorkflowProfile, WorkflowStep } from '../../../types/analysis';
import { nanoid } from 'nanoid';

interface WorkflowEditModalProps {
  profile: WorkflowProfile;
  onSave: (updatedProfile: WorkflowProfile) => void;
  onClose: () => void;
}

export function WorkflowEditModal({ profile, onSave, onClose }: WorkflowEditModalProps) {
  const [name, setName] = useState(profile.name);
  const [frequency, setFrequency] = useState(profile.frequency);
  const [steps, setSteps] = useState<WorkflowStep[]>([...profile.steps]);
  const [participants, setParticipants] = useState<string[]>([...profile.participants]);
  const [systems, setSystems] = useState<string[]>([...profile.systems]);

  // New item inputs
  const [newParticipant, setNewParticipant] = useState('');
  const [newSystem, setNewSystem] = useState('');
  const [newStepName, setNewStepName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;

    const updatedProfile: WorkflowProfile = {
      ...profile,
      name: name.trim(),
      frequency,
      steps: steps.filter(s => s.name.trim()),
      participants: participants.filter(p => p.trim()),
      systems: systems.filter(s => s.trim()),
    };

    onSave(updatedProfile);
  };

  // Step handlers
  const addStep = () => {
    if (newStepName.trim()) {
      setSteps([...steps, {
        id: nanoid(),
        name: newStepName.trim(),
      }]);
      setNewStepName('');
    }
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, ...updates } : s));
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId));
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    setSteps(newSteps);
  };

  // Participant handlers
  const addParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (idx: number) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  // System handlers
  const addSystem = () => {
    if (newSystem.trim() && !systems.includes(newSystem.trim())) {
      setSystems([...systems, newSystem.trim()]);
      setNewSystem('');
    }
  };

  const removeSystem = (idx: number) => {
    setSystems(systems.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Workflow</h2>
              <p className="text-blue-100 text-sm">
                Modify workflow details and process steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Workflow Name & Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Workflow Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="ad-hoc">Ad-hoc</option>
              </select>
            </div>
          </div>

          {/* Process Steps */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Process Steps ({steps.length})
            </label>
            <div className="space-y-2 mb-3">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg group"
                >
                  <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                    <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => updateStep(step.id, { name: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Step name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={step.owner || ''}
                        onChange={(e) => updateStep(step.id, { owner: e.target.value })}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Owner (role)"
                      />
                      <input
                        type="text"
                        value={step.duration || ''}
                        onChange={(e) => updateStep(step.id, { duration: e.target.value })}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Duration (e.g., 30 min)"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {idx > 0 && (
                      <button
                        onClick={() => moveStep(idx, idx - 1)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Move up"
                      >
                        <span className="text-xs">&#x25B2;</span>
                      </button>
                    )}
                    {idx < steps.length - 1 && (
                      <button
                        onClick={() => moveStep(idx, idx + 1)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Move down"
                      >
                        <span className="text-xs">&#x25BC;</span>
                      </button>
                    )}
                    <button
                      onClick={() => removeStep(step.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addStep)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add new step..."
              />
              <button
                onClick={addStep}
                disabled={!newStepName.trim()}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Participants ({participants.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {participants.map((participant, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm group"
                >
                  <span>{participant}</span>
                  <button
                    onClick={() => removeParticipant(idx)}
                    className="p-0.5 hover:bg-indigo-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addParticipant)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add participant (role)..."
              />
              <button
                onClick={addParticipant}
                disabled={!newParticipant.trim()}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Systems */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Systems & Tools ({systems.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {systems.map((system, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm group"
                >
                  <span>{system}</span>
                  <button
                    onClick={() => removeSystem(idx)}
                    className="p-0.5 hover:bg-blue-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSystem}
                onChange={(e) => setNewSystem(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addSystem)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add system or tool..."
              />
              <button
                onClick={addSystem}
                disabled={!newSystem.trim()}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Note about auto-generated data */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Failure points and unclear steps are automatically detected from interview data. To update these, edit the individual step details or re-analyze interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
