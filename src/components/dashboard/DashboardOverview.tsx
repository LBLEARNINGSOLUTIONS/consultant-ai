import { FileText, GitBranch, AlertTriangle, Wrench, Users, AlertCircle } from 'lucide-react';

interface DashboardOverviewProps {
  totalInterviews: number;
  completedInterviews: number;
  totalWorkflows: number;
  totalPainPoints: number;
  totalTools: number;
  totalRoles: number;
  criticalPainPoints: number;
  highRiskHandoffs: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardOverview({
  totalInterviews,
  completedInterviews,
  totalWorkflows,
  totalPainPoints,
  totalTools,
  totalRoles,
  criticalPainPoints,
  highRiskHandoffs,
}: DashboardOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        title="Interviews"
        value={completedInterviews}
        subtitle={totalInterviews > completedInterviews ? `${totalInterviews} total` : undefined}
        icon={<FileText className="w-6 h-6 text-indigo-600" />}
        color="text-indigo-600"
      />
      <StatCard
        title="Workflows"
        value={totalWorkflows}
        icon={<GitBranch className="w-6 h-6 text-blue-600" />}
        color="text-blue-600"
      />
      <StatCard
        title="Pain Points"
        value={totalPainPoints}
        subtitle={criticalPainPoints > 0 ? `${criticalPainPoints} critical/high` : undefined}
        icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
        color="text-amber-600"
      />
      <StatCard
        title="Tools"
        value={totalTools}
        icon={<Wrench className="w-6 h-6 text-emerald-600" />}
        color="text-emerald-600"
      />
      <StatCard
        title="Roles"
        value={totalRoles}
        icon={<Users className="w-6 h-6 text-purple-600" />}
        color="text-purple-600"
      />
      <StatCard
        title="High-Risk Handoffs"
        value={highRiskHandoffs}
        icon={<AlertCircle className="w-6 h-6 text-red-600" />}
        color="text-red-600"
      />
    </div>
  );
}
