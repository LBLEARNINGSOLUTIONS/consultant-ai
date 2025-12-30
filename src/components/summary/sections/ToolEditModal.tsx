import { useState } from 'react';
import { X, Wrench, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { ToolProfile } from '../../../types/analysis';

interface ToolEditModalProps {
  profile: ToolProfile;
  onSave: (updatedProfile: ToolProfile) => void;
  onClose: () => void;
}

const categories: ToolProfile['category'][] = ['crm', 'pm', 'spreadsheet', 'communication', 'erp', 'custom', 'other'];

const categoryLabels: Record<ToolProfile['category'], string> = {
  crm: 'CRM',
  pm: 'Project Management',
  spreadsheet: 'Spreadsheet',
  communication: 'Communication',
  erp: 'ERP',
  custom: 'Custom Application',
  other: 'Other',
};

const gapTypes: ToolProfile['gaps'][0]['type'][] = ['underutilized', 'misused', 'overlap', 'data-handoff', 'missing-integration'];

const gapTypeLabels: Record<string, string> = {
  underutilized: 'Underutilized',
  misused: 'Misused',
  overlap: 'Overlap',
  'data-handoff': 'Data Handoff Issue',
  'missing-integration': 'Missing Integration',
};

export function ToolEditModal({ profile, onSave, onClose }: ToolEditModalProps) {
  const [name, setName] = useState(profile.name);
  const [category, setCategory] = useState(profile.category);
  const [intendedPurpose, setIntendedPurpose] = useState(profile.intendedPurpose);
  const [actualUsage, setActualUsage] = useState<string[]>([...profile.actualUsage]);
  const [frequency, setFrequency] = useState(profile.frequency);
  const [usedBy, setUsedBy] = useState([...profile.usedBy]);
  const [integratesWith, setIntegratesWith] = useState<string[]>([...profile.integratesWith]);
  const [gaps, setGaps] = useState([...profile.gaps]);
  const [limitations, setLimitations] = useState<string[]>([...profile.limitations]);

  // New item inputs
  const [newUsage, setNewUsage] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newRolePurpose, setNewRolePurpose] = useState('');
  const [newIntegration, setNewIntegration] = useState('');
  const [newLimitation, setNewLimitation] = useState('');
  const [newGapType, setNewGapType] = useState<ToolProfile['gaps'][0]['type']>('underutilized');
  const [newGapDescription, setNewGapDescription] = useState('');
  const [newGapSeverity, setNewGapSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSave = () => {
    if (!name.trim()) return;

    const updatedProfile: ToolProfile = {
      ...profile,
      name: name.trim(),
      category,
      intendedPurpose: intendedPurpose.trim(),
      actualUsage: actualUsage.filter(u => u.trim()),
      frequency,
      usedBy: usedBy.filter(u => u.role.trim()),
      integratesWith: integratesWith.filter(i => i.trim()),
      gaps,
      limitations: limitations.filter(l => l.trim()),
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
  const addUsage = () => {
    if (newUsage.trim()) {
      setActualUsage([...actualUsage, newUsage.trim()]);
      setNewUsage('');
    }
  };

  const addRole = () => {
    if (newRole.trim()) {
      setUsedBy([...usedBy, { role: newRole.trim(), purpose: newRolePurpose.trim() || 'General use', count: 1 }]);
      setNewRole('');
      setNewRolePurpose('');
    }
  };

  const addIntegration = () => {
    if (newIntegration.trim() && !integratesWith.includes(newIntegration.trim())) {
      setIntegratesWith([...integratesWith, newIntegration.trim()]);
      setNewIntegration('');
    }
  };

  const addLimitation = () => {
    if (newLimitation.trim()) {
      setLimitations([...limitations, newLimitation.trim()]);
      setNewLimitation('');
    }
  };

  const addGap = () => {
    if (newGapDescription.trim()) {
      setGaps([...gaps, {
        type: newGapType,
        description: newGapDescription.trim(),
        severity: newGapSeverity,
      }]);
      setNewGapDescription('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Tool</h2>
              <p className="text-indigo-100 text-sm">
                Modify tool details and gap analysis
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tool Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter tool name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ToolProfile['category'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Intended Purpose */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Intended Purpose
            </label>
            <textarea
              value={intendedPurpose}
              onChange={(e) => setIntendedPurpose(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="What is this tool supposed to be used for?"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Usage Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="ad-hoc">Ad-hoc</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Actual Usage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Actual Usage ({actualUsage.length})
            </label>
            <div className="space-y-2 mb-3">
              {actualUsage.map((usage, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                  <span className="flex-1 text-sm text-slate-700">{usage}</span>
                  <button
                    onClick={() => setActualUsage(actualUsage.filter((_, i) => i !== idx))}
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
                value={newUsage}
                onChange={(e) => setNewUsage(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addUsage)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add actual usage..."
              />
              <button
                onClick={addUsage}
                disabled={!newUsage.trim()}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Users */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Used By ({usedBy.length})
            </label>
            <div className="space-y-2 mb-3">
              {usedBy.map((user, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700">{user.role}</span>
                    <span className="text-xs text-slate-500 ml-2">- {user.purpose}</span>
                  </div>
                  <button
                    onClick={() => setUsedBy(usedBy.filter((_, i) => i !== idx))}
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
                value={newRolePurpose}
                onChange={(e) => setNewRolePurpose(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addRole)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Purpose..."
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

          {/* Integrations */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Integrates With ({integratesWith.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {integratesWith.map((integration, idx) => (
                <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm group">
                  <span>{integration}</span>
                  <button
                    onClick={() => setIntegratesWith(integratesWith.filter((_, i) => i !== idx))}
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
                value={newIntegration}
                onChange={(e) => setNewIntegration(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addIntegration)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add integration..."
              />
              <button
                onClick={addIntegration}
                disabled={!newIntegration.trim()}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gaps */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Identified Gaps ({gaps.length})
            </label>
            <div className="space-y-2 mb-3">
              {gaps.map((gap, idx) => (
                <div key={idx} className={`flex items-start gap-2 p-3 rounded-lg group ${
                  gap.severity === 'high' ? 'bg-red-50' : gap.severity === 'medium' ? 'bg-amber-50' : 'bg-slate-50'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        gap.severity === 'high' ? 'bg-red-200 text-red-700' :
                        gap.severity === 'medium' ? 'bg-amber-200 text-amber-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {gap.severity}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{gapTypeLabels[gap.type]}</span>
                    </div>
                    <p className="text-sm text-slate-600">{gap.description}</p>
                  </div>
                  <button
                    onClick={() => setGaps(gaps.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newGapType}
                  onChange={(e) => setNewGapType(e.target.value as ToolProfile['gaps'][0]['type'])}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {gapTypes.map(type => (
                    <option key={type} value={type}>{gapTypeLabels[type]}</option>
                  ))}
                </select>
                <select
                  value={newGapSeverity}
                  onChange={(e) => setNewGapSeverity(e.target.value as 'low' | 'medium' | 'high')}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="high">High Severity</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newGapDescription}
                  onChange={(e) => setNewGapDescription(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, addGap)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the gap..."
                />
                <button
                  onClick={addGap}
                  disabled={!newGapDescription.trim()}
                  className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Limitations */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Limitations ({limitations.length})
            </label>
            <div className="space-y-2 mb-3">
              {limitations.map((limitation, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg group">
                  <span className="flex-1 text-sm text-amber-700">{limitation}</span>
                  <button
                    onClick={() => setLimitations(limitations.filter((_, i) => i !== idx))}
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
                value={newLimitation}
                onChange={(e) => setNewLimitation(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addLimitation)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add limitation..."
              />
              <button
                onClick={addLimitation}
                disabled={!newLimitation.trim()}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
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
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
