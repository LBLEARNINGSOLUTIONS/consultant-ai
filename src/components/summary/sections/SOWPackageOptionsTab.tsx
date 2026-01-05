import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Package, ChevronDown, ChevronUp, Percent } from 'lucide-react';
import { SOWPackage, RecommendationProfile, SummarySOWConfig } from '../../../types/analysis';
import { formatCurrency } from '../../../utils/formatters';

interface SOWPackageOptionsTabProps {
  packages: SOWPackage[];
  onChange: (packages: SOWPackage[]) => void;
  selectedProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig;
}

const defaultPackages: Omit<SOWPackage, 'id'>[] = [
  {
    name: 'Essential',
    description: 'Core improvements focusing on the highest-priority items with immediate impact.',
    recommendationIds: [],
    order: 0,
  },
  {
    name: 'Standard',
    description: 'Comprehensive solution including essential items plus key enhancements.',
    recommendationIds: [],
    order: 1,
  },
  {
    name: 'Premium',
    description: 'Complete transformation package with all recommended improvements.',
    recommendationIds: [],
    order: 2,
  },
];

export function SOWPackageOptionsTab({
  packages,
  onChange,
  selectedProfiles,
  sowConfig,
}: SOWPackageOptionsTabProps) {
  const [expandedPackage, setExpandedPackage] = useState<string | null>(packages[0]?.id || null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDiscount, setEditDiscount] = useState<number | undefined>(undefined);

  const initializeDefaultPackages = () => {
    const highPriority = selectedProfiles.filter(p => p.priority === 'high');
    const mediumPriority = selectedProfiles.filter(p => p.priority === 'medium');
    // lowPriority is used implicitly (all profiles = high + medium + low)

    const newPackages = defaultPackages.map((pkg, index) => {
      let recommendationIds: string[] = [];

      if (index === 0) {
        // Essential: high priority only
        recommendationIds = highPriority.map(p => p.id);
      } else if (index === 1) {
        // Standard: high + medium priority
        recommendationIds = [...highPriority, ...mediumPriority].map(p => p.id);
      } else {
        // Premium: all selected
        recommendationIds = selectedProfiles.map(p => p.id);
      }

      return {
        ...pkg,
        id: `package-${Date.now()}-${index}`,
        recommendationIds,
      };
    });

    onChange(newPackages);
    setExpandedPackage(newPackages[0]?.id || null);
  };

  const addPackage = () => {
    const newPackage: SOWPackage = {
      id: `package-${Date.now()}`,
      name: `Package ${packages.length + 1}`,
      description: 'Enter package description...',
      recommendationIds: [],
      order: packages.length,
    };
    onChange([...packages, newPackage]);
    setExpandedPackage(newPackage.id);
  };

  const removePackage = (packageId: string) => {
    onChange(packages.filter(p => p.id !== packageId));
  };

  const startEditing = (pkg: SOWPackage) => {
    setEditingPackageId(pkg.id);
    setEditName(pkg.name);
    setEditDescription(pkg.description);
    setEditDiscount(pkg.discountPercent);
  };

  const saveEditing = () => {
    if (!editingPackageId) return;
    onChange(packages.map(p =>
      p.id === editingPackageId
        ? { ...p, name: editName, description: editDescription, discountPercent: editDiscount }
        : p
    ));
    setEditingPackageId(null);
  };

  const cancelEditing = () => {
    setEditingPackageId(null);
    setEditName('');
    setEditDescription('');
    setEditDiscount(undefined);
  };

  const toggleItemInPackage = (packageId: string, profileId: string) => {
    onChange(packages.map(pkg => {
      if (pkg.id === packageId) {
        const hasItem = pkg.recommendationIds.includes(profileId);
        return {
          ...pkg,
          recommendationIds: hasItem
            ? pkg.recommendationIds.filter(id => id !== profileId)
            : [...pkg.recommendationIds, profileId],
        };
      }
      return pkg;
    }));
  };

  const getPackageProfiles = (pkg: SOWPackage) => {
    return selectedProfiles.filter(p => pkg.recommendationIds.includes(p.id));
  };

  const getPackageTotals = (pkg: SOWPackage) => {
    const profiles = getPackageProfiles(pkg);
    const totals = profiles.reduce(
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

    // Apply discount if present
    const discount = pkg.discountPercent || 0;
    const discountedCost = totals.cost * (1 - discount / 100);

    return { ...totals, discountedCost, discount };
  };

  if (packages.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900">Package Options</h3>
          <p className="text-sm text-slate-500 mt-1">
            Create tiered pricing packages for different client needs and budgets.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-600 mb-4">
            No packages defined yet. Create tiered options to give clients flexibility.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={initializeDefaultPackages}
              disabled={selectedProfiles.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Default Packages
            </button>
            <button
              onClick={addPackage}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Create Custom Package
            </button>
          </div>
          {selectedProfiles.length === 0 && (
            <p className="text-xs text-amber-600 mt-3">
              Select recommendations from the left panel first to auto-populate packages.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Package Options</h3>
          <p className="text-sm text-slate-500 mt-1">
            Each package can include different items. Items can appear in multiple packages.
          </p>
        </div>
        <button
          onClick={addPackage}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {/* Package comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map(pkg => {
          const totals = getPackageTotals(pkg);
          const profiles = getPackageProfiles(pkg);

          return (
            <div
              key={pkg.id}
              className="border border-slate-200 rounded-lg p-4 text-center bg-white"
            >
              <h4 className="font-semibold text-slate-900">{pkg.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{profiles.length} items</p>
              <div className="mt-3">
                {totals.discount > 0 && (
                  <div className="text-sm text-slate-400 line-through">
                    {formatCurrency(totals.cost, sowConfig.currency)}
                  </div>
                )}
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(totals.discountedCost, sowConfig.currency)}
                </div>
                {totals.discount > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    {totals.discount}% discount
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Package list */}
      <div className="space-y-3">
        {packages.map(pkg => {
          const totals = getPackageTotals(pkg);
          const pkgProfiles = getPackageProfiles(pkg);
          const isExpanded = expandedPackage === pkg.id;
          const isEditing = editingPackageId === pkg.id;

          return (
            <div
              key={pkg.id}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              {/* Package header */}
              <div
                className={`flex items-center gap-3 px-4 py-3 bg-slate-50 ${
                  !isEditing ? 'cursor-pointer hover:bg-slate-100' : ''
                }`}
                onClick={() => !isEditing && setExpandedPackage(isExpanded ? null : pkg.id)}
              >
                <Package className="w-5 h-5 text-indigo-500" />

                {isEditing ? (
                  <div className="flex-1 space-y-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-2 py-1 text-sm font-medium border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Package name"
                    />
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Package description"
                    />
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editDiscount || ''}
                        onChange={e => setEditDiscount(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                      />
                      <span className="text-xs text-slate-500">% discount</span>
                    </div>
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
                      <h4 className="font-medium text-slate-900">{pkg.name}</h4>
                      <p className="text-xs text-slate-500">{pkg.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>{pkgProfiles.length} items</span>
                      <span>{totals.hours} hrs</span>
                      <span className="font-medium text-indigo-600">
                        {formatCurrency(totals.discountedCost, sowConfig.currency)}
                        {totals.discount > 0 && (
                          <span className="text-xs text-green-600 ml-1">
                            (-{totals.discount}%)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => startEditing(pkg)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removePackage(pkg.id)}
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

              {/* Package content */}
              {isExpanded && !isEditing && (
                <div className="p-4 border-t border-slate-200">
                  {selectedProfiles.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Select recommendations from the left panel first.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedProfiles.map(profile => {
                        const isInPackage = pkg.recommendationIds.includes(profile.id);
                        const hours = profile.deliveryProfile?.estimatedHours || 0;
                        const rate = profile.deliveryProfile?.hourlyRateOverride ?? sowConfig.defaultHourlyRate;

                        return (
                          <div
                            key={profile.id}
                            onClick={() => toggleItemInPackage(pkg.id, profile.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              isInPackage
                                ? 'bg-indigo-50 border border-indigo-200'
                                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isInPackage
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-slate-300'
                            }`}>
                              {isInPackage && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <span className={`text-sm ${isInPackage ? 'font-medium text-indigo-900' : 'text-slate-700'}`}>
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
