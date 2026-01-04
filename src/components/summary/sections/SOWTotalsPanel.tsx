import { Clock, DollarSign, Package, FileText } from 'lucide-react';
import { RecommendationProfile, SummarySOWConfig } from '../../../types/analysis';

interface SOWTotalsPanelProps {
  profiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig;
  onExport?: () => void;
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
  };
  return `${symbols[currency] || '$'}${amount.toLocaleString()}`;
}

export function SOWTotalsPanel({ profiles, sowConfig, onExport }: SOWTotalsPanelProps) {
  // Calculate totals from included profiles
  const includedProfiles = profiles.filter(
    p => p.deliveryProfile && !p.deliveryProfile.excludeFromEstimate
  );

  const stats = includedProfiles.reduce(
    (acc, profile) => {
      const delivery = profile.deliveryProfile!;
      const rate = delivery.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
      const cost = delivery.estimatedHours * rate;

      acc.totalHours += delivery.estimatedHours;
      acc.totalCost += cost;
      acc.rateSum += rate;
      delivery.deliverables.forEach(d => acc.deliverableSet.add(d));

      return acc;
    },
    {
      totalHours: 0,
      totalCost: 0,
      rateSum: 0,
      deliverableSet: new Set<string>(),
    }
  );

  const avgRate = includedProfiles.length > 0
    ? Math.round(stats.rateSum / includedProfiles.length)
    : sowConfig.defaultHourlyRate;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Stats */}
        <div className="flex items-center gap-8 flex-wrap">
          {/* Items */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{includedProfiles.length}</div>
              <div className="text-xs text-indigo-200">Line Items</div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.deliverableSet.size}</div>
              <div className="text-xs text-indigo-200">Deliverables</div>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalHours.toLocaleString()}</div>
              <div className="text-xs text-indigo-200">Total Hours</div>
            </div>
          </div>

          {/* Avg Rate */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(avgRate, sowConfig.currency)}</div>
              <div className="text-xs text-indigo-200">Avg Rate/hr</div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="flex items-center gap-2 pl-4 border-l border-white/30">
            <div>
              <div className="text-xs text-indigo-200">Estimated Total</div>
              <div className="text-3xl font-bold">{formatCurrency(stats.totalCost, sowConfig.currency)}</div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        {onExport && (
          <button
            onClick={onExport}
            className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export SOW
          </button>
        )}
      </div>
    </div>
  );
}
