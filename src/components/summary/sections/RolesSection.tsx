import { useState, useMemo } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { RoleProfile } from '../../../types/analysis';
import { RoleProfileCard } from './RoleProfileCard';
import { RoleListRow } from './RoleListRow';
import { RoleDetailModal } from './RoleDetailModal';
import { RoleEditModal } from './RoleEditModal';
import { RoleMergeModal } from './RoleMergeModal';
import { ViewModeToggle, ViewMode } from '../ViewModeToggle';

// Helper function to merge arrays by a key, combining counts
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

interface RolesSectionProps {
  roleDistribution: Record<string, number>;
  roleProfiles?: RoleProfile[];
  onUpdate?: (roleDistribution: Record<string, number>) => Promise<void>;
  onUpdateProfiles?: (profiles: RoleProfile[]) => Promise<void>;
}

export function RolesSection({ roleDistribution, roleProfiles = [], onUpdate, onUpdateProfiles }: RolesSectionProps) {
  const [selectedRole, setSelectedRole] = useState<RoleProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<RoleProfile | null>(null);
  const [mergingProfile, setMergingProfile] = useState<RoleProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [newCount, setNewCount] = useState(1);
  const [editRole, setEditRole] = useState('');
  const [editCount, setEditCount] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter profiles by search query
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return roleProfiles;
    const query = searchQuery.toLowerCase();
    return roleProfiles.filter(profile =>
      profile.title.toLowerCase().includes(query) ||
      profile.responsibilities.some(r => r.toLowerCase().includes(query)) ||
      profile.workflows.some(w => w.toLowerCase().includes(query)) ||
      profile.tools.some(t => t.toLowerCase().includes(query))
    );
  }, [roleProfiles, searchQuery]);

  // For legacy display when no profiles available
  const sortedRoles = Object.entries(roleDistribution).sort(([, a], [, b]) => b - a);
  const hasProfiles = roleProfiles.length > 0;

  const handleAdd = async () => {
    if (!onUpdate || !newRole.trim()) return;
    const updated = { ...roleDistribution, [newRole.trim()]: newCount };
    await onUpdate(updated);
    setNewRole('');
    setNewCount(1);
    setIsAdding(false);
  };

  const handleEdit = async (oldRole: string) => {
    if (!onUpdate || !editRole.trim()) return;
    const updated = { ...roleDistribution };
    if (editRole.trim() !== oldRole) {
      delete updated[oldRole];
    }
    updated[editRole.trim()] = editCount;
    await onUpdate(updated);
    setEditingRole(null);
  };

  const handleDelete = async (role: string) => {
    if (!onUpdate) return;
    const updated = { ...roleDistribution };
    delete updated[role];
    await onUpdate(updated);
  };

  const startEditing = (role: string, count: number) => {
    setEditingRole(role);
    setEditRole(role);
    setEditCount(count);
  };

  // Profile-based handlers
  const handleEditProfile = (profile: RoleProfile) => {
    setEditingProfile(profile);
  };

  const handleSaveProfile = async (updatedProfile: RoleProfile) => {
    if (!onUpdateProfiles) return;

    const updatedProfiles = roleProfiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    await onUpdateProfiles(updatedProfiles);
    setEditingProfile(null);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!onUpdateProfiles) return;

    const updatedProfiles = roleProfiles.filter(p => p.id !== profileId);
    await onUpdateProfiles(updatedProfiles);
    setDeleteConfirm(null);
  };

  const confirmDelete = (profileId: string) => {
    setDeleteConfirm(profileId);
  };

  // Merge handlers
  const handleMergeProfile = (profile: RoleProfile) => {
    setMergingProfile(profile);
  };

  const handleMerge = async (sourceId: string, targetId: string, mergedTitle: string) => {
    if (!onUpdateProfiles) return;

    const sourceProfile = roleProfiles.find(p => p.id === sourceId);
    const targetProfile = roleProfiles.find(p => p.id === targetId);

    if (!sourceProfile || !targetProfile) return;

    // Create merged profile
    const mergedProfile: RoleProfile = {
      id: targetId, // Keep target ID
      title: mergedTitle,
      count: sourceProfile.count + targetProfile.count,
      responsibilities: [...new Set([...targetProfile.responsibilities, ...sourceProfile.responsibilities])],
      workflows: [...new Set([...targetProfile.workflows, ...sourceProfile.workflows])],
      tools: [...new Set([...targetProfile.tools, ...sourceProfile.tools])],
      inputsFrom: mergeArraysByKey(
        [...targetProfile.inputsFrom, ...sourceProfile.inputsFrom],
        (item) => `${item.role.toLowerCase()}-${item.process.toLowerCase()}`,
        (a, b) => ({ ...a, count: a.count + b.count })
      ),
      outputsTo: mergeArraysByKey(
        [...targetProfile.outputsTo, ...sourceProfile.outputsTo],
        (item) => `${item.role.toLowerCase()}-${item.process.toLowerCase()}`,
        (a, b) => ({ ...a, count: a.count + b.count })
      ),
      issuesDetected: mergeArraysByKey(
        [...targetProfile.issuesDetected, ...sourceProfile.issuesDetected],
        (item) => item.description.toLowerCase().slice(0, 50),
        (a, b) => ({ ...a, count: a.count + b.count })
      ),
      trainingNeeds: mergeArraysByKey(
        [...targetProfile.trainingNeeds, ...sourceProfile.trainingNeeds],
        (item) => item.area.toLowerCase(),
        (a, b) => ({ ...a, count: a.count + b.count })
      ),
      interviewIds: [...new Set([...targetProfile.interviewIds, ...sourceProfile.interviewIds])],
    };

    // Remove source profile and update target with merged data
    const updatedProfiles = roleProfiles
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
            <Users className="w-6 h-6 text-purple-600" />
            Role & Responsibility Breakdown
          </h2>
          <p className="text-slate-600">
            {hasProfiles
              ? `${roleProfiles.length} role${roleProfiles.length !== 1 ? 's' : ''} identified with detailed profiles.`
              : `Distribution of roles identified across ${Object.keys(roleDistribution).length} unique positions.`}
          </p>
        </div>
        {onUpdate && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        )}
      </div>

      {/* Search bar and view toggle for profiles */}
      {hasProfiles && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles, responsibilities, workflows, or tools..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      )}

      {/* Add new role form */}
      {isAdding && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Role title"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <input
              type="number"
              value={newCount}
              onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
              min={1}
              placeholder="Count"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsAdding(false); setNewRole(''); setNewCount(1); }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newRole.trim()}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {hasProfiles ? (
        // New profile cards view
        filteredProfiles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No roles match your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <RoleProfileCard
                key={profile.id}
                profile={profile}
                onClick={() => setSelectedRole(profile)}
                onEdit={() => handleEditProfile(profile)}
                onMerge={() => handleMergeProfile(profile)}
                onDelete={() => confirmDelete(profile.id)}
                canEdit={!!onUpdateProfiles}
              />
            ))}
          </div>
        )
      ) : (
        // Legacy simple grid view
        sortedRoles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No roles identified yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedRoles.map(([role, count]) => (
              <div key={role} className="group">
                {editingRole === role ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-2 py-1 mb-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={editCount}
                        onChange={(e) => setEditCount(parseInt(e.target.value) || 1)}
                        min={1}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingRole(null)}
                          className="p-1 text-slate-500 hover:bg-white rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-1 text-purple-600 hover:bg-white rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 relative">
                    <p className="text-sm font-semibold text-purple-900 pr-12">{role}</p>
                    <p className="text-2xl font-bold text-purple-600">{count}</p>
                    {onUpdate && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(role, count)}
                          className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Role Detail Modal */}
      {selectedRole && !editingProfile && (
        <RoleDetailModal
          profile={selectedRole}
          onClose={() => setSelectedRole(null)}
        />
      )}

      {/* Role Edit Modal */}
      {editingProfile && (
        <RoleEditModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}

      {/* Role Merge Modal */}
      {mergingProfile && (
        <RoleMergeModal
          sourceProfile={mergingProfile}
          allProfiles={roleProfiles}
          onMerge={handleMerge}
          onClose={() => setMergingProfile(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Role?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this role? This action cannot be undone.
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
