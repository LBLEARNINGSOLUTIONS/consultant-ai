import { useState, useMemo } from 'react';
import { TrendingUp, Search, Plus } from 'lucide-react';
import { WorkflowProfile, WorkflowStep } from '../../../types/analysis';
import { WorkflowCard } from './WorkflowCard';
import { WorkflowDetailModal } from './WorkflowDetailModal';
import { WorkflowEditModal } from './WorkflowEditModal';
import { WorkflowMergeModal } from './WorkflowMergeModal';
import { nanoid } from 'nanoid';

// Helper function to merge arrays, combining counts
function mergeArraysByKey<T>(
  items: T[],
  getKey: (item: T) => string,
  merge: (a: T, b: T) => T
): T[] {
  const map = new Map<string, T>();
  items.forEach(item => {
    const key = getKey(item);
    const existing = map.get(key);
    if (existing) {
      map.set(key, merge(existing, item));
    } else {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}

interface WorkflowsSectionProps {
  workflowProfiles?: WorkflowProfile[];
  onUpdateProfiles?: (profiles: WorkflowProfile[]) => Promise<void>;
}

export function WorkflowsSection({ workflowProfiles = [], onUpdateProfiles }: WorkflowsSectionProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<WorkflowProfile | null>(null);
  const [mergingProfile, setMergingProfile] = useState<WorkflowProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  // Filter profiles by search query
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return workflowProfiles;
    const query = searchQuery.toLowerCase();
    return workflowProfiles.filter(profile =>
      profile.name.toLowerCase().includes(query) ||
      profile.participants.some(p => p.toLowerCase().includes(query)) ||
      profile.systems.some(s => s.toLowerCase().includes(query)) ||
      profile.steps.some(step => step.name.toLowerCase().includes(query))
    );
  }, [workflowProfiles, searchQuery]);

  const hasProfiles = workflowProfiles.length > 0;

  // Profile handlers
  const handleEditProfile = (profile: WorkflowProfile) => {
    setEditingProfile(profile);
  };

  const handleSaveProfile = async (updatedProfile: WorkflowProfile) => {
    if (!onUpdateProfiles) return;

    const updatedProfiles = workflowProfiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    await onUpdateProfiles(updatedProfiles);
    setEditingProfile(null);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!onUpdateProfiles) return;

    const updatedProfiles = workflowProfiles.filter(p => p.id !== profileId);
    await onUpdateProfiles(updatedProfiles);
    setDeleteConfirm(null);
  };

  const confirmDelete = (profileId: string) => {
    setDeleteConfirm(profileId);
  };

  // Add new workflow
  const handleAddWorkflow = async () => {
    if (!onUpdateProfiles || !newWorkflowName.trim()) return;

    const newProfile: WorkflowProfile = {
      id: nanoid(),
      name: newWorkflowName.trim(),
      count: 0,
      frequency: 'ad-hoc',
      steps: [],
      participants: [],
      systems: [],
      failurePoints: [],
      unclearSteps: [],
      interviewIds: [],
    };

    await onUpdateProfiles([...workflowProfiles, newProfile]);
    setNewWorkflowName('');
    setIsAdding(false);
    // Open edit modal for the new workflow
    setEditingProfile(newProfile);
  };

  // Merge handlers
  const handleMergeProfile = (profile: WorkflowProfile) => {
    setMergingProfile(profile);
  };

  const handleMerge = async (sourceId: string, targetId: string, mergedName: string) => {
    if (!onUpdateProfiles) return;

    const sourceProfile = workflowProfiles.find(p => p.id === sourceId);
    const targetProfile = workflowProfiles.find(p => p.id === targetId);

    if (!sourceProfile || !targetProfile) return;

    // Merge steps (deduplicate by name, keep order from target first then source)
    const mergedStepsMap = new Map<string, WorkflowStep>();
    [...targetProfile.steps, ...sourceProfile.steps].forEach(step => {
      const key = step.name.toLowerCase();
      if (!mergedStepsMap.has(key)) {
        mergedStepsMap.set(key, { ...step, id: step.id });
      }
    });

    // Determine frequency (keep most frequent)
    const freqOrder: Record<string, number> = { daily: 4, weekly: 3, monthly: 2, 'ad-hoc': 1 };
    const mergedFrequency = (freqOrder[sourceProfile.frequency] || 0) > (freqOrder[targetProfile.frequency] || 0)
      ? sourceProfile.frequency
      : targetProfile.frequency;

    // Create merged profile
    const mergedProfile: WorkflowProfile = {
      id: targetId, // Keep target ID
      name: mergedName,
      count: sourceProfile.count + targetProfile.count,
      frequency: mergedFrequency,
      steps: Array.from(mergedStepsMap.values()),
      participants: [...new Set([...targetProfile.participants, ...sourceProfile.participants])],
      systems: [...new Set([...targetProfile.systems, ...sourceProfile.systems])],
      failurePoints: mergeArraysByKey(
        [...targetProfile.failurePoints, ...sourceProfile.failurePoints],
        (item) => item.description.toLowerCase().slice(0, 50),
        (a) => a // Keep first occurrence
      ),
      unclearSteps: [...new Set([...targetProfile.unclearSteps, ...sourceProfile.unclearSteps])],
      interviewIds: [...new Set([...targetProfile.interviewIds, ...sourceProfile.interviewIds])],
    };

    // Remove source profile and update target with merged data
    const updatedProfiles = workflowProfiles
      .filter(p => p.id !== sourceId)
      .map(p => p.id === targetId ? mergedProfile : p);

    await onUpdateProfiles(updatedProfiles);
    setMergingProfile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Workflow & Process Analysis
          </h2>
          <p className="text-slate-600">
            {hasProfiles
              ? `${workflowProfiles.length} workflow${workflowProfiles.length !== 1 ? 's' : ''} identified with process details.`
              : 'No workflows identified yet.'}
          </p>
        </div>
        {onUpdateProfiles && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Workflow
          </button>
        )}
      </div>

      {/* Search bar */}
      {hasProfiles && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows, participants, systems, or steps..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Add new workflow form */}
      {isAdding && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="mb-3">
            <input
              type="text"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="Workflow name (e.g., Order Processing, Lead to Close)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newWorkflowName.trim()) {
                  handleAddWorkflow();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsAdding(false); setNewWorkflowName(''); }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWorkflow}
              disabled={!newWorkflowName.trim()}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add & Edit
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {hasProfiles ? (
        filteredProfiles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No workflows match your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <WorkflowCard
                key={profile.id}
                profile={profile}
                onClick={() => setSelectedWorkflow(profile)}
                onEdit={() => handleEditProfile(profile)}
                onMerge={() => handleMergeProfile(profile)}
                onDelete={() => confirmDelete(profile.id)}
                canEdit={!!onUpdateProfiles}
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No workflows identified yet.</p>
          {onUpdateProfiles && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Your First Workflow
            </button>
          )}
        </div>
      )}

      {/* Workflow Detail Modal */}
      {selectedWorkflow && !editingProfile && (
        <WorkflowDetailModal
          profile={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
        />
      )}

      {/* Workflow Edit Modal */}
      {editingProfile && (
        <WorkflowEditModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}

      {/* Workflow Merge Modal */}
      {mergingProfile && (
        <WorkflowMergeModal
          sourceProfile={mergingProfile}
          allProfiles={workflowProfiles}
          onMerge={handleMerge}
          onClose={() => setMergingProfile(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Workflow?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this workflow? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProfile(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
