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

// Tool Profile for detailed technology analysis
export interface ToolProfile {
  id: string;
  name: string;
  count: number;              // How many interviews mentioned this tool
  category: 'crm' | 'pm' | 'spreadsheet' | 'communication' | 'erp' | 'custom' | 'other';

  // Usage context
  intendedPurpose: string;    // What it's supposed to be used for
  actualUsage: string[];      // What it's actually used for (collected from interviews)
  frequency: string;          // How often it's used

  // Who uses it
  usedBy: Array<{
    role: string;
    purpose: string;          // What this role uses it for
    count: number;
  }>;

  // Where it's used
  workflows: Array<{
    name: string;
    step?: string;            // Which step uses this tool
    count: number;
  }>;

  // Integrations
  integratesWith: string[];   // Other tools it connects to
  dataFlows: Array<{          // How data moves
    direction: 'in' | 'out';
    system: string;
    dataType: string;
  }>;

  // Problems & Gaps
  gaps: Array<{
    type: 'underutilized' | 'misused' | 'overlap' | 'data-handoff' | 'missing-integration';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  limitations: string[];

  // Traceability
  interviewIds: string[];
}

// Training Gap Profile for detailed capability analysis
export interface TrainingGapProfile {
  id: string;
  area: string;
  count: number;              // Interview mention count

  // Classification
  category: 'skill' | 'system' | 'process' | 'knowledge' | 'other';
  priority: 'low' | 'medium' | 'high';

  // Context
  currentState: string;       // What's the current capability
  desiredState: string;       // What should be achieved
  suggestedTraining: string;  // Recommended approach

  // Associations
  affectedRoles: Array<{
    role: string;
    impact: string;           // How this role is affected
    count: number;
  }>;
  relatedSystems: string[];   // Tools/systems related to this gap
  relatedWorkflows: string[]; // Workflows impacted by this gap

  // Risk Assessment
  risk: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;      // What happens if not addressed
    businessImpact: string;   // Operational/financial impact
  };

  // Traceability
  interviewIds: string[];
}

// ============================================
// DELIVERY PROFILE TYPES (Scope of Work / Estimation)
// ============================================

// Work type classification for deliverables
export type DeliveryWorkType =
  | 'workflow-mapping'
  | 'sop-creation'
  | 'role-clarity-raci'
  | 'system-configuration'
  | 'automation-build'
  | 'training-development'
  | 'training-delivery'
  | 'assessment-audit'
  | 'change-management'
  | 'other';

// Primary domain for classification
export type DeliveryDomain =
  | 'role-responsibility'
  | 'workflow-process'
  | 'technology-systems'
  | 'risk-bottlenecks'
  | 'training-adoption';

// Deliverable types for the bundle
export type DeliverableType =
  | 'sop-document'
  | 'checklist'
  | 'template'
  | 'process-map'
  | 'training-micro'
  | 'training-session'
  | 'dashboard-report'
  | 'raci-matrix'
  | 'job-aid'
  | 'other';

// Work mode
export type DeliveryWorkMode = 'document-only' | 'configure-existing' | 'build-new' | 'hybrid';

// Delivery profile (embedded in RecommendationProfile)
export interface DeliveryProfile {
  workType: DeliveryWorkType;
  primaryDomain: DeliveryDomain;
  deliverables: DeliverableType[];
  estimatedHours: number;
  workMode: DeliveryWorkMode;
  hourlyRateOverride?: number;      // If different from summary default
  excludeFromEstimate: boolean;
  outcomeStatement?: string;
  behaviorChangeBefore?: string;
  behaviorChangeAfter?: string;
}

// Summary-level SOW configuration
export interface SummarySOWConfig {
  defaultHourlyRate: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  clientName?: string;
  projectName?: string;
  validUntil?: string;              // ISO date string
  termsAndConditions?: string;
  disclaimerText?: string;
  sowDocument?: SOWDocument;        // Full SOW document state
}

// ============================================
// SOW BUILDER TYPES
// ============================================

// Phase configuration for implementation plan
export interface SOWPhase {
  id: string;
  name: string;                     // e.g., "Phase 1: Foundation"
  description: string;              // Editable description
  recommendationIds: string[];      // Which recommendations are in this phase
  order: number;                    // Sort order
}

// Package tier for pricing options
export interface SOWPackage {
  id: string;
  name: string;                     // e.g., "Essential", "Standard", "Premium"
  description: string;              // Editable description
  recommendationIds: string[];      // Which recommendations are in this package
  discountPercent?: number;         // Optional discount for this tier
  order: number;                    // Sort order
}

// Complete SOW Document structure
export interface SOWDocument {
  id: string;
  executiveSummary: string;         // Editable rich text
  objective: string;                // Editable rich text
  phases: SOWPhase[];               // Customizable phases
  packages: SOWPackage[];           // Multiple pricing tiers
  selectedRecommendationIds: string[];  // All selected recommendations
  createdAt: string;
  updatedAt: string;
}

// ============================================
// RECOMMENDATION PROFILE
// ============================================

// Recommendation Profile for detailed roadmap view
export interface RecommendationProfile {
  id: string;
  title: string;                    // Short summary title
  description: string;              // Full recommendation text

  // Classification
  priority: 'high' | 'medium' | 'low';
  category: 'process' | 'training' | 'technology' | 'organization' | 'risk-mitigation';
  phase: 'immediate' | 'short-term' | 'long-term';  // Timeline phase

  // Structured fields
  problemAddressed: string;         // What issue does this solve?
  scope: string;                    // Who/what is affected? (roles, departments, systems)
  expectedImpact: string;           // Business/operational outcome
  levelOfEffort: 'low' | 'medium' | 'high';  // Resource requirements
  effortDetails?: string;           // Optional details on effort (hours, cost, etc.)

  // Dependencies
  dependencies: string[];           // Other recommendations or external factors needed first
  relatedItems: {                   // Cross-references to other analysis items
    roles?: string[];
    workflows?: string[];
    tools?: string[];
    trainingGaps?: string[];
    painPoints?: string[];
  };

  // Source tracking
  source: 'auto' | 'manual';        // Auto-generated vs user-added
  sourceDescription?: string;       // e.g., "Derived from pain point: Manual data entry"
  count: number;                    // Interview mention count (for auto-generated)
  interviewIds: string[];           // Traceability

  // Delivery profile for SOW/estimation (optional)
  deliveryProfile?: DeliveryProfile;
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

  // Scope of Work configuration
  sowConfig?: SummarySOWConfig;
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
