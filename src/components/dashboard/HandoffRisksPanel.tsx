import { ArrowRight } from 'lucide-react';
import { HandoffRiskAggregation } from '../../types/dashboard';
import { Badge } from '../analysis/Badge';

interface HandoffRisksPanelProps {
  handoffRisks: HandoffRiskAggregation[];
  limit?: number;
}

const riskVariant: Record<string, 'red' | 'yellow' | 'gray'> = {
  high: 'red',
  medium: 'yellow',
  low: 'gray',
};

export function HandoffRisksPanel({ handoffRisks, limit = 8 }: HandoffRisksPanelProps) {
  const topRisks = handoffRisks.slice(0, limit);

  if (topRisks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">High-Risk Handoffs</h3>
        <p className="text-sm text-slate-500">No handoff risks identified</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">High-Risk Handoffs</h3>
      <div className="space-y-3">
        {topRisks.map((risk, index) => (
          <div
            key={index}
            className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-900">{risk.fromRole}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900">{risk.toRole}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{risk.count}x</span>
                <Badge variant={riskVariant[risk.riskLevel] || 'gray'}>
                  {risk.riskLevel}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-slate-600 truncate">{risk.process}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
