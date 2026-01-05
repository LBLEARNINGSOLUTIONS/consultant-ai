import { useState, useMemo } from 'react';
import { ClipboardList, Settings, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { RecommendationProfile, SummarySOWConfig, DeliveryWorkType, DeliveryDomain } from '../../../types/analysis';
import { formatCurrency } from '../../../utils/formatters';
import { SOWLineItemCard } from './SOWLineItemCard';
import { SOWLineItemListRow } from './SOWLineItemListRow';
import { SOWTotalsPanel } from './SOWTotalsPanel';
import { ScopeOfWorkConfigModal } from './ScopeOfWorkConfigModal';
import { RecommendationEditModal } from './RecommendationEditModal';
import { ViewModeToggle, ViewMode } from '../ViewModeToggle';

interface ScopeOfWorkSectionProps {
  recommendationProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig | null;
  onUpdateProfiles?: (profiles: RecommendationProfile[]) => Promise<void>;
  onUpdateSOWConfig?: (config: SummarySOWConfig) => Promise<void>;
  onExportSOW?: () => void;
}

const workTypeLabels: Record<DeliveryWorkType, string> = {
  'workflow-mapping': 'Workflow Mapping',
  'sop-creation': 'SOP Creation',
  'role-clarity-raci': 'Role Clarity / RACI',
  'system-configuration': 'System Configuration',
  'automation-build': 'Automation Build',
  'training-development': 'Training Development',
  'training-delivery': 'Training Delivery',
  'assessment-audit': 'Assessment / Audit',
  'change-management': 'Change Management',
  'other': 'Other',
};

const domainLabels: Record<DeliveryDomain, string> = {
  'role-responsibility': 'Role & Responsibility',
  'workflow-process': 'Workflow & Process',
  'technology-systems': 'Technology & Systems',
  'risk-bottlenecks': 'Risk & Bottlenecks',
  'training-adoption': 'Training & Adoption',
};

const workTypes: DeliveryWorkType[] = [
  'workflow-mapping', 'sop-creation', 'role-clarity-raci', 'system-configuration',
  'automation-build', 'training-development', 'training-delivery', 'assessment-audit',
  'change-management', 'other',
];

const domains: DeliveryDomain[] = [
  'role-responsibility', 'workflow-process', 'technology-systems', 'risk-bottlenecks', 'training-adoption',
];

type FilterMode = 'all' | 'included' | 'excluded' | 'not-configured';

const defaultSOWConfig: SummarySOWConfig = {
  defaultHourlyRate: 150,
  currency: 'USD',
};

export function ScopeOfWorkSection({
  recommendationProfiles,
  sowConfig,
  onUpdateProfiles,
  onUpdateSOWConfig,
  onExportSOW,
}: ScopeOfWorkSectionProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<RecommendationProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState<DeliveryWorkType | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<DeliveryDomain | 'all'>('all');

  const effectiveConfig = sowConfig || defaultSOWConfig;

  // Categorize profiles
  const categorizedProfiles = useMemo(() => {
    const included: RecommendationProfile[] = [];
    const excluded: RecommendationProfile[] = [];
    const notConfigured: RecommendationProfile[] = [];

    recommendationProfiles.forEach(profile => {
      if (!profile.deliveryProfile) {
        notConfigured.push(profile);
      } else if (profile.deliveryProfile.excludeFromEstimate) {
        excluded.push(profile);
      } else {
        included.push(profile);
      }
    });

    return { included, excluded, notConfigured };
  }, [recommendationProfiles]);

  // Filter profiles based on mode and other filters
  const filteredProfiles = useMemo(() => {
    let filtered: RecommendationProfile[];

    switch (filterMode) {
      case 'included':
        filtered = categorizedProfiles.included;
        break;
      case 'excluded':
        filtered = categorizedProfiles.excluded;
        break;
      case 'not-configured':
        filtered = categorizedProfiles.notConfigured;
        break;
      default:
        filtered = recommendationProfiles;
    }

    // Work type filter (only applies to configured profiles)
    if (workTypeFilter !== 'all') {
      filtered = filtered.filter(
        p => p.deliveryProfile?.workType === workTypeFilter
      );
    }

    // Domain filter (only applies to configured profiles)
    if (domainFilter !== 'all') {
      filtered = filtered.filter(
        p => p.deliveryProfile?.primaryDomain === domainFilter
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [recommendationProfiles, categorizedProfiles, filterMode, workTypeFilter, domainFilter, searchQuery]);

  // Stats for the header
  const stats = useMemo(() => {
    const totalHours = categorizedProfiles.included.reduce(
      (sum, p) => sum + (p.deliveryProfile?.estimatedHours || 0),
      0
    );

    const totalCost = categorizedProfiles.included.reduce((sum, p) => {
      const delivery = p.deliveryProfile;
      if (!delivery) return sum;
      const rate = delivery.hourlyRateOverride ?? effectiveConfig.defaultHourlyRate;
      return sum + (delivery.estimatedHours * rate);
    }, 0);

    return {
      included: categorizedProfiles.included.length,
      excluded: categorizedProfiles.excluded.length,
      notConfigured: categorizedProfiles.notConfigured.length,
      totalHours,
      totalCost,
    };
  }, [categorizedProfiles, effectiveConfig]);

  const handleSaveProfile = async (updatedProfile: RecommendationProfile) => {
    if (!onUpdateProfiles) return;
    const updated = recommendationProfiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    await onUpdateProfiles(updated);
    setEditingProfile(null);
  };

  const canEdit = !!onUpdateProfiles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            Scope of Work
          </h2>
          <p className="text-slate-600">
            {stats.included} item{stats.included !== 1 ? 's' : ''} • {stats.totalHours} hours • {formatCurrency(stats.totalCost, effectiveConfig.currency)} estimated
          </p>
        </div>
        {onUpdateSOWConfig && (
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configure
          </button>
        )}
      </div>

      {/* Totals Panel */}
      {stats.included > 0 && (
        <SOWTotalsPanel
          profiles={categorizedProfiles.included}
          sowConfig={effectiveConfig}
          onExport={onExportSOW}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({recommendationProfiles.length})
        </button>
        <button
          onClick={() => setFilterMode('included')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'included'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          Included ({stats.included})
        </button>
        <button
          onClick={() => setFilterMode('excluded')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'excluded'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          Excluded ({stats.excluded})
        </button>
        <button
          onClick={() => setFilterMode('not-configured')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'not-configured'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Not Configured ({stats.notConfigured})
        </button>
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
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Work Type filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value as DeliveryWorkType | 'all')}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Work Types</option>
            {workTypes.map(wt => (
              <option key={wt} value={wt}>{workTypeLabels[wt]}</option>
            ))}
          </select>
        </div>

        {/* Domain filter */}
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value as DeliveryDomain | 'all')}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Domains</option>
          {domains.map(d => (
            <option key={d} value={d}>{domainLabels[d]}</option>
          ))}
        </select>

        {/* View mode toggle */}
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Content */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">
            {filterMode === 'not-configured'
              ? 'No recommendations without delivery profiles.'
              : filterMode === 'excluded'
              ? 'No excluded items.'
              : searchQuery || workTypeFilter !== 'all' || domainFilter !== 'all'
              ? 'No items match your filters.'
              : 'No scope of work items configured yet.'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {filterMode === 'not-configured' && stats.notConfigured === 0
              ? 'All recommendations have delivery profiles configured.'
              : 'Configure delivery profiles in the Recommendations section to add items here.'}
          </p>
        </div>
      ) : filterMode === 'not-configured' ? (
        // Show not-configured items differently
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-4">
            These recommendations don't have delivery profiles yet. Click to configure.
          </p>
          {filteredProfiles.map(profile => (
            <div
              key={profile.id}
              onClick={() => canEdit && setEditingProfile(profile)}
              className={`bg-white border border-dashed border-slate-300 rounded-xl p-4 ${
                canEdit ? 'hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer' : ''
              } transition-colors`}
            >
              <h3 className="font-medium text-slate-700">{profile.title}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{profile.description}</p>
              {canEdit && (
                <p className="text-xs text-indigo-600 mt-2">Click to configure delivery profile →</p>
              )}
            </div>
          ))}
        </div>
      ) : viewMode === 'tile' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProfiles.map(profile => {
            // For excluded items or items without delivery profile, show a simpler card
            if (!profile.deliveryProfile || profile.deliveryProfile.excludeFromEstimate) {
              return (
                <div
                  key={profile.id}
                  onClick={() => canEdit && setEditingProfile(profile)}
                  className={`bg-white border border-slate-200 rounded-xl p-4 opacity-60 ${
                    canEdit ? 'hover:opacity-100 cursor-pointer' : ''
                  } transition-opacity`}
                >
                  <h3 className="font-medium text-slate-700">{profile.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {profile.deliveryProfile?.excludeFromEstimate ? 'Excluded from estimate' : 'Not configured'}
                  </p>
                </div>
              );
            }

            return (
              <SOWLineItemCard
                key={profile.id}
                profile={profile}
                defaultHourlyRate={effectiveConfig.defaultHourlyRate}
                currency={effectiveConfig.currency}
                onClick={() => canEdit && setEditingProfile(profile)}
                onEdit={canEdit ? () => setEditingProfile(profile) : undefined}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredProfiles.map(profile => {
            // For excluded items or items without delivery profile, show a simpler row
            if (!profile.deliveryProfile || profile.deliveryProfile.excludeFromEstimate) {
              return (
                <div
                  key={profile.id}
                  onClick={() => canEdit && setEditingProfile(profile)}
                  className={`bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-4 opacity-60 ${
                    canEdit ? 'hover:opacity-100 cursor-pointer' : ''
                  } transition-opacity`}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-700">{profile.title}</h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {profile.deliveryProfile?.excludeFromEstimate ? 'Excluded' : 'Not configured'}
                  </span>
                </div>
              );
            }

            return (
              <SOWLineItemListRow
                key={profile.id}
                profile={profile}
                defaultHourlyRate={effectiveConfig.defaultHourlyRate}
                currency={effectiveConfig.currency}
                onClick={() => canEdit && setEditingProfile(profile)}
                onEdit={canEdit ? () => setEditingProfile(profile) : undefined}
              />
            );
          })}
        </div>
      )}

      {/* Config Modal */}
      {onUpdateSOWConfig && (
        <ScopeOfWorkConfigModal
          isOpen={showConfigModal}
          config={sowConfig}
          onSave={async (config) => {
            await onUpdateSOWConfig(config);
            setShowConfigModal(false);
          }}
          onClose={() => setShowConfigModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingProfile && onUpdateProfiles && (
        <RecommendationEditModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={() => setEditingProfile(null)}
          defaultHourlyRate={effectiveConfig.defaultHourlyRate}
        />
      )}
    </div>
  );
}
