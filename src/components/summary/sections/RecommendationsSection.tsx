import { useState, useMemo } from 'react';
import { Lightbulb, Plus, Search, Filter, Zap, Clock, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { RecommendationProfile } from '../../../types/analysis';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationListRow } from './RecommendationListRow';
import { RecommendationDetailModal } from './RecommendationDetailModal';
import { RecommendationEditModal } from './RecommendationEditModal';
import { ViewModeToggle, ViewMode } from '../ViewModeToggle';
import { nanoid } from 'nanoid';

interface RecommendationsSectionProps {
  recommendationProfiles?: RecommendationProfile[];
  onUpdateProfiles?: (profiles: RecommendationProfile[]) => Promise<void>;
  defaultHourlyRate?: number;
}

const categoryLabels: Record<RecommendationProfile['category'], string> = {
  process: 'Process',
  training: 'Training',
  technology: 'Technology',
  organization: 'Organization',
  'risk-mitigation': 'Risk Mitigation',
};

const phaseLabels: Record<RecommendationProfile['phase'], string> = {
  immediate: 'Immediate (0-30 days)',
  'short-term': 'Short-term (30-90 days)',
  'long-term': 'Long-term (90+ days)',
};

const phaseColors: Record<RecommendationProfile['phase'], string> = {
  immediate: 'border-red-300 bg-red-50',
  'short-term': 'border-amber-300 bg-amber-50',
  'long-term': 'border-green-300 bg-green-50',
};

const phaseTextColors: Record<RecommendationProfile['phase'], string> = {
  immediate: 'text-red-700',
  'short-term': 'text-amber-700',
  'long-term': 'text-green-700',
};

const phaseIcons: Record<RecommendationProfile['phase'], typeof Zap> = {
  immediate: Zap,
  'short-term': Clock,
  'long-term': Calendar,
};

const categories: RecommendationProfile['category'][] = ['process', 'training', 'technology', 'organization', 'risk-mitigation'];
const phases: RecommendationProfile['phase'][] = ['immediate', 'short-term', 'long-term'];

export function RecommendationsSection({ recommendationProfiles = [], onUpdateProfiles, defaultHourlyRate = 150 }: RecommendationsSectionProps) {
  const [selectedRec, setSelectedRec] = useState<RecommendationProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<RecommendationProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const [categoryFilter, setCategoryFilter] = useState<RecommendationProfile['category'] | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<RecommendationProfile['phase'] | 'all'>('all');
  const [effortFilter, setEffortFilter] = useState<RecommendationProfile['levelOfEffort'] | 'all'>('all');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['immediate', 'short-term', 'long-term']));
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RecommendationProfile['category']>('process');

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let filtered = recommendationProfiles;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    // Phase filter
    if (phaseFilter !== 'all') {
      filtered = filtered.filter(r => r.phase === phaseFilter);
    }

    // Effort filter
    if (effortFilter !== 'all') {
      filtered = filtered.filter(r => r.levelOfEffort === effortFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.problemAddressed.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [recommendationProfiles, categoryFilter, phaseFilter, effortFilter, searchQuery]);

  // Group by phase
  const groupedByPhase = useMemo(() => {
    const groups: Record<RecommendationProfile['phase'], RecommendationProfile[]> = {
      immediate: [],
      'short-term': [],
      'long-term': [],
    };

    filteredProfiles.forEach(profile => {
      groups[profile.phase].push(profile);
    });

    return groups;
  }, [filteredProfiles]);

  // Count by phase (unfiltered for tabs)
  const countByPhase = useMemo(() => {
    const counts: Record<RecommendationProfile['phase'], number> = {
      immediate: 0,
      'short-term': 0,
      'long-term': 0,
    };

    recommendationProfiles.forEach(profile => {
      counts[profile.phase]++;
    });

    return counts;
  }, [recommendationProfiles]);

  // Unique roles for stats
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    recommendationProfiles.forEach(r => cats.add(r.category));
    return cats.size;
  }, [recommendationProfiles]);

  const togglePhase = (phase: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  const handleAddNew = async () => {
    if (!onUpdateProfiles || !newTitle.trim()) return;

    const newProfile: RecommendationProfile = {
      id: nanoid(),
      title: newTitle.trim(),
      description: newTitle.trim(),
      priority: 'medium',
      category: newCategory,
      phase: 'short-term',
      problemAddressed: 'To be defined',
      scope: 'Organization-wide',
      expectedImpact: 'Impact to be assessed',
      levelOfEffort: 'medium',
      dependencies: [],
      relatedItems: {},
      source: 'manual',
      count: 0,
      interviewIds: [],
    };

    await onUpdateProfiles([...recommendationProfiles, newProfile]);
    setNewTitle('');
    setNewCategory('process');
    setIsAdding(false);
    // Open edit modal for the new recommendation
    setEditingProfile(newProfile);
  };

  const handleSaveEdit = async (updatedProfile: RecommendationProfile) => {
    if (!onUpdateProfiles) return;

    const updated = recommendationProfiles.map(r =>
      r.id === updatedProfile.id ? updatedProfile : r
    );
    await onUpdateProfiles(updated);
    setEditingProfile(null);
  };

  const handleDelete = async (id: string) => {
    if (!onUpdateProfiles) return;
    await onUpdateProfiles(recommendationProfiles.filter(r => r.id !== id));
    setDeleteConfirm(null);
  };

  const canEdit = !!onUpdateProfiles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Lightbulb className="w-6 h-6 text-emerald-600" />
            Recommendations & Roadmap
          </h2>
          <p className="text-slate-600">
            {recommendationProfiles.length} recommendation{recommendationProfiles.length !== 1 ? 's' : ''} across {uniqueCategories} categories
          </p>
        </div>
        {canEdit && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Recommendation
          </button>
        )}
      </div>

      {/* Add new form */}
      {isAdding && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter recommendation title..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as RecommendationProfile['category'])}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsAdding(false); setNewTitle(''); }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNew}
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              Add & Configure
            </button>
          </div>
        </div>
      )}

      {/* Phase tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setPhaseFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            phaseFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({recommendationProfiles.length})
        </button>
        {phases.map(phase => {
          const PhaseIcon = phaseIcons[phase];
          return (
            <button
              key={phase}
              onClick={() => setPhaseFilter(phase === phaseFilter ? 'all' : phase)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                phaseFilter === phase
                  ? phaseColors[phase] + ' ' + phaseTextColors[phase]
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PhaseIcon className="w-4 h-4" />
              {phase === 'immediate' ? 'Immediate' : phase === 'short-term' ? 'Short-term' : 'Long-term'}
              ({countByPhase[phase]})
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as RecommendationProfile['category'] | 'all')}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{categoryLabels[cat]}</option>
            ))}
          </select>
        </div>

        {/* Effort filter */}
        <select
          value={effortFilter}
          onChange={(e) => setEffortFilter(e.target.value as RecommendationProfile['levelOfEffort'] | 'all')}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Effort Levels</option>
          <option value="low">Low Effort</option>
          <option value="medium">Medium Effort</option>
          <option value="high">High Effort</option>
        </select>

        {/* View mode toggle */}
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Content */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No recommendations found.</p>
          <p className="text-sm text-slate-400 mt-1">
            {searchQuery || categoryFilter !== 'all' || phaseFilter !== 'all' || effortFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Recommendations will appear when interviews are analyzed.'}
          </p>
        </div>
      ) : phaseFilter !== 'all' ? (
        // Filtered view - show cards or list directly
        viewMode === 'tile' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProfiles.map(profile => (
              <RecommendationCard
                key={profile.id}
                profile={profile}
                onClick={() => setSelectedRec(profile)}
                onEdit={canEdit ? () => setEditingProfile(profile) : undefined}
                onDelete={canEdit ? () => setDeleteConfirm(profile.id) : undefined}
                canEdit={canEdit}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredProfiles.map(profile => (
              <RecommendationListRow
                key={profile.id}
                profile={profile}
                onClick={() => setSelectedRec(profile)}
                onEdit={canEdit ? () => setEditingProfile(profile) : undefined}
                onDelete={canEdit ? () => setDeleteConfirm(profile.id) : undefined}
                canEdit={canEdit}
              />
            ))}
          </div>
        )
      ) : (
        // Grouped by phase view
        <div className="space-y-6">
          {phases.map(phase => {
            const phaseRecs = groupedByPhase[phase];
            if (phaseRecs.length === 0) return null;

            const PhaseIcon = phaseIcons[phase];
            const isExpanded = expandedPhases.has(phase);

            return (
              <div key={phase} className={`border rounded-xl overflow-hidden ${phaseColors[phase]}`}>
                {/* Phase header */}
                <button
                  onClick={() => togglePhase(phase)}
                  className={`w-full flex items-center justify-between p-4 ${phaseTextColors[phase]} hover:bg-white/30 transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <PhaseIcon className="w-5 h-5" />
                    <span className="font-semibold">{phaseLabels[phase]}</span>
                    <span className="text-sm opacity-75">({phaseRecs.length} item{phaseRecs.length !== 1 ? 's' : ''})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {/* Phase content */}
                {isExpanded && (
                  <div className="p-4 pt-0">
                    {viewMode === 'tile' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {phaseRecs.map(profile => (
                          <RecommendationCard
                            key={profile.id}
                            profile={profile}
                            onClick={() => setSelectedRec(profile)}
                            onEdit={canEdit ? () => setEditingProfile(profile) : undefined}
                            onDelete={canEdit ? () => setDeleteConfirm(profile.id) : undefined}
                            canEdit={canEdit}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {phaseRecs.map(profile => (
                          <RecommendationListRow
                            key={profile.id}
                            profile={profile}
                            onClick={() => setSelectedRec(profile)}
                            onEdit={canEdit ? () => setEditingProfile(profile) : undefined}
                            onDelete={canEdit ? () => setDeleteConfirm(profile.id) : undefined}
                            canEdit={canEdit}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Recommendation?</h3>
            <p className="text-slate-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedRec && (
        <RecommendationDetailModal
          profile={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}

      {/* Edit modal */}
      {editingProfile && (
        <RecommendationEditModal
          profile={editingProfile}
          onSave={handleSaveEdit}
          onClose={() => setEditingProfile(null)}
          defaultHourlyRate={defaultHourlyRate}
        />
      )}
    </div>
  );
}
