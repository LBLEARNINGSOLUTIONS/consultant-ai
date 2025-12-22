import { InterviewAnalysis, Workflow, PainPoint, Tool, CompanySummaryData } from '../types/analysis';

/**
 * Aggregate multiple interview analyses into a company summary
 */
export function aggregateAnalyses(analyses: InterviewAnalysis[], dates: string[]): CompanySummaryData {
  // Count workflow occurrences
  const workflowCounts = new Map<string, { frequency: number; mentions: number }>();
  analyses.forEach(analysis => {
    analysis.workflows.forEach(workflow => {
      const existing = workflowCounts.get(workflow.name) || { frequency: 0, mentions: 0 };
      workflowCounts.set(workflow.name, {
        frequency: existing.frequency + (workflow.frequency === 'daily' ? 365 : workflow.frequency === 'weekly' ? 52 : workflow.frequency === 'monthly' ? 12 : 1),
        mentions: existing.mentions + 1
      });
    });
  });

  const topWorkflows = Array.from(workflowCounts.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);

  // Get critical pain points
  const allPainPoints: PainPoint[] = analyses.flatMap(a => a.painPoints);
  const criticalPainPoints = allPainPoints
    .filter(p => p.severity === 'high' || p.severity === 'critical')
    .reduce((acc, painPoint) => {
      const existing = acc.find(p => p.description.toLowerCase() === painPoint.description.toLowerCase());
      if (existing) {
        existing.affectedCount++;
      } else {
        acc.push({
          description: painPoint.description,
          severity: painPoint.severity as 'high' | 'critical',
          affectedCount: 1
        });
      }
      return acc;
    }, [] as Array<{ description: string; severity: 'high' | 'critical'; affectedCount: number }>)
    .sort((a, b) => b.affectedCount - a.affectedCount)
    .slice(0, 10);

  // Get common tools
  const toolUsage = new Map<string, { userCount: number; roles: Set<string> }>();
  analyses.forEach(analysis => {
    analysis.tools.forEach(tool => {
      const existing = toolUsage.get(tool.name) || { userCount: 0, roles: new Set<string>() };
      existing.userCount++;
      tool.usedBy.forEach(role => existing.roles.add(role));
      toolUsage.set(tool.name, existing);
    });
  });

  const commonTools = Array.from(toolUsage.entries())
    .map(([name, data]) => ({
      name,
      userCount: data.userCount,
      roles: Array.from(data.roles)
    }))
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, 10);

  // Role distribution
  const roleDistribution: Record<string, number> = {};
  analyses.forEach(analysis => {
    analysis.roles.forEach(role => {
      roleDistribution[role.title] = (roleDistribution[role.title] || 0) + 1;
    });
  });

  // Priority training gaps
  const trainingGapCounts = new Map<string, { affectedRoles: Set<string>; frequency: number }>();
  analyses.forEach(analysis => {
    analysis.trainingGaps.filter(g => g.priority === 'high').forEach(gap => {
      const existing = trainingGapCounts.get(gap.area) || { affectedRoles: new Set<string>(), frequency: 0 };
      existing.frequency++;
      gap.affectedRoles.forEach(role => existing.affectedRoles.add(role));
      trainingGapCounts.set(gap.area, existing);
    });
  });

  const priorityTrainingGaps = Array.from(trainingGapCounts.entries())
    .map(([area, data]) => ({
      area,
      affectedRoles: Array.from(data.affectedRoles),
      priority: 'high' as const,
      frequency: data.frequency
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  // High-risk handoffs
  const handoffCounts = new Map<string, number>();
  analyses.forEach(analysis => {
    analysis.handoffRisks.filter(h => h.riskLevel === 'high').forEach(handoff => {
      const key = `${handoff.fromRole}→${handoff.toRole}:${handoff.process}`;
      handoffCounts.set(key, (handoffCounts.get(key) || 0) + 1);
    });
  });

  const highRiskHandoffs = Array.from(handoffCounts.entries())
    .map(([key, occurrences]) => {
      const [roles, process] = key.split(':');
      const [fromRole, toRole] = roles.split('→');
      return { fromRole, toRole, process, occurrences };
    })
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10);

  return {
    totalInterviews: analyses.length,
    dateRange: {
      earliest: dates.length > 0 ? dates.sort()[0] : new Date().toISOString(),
      latest: dates.length > 0 ? dates.sort()[dates.length - 1] : new Date().toISOString()
    },
    topWorkflows,
    criticalPainPoints,
    commonTools,
    roleDistribution,
    priorityTrainingGaps,
    highRiskHandoffs
  };
}
