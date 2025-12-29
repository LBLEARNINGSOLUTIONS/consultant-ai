import { useState, useMemo } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { RoleProfile } from '../../../types/analysis';
import { RoleProfileCard } from './RoleProfileCard';
import { RoleDetailModal } from './RoleDetailModal';

interface RolesSectionProps {
  roleDistribution: Record<string, number>;
  roleProfiles?: RoleProfile[];
  onUpdate?: (roleDistribution: Record<string, number>) => Promise<void>;
}

export function RolesSection({ roleDistribution, roleProfiles = [], onUpdate }: RolesSectionProps) {
  const [selectedRole, setSelectedRole] = useState<RoleProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [newCount, setNewCount] = useState(1);
  const [editRole, setEditRole] = useState('');
  const [editCount, setEditCount] = useState(1);

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

      {/* Search bar for profiles */}
      {hasProfiles && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, responsibilities, workflows, or tools..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
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
      {selectedRole && (
        <RoleDetailModal
          profile={selectedRole}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
}
