import { useState } from 'react';
import { X, Lightbulb, Plus, Trash2 } from 'lucide-react';
import { RecommendationProfile } from '../../../types/analysis';

interface RecommendationEditModalProps {
  profile: RecommendationProfile;
  onSave: (updatedProfile: RecommendationProfile) => void;
  onClose: () => void;
}

const categories: RecommendationProfile['category'][] = ['process', 'training', 'technology', 'organization', 'risk-mitigation'];

const categoryLabels: Record<RecommendationProfile['category'], string> = {
  process: 'Process Improvement',
  training: 'Training & Development',
  technology: 'Technology Enhancement',
  organization: 'Organizational Change',
  'risk-mitigation': 'Risk Mitigation',
};

const phases: RecommendationProfile['phase'][] = ['immediate', 'short-term', 'long-term'];

const phaseLabels: Record<RecommendationProfile['phase'], string> = {
  immediate: 'Immediate (0-30 days)',
  'short-term': 'Short-term (30-90 days)',
  'long-term': 'Long-term (90+ days)',
};

const effortLevels: RecommendationProfile['levelOfEffort'][] = ['low', 'medium', 'high'];

export function RecommendationEditModal({ profile, onSave, onClose }: RecommendationEditModalProps) {
  const [title, setTitle] = useState(profile.title);
  const [description, setDescription] = useState(profile.description);
  const [priority, setPriority] = useState(profile.priority);
  const [category, setCategory] = useState(profile.category);
  const [phase, setPhase] = useState(profile.phase);
  const [problemAddressed, setProblemAddressed] = useState(profile.problemAddressed);
  const [scope, setScope] = useState(profile.scope);
  const [expectedImpact, setExpectedImpact] = useState(profile.expectedImpact);
  const [levelOfEffort, setLevelOfEffort] = useState(profile.levelOfEffort);
  const [effortDetails, setEffortDetails] = useState(profile.effortDetails || '');
  const [dependencies, setDependencies] = useState<string[]>([...profile.dependencies]);
  const [newDependency, setNewDependency] = useState('');

  const handleSave = () => {
    if (!title.trim() || !description.trim()) return;

    const updatedProfile: RecommendationProfile = {
      ...profile,
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      phase,
      problemAddressed: problemAddressed.trim() || 'Identified need for improvement',
      scope: scope.trim() || 'Organization-wide',
      expectedImpact: expectedImpact.trim() || 'Impact to be assessed',
      levelOfEffort,
      effortDetails: effortDetails.trim() || undefined,
      dependencies: dependencies.filter(d => d.trim()),
      source: 'manual', // Once edited, it becomes manual
    };

    onSave(updatedProfile);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const addDependency = () => {
    if (newDependency.trim() && !dependencies.includes(newDependency.trim())) {
      setDependencies([...dependencies, newDependency.trim()]);
      setNewDependency('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Recommendation</h2>
              <p className="text-emerald-100 text-sm">
                Modify recommendation details and roadmap placement
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Short summary of the recommendation"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Full recommendation details..."
            />
          </div>

          {/* Classification row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RecommendationProfile['category'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                onChange={(e) => setPriority(e.target.value as RecommendationProfile['priority'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phase
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as RecommendationProfile['phase'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {phases.map(p => (
                  <option key={p} value={p}>{phaseLabels[p]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Problem Addressed */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Problem Addressed
            </label>
            <textarea
              value={problemAddressed}
              onChange={(e) => setProblemAddressed(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="What issue or pain point does this solve?"
            />
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Scope
            </label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Who/what is affected? (e.g., 'Operations team, Order processing')"
            />
          </div>

          {/* Expected Impact */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Expected Impact
            </label>
            <textarea
              value={expectedImpact}
              onChange={(e) => setExpectedImpact(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="What business/operational outcome is expected?"
            />
          </div>

          {/* Effort row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Level of Effort
              </label>
              <select
                value={levelOfEffort}
                onChange={(e) => setLevelOfEffort(e.target.value as RecommendationProfile['levelOfEffort'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {effortLevels.map(level => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Effort Details (optional)
              </label>
              <input
                type="text"
                value={effortDetails}
                onChange={(e) => setEffortDetails(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., '2-3 weeks', '$5,000 budget'"
              />
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dependencies ({dependencies.length})
            </label>
            <div className="space-y-2 mb-3">
              {dependencies.map((dep, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                  <span className="flex-1 text-sm text-slate-700">{dep}</span>
                  <button
                    onClick={() => setDependencies(dependencies.filter((_, i) => i !== idx))}
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
                value={newDependency}
                onChange={(e) => setNewDependency(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addDependency)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Add prerequisite or dependency..."
              />
              <button
                onClick={addDependency}
                disabled={!newDependency.trim()}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
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
            disabled={!title.trim() || !description.trim()}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
