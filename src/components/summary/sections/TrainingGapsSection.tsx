import { useState, useMemo } from 'react';
import { GraduationCap, Plus, Search, Filter, AlertTriangle, Users, ChevronDown, ChevronRight, Brain, Wrench, TrendingUp, BookOpen, HelpCircle } from 'lucide-react';
import { TrainingGapProfile } from '../../../types/analysis';
import { TrainingGapCard } from './TrainingGapCard';
import { TrainingGapDetailModal } from './TrainingGapDetailModal';
import { TrainingGapEditModal } from './TrainingGapEditModal';
import { nanoid } from 'nanoid';

interface TrainingGapsSectionProps {
  trainingGapProfiles?: TrainingGapProfile[];
  onUpdateProfiles?: (profiles: TrainingGapProfile[]) => Promise<void>;
}

const categoryLabels: Record<TrainingGapProfile['category'], string> = {
  skill: 'Skill',
  system: 'System',
  process: 'Process',
  knowledge: 'Knowledge',
  other: 'Other',
};

const categoryIcons: Record<TrainingGapProfile['category'], typeof GraduationCap> = {
  skill: Brain,
  system: Wrench,
  process: TrendingUp,
  knowledge: BookOpen,
  other: HelpCircle,
};

const categories: TrainingGapProfile['category'][] = ['skill', 'system', 'process', 'knowledge', 'other'];

export function TrainingGapsSection({ trainingGapProfiles = [], onUpdateProfiles }: TrainingGapsSectionProps) {
  const [selectedGap, setSelectedGap] = useState<TrainingGapProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<TrainingGapProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TrainingGapProfile['category'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TrainingGapProfile['priority'] | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<TrainingGapProfile['risk']['severity'] | 'all'>('all');
  const [groupByRole, setGroupByRole] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newGapArea, setNewGapArea] = useState('');
  const [newGapCategory, setNewGapCategory] = useState<TrainingGapProfile['category']>('other');

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let filtered = trainingGapProfiles;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(p => p.priority === priorityFilter);
    }

    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(p => p.risk.severity === riskFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.area.toLowerCase().includes(query) ||
        profile.affectedRoles.some(r => r.role.toLowerCase().includes(query)) ||
        profile.relatedSystems.some(s => s.toLowerCase().includes(query)) ||
        profile.relatedWorkflows.some(w => w.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [trainingGapProfiles, searchQuery, categoryFilter, priorityFilter, riskFilter]);

  // Group by role for role-grouped view
  const profilesByRole = useMemo(() => {
    const roleMap = new Map<string, TrainingGapProfile[]>();

    filteredProfiles.forEach(profile => {
      profile.affectedRoles.forEach(role => {
        const existing = roleMap.get(role.role) || [];
        if (!existing.includes(profile)) {
          existing.push(profile);
        }
        roleMap.set(role.role, existing);
      });

      // Also add to "Unassigned" if no roles
      if (profile.affectedRoles.length === 0) {
        const existing = roleMap.get('Unassigned') || [];
        existing.push(profile);
        roleMap.set('Unassigned', existing);
      }
    });

    // Sort by gap count descending
    return Array.from(roleMap.entries())
      .map(([role, profiles]) => ({ role, profiles }))
      .sort((a, b) => b.profiles.length - a.profiles.length);
  }, [filteredProfiles]);

  const hasProfiles = trainingGapProfiles.length > 0;
  const criticalCount = trainingGapProfiles.filter(p => p.risk.severity === 'critical' || p.risk.severity === 'high').length;
  const uniqueRolesAffected = new Set(trainingGapProfiles.flatMap(p => p.affectedRoles.map(r => r.role))).size;

  // Toggle role expansion
  const toggleRole = (role: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  // Profile handlers
  const handleEditProfile = (profile: TrainingGapProfile) => {
    setEditingProfile(profile);
  };

  const handleSaveProfile = async (updatedProfile: TrainingGapProfile) => {
    if (!onUpdateProfiles) return;

    const updatedProfiles = trainingGapProfiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    await onUpdateProfiles(updatedProfiles);
    setEditingProfile(null);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!onUpdateProfiles) return;

    const updatedProfiles = trainingGapProfiles.filter(p => p.id !== profileId);
    await onUpdateProfiles(updatedProfiles);
    setDeleteConfirm(null);
  };

  const confirmDelete = (profileId: string) => {
    setDeleteConfirm(profileId);
  };

  // Add new gap
  const handleAddGap = async () => {
    if (!onUpdateProfiles || !newGapArea.trim()) return;

    const newProfile: TrainingGapProfile = {
      id: nanoid(),
      area: newGapArea.trim(),
      count: 0,
      category: newGapCategory,
      priority: 'medium',
      currentState: 'Not documented',
      desiredState: 'Not specified',
      suggestedTraining: 'Training approach to be determined',
      affectedRoles: [],
      relatedSystems: [],
      relatedWorkflows: [],
      risk: {
        severity: 'low',
        description: 'Standard training priority',
        businessImpact: 'Impact to be assessed',
      },
      interviewIds: [],
    };

    await onUpdateProfiles([...trainingGapProfiles, newProfile]);
    setNewGapArea('');
    setNewGapCategory('other');
    setIsAdding(false);
    // Open edit modal for the new gap
    setEditingProfile(newProfile);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            Training & Capability Gaps
          </h2>
          <p className="text-slate-600">
            {hasProfiles
              ? `${trainingGapProfiles.length} gap${trainingGapProfiles.length !== 1 ? 's' : ''} identified affecting ${uniqueRolesAffected} role${uniqueRolesAffected !== 1 ? 's' : ''}.`
              : 'No training gaps identified yet.'}
            {criticalCount > 0 && (
              <span className="ml-2 text-red-600">
                ({criticalCount} high/critical risk)
              </span>
            )}
          </p>
        </div>
        {onUpdateProfiles && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Gap
          </button>
        )}
      </div>

      {/* Filters */}
      {hasProfiles && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gaps, roles, systems..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TrainingGapProfile['category'] | 'all')}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TrainingGapProfile['priority'] | 'all')}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Risk filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as TrainingGapProfile['risk']['severity'] | 'all')}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Group by Role toggle */}
          <button
            onClick={() => setGroupByRole(!groupByRole)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              groupByRole
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Group by Role
          </button>
        </div>
      )}

      {/* Add new gap form */}
      {isAdding && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newGapArea}
              onChange={(e) => setNewGapArea(e.target.value)}
              placeholder="Training gap area (e.g., Excel Advanced Functions)"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newGapArea.trim()) {
                  handleAddGap();
                }
              }}
            />
            <select
              value={newGapCategory}
              onChange={(e) => setNewGapCategory(e.target.value as TrainingGapProfile['category'])}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsAdding(false); setNewGapArea(''); }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddGap}
              disabled={!newGapArea.trim()}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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
            <p className="text-slate-500">No training gaps match your filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setPriorityFilter('all'); setRiskFilter('all'); }}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          </div>
        ) : groupByRole ? (
          // Role-grouped view
          <div className="space-y-4">
            {profilesByRole.map(({ role, profiles }) => {
              const isExpanded = expandedRoles.has(role);
              const roleHighRisk = profiles.filter(p => p.risk.severity === 'critical' || p.risk.severity === 'high').length;

              return (
                <div key={role} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleRole(role)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                      <Users className="w-5 h-5 text-indigo-500" />
                      <span className="font-semibold text-slate-900">{role}</span>
                      <span className="text-sm text-slate-500">
                        ({profiles.length} gap{profiles.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    {roleHighRisk > 0 && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        {roleHighRisk} high risk
                      </div>
                    )}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profiles.map((profile) => (
                          <TrainingGapCard
                            key={profile.id}
                            profile={profile}
                            onClick={() => setSelectedGap(profile)}
                            onEdit={() => handleEditProfile(profile)}
                            onDelete={() => confirmDelete(profile.id)}
                            canEdit={!!onUpdateProfiles}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Grid view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <TrainingGapCard
                key={profile.id}
                profile={profile}
                onClick={() => setSelectedGap(profile)}
                onEdit={() => handleEditProfile(profile)}
                onDelete={() => confirmDelete(profile.id)}
                canEdit={!!onUpdateProfiles}
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No training gaps identified yet.</p>
          {onUpdateProfiles && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Add Your First Training Gap
            </button>
          )}
        </div>
      )}

      {/* Gap Detail Modal */}
      {selectedGap && !editingProfile && (
        <TrainingGapDetailModal
          profile={selectedGap}
          onClose={() => setSelectedGap(null)}
        />
      )}

      {/* Gap Edit Modal */}
      {editingProfile && (
        <TrainingGapEditModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Training Gap?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this training gap? This action cannot be undone.
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
