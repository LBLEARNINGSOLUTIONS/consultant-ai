import { InterviewAnalysis, Workflow, PainPoint, Tool, CompanySummaryData } from '../types/analysis';
import { Interview } from '../types/database';
import {
  DashboardMetrics,
  WorkflowAggregation,
  PainPointAggregation,
  ToolAggregation,
  RoleAggregation,
  TrainingGapAggregation,
  HandoffRiskAggregation,
} from '../types/dashboard';

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

/**
 * Calculate dashboard metrics from completed interviews
 */
export function calculateDashboardMetrics(interviews: Interview[]): DashboardMetrics {
  const completedInterviews = interviews.filter(i => i.analysis_status === 'completed');

  // Aggregate workflows
  const workflowMap = new Map<string, WorkflowAggregation>();
  completedInterviews.forEach(interview => {
    const workflows = (interview.workflows as unknown as Workflow[]) || [];
    workflows.forEach(workflow => {
      const key = workflow.name.toLowerCase();
      const existing = workflowMap.get(key);
      if (existing) {
        existing.count++;
        existing.participants = [...new Set([...existing.participants, ...workflow.participants])];
        existing.interviewIds.push(interview.id);
      } else {
        workflowMap.set(key, {
          name: workflow.name,
          count: 1,
          frequency: workflow.frequency,
          participants: [...workflow.participants],
          interviewIds: [interview.id],
        });
      }
    });
  });
  const workflows = Array.from(workflowMap.values()).sort((a, b) => b.count - a.count);

  // Aggregate pain points
  const painPointMap = new Map<string, PainPointAggregation>();
  completedInterviews.forEach(interview => {
    const painPoints = (interview.pain_points as unknown as PainPoint[]) || [];
    painPoints.forEach(pp => {
      const key = pp.description.toLowerCase().slice(0, 50);
      const existing = painPointMap.get(key);
      if (existing) {
        existing.count++;
        existing.affectedRoles = [...new Set([...existing.affectedRoles, ...pp.affectedRoles])];
        existing.interviewIds.push(interview.id);
        // Keep highest severity
        if (pp.severity === 'critical' || (pp.severity === 'high' && existing.severity !== 'critical')) {
          existing.severity = pp.severity;
        }
      } else {
        painPointMap.set(key, {
          description: pp.description,
          category: pp.category,
          severity: pp.severity,
          affectedRoles: [...pp.affectedRoles],
          count: 1,
          interviewIds: [interview.id],
        });
      }
    });
  });
  const painPoints = Array.from(painPointMap.values()).sort((a, b) => b.count - a.count);

  // Aggregate tools
  const toolMap = new Map<string, ToolAggregation>();
  completedInterviews.forEach(interview => {
    const tools = (interview.tools as unknown as Tool[]) || [];
    tools.forEach(tool => {
      const key = tool.name.toLowerCase();
      const existing = toolMap.get(key);
      if (existing) {
        existing.count++;
        existing.usedBy = [...new Set([...existing.usedBy, ...tool.usedBy])];
        if (tool.limitations) {
          existing.limitations = [...new Set([...existing.limitations, tool.limitations])];
        }
        existing.interviewIds.push(interview.id);
      } else {
        toolMap.set(key, {
          name: tool.name,
          purpose: tool.purpose,
          usedBy: [...tool.usedBy],
          count: 1,
          limitations: tool.limitations ? [tool.limitations] : [],
          interviewIds: [interview.id],
        });
      }
    });
  });
  const tools = Array.from(toolMap.values()).sort((a, b) => b.count - a.count);

  // Aggregate roles
  const roleMap = new Map<string, RoleAggregation>();
  completedInterviews.forEach(interview => {
    const roles = (interview.roles as any[]) || [];
    roles.forEach(role => {
      const key = role.title.toLowerCase();
      const existing = roleMap.get(key);
      if (existing) {
        existing.count++;
        existing.responsibilities = [...new Set([...existing.responsibilities, ...role.responsibilities])];
        existing.workflows = [...new Set([...existing.workflows, ...role.workflows])];
        existing.tools = [...new Set([...existing.tools, ...role.tools])];
        existing.interviewIds.push(interview.id);
      } else {
        roleMap.set(key, {
          title: role.title,
          responsibilities: [...role.responsibilities],
          workflows: [...role.workflows],
          tools: [...role.tools],
          count: 1,
          interviewIds: [interview.id],
        });
      }
    });
  });
  const roles = Array.from(roleMap.values()).sort((a, b) => b.count - a.count);

  // Aggregate training gaps
  const trainingGapMap = new Map<string, TrainingGapAggregation>();
  completedInterviews.forEach(interview => {
    const gaps = (interview.training_gaps as any[]) || [];
    gaps.forEach(gap => {
      const key = gap.area.toLowerCase();
      const existing = trainingGapMap.get(key);
      if (existing) {
        existing.count++;
        existing.affectedRoles = [...new Set([...existing.affectedRoles, ...gap.affectedRoles])];
        existing.interviewIds.push(interview.id);
        // Keep highest priority
        if (gap.priority === 'high' || (gap.priority === 'medium' && existing.priority === 'low')) {
          existing.priority = gap.priority;
        }
      } else {
        trainingGapMap.set(key, {
          area: gap.area,
          priority: gap.priority,
          affectedRoles: [...gap.affectedRoles],
          count: 1,
          interviewIds: [interview.id],
        });
      }
    });
  });
  const trainingGaps = Array.from(trainingGapMap.values()).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  });

  // Aggregate handoff risks
  const handoffMap = new Map<string, HandoffRiskAggregation>();
  completedInterviews.forEach(interview => {
    const handoffs = (interview.handoff_risks as any[]) || [];
    handoffs.forEach(handoff => {
      const key = `${handoff.fromRole.toLowerCase()}->${handoff.toRole.toLowerCase()}`;
      const existing = handoffMap.get(key);
      if (existing) {
        existing.count++;
        existing.interviewIds.push(interview.id);
        // Keep highest risk level
        if (handoff.riskLevel === 'high' || (handoff.riskLevel === 'medium' && existing.riskLevel === 'low')) {
          existing.riskLevel = handoff.riskLevel;
        }
      } else {
        handoffMap.set(key, {
          fromRole: handoff.fromRole,
          toRole: handoff.toRole,
          process: handoff.process,
          riskLevel: handoff.riskLevel,
          count: 1,
          interviewIds: [interview.id],
        });
      }
    });
  });
  const handoffRisks = Array.from(handoffMap.values()).sort((a, b) => {
    const riskOrder = { high: 3, medium: 2, low: 1 };
    return (riskOrder[b.riskLevel as keyof typeof riskOrder] || 0) -
           (riskOrder[a.riskLevel as keyof typeof riskOrder] || 0);
  });

  // Calculate distributions
  const painPointsBySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const painPointsByCategory: Record<string, number> = {};
  painPoints.forEach(pp => {
    painPointsBySeverity[pp.severity] = (painPointsBySeverity[pp.severity] || 0) + pp.count;
    painPointsByCategory[pp.category] = (painPointsByCategory[pp.category] || 0) + pp.count;
  });

  const workflowsByFrequency: Record<string, number> = { daily: 0, weekly: 0, monthly: 0, 'ad-hoc': 0 };
  workflows.forEach(w => {
    workflowsByFrequency[w.frequency] = (workflowsByFrequency[w.frequency] || 0) + w.count;
  });

  const trainingGapsByPriority: Record<string, number> = { high: 0, medium: 0, low: 0 };
  trainingGaps.forEach(g => {
    trainingGapsByPriority[g.priority] = (trainingGapsByPriority[g.priority] || 0) + g.count;
  });

  const handoffRisksByLevel: Record<string, number> = { high: 0, medium: 0, low: 0 };
  handoffRisks.forEach(h => {
    handoffRisksByLevel[h.riskLevel] = (handoffRisksByLevel[h.riskLevel] || 0) + h.count;
  });

  return {
    totalInterviews: interviews.length,
    completedInterviews: completedInterviews.length,
    totalWorkflows: workflows.length,
    totalPainPoints: painPoints.length,
    totalTools: tools.length,
    totalRoles: roles.length,
    criticalPainPoints: painPoints.filter(p => p.severity === 'critical' || p.severity === 'high').length,
    highRiskHandoffs: handoffRisks.filter(h => h.riskLevel === 'high').length,
    workflows,
    painPoints,
    tools,
    roles,
    trainingGaps,
    handoffRisks,
    painPointsBySeverity,
    painPointsByCategory,
    workflowsByFrequency,
    trainingGapsByPriority,
    handoffRisksByLevel,
  };
}
