import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CompanySummaryData } from '../../types/analysis';
import { CompanySummary, Interview, Json } from '../../types/database';
import { formatDate } from '../../utils/dateFormatters';
import { useToast } from '../../contexts/ToastContext';
import { useAnalyticsDashboard } from '../../hooks/useAnalyticsDashboard';
import { buildRoleProfiles } from '../../utils/analysisHelpers';
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

  // Build role profiles from interview data
  const roleProfiles = useMemo(() => buildRoleProfiles(interviews), [interviews]);

  // Local state for editable sections
  const [workflows, setWorkflows] = useState(data.topWorkflows || []);
  const [painPoints, setPainPoints] = useState(data.criticalPainPoints || []);
  const [tools, setTools] = useState(data.commonTools || []);
  const [trainingGaps, setTrainingGaps] = useState(data.priorityTrainingGaps || []);
  const [handoffs, setHandoffs] = useState(data.highRiskHandoffs || []);
  const [recommendations, setRecommendations] = useState(data.recommendations || []);
  const [roleDistribution, setRoleDistribution] = useState(data.roleDistribution || {});
  const [companyContext, setCompanyContext] = useState<CompanyContext>(
    (data as unknown as { companyContext?: CompanyContext }).companyContext || {}
  );
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary>(
    (data as unknown as { executiveSummary?: ExecutiveSummary }).executiveSummary || {}
  );

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
  const handleUpdateWorkflows = async (newWorkflows: typeof workflows) => {
    const result = await saveData({ topWorkflows: newWorkflows });
    if (!result.error) setWorkflows(newWorkflows);
  };

  const handleUpdatePainPoints = async (newPainPoints: typeof painPoints) => {
    const result = await saveData({ criticalPainPoints: newPainPoints });
    if (!result.error) setPainPoints(newPainPoints);
  };

  const handleUpdateTools = async (newTools: typeof tools) => {
    const result = await saveData({ commonTools: newTools });
    if (!result.error) setTools(newTools);
  };

  const handleUpdateTrainingGaps = async (newGaps: typeof trainingGaps) => {
    const result = await saveData({ priorityTrainingGaps: newGaps });
    if (!result.error) setTrainingGaps(newGaps);
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
          />
        );

      case 'workflows':
        return (
          <WorkflowsSection
            workflows={workflows}
            analyticsWorkflows={metrics.workflows}
            onUpdate={onUpdate ? handleUpdateWorkflows : undefined}
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
            tools={tools}
            analyticsTools={metrics.tools}
            onUpdate={onUpdate ? handleUpdateTools : undefined}
          />
        );

      case 'training':
        return (
          <TrainingGapsSection
            trainingGaps={trainingGaps}
            analyticsTrainingGaps={metrics.trainingGaps}
            onUpdate={onUpdate ? handleUpdateTrainingGaps : undefined}
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
