// Core analysis data structures for interview transcript analysis

export interface Workflow {
  id: string;
  name: string;
  steps: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'ad-hoc';
  participants: string[];
  duration?: string;
  notes?: string;
}

export interface PainPoint {
  id: string;
  category: 'inefficiency' | 'bottleneck' | 'error-prone' | 'manual' | 'communication' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedRoles: string[];
  frequency: string;
  impact: string;
  suggestedSolution?: string;
}

export interface Tool {
  id: string;
  name: string;
  purpose: string;
  usedBy: string[];
  frequency: string;
  integrations?: string[];
  limitations?: string;
}

export interface Role {
  id: string;
  title: string;
  responsibilities: string[];
  workflows: string[];
  tools: string[];
  teamSize?: number;
}

export interface TrainingGap {
  id: string;
  area: string;
  affectedRoles: string[];
  priority: 'low' | 'medium' | 'high';
  currentState: string;
  desiredState: string;
  suggestedTraining?: string;
}

export interface HandoffRisk {
  id: string;
  fromRole: string;
  toRole: string;
  process: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  mitigation?: string;
}

// Complete analysis structure
export interface InterviewAnalysis {
  workflows: Workflow[];
  painPoints: PainPoint[];
  tools: Tool[];
  roles: Role[];
  trainingGaps: TrainingGap[];
  handoffRisks: HandoffRisk[];
}

// Company-wide aggregated summary
export interface CompanySummaryData {
  totalInterviews: number;
  dateRange: {
    earliest: string;
    latest: string;
  };

  // Aggregated metrics
  topWorkflows: Array<{
    name: string;
    frequency: number;
    mentions: number;
  }>;

  criticalPainPoints: Array<{
    description: string;
    severity: 'high' | 'critical';
    affectedCount: number;
  }>;

  commonTools: Array<{
    name: string;
    userCount: number;
    roles: string[];
  }>;

  roleDistribution: Record<string, number>;

  priorityTrainingGaps: Array<{
    area: string;
    affectedRoles: string[];
    priority: 'high';
    frequency: number;
  }>;

  highRiskHandoffs: Array<{
    fromRole: string;
    toRole: string;
    process: string;
    occurrences: number;
  }>;
}

// Claude API response structure
export interface ClaudeAnalysisResponse {
  success: boolean;
  analysis?: InterviewAnalysis;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
