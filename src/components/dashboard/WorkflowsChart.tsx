import { WorkflowAggregation } from '../../types/dashboard';

interface WorkflowsChartProps {
  workflows: WorkflowAggregation[];
  limit?: number;
}

const frequencyColors: Record<string, string> = {
  daily: 'bg-indigo-500',
  weekly: 'bg-blue-500',
  monthly: 'bg-emerald-500',
  'ad-hoc': 'bg-slate-400',
};

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  'ad-hoc': 'Ad-hoc',
};

export function WorkflowsChart({ workflows, limit = 10 }: WorkflowsChartProps) {
  const topWorkflows = workflows.slice(0, limit);
  const maxCount = Math.max(...topWorkflows.map(w => w.count), 1);

  if (topWorkflows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Workflows</h3>
        <p className="text-sm text-slate-500">No workflows found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Workflows</h3>
      <div className="space-y-3">
        {topWorkflows.map((workflow, index) => {
          const percentage = (workflow.count / maxCount) * 100;
          const color = frequencyColors[workflow.frequency] || 'bg-slate-400';

          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-900 truncate max-w-[60%]">
                  {workflow.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${color}`}>
                    {frequencyLabels[workflow.frequency] || workflow.frequency}
                  </span>
                  <span className="text-sm text-slate-600">
                    {workflow.count} {workflow.count === 1 ? 'mention' : 'mentions'}
                  </span>
                </div>
              </div>
              <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {workflow.participants.length > 0 && (
                <div className="text-xs text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Participants: {workflow.participants.slice(0, 3).join(', ')}
                  {workflow.participants.length > 3 && ` +${workflow.participants.length - 3} more`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
