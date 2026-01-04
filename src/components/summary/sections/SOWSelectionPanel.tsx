import { useState, useMemo } from 'react';
import { Search, CheckSquare, Square } from 'lucide-react';
import { RecommendationProfile, SummarySOWConfig } from '../../../types/analysis';

interface SOWSelectionPanelProps {
  recommendationProfiles: RecommendationProfile[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  sowConfig: SummarySOWConfig;
}

export function SOWSelectionPanel({
  recommendationProfiles,
  selectedIds,
  onSelectionChange,
  sowConfig,
}: SOWSelectionPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'configured' | 'selected'>('configured');

  // Filter to only show profiles with delivery profiles configured
  const configurableProfiles = useMemo(() => {
    return recommendationProfiles.filter(p =>
      p.deliveryProfile && !p.deliveryProfile.excludeFromEstimate
    );
  }, [recommendationProfiles]);

  // Apply filters
  const filteredProfiles = useMemo(() => {
    let profiles = filterMode === 'all'
      ? recommendationProfiles
      : filterMode === 'selected'
      ? recommendationProfiles.filter(p => selectedIds.includes(p.id))
      : configurableProfiles;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      profiles = profiles.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return profiles;
  }, [recommendationProfiles, configurableProfiles, filterMode, searchQuery, selectedIds]);

  // Calculate totals for selected items
  const totals = useMemo(() => {
    const selected = recommendationProfiles.filter(p => selectedIds.includes(p.id));
    let totalHours = 0;
    let totalCost = 0;

    selected.forEach(p => {
      if (p.deliveryProfile) {
        const hours = p.deliveryProfile.estimatedHours;
        const rate = p.deliveryProfile.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
        totalHours += hours;
        totalCost += hours * rate;
      }
    });

    return { count: selected.length, totalHours, totalCost };
  }, [recommendationProfiles, selectedIds, sowConfig.defaultHourlyRate]);

  const formatCurrency = (amount: number): string => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
    };
    return `${symbols[sowConfig.currency] || '$'}${amount.toLocaleString()}`;
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    const allConfiguredIds = configurableProfiles.map(p => p.id);
    onSelectionChange(allConfiguredIds);
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Select Items</h3>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setFilterMode('configured')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterMode === 'configured'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Configured ({configurableProfiles.length})
          </button>
          <button
            onClick={() => setFilterMode('selected')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterMode === 'selected'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Selected ({selectedIds.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterMode === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({recommendationProfiles.length})
          </button>
        </div>

        {/* Bulk actions */}
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          >
            <CheckSquare className="w-3 h-3" />
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            <Square className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto">
        {filteredProfiles.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            {filterMode === 'configured'
              ? 'No recommendations with delivery profiles configured.'
              : filterMode === 'selected'
              ? 'No items selected.'
              : 'No recommendations found.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProfiles.map(profile => {
              const hasDelivery = profile.deliveryProfile && !profile.deliveryProfile.excludeFromEstimate;
              const hours = profile.deliveryProfile?.estimatedHours || 0;
              const rate = profile.deliveryProfile?.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
              const cost = hours * rate;

              return (
                <div
                  key={profile.id}
                  onClick={() => hasDelivery && toggleSelection(profile.id)}
                  className={`p-3 flex items-start gap-3 transition-colors ${
                    hasDelivery
                      ? 'cursor-pointer hover:bg-slate-50'
                      : 'opacity-50 cursor-not-allowed'
                  } ${isSelected(profile.id) ? 'bg-indigo-50' : ''}`}
                >
                  {/* Checkbox */}
                  <div className="mt-0.5">
                    {hasDelivery ? (
                      isSelected(profile.id) ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )
                    ) : (
                      <Square className="w-5 h-5 text-slate-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate">
                      {profile.title}
                    </h4>
                    {hasDelivery ? (
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{hours} hrs</span>
                        <span>•</span>
                        <span>{formatCurrency(cost)}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">Not configured</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with totals */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600">Selected Items</span>
          <span className="font-semibold text-slate-900">{totals.count}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600">Total Hours</span>
          <span className="font-semibold text-slate-900">{totals.totalHours}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Estimated Total</span>
          <span className="font-bold text-lg text-indigo-600">{formatCurrency(totals.totalCost)}</span>
        </div>
      </div>
    </div>
  );
}
