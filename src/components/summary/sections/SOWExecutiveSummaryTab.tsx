import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { RecommendationProfile, SummarySOWConfig } from '../../../types/analysis';
import { formatCurrency } from '../../../utils/formatters';

interface SOWExecutiveSummaryTabProps {
  value: string;
  onChange: (value: string) => void;
  selectedProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig;
}

export function SOWExecutiveSummaryTab({
  value,
  onChange,
  selectedProfiles,
  sowConfig,
}: SOWExecutiveSummaryTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate totals for the summary
  const totals = selectedProfiles.reduce(
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

  const generateDraft = () => {
    setIsGenerating(true);

    // Group by priority
    const highPriority = selectedProfiles.filter(p => p.priority === 'high');
    const mediumPriority = selectedProfiles.filter(p => p.priority === 'medium');

    // Group by category
    const categories = selectedProfiles.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryList = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat.replace('-', ' '))
      .slice(0, 3);

    const draft = `This Scope of Work outlines a comprehensive engagement consisting of ${selectedProfiles.length} key initiatives across ${categoryList.join(', ')} areas. The proposed work represents ${totals.hours} hours of professional services with an estimated investment of ${formatCurrency(totals.cost, sowConfig.currency)}.

${highPriority.length > 0 ? `The engagement prioritizes ${highPriority.length} high-impact items that address critical operational needs, including ${highPriority.slice(0, 2).map(p => p.title.toLowerCase()).join(' and ')}.` : ''}

${mediumPriority.length > 0 ? `Additionally, ${mediumPriority.length} medium-priority initiatives will strengthen operational foundations and support sustainable improvement.` : ''}

This proposal is structured to deliver measurable outcomes while providing flexibility through multiple package options to align with your organization's priorities and budget.`;

    setTimeout(() => {
      onChange(draft);
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Executive Summary</h3>
          <p className="text-sm text-slate-500 mt-1">
            Provide a high-level overview of the scope and value proposition.
          </p>
        </div>
        <button
          onClick={generateDraft}
          disabled={isGenerating || selectedProfiles.length === 0}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Auto-Generate
            </>
          )}
        </button>
      </div>

      {selectedProfiles.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Select recommendations from the left panel to generate an executive summary.
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-slate-900">{selectedProfiles.length}</div>
              <div className="text-xs text-slate-500">Items</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-slate-900">{totals.hours}</div>
              <div className="text-xs text-slate-500">Hours</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600">{formatCurrency(totals.cost, sowConfig.currency)}</div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
          </div>

          {/* Text editor */}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your executive summary here, or click 'Auto-Generate' to create a draft based on selected items..."
            className="w-full h-64 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm leading-relaxed"
          />

          <p className="text-xs text-slate-400">
            Tip: The executive summary appears at the beginning of your SOW document and sets the tone for the entire proposal.
          </p>
        </>
      )}
    </div>
  );
}
