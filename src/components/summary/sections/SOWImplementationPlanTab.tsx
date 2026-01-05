import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Edit2, Check, X, Calendar } from 'lucide-react';
import { SOWPhase, RecommendationProfile, SummarySOWConfig } from '../../../types/analysis';
import { formatCurrency } from '../../../utils/formatters';

interface SOWImplementationPlanTabProps {
  phases: SOWPhase[];
  onChange: (phases: SOWPhase[]) => void;
  selectedProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig;
}

const defaultPhases: Omit<SOWPhase, 'id'>[] = [
  {
    name: 'Phase 1: Immediate (0-30 days)',
    description: 'Quick wins and critical fixes that can be implemented immediately.',
    recommendationIds: [],
    order: 0,
  },
  {
    name: 'Phase 2: Short-term (1-3 months)',
    description: 'Core improvements that build on the foundation established in Phase 1.',
    recommendationIds: [],
    order: 1,
  },
  {
    name: 'Phase 3: Long-term (3-6 months)',
    description: 'Strategic initiatives for sustained improvement and optimization.',
    recommendationIds: [],
    order: 2,
  },
];

export function SOWImplementationPlanTab({
  phases,
  onChange,
  selectedProfiles,
  sowConfig,
}: SOWImplementationPlanTabProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(phases[0]?.id || null);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const initializeDefaultPhases = () => {
    const newPhases = defaultPhases.map((phase, index) => ({
      ...phase,
      id: `phase-${Date.now()}-${index}`,
      recommendationIds: [] as string[],
    }));

    // Auto-assign selected profiles to phases based on their phase property
    selectedProfiles.forEach(profile => {
      const phaseIndex =
        profile.phase === 'immediate' ? 0 :
        profile.phase === 'short-term' ? 1 : 2;
      if (newPhases[phaseIndex]) {
        newPhases[phaseIndex].recommendationIds.push(profile.id);
      }
    });

    onChange(newPhases);
    setExpandedPhase(newPhases[0]?.id || null);
  };

  const addPhase = () => {
    const newPhase: SOWPhase = {
      id: `phase-${Date.now()}`,
      name: `Phase ${phases.length + 1}`,
      description: 'Enter phase description...',
      recommendationIds: [],
      order: phases.length,
    };
    onChange([...phases, newPhase]);
    setExpandedPhase(newPhase.id);
  };

  const removePhase = (phaseId: string) => {
    onChange(phases.filter(p => p.id !== phaseId));
  };

  const startEditing = (phase: SOWPhase) => {
    setEditingPhaseId(phase.id);
    setEditName(phase.name);
    setEditDescription(phase.description);
  };

  const saveEditing = () => {
    if (!editingPhaseId) return;
    onChange(phases.map(p =>
      p.id === editingPhaseId
        ? { ...p, name: editName, description: editDescription }
        : p
    ));
    setEditingPhaseId(null);
  };

  const cancelEditing = () => {
    setEditingPhaseId(null);
    setEditName('');
    setEditDescription('');
  };

  const toggleItemInPhase = (phaseId: string, profileId: string) => {
    onChange(phases.map(phase => {
      if (phase.id === phaseId) {
        const hasItem = phase.recommendationIds.includes(profileId);
        return {
          ...phase,
          recommendationIds: hasItem
            ? phase.recommendationIds.filter(id => id !== profileId)
            : [...phase.recommendationIds, profileId],
        };
      }
      // Remove from other phases if adding to this one
      if (!phase.recommendationIds.includes(profileId)) {
        return phase;
      }
      // Check if we're adding to a different phase
      const targetPhase = phases.find(p => p.id === phaseId);
      if (targetPhase && !targetPhase.recommendationIds.includes(profileId)) {
        return {
          ...phase,
          recommendationIds: phase.recommendationIds.filter(id => id !== profileId),
        };
      }
      return phase;
    }));
  };

  const getPhaseProfiles = (phase: SOWPhase) => {
    return selectedProfiles.filter(p => phase.recommendationIds.includes(p.id));
  };

  const getPhaseTotals = (phase: SOWPhase) => {
    const profiles = getPhaseProfiles(phase);
    return profiles.reduce(
      (acc, p) => {
        if (p.deliveryProfile) {
          const hours = p.deliveryProfile.estimatedHours;
          const rate = p.deliveryProfile.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
          acc.hours += hours;
          acc.cost += hours * rate;
        }
        return acc;
      },
      { hours: 0, cost: 0 }
    );
  };

  const getUnassignedProfiles = () => {
    const assignedIds = new Set(phases.flatMap(p => p.recommendationIds));
    return selectedProfiles.filter(p => !assignedIds.has(p.id));
  };

  const unassigned = getUnassignedProfiles();

  if (phases.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900">Implementation Plan</h3>
          <p className="text-sm text-slate-500 mt-1">
            Organize your recommendations into implementation phases.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-600 mb-4">
            No phases defined yet. Start with our default timeline or create your own.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={initializeDefaultPhases}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Use Default Phases
            </button>
            <button
              onClick={addPhase}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Create Custom Phase
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Implementation Plan</h3>
          <p className="text-sm text-slate-500 mt-1">
            Assign recommendations to phases. Click items to move between phases.
          </p>
        </div>
        <button
          onClick={addPhase}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Phase
        </button>
      </div>

      {/* Unassigned items */}
      {unassigned.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            Unassigned Items ({unassigned.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {unassigned.map(profile => (
              <span
                key={profile.id}
                className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
              >
                {profile.title}
              </span>
            ))}
          </div>
          <p className="text-xs text-amber-600 mt-2">
            Expand a phase below and click items to assign them.
          </p>
        </div>
      )}

      {/* Phase list */}
      <div className="space-y-3">
        {phases.map(phase => {
          const totals = getPhaseTotals(phase);
          const phaseProfiles = getPhaseProfiles(phase);
          const isExpanded = expandedPhase === phase.id;
          const isEditing = editingPhaseId === phase.id;

          return (
            <div
              key={phase.id}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              {/* Phase header */}
              <div
                className={`flex items-center gap-3 px-4 py-3 bg-slate-50 ${
                  !isEditing ? 'cursor-pointer hover:bg-slate-100' : ''
                }`}
                onClick={() => !isEditing && setExpandedPhase(isExpanded ? null : phase.id)}
              >
                <GripVertical className="w-4 h-4 text-slate-400" />

                {isEditing ? (
                  <div className="flex-1 space-y-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-2 py-1 text-sm font-medium border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditing}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{phase.name}</h4>
                      <p className="text-xs text-slate-500">{phase.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>{phaseProfiles.length} items</span>
                      <span>{totals.hours} hrs</span>
                      <span className="font-medium text-indigo-600">
                        {formatCurrency(totals.cost, sowConfig.currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => startEditing(phase)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removePhase(phase.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </>
                )}
              </div>

              {/* Phase content */}
              {isExpanded && !isEditing && (
                <div className="p-4 border-t border-slate-200">
                  {selectedProfiles.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Select recommendations from the left panel first.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedProfiles.map(profile => {
                        const isInPhase = phase.recommendationIds.includes(profile.id);
                        const hours = profile.deliveryProfile?.estimatedHours || 0;
                        const rate = profile.deliveryProfile?.hourlyRateOverride ?? sowConfig.defaultHourlyRate;

                        return (
                          <div
                            key={profile.id}
                            onClick={() => toggleItemInPhase(phase.id, profile.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              isInPhase
                                ? 'bg-indigo-50 border border-indigo-200'
                                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isInPhase
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-slate-300'
                            }`}>
                              {isInPhase && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <span className={`text-sm ${isInPhase ? 'font-medium text-indigo-900' : 'text-slate-700'}`}>
                                {profile.title}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {hours} hrs • {formatCurrency(hours * rate, sowConfig.currency)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
