// Aggregated workflow data
export interface WorkflowAggregation {
  name: string;
  count: number;
  frequency: string;
  participants: string[];
  interviewIds: string[];
}

// Aggregated pain point data
export interface PainPointAggregation {
  description: string;
  category: string;
  severity: string;
  affectedRoles: string[];
  count: number;
  interviewIds: string[];
}

// Aggregated tool data
export interface ToolAggregation {
  name: string;
  purpose: string;
  usedBy: string[];
  count: number;
  limitations: string[];
  interviewIds: string[];
}

// Aggregated role data
export interface RoleAggregation {
  title: string;
  responsibilities: string[];
  workflows: string[];
  tools: string[];
  count: number;
  interviewIds: string[];
}

// Aggregated training gap data
export interface TrainingGapAggregation {
  area: string;
  priority: string;
  affectedRoles: string[];
  count: number;
  interviewIds: string[];
}

// Aggregated handoff risk data
export interface HandoffRiskAggregation {
  fromRole: string;
  toRole: string;
  process: string;
  riskLevel: string;
  count: number;
  interviewIds: string[];
}

// Full dashboard metrics
export interface DashboardMetrics {
  // Overview counts
  totalInterviews: number;
  completedInterviews: number;
  totalWorkflows: number;
  totalPainPoints: number;
  totalTools: number;
  totalRoles: number;
  criticalPainPoints: number;
  highRiskHandoffs: number;

  // Aggregated data
  workflows: WorkflowAggregation[];
  painPoints: PainPointAggregation[];
  tools: ToolAggregation[];
  roles: RoleAggregation[];
  trainingGaps: TrainingGapAggregation[];
  handoffRisks: HandoffRiskAggregation[];

  // Distributions
  painPointsBySeverity: Record<string, number>;
  painPointsByCategory: Record<string, number>;
  workflowsByFrequency: Record<string, number>;
  trainingGapsByPriority: Record<string, number>;
  handoffRisksByLevel: Record<string, number>;
}
