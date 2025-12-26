interface PainPointsChartProps {
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

const categoryColors: Record<string, string> = {
  inefficiency: 'bg-purple-500',
  bottleneck: 'bg-red-500',
  'error-prone': 'bg-orange-500',
  manual: 'bg-yellow-500',
  communication: 'bg-blue-500',
  other: 'bg-slate-500',
};

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-24 capitalize">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-slate-900 w-8 text-right">{value}</span>
    </div>
  );
}

export function PainPointsChart({ bySeverity, byCategory }: PainPointsChartProps) {
  const maxSeverity = Math.max(...Object.values(bySeverity), 1);
  const maxCategory = Math.max(...Object.values(byCategory), 1);

  const severityOrder = ['critical', 'high', 'medium', 'low'];
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* By Severity */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Pain Points by Severity</h3>
        <div className="space-y-3">
          {severityOrder.map(severity => (
            <ProgressBar
              key={severity}
              label={severity}
              value={bySeverity[severity] || 0}
              max={maxSeverity}
              color={severityColors[severity] || 'bg-slate-500'}
            />
          ))}
        </div>
      </div>

      {/* By Category */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Pain Points by Category</h3>
        <div className="space-y-3">
          {categoryEntries.length > 0 ? (
            categoryEntries.slice(0, 6).map(([category, count]) => (
              <ProgressBar
                key={category}
                label={category}
                value={count}
                max={maxCategory}
                color={categoryColors[category] || 'bg-slate-500'}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500">No pain points found</p>
          )}
        </div>
      </div>
    </div>
  );
}
