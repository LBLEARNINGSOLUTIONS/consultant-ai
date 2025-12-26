import { TrainingGapAggregation } from '../../types/dashboard';
import { Badge } from '../analysis/Badge';

interface TrainingGapsPanelProps {
  trainingGaps: TrainingGapAggregation[];
  limit?: number;
}

const priorityVariant: Record<string, 'red' | 'yellow' | 'gray'> = {
  high: 'red',
  medium: 'yellow',
  low: 'gray',
};

export function TrainingGapsPanel({ trainingGaps, limit = 8 }: TrainingGapsPanelProps) {
  const topGaps = trainingGaps.slice(0, limit);

  if (topGaps.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Priority Training Gaps</h3>
        <p className="text-sm text-slate-500">No training gaps identified</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Priority Training Gaps</h3>
      <div className="space-y-3">
        {topGaps.map((gap, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{gap.area}</p>
              <p className="text-xs text-slate-500 mt-1">
                Affects: {gap.affectedRoles.slice(0, 3).join(', ')}
                {gap.affectedRoles.length > 3 && ` +${gap.affectedRoles.length - 3} more`}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <span className="text-xs text-slate-500">
                {gap.count}x
              </span>
              <Badge variant={priorityVariant[gap.priority] || 'gray'}>
                {gap.priority}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
