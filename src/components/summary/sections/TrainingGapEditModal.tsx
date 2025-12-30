import { useState } from 'react';
import { X, GraduationCap, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { TrainingGapProfile } from '../../../types/analysis';

interface TrainingGapEditModalProps {
  profile: TrainingGapProfile;
  onSave: (updatedProfile: TrainingGapProfile) => void;
  onClose: () => void;
}

const categories: TrainingGapProfile['category'][] = ['skill', 'system', 'process', 'knowledge', 'other'];

const categoryLabels: Record<TrainingGapProfile['category'], string> = {
  skill: 'Skill Gap',
  system: 'System Training',
  process: 'Process Understanding',
  knowledge: 'Knowledge Gap',
  other: 'Other',
};

const severityOptions: TrainingGapProfile['risk']['severity'][] = ['low', 'medium', 'high', 'critical'];

export function TrainingGapEditModal({ profile, onSave, onClose }: TrainingGapEditModalProps) {
  const [area, setArea] = useState(profile.area);
  const [category, setCategory] = useState(profile.category);
  const [priority, setPriority] = useState(profile.priority);
  const [currentState, setCurrentState] = useState(profile.currentState);
  const [desiredState, setDesiredState] = useState(profile.desiredState);
  const [suggestedTraining, setSuggestedTraining] = useState(profile.suggestedTraining);
  const [affectedRoles, setAffectedRoles] = useState([...profile.affectedRoles]);
  const [relatedSystems, setRelatedSystems] = useState<string[]>([...profile.relatedSystems]);
  const [relatedWorkflows, setRelatedWorkflows] = useState<string[]>([...profile.relatedWorkflows]);
  const [riskSeverity, setRiskSeverity] = useState(profile.risk.severity);
  const [riskDescription, setRiskDescription] = useState(profile.risk.description);
  const [businessImpact, setBusinessImpact] = useState(profile.risk.businessImpact);

  // New item inputs
  const [newRole, setNewRole] = useState('');
  const [newRoleImpact, setNewRoleImpact] = useState('');
  const [newSystem, setNewSystem] = useState('');
  const [newWorkflow, setNewWorkflow] = useState('');

  const handleSave = () => {
    if (!area.trim()) return;

    const updatedProfile: TrainingGapProfile = {
      ...profile,
      area: area.trim(),
      category,
      priority,
      currentState: currentState.trim() || 'Not documented',
      desiredState: desiredState.trim() || 'Not specified',
      suggestedTraining: suggestedTraining.trim() || 'Training approach to be determined',
      affectedRoles: affectedRoles.filter(r => r.role.trim()),
      relatedSystems: relatedSystems.filter(s => s.trim()),
      relatedWorkflows: relatedWorkflows.filter(w => w.trim()),
      risk: {
        severity: riskSeverity,
        description: riskDescription.trim() || 'Standard training priority',
        businessImpact: businessImpact.trim() || 'Impact to be assessed',
      },
    };

    onSave(updatedProfile);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // Add handlers
  const addRole = () => {
    if (newRole.trim()) {
      setAffectedRoles([...affectedRoles, {
        role: newRole.trim(),
        impact: newRoleImpact.trim() || 'General capability gap',
        count: 1,
      }]);
      setNewRole('');
      setNewRoleImpact('');
    }
  };

  const addSystem = () => {
    if (newSystem.trim() && !relatedSystems.includes(newSystem.trim())) {
      setRelatedSystems([...relatedSystems, newSystem.trim()]);
      setNewSystem('');
    }
  };

  const addWorkflow = () => {
    if (newWorkflow.trim() && !relatedWorkflows.includes(newWorkflow.trim())) {
      setRelatedWorkflows([...relatedWorkflows, newWorkflow.trim()]);
      setNewWorkflow('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Training Gap</h2>
              <p className="text-indigo-100 text-sm">
                Modify gap details and risk assessment
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
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Training Gap Area
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Excel Advanced Functions, CRM Usage, Order Processing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TrainingGapProfile['category'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TrainingGapProfile['priority'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Current State */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current State
            </label>
            <textarea
              value={currentState}
              onChange={(e) => setCurrentState(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe the current capability level..."
            />
          </div>

          {/* Desired State */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Desired State
            </label>
            <textarea
              value={desiredState}
              onChange={(e) => setDesiredState(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe the target capability level..."
            />
          </div>

          {/* Suggested Training */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Suggested Training Approach
            </label>
            <textarea
              value={suggestedTraining}
              onChange={(e) => setSuggestedTraining(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Recommend training methods, courses, or resources..."
            />
          </div>

          {/* Affected Roles */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Affected Roles ({affectedRoles.length})
            </label>
            <div className="space-y-2 mb-3">
              {affectedRoles.map((role, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700">{role.role}</span>
                    <span className="text-xs text-slate-500 ml-2">- {role.impact}</span>
                  </div>
                  <button
                    onClick={() => setAffectedRoles(affectedRoles.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-1/3 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Role..."
              />
              <input
                type="text"
                value={newRoleImpact}
                onChange={(e) => setNewRoleImpact(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addRole)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Impact on this role..."
              />
              <button
                onClick={addRole}
                disabled={!newRole.trim()}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Related Systems */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Related Systems ({relatedSystems.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {relatedSystems.map((system, idx) => (
                <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm group">
                  <span>{system}</span>
                  <button
                    onClick={() => setRelatedSystems(relatedSystems.filter((_, i) => i !== idx))}
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
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add related system..."
              />
              <button
                onClick={addSystem}
                disabled={!newSystem.trim()}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Related Workflows */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Impacted Workflows ({relatedWorkflows.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {relatedWorkflows.map((workflow, idx) => (
                <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm group">
                  <span>{workflow}</span>
                  <button
                    onClick={() => setRelatedWorkflows(relatedWorkflows.filter((_, i) => i !== idx))}
                    className="p-0.5 hover:bg-green-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newWorkflow}
                onChange={(e) => setNewWorkflow(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addWorkflow)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add impacted workflow..."
              />
              <button
                onClick={addWorkflow}
                disabled={!newWorkflow.trim()}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="text-sm font-semibold text-amber-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Assessment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Risk Severity
                </label>
                <select
                  value={riskSeverity}
                  onChange={(e) => setRiskSeverity(e.target.value as TrainingGapProfile['risk']['severity'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {severityOptions.map(severity => (
                    <option key={severity} value={severity}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Risk Description
                </label>
                <input
                  type="text"
                  value={riskDescription}
                  onChange={(e) => setRiskDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the risk factors..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Impact
                </label>
                <textarea
                  value={businessImpact}
                  onChange={(e) => setBusinessImpact(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the potential business impact if not addressed..."
                />
              </div>
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
            disabled={!area.trim()}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
