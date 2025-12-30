import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CompanySummaryData, RoleProfile, WorkflowProfile, ToolProfile, TrainingGapProfile } from '../../types/analysis';
import { CompanySummary, Interview, Json } from '../../types/database';
import { formatDate } from '../../utils/dateFormatters';
import { useToast } from '../../contexts/ToastContext';
import { useAnalyticsDashboard } from '../../hooks/useAnalyticsDashboard';
import { buildRoleProfiles, buildWorkflowProfiles, buildToolProfiles, buildTrainingGapProfiles } from '../../utils/analysisHelpers';
import { SummaryNav, SectionId } from './SummaryNav';
import { ExecutiveSummarySection } from './sections/ExecutiveSummarySection';
import { CompanyOverviewSection } from './sections/CompanyOverviewSection';
import { RolesSection } from './sections/RolesSection';
import { WorkflowsSection } from './sections/WorkflowsSection';
import { RisksSection } from './sections/RisksSection';
import { TechnologySection } from './sections/TechnologySection';
import { TrainingGapsSection } from './sections/TrainingGapsSection';
import { RecommendationsSection } from './sections/RecommendationsSection';
import { EvidenceSection } from './sections/EvidenceSection';
import { ExportsSection } from './sections/ExportsSection';

interface CompanySummaryViewProps {
  summary: CompanySummary;
  interviews: Interview[];
  onBack: () => void;
  onUpdate?: (id: string, updates: { summary_data?: Json }) => Promise<{ error: string | null }>;
  onViewInterview?: (interview: Interview) => void;
}

interface CompanyContext {
  description?: string;
  industry?: string;
  companySize?: string;
  projectGoals?: string;
}

interface ExecutiveSummary {
  narrativeSummary?: string;
  keyFindings?: string[];
  topRisks?: Array<{ id: string; text: string; rank: number }>;
  topOpportunities?: Array<{ id: string; text: string; rank: number }>;
  maturityLevel?: 1 | 2 | 3 | 4 | 5;
  maturityNotes?: string;
}

export function CompanySummaryView({ summary, interviews, onBack, onUpdate, onViewInterview }: CompanySummaryViewProps) {
  const data = summary.summary_data as unknown as CompanySummaryData;
  const { addToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionId>('executive');

  // Analytics data from interviews
  const { metrics } = useAnalyticsDashboard(interviews);

  // Build role profiles from interview data (base profiles)
  const baseRoleProfiles = useMemo(() => buildRoleProfiles(interviews), [interviews]);

  // Build workflow profiles from interview data (base profiles)
  const baseWorkflowProfiles = useMemo(() => buildWorkflowProfiles(interviews), [interviews]);

  // Build tool profiles from interview data (base profiles)
  const baseToolProfiles = useMemo(() => buildToolProfiles(interviews), [interviews]);

  // Build training gap profiles from interview data (base profiles)
  const baseTrainingGapProfiles = useMemo(() => buildTrainingGapProfiles(interviews), [interviews]);

  // Local state for editable sections
  const workflows = data.topWorkflows || []; // Read-only for ExecutiveSummarySection
  const tools = data.commonTools || []; // Read-only for ExecutiveSummarySection
  const [painPoints, setPainPoints] = useState(data.criticalPainPoints || []);
  const [handoffs, setHandoffs] = useState(data.highRiskHandoffs || []);
  const [recommendations, setRecommendations] = useState(data.recommendations || []);
  const [roleDistribution, setRoleDistribution] = useState(data.roleDistribution || {});
  const [companyContext, setCompanyContext] = useState<CompanyContext>(
    (data as unknown as { companyContext?: CompanyContext }).companyContext || {}
  );
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary>(
    (data as unknown as { executiveSummary?: ExecutiveSummary }).executiveSummary || {}
  );

  // Role profiles - start with saved customizations or use base profiles
  const savedRoleProfiles = (data as unknown as { roleProfiles?: RoleProfile[] }).roleProfiles;
  const [customRoleProfiles, setCustomRoleProfiles] = useState<RoleProfile[] | null>(
    savedRoleProfiles || null
  );

  // Workflow profiles - start with saved customizations or use base profiles
  const savedWorkflowProfiles = (data as unknown as { workflowProfiles?: WorkflowProfile[] }).workflowProfiles;
  const [customWorkflowProfiles, setCustomWorkflowProfiles] = useState<WorkflowProfile[] | null>(
    savedWorkflowProfiles || null
  );

  // Tool profiles - start with saved customizations or use base profiles
  const savedToolProfiles = (data as unknown as { toolProfiles?: ToolProfile[] }).toolProfiles;
  const [customToolProfiles, setCustomToolProfiles] = useState<ToolProfile[] | null>(
    savedToolProfiles || null
  );

  // Training gap profiles - start with saved customizations or use base profiles
  const savedTrainingGapProfiles = (data as unknown as { trainingGapProfiles?: TrainingGapProfile[] }).trainingGapProfiles;
  const [customTrainingGapProfiles, setCustomTrainingGapProfiles] = useState<TrainingGapProfile[] | null>(
    savedTrainingGapProfiles || null
  );

  // Merge base profiles with customizations
  const roleProfiles = useMemo(() => {
    if (!customRoleProfiles) return baseRoleProfiles;

    // Create a map of custom profiles by id for quick lookup
    const customMap = new Map(customRoleProfiles.map(p => [p.id, p]));

    // Start with custom profiles
    const merged: RoleProfile[] = [...customRoleProfiles];

    // Add any base profiles that don't exist in custom (new roles from interviews)
    baseRoleProfiles.forEach(baseProfile => {
      const existsByTitle = customRoleProfiles.some(
        cp => cp.title.toLowerCase() === baseProfile.title.toLowerCase()
      );
      if (!existsByTitle && !customMap.has(baseProfile.id)) {
        merged.push(baseProfile);
      }
    });

    return merged.sort((a, b) => b.count - a.count);
  }, [baseRoleProfiles, customRoleProfiles]);

  // Merge base workflow profiles with customizations
  const workflowProfiles = useMemo(() => {
    if (!customWorkflowProfiles) return baseWorkflowProfiles;

    // Create a map of custom profiles by id for quick lookup
    const customMap = new Map(customWorkflowProfiles.map(p => [p.id, p]));

    // Start with custom profiles
    const merged: WorkflowProfile[] = [...customWorkflowProfiles];

    // Add any base profiles that don't exist in custom (new workflows from interviews)
    baseWorkflowProfiles.forEach(baseProfile => {
      const existsByName = customWorkflowProfiles.some(
        cp => cp.name.toLowerCase() === baseProfile.name.toLowerCase()
      );
      if (!existsByName && !customMap.has(baseProfile.id)) {
        merged.push(baseProfile);
      }
    });

    return merged.sort((a, b) => b.count - a.count);
  }, [baseWorkflowProfiles, customWorkflowProfiles]);

  // Merge base tool profiles with customizations
  const toolProfiles = useMemo(() => {
    if (!customToolProfiles) return baseToolProfiles;

    // Create a map of custom profiles by id for quick lookup
    const customMap = new Map(customToolProfiles.map(p => [p.id, p]));

    // Start with custom profiles
    const merged: ToolProfile[] = [...customToolProfiles];

    // Add any base profiles that don't exist in custom (new tools from interviews)
    baseToolProfiles.forEach(baseProfile => {
      const existsByName = customToolProfiles.some(
        cp => cp.name.toLowerCase() === baseProfile.name.toLowerCase()
      );
      if (!existsByName && !customMap.has(baseProfile.id)) {
        merged.push(baseProfile);
      }
    });

    return merged.sort((a, b) => b.count - a.count);
  }, [baseToolProfiles, customToolProfiles]);

  // Merge base training gap profiles with customizations
  const trainingGapProfiles = useMemo(() => {
    if (!customTrainingGapProfiles) return baseTrainingGapProfiles;

    // Create a map of custom profiles by id for quick lookup
    const customMap = new Map(customTrainingGapProfiles.map(p => [p.id, p]));

    // Start with custom profiles
    const merged: TrainingGapProfile[] = [...customTrainingGapProfiles];

    // Add any base profiles that don't exist in custom (new gaps from interviews)
    baseTrainingGapProfiles.forEach(baseProfile => {
      const existsByArea = customTrainingGapProfiles.some(
        cp => cp.area.toLowerCase() === baseProfile.area.toLowerCase()
      );
      if (!existsByArea && !customMap.has(baseProfile.id)) {
        merged.push(baseProfile);
      }
    });

    // Sort by risk severity, then priority, then count
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return merged.sort((a, b) => {
      const severityDiff = severityOrder[a.risk.severity] - severityOrder[b.risk.severity];
      if (severityDiff !== 0) return severityDiff;

      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return b.count - a.count;
    });
  }, [baseTrainingGapProfiles, customTrainingGapProfiles]);

  // Generic save function
  const saveData = async (updates: Partial<CompanySummaryData & { companyContext?: CompanyContext }>) => {
    if (!onUpdate) return { error: 'No update function' };

    const updatedData = { ...data, ...updates };
    const result = await onUpdate(summary.id, { summary_data: updatedData as unknown as Json });

    if (result.error) {
      addToast('Failed to save changes', 'error');
    } else {
      addToast('Changes saved', 'success');
    }
    return result;
  };

  // Section-specific update handlers
  const handleUpdatePainPoints = async (newPainPoints: typeof painPoints) => {
    const result = await saveData({ criticalPainPoints: newPainPoints });
    if (!result.error) setPainPoints(newPainPoints);
  };

  const handleUpdateHandoffs = async (newHandoffs: typeof handoffs) => {
    const result = await saveData({ highRiskHandoffs: newHandoffs });
    if (!result.error) setHandoffs(newHandoffs);
  };

  const handleUpdateRecommendations = async (newRecs: typeof recommendations) => {
    const result = await saveData({ recommendations: newRecs });
    if (!result.error) setRecommendations(newRecs);
  };

  const handleUpdateRoleDistribution = async (newRoles: typeof roleDistribution) => {
    const result = await saveData({ roleDistribution: newRoles });
    if (!result.error) setRoleDistribution(newRoles);
  };

  const handleUpdateCompanyContext = async (newContext: CompanyContext) => {
    const result = await saveData({ companyContext: newContext } as unknown as Partial<CompanySummaryData>);
    if (!result.error) setCompanyContext(newContext);
  };

  const handleUpdateExecutiveSummary = async (newExecSummary: ExecutiveSummary) => {
    const result = await saveData({ executiveSummary: newExecSummary } as unknown as Partial<CompanySummaryData>);
    if (!result.error) setExecutiveSummary(newExecSummary);
  };

  const handleUpdateRoleProfiles = async (newProfiles: RoleProfile[]) => {
    const result = await saveData({ roleProfiles: newProfiles } as unknown as Partial<CompanySummaryData>);
    if (!result.error) setCustomRoleProfiles(newProfiles);
  };

  const handleUpdateWorkflowProfiles = async (newProfiles: WorkflowProfile[]) => {
    const result = await saveData({ workflowProfiles: newProfiles } as unknown as Partial<CompanySummaryData>);
    if (!result.error) setCustomWorkflowProfiles(newProfiles);
  };

  const handleUpdateToolProfiles = async (newProfiles: ToolProfile[]) => {
    const result = await saveData({ toolProfiles: newProfiles } as unknown as Partial<CompanySummaryData>);
    if (!result.error) setCustomToolProfiles(newProfiles);
  };

  const handleUpdateTrainingGapProfiles = async (newProfiles: TrainingGapProfile[]) => {
    const result = await saveData({ trainingGapProfiles: newProfiles } as unknown as Partial<CompanySummaryData>);
    if (!result.error) setCustomTrainingGapProfiles(newProfiles);
  };

  // Render active section
  const renderSection = () => {
    switch (activeSection) {
      case 'executive':
        return (
          <ExecutiveSummarySection
            data={{ ...data, topWorkflows: workflows, criticalPainPoints: painPoints, commonTools: tools, highRiskHandoffs: handoffs }}
            companyName={summary.title}
            auditDate={summary.created_at}
            executiveSummary={executiveSummary}
            recommendations={recommendations}
            onUpdate={onUpdate ? handleUpdateExecutiveSummary : undefined}
          />
        );

      case 'company':
        return (
          <CompanyOverviewSection
            data={{ ...data, roleDistribution }}
            companyContext={companyContext}
            createdAt={summary.created_at}
            onUpdateContext={onUpdate ? handleUpdateCompanyContext : undefined}
          />
        );

      case 'roles':
        return (
          <RolesSection
            roleDistribution={roleDistribution}
            roleProfiles={roleProfiles}
            onUpdate={onUpdate ? handleUpdateRoleDistribution : undefined}
            onUpdateProfiles={onUpdate ? handleUpdateRoleProfiles : undefined}
          />
        );

      case 'workflows':
        return (
          <WorkflowsSection
            workflowProfiles={workflowProfiles}
            onUpdateProfiles={onUpdate ? handleUpdateWorkflowProfiles : undefined}
          />
        );

      case 'risks':
        return (
          <RisksSection
            painPoints={painPoints}
            handoffs={handoffs}
            painPointsBySeverity={metrics.painPointsBySeverity}
            painPointsByCategory={metrics.painPointsByCategory}
            onUpdatePainPoints={onUpdate ? handleUpdatePainPoints : undefined}
            onUpdateHandoffs={onUpdate ? handleUpdateHandoffs : undefined}
          />
        );

      case 'technology':
        return (
          <TechnologySection
            toolProfiles={toolProfiles}
            onUpdateProfiles={onUpdate ? handleUpdateToolProfiles : undefined}
          />
        );

      case 'training':
        return (
          <TrainingGapsSection
            trainingGapProfiles={trainingGapProfiles}
            onUpdateProfiles={onUpdate ? handleUpdateTrainingGapProfiles : undefined}
          />
        );

      case 'recommendations':
        return (
          <RecommendationsSection
            recommendations={recommendations}
            onUpdate={onUpdate ? handleUpdateRecommendations : undefined}
          />
        );

      case 'evidence':
        return (
          <EvidenceSection
            interviews={interviews}
            onViewInterview={onViewInterview}
          />
        );

      case 'exports':
        return <ExportsSection summary={summary} />;

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-shrink-0">
        <div className="px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-indigo-100 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Interviews
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{summary.title}</h1>
              <p className="text-indigo-100 text-sm">
                Generated {formatDate(summary.created_at)} • {data.totalInterviews} interviews analyzed
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation */}
        <SummaryNav activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
