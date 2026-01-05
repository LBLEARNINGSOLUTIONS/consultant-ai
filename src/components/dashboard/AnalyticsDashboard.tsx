import { PieChart } from 'lucide-react';
import { Interview } from '../../types/database';
import { useAnalyticsDashboard } from '../../hooks/useAnalyticsDashboard';
import { DashboardOverview } from './DashboardOverview';
import { PainPointsChart } from './PainPointsChart';
import { WorkflowsChart } from './WorkflowsChart';
import { TrainingGapsPanel } from './TrainingGapsPanel';
import { HandoffRisksPanel } from './HandoffRisksPanel';
import { ToolUsageGrid } from './ToolUsageGrid';

interface AnalyticsDashboardProps {
  interviews: Interview[];
  loading: boolean;
}

export function AnalyticsDashboard({ interviews, loading }: AnalyticsDashboardProps) {
  const { metrics } = useAnalyticsDashboard(interviews);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (metrics.completedInterviews === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <PieChart className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No analytics data yet
        </h3>
        <p className="text-slate-600 mb-2">
          Complete at least one interview analysis to see aggregated insights
        </p>
        <p className="text-sm text-slate-500">
          {metrics.totalInterviews > 0
            ? `${metrics.totalInterviews} interview${metrics.totalInterviews > 1 ? 's' : ''} pending analysis`
            : 'Upload interview transcripts to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
        <p className="text-slate-600 mt-1">
          Aggregated insights from {metrics.completedInterviews} completed interview{metrics.completedInterviews !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Overview Stats */}
      <DashboardOverview
        totalInterviews={metrics.totalInterviews}
        completedInterviews={metrics.completedInterviews}
        totalWorkflows={metrics.totalWorkflows}
        totalPainPoints={metrics.totalPainPoints}
        totalTools={metrics.totalTools}
        totalRoles={metrics.totalRoles}
        criticalPainPoints={metrics.criticalPainPoints}
        highRiskHandoffs={metrics.highRiskHandoffs}
      />

      {/* Pain Points Charts */}
      <PainPointsChart
        bySeverity={metrics.painPointsBySeverity}
        byCategory={metrics.painPointsByCategory}
      />

      {/* Top Workflows */}
      <WorkflowsChart workflows={metrics.workflows} />

      {/* Training Gaps & Handoff Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainingGapsPanel trainingGaps={metrics.trainingGaps} />
        <HandoffRisksPanel handoffRisks={metrics.handoffRisks} />
      </div>

      {/* Tool Usage Grid */}
      <ToolUsageGrid tools={metrics.tools} />
    </div>
  );
}

export default AnalyticsDashboard;
