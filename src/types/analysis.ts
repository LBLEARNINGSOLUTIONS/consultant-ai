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

export interface Recommendation {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: 'process' | 'training' | 'technology' | 'organization' | 'risk-mitigation';
  source?: string; // e.g., "pain point", "training gap", "handoff risk"
}

// Complete analysis structure
export interface InterviewAnalysis {
  workflows: Workflow[];
  painPoints: PainPoint[];
  tools: Tool[];
  roles: Role[];
  trainingGaps: TrainingGap[];
  handoffRisks: HandoffRisk[];
  recommendations: Recommendation[];
}

// Workflow Step for detailed workflow view
export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  owner?: string;           // Role responsible for this step
  inputs?: string[];        // What comes into this step
  outputs?: string[];       // What this step produces
  systems?: string[];       // Tools/systems used in this step
  duration?: string;        // How long this step takes
  issues?: Array<{          // Problems identified at this step
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

// Workflow Profile for detailed workflow view
export interface WorkflowProfile {
  id: string;
  name: string;
  count: number;            // How many interviews mentioned this workflow
  frequency: string;        // daily/weekly/monthly/ad-hoc

  // Detailed process information
  steps: WorkflowStep[];
  participants: string[];   // All roles involved
  systems: string[];        // All systems/tools used

  // Problem areas
  failurePoints: Array<{
    stepId?: string;        // Which step has the issue
    description: string;
    severity: string;
  }>;
  unclearSteps: string[];   // Steps that lack clarity

  // Traceability
  interviewIds: string[];
}

// Role Profile for detailed role view
export interface RoleProfile {
  id: string;
  title: string;
  count: number;  // How many interviews mentioned this role

  // Core data
  responsibilities: string[];
  workflows: string[];
  tools: string[];

  // Dependencies (derived from HandoffRisks)
  inputsFrom: Array<{ role: string; process: string; count: number }>;  // Who hands off to this role
  outputsTo: Array<{ role: string; process: string; count: number }>;   // Who this role hands off to

  // Issues and gaps (filtered by role)
  issuesDetected: Array<{ description: string; severity: string; count: number }>;
  trainingNeeds: Array<{ area: string; priority: string; count: number }>;

  // Traceability
  interviewIds: string[];
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

  // User-added recommendations
  recommendations?: Array<{
    id: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
  }>;

  // Executive Summary (editable)
  executiveSummary?: {
    narrativeSummary?: string; // 3-5 paragraph narrative
    keyFindings?: string[]; // Bullet highlights
    topRisks?: Array<{ id: string; text: string; rank: number }>; // Top 5 risks ranked
    topOpportunities?: Array<{ id: string; text: string; rank: number }>; // Top 5 opportunities ranked
    maturityLevel?: 1 | 2 | 3 | 4 | 5; // Readiness/maturity scale
    maturityNotes?: string; // Notes about the maturity assessment
  };
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
