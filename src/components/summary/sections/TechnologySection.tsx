import { useState, useMemo } from 'react';
import { Wrench, Search, Plus, Filter, AlertTriangle } from 'lucide-react';
import { ToolProfile } from '../../../types/analysis';
import { ToolCard } from './ToolCard';
import { ToolDetailModal } from './ToolDetailModal';
import { ToolEditModal } from './ToolEditModal';
import { ToolMergeModal } from './ToolMergeModal';
import { nanoid } from 'nanoid';

interface TechnologySectionProps {
  toolProfiles?: ToolProfile[];
  onUpdateProfiles?: (profiles: ToolProfile[]) => Promise<void>;
}

const categoryLabels: Record<ToolProfile['category'], string> = {
  crm: 'CRM',
  pm: 'Project Mgmt',
  spreadsheet: 'Spreadsheet',
  communication: 'Communication',
  erp: 'ERP',
  custom: 'Custom',
  other: 'Other',
};

const categories: ToolProfile['category'][] = ['crm', 'pm', 'spreadsheet', 'communication', 'erp', 'custom', 'other'];

export function TechnologySection({ toolProfiles = [], onUpdateProfiles }: TechnologySectionProps) {
  const [selectedTool, setSelectedTool] = useState<ToolProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<ToolProfile | null>(null);
  const [mergingProfile, setMergingProfile] = useState<ToolProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ToolProfile['category'] | 'all'>('all');
  const [showGapsOnly, setShowGapsOnly] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolCategory, setNewToolCategory] = useState<ToolProfile['category']>('other');

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let filtered = toolProfiles;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Gaps filter
    if (showGapsOnly) {
      filtered = filtered.filter(p => p.gaps.length > 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(query) ||
        profile.usedBy.some(u => u.role.toLowerCase().includes(query)) ||
        profile.workflows.some(w => w.name.toLowerCase().includes(query)) ||
        profile.intendedPurpose.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [toolProfiles, searchQuery, categoryFilter, showGapsOnly]);

  const hasProfiles = toolProfiles.length > 0;
  const gapCount = toolProfiles.reduce((sum, p) => sum + p.gaps.length, 0);

  // Profile handlers
  const handleEditProfile = (profile: ToolProfile) => {
    setEditingProfile(profile);
  };

  const handleSaveProfile = async (updatedProfile: ToolProfile) => {
    if (!onUpdateProfiles) return;

    const updatedProfiles = toolProfiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    await onUpdateProfiles(updatedProfiles);
    setEditingProfile(null);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!onUpdateProfiles) return;

    const updatedProfiles = toolProfiles.filter(p => p.id !== profileId);
    await onUpdateProfiles(updatedProfiles);
    setDeleteConfirm(null);
  };

  const confirmDelete = (profileId: string) => {
    setDeleteConfirm(profileId);
  };

  // Add new tool
  const handleAddTool = async () => {
    if (!onUpdateProfiles || !newToolName.trim()) return;

    const newProfile: ToolProfile = {
      id: nanoid(),
      name: newToolName.trim(),
      count: 0,
      category: newToolCategory,
      intendedPurpose: '',
      actualUsage: [],
      frequency: 'unknown',
      usedBy: [],
      workflows: [],
      integratesWith: [],
      dataFlows: [],
      gaps: [],
      limitations: [],
      interviewIds: [],
    };

    await onUpdateProfiles([...toolProfiles, newProfile]);
    setNewToolName('');
    setNewToolCategory('other');
    setIsAdding(false);
    // Open edit modal for the new tool
    setEditingProfile(newProfile);
  };

  // Merge handlers
  const handleMergeProfile = (profile: ToolProfile) => {
    setMergingProfile(profile);
  };

  const handleMerge = async (sourceId: string, targetId: string, mergedName: string) => {
    if (!onUpdateProfiles) return;

    const sourceProfile = toolProfiles.find(p => p.id === sourceId);
    const targetProfile = toolProfiles.find(p => p.id === targetId);

    if (!sourceProfile || !targetProfile) return;

    // Merge usedBy (combine roles, sum counts)
    const usedByMap = new Map<string, { role: string; purpose: string; count: number }>();
    [...targetProfile.usedBy, ...sourceProfile.usedBy].forEach(user => {
      const key = user.role.toLowerCase();
      const existing = usedByMap.get(key);
      if (existing) {
        existing.count += user.count;
        if (user.purpose && user.purpose !== 'General use') {
          existing.purpose = existing.purpose === 'General use' ? user.purpose : `${existing.purpose}; ${user.purpose}`;
        }
      } else {
        usedByMap.set(key, { ...user });
      }
    });

    // Merge workflows
    const workflowsMap = new Map<string, { name: string; step?: string; count: number }>();
    [...targetProfile.workflows, ...sourceProfile.workflows].forEach(wf => {
      const key = wf.name.toLowerCase();
      const existing = workflowsMap.get(key);
      if (existing) {
        existing.count += wf.count;
      } else {
        workflowsMap.set(key, { ...wf });
      }
    });

    // Create merged profile
    const mergedProfile: ToolProfile = {
      id: targetId,
      name: mergedName,
      count: sourceProfile.count + targetProfile.count,
      category: targetProfile.category,
      intendedPurpose: targetProfile.intendedPurpose || sourceProfile.intendedPurpose,
      actualUsage: [...new Set([...targetProfile.actualUsage, ...sourceProfile.actualUsage])],
      frequency: targetProfile.frequency !== 'unknown' ? targetProfile.frequency : sourceProfile.frequency,
      usedBy: Array.from(usedByMap.values()),
      workflows: Array.from(workflowsMap.values()),
      integratesWith: [...new Set([...targetProfile.integratesWith, ...sourceProfile.integratesWith])],
      dataFlows: [...targetProfile.dataFlows, ...sourceProfile.dataFlows],
      gaps: [...targetProfile.gaps, ...sourceProfile.gaps].slice(0, 5),
      limitations: [...new Set([...targetProfile.limitations, ...sourceProfile.limitations])],
      interviewIds: [...new Set([...targetProfile.interviewIds, ...sourceProfile.interviewIds])],
    };

    // Remove source profile and update target with merged data
    const updatedProfiles = toolProfiles
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
            <Wrench className="w-6 h-6 text-indigo-600" />
            Technology & Systems
          </h2>
          <p className="text-slate-600">
            {hasProfiles
              ? `${toolProfiles.length} tool${toolProfiles.length !== 1 ? 's' : ''} identified with usage analysis.`
              : 'No tools identified yet.'}
            {gapCount > 0 && (
              <span className="ml-2 text-amber-600">
                ({gapCount} gap{gapCount !== 1 ? 's' : ''} detected)
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
            Add Tool
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
              placeholder="Search tools, users, workflows..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ToolProfile['category'] | 'all')}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>
          </div>

          {/* Gaps filter */}
          <button
            onClick={() => setShowGapsOnly(!showGapsOnly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              showGapsOnly
                ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Gaps Only
          </button>
        </div>
      )}

      {/* Add new tool form */}
      {isAdding && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newToolName}
              onChange={(e) => setNewToolName(e.target.value)}
              placeholder="Tool name (e.g., Salesforce, Asana)"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newToolName.trim()) {
                  handleAddTool();
                }
              }}
            />
            <select
              value={newToolCategory}
              onChange={(e) => setNewToolCategory(e.target.value as ToolProfile['category'])}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsAdding(false); setNewToolName(''); }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTool}
              disabled={!newToolName.trim()}
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
            <p className="text-slate-500">No tools match your filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setShowGapsOnly(false); }}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <ToolCard
                key={profile.id}
                profile={profile}
                onClick={() => setSelectedTool(profile)}
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
          <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No tools identified yet.</p>
          {onUpdateProfiles && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Add Your First Tool
            </button>
          )}
        </div>
      )}

      {/* Tool Detail Modal */}
      {selectedTool && !editingProfile && (
        <ToolDetailModal
          profile={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}

      {/* Tool Edit Modal */}
      {editingProfile && (
        <ToolEditModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}

      {/* Tool Merge Modal */}
      {mergingProfile && (
        <ToolMergeModal
          sourceProfile={mergingProfile}
          allProfiles={toolProfiles}
          onMerge={handleMerge}
          onClose={() => setMergingProfile(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Tool?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this tool? This action cannot be undone.
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
