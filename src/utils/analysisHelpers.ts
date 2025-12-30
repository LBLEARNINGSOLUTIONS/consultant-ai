import { InterviewAnalysis, Workflow, PainPoint, Tool, Role, TrainingGap, HandoffRisk, CompanySummaryData, RoleProfile, WorkflowProfile, WorkflowStep, ToolProfile } from '../types/analysis';
import { Interview } from '../types/database';
import { nanoid } from 'nanoid';
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

  // Aggregate recommendations from all analyses
  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const recommendationMap = new Map<string, {
    id: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
    category?: string;
    count: number
  }>();

  analyses.forEach(analysis => {
    // From dedicated recommendations field (new analyses)
    (analysis.recommendations || []).forEach(rec => {
      const key = rec.text.toLowerCase().slice(0, 50);
      const existing = recommendationMap.get(key);
      if (existing) {
        existing.count++;
        // Keep highest priority
        if ((priorityOrder[rec.priority] || 0) > (priorityOrder[existing.priority] || 0)) {
          existing.priority = rec.priority;
        }
      } else {
        recommendationMap.set(key, {
          id: rec.id || nanoid(),
          text: rec.text,
          priority: rec.priority,
          category: rec.category,
          count: 1
        });
      }
    });

    // Fallback: Extract from suggestion fields (for older analyses without recommendations)
    analysis.painPoints.forEach(pp => {
      if (pp.suggestedSolution) {
        const key = pp.suggestedSolution.toLowerCase().slice(0, 50);
        if (!recommendationMap.has(key)) {
          recommendationMap.set(key, {
            id: nanoid(),
            text: pp.suggestedSolution,
            priority: pp.severity === 'critical' ? 'high' : pp.severity === 'high' ? 'high' : 'medium',
            category: 'process',
            count: 1
          });
        }
      }
    });

    analysis.trainingGaps.forEach(gap => {
      if (gap.suggestedTraining) {
        const key = gap.suggestedTraining.toLowerCase().slice(0, 50);
        if (!recommendationMap.has(key)) {
          recommendationMap.set(key, {
            id: nanoid(),
            text: gap.suggestedTraining,
            priority: gap.priority,
            category: 'training',
            count: 1
          });
        }
      }
    });

    analysis.handoffRisks.forEach(handoff => {
      if (handoff.mitigation) {
        const key = handoff.mitigation.toLowerCase().slice(0, 50);
        if (!recommendationMap.has(key)) {
          recommendationMap.set(key, {
            id: nanoid(),
            text: handoff.mitigation,
            priority: handoff.riskLevel === 'high' ? 'high' : 'medium',
            category: 'risk-mitigation',
            count: 1
          });
        }
      }
    });
  });

  // Convert to array and sort by priority then count
  const recommendations = Array.from(recommendationMap.values())
    .sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.count - a.count;
    })
    .slice(0, 15)
    .map(({ id, text, priority }) => ({ id, text, priority }));

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
    highRiskHandoffs,
    recommendations
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

/**
 * Merge multiple interviews' analysis data into a single combined analysis
 * Returns full analysis arrays (not aggregated summaries)
 */
export function mergeAnalysisData(interviews: Interview[]): InterviewAnalysis {
  const frequencyOrder: Record<string, number> = { daily: 4, weekly: 3, monthly: 2, 'ad-hoc': 1 };
  const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const riskOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

  // Merge workflows - group by name, merge arrays, keep highest frequency
  const workflowMap = new Map<string, Workflow>();
  interviews.forEach(interview => {
    const workflows = (interview.workflows as unknown as Workflow[]) || [];
    workflows.forEach(workflow => {
      const key = workflow.name.toLowerCase();
      const existing = workflowMap.get(key);
      if (existing) {
        existing.steps = [...new Set([...existing.steps, ...workflow.steps])];
        existing.participants = [...new Set([...existing.participants, ...workflow.participants])];
        if ((frequencyOrder[workflow.frequency] || 0) > (frequencyOrder[existing.frequency] || 0)) {
          existing.frequency = workflow.frequency;
        }
        if (workflow.duration && !existing.duration) existing.duration = workflow.duration;
        if (workflow.notes) existing.notes = existing.notes ? `${existing.notes}; ${workflow.notes}` : workflow.notes;
      } else {
        workflowMap.set(key, { ...workflow, id: nanoid() });
      }
    });
  });

  // Merge pain points - group by description, keep highest severity
  const painPointMap = new Map<string, PainPoint>();
  interviews.forEach(interview => {
    const painPoints = (interview.pain_points as unknown as PainPoint[]) || [];
    painPoints.forEach(pp => {
      const key = pp.description.toLowerCase().slice(0, 100);
      const existing = painPointMap.get(key);
      if (existing) {
        existing.affectedRoles = [...new Set([...existing.affectedRoles, ...pp.affectedRoles])];
        if ((severityOrder[pp.severity] || 0) > (severityOrder[existing.severity] || 0)) {
          existing.severity = pp.severity;
        }
        if (pp.suggestedSolution && !existing.suggestedSolution) {
          existing.suggestedSolution = pp.suggestedSolution;
        }
      } else {
        painPointMap.set(key, { ...pp, id: nanoid() });
      }
    });
  });

  // Merge tools - group by name, merge usedBy and integrations
  const toolMap = new Map<string, Tool>();
  interviews.forEach(interview => {
    const tools = (interview.tools as unknown as Tool[]) || [];
    tools.forEach(tool => {
      const key = tool.name.toLowerCase();
      const existing = toolMap.get(key);
      if (existing) {
        existing.usedBy = [...new Set([...existing.usedBy, ...tool.usedBy])];
        if (tool.integrations) {
          existing.integrations = [...new Set([...(existing.integrations || []), ...tool.integrations])];
        }
        if (tool.limitations && !existing.limitations) existing.limitations = tool.limitations;
      } else {
        toolMap.set(key, { ...tool, id: nanoid() });
      }
    });
  });

  // Merge roles - group by title, merge responsibilities/workflows/tools
  const roleMap = new Map<string, Role>();
  interviews.forEach(interview => {
    const roles = (interview.roles as unknown as Role[]) || [];
    roles.forEach(role => {
      const key = role.title.toLowerCase();
      const existing = roleMap.get(key);
      if (existing) {
        existing.responsibilities = [...new Set([...existing.responsibilities, ...role.responsibilities])];
        existing.workflows = [...new Set([...existing.workflows, ...role.workflows])];
        existing.tools = [...new Set([...existing.tools, ...role.tools])];
        if (role.teamSize && (!existing.teamSize || role.teamSize > existing.teamSize)) {
          existing.teamSize = role.teamSize;
        }
      } else {
        roleMap.set(key, { ...role, id: nanoid() });
      }
    });
  });

  // Merge training gaps - group by area, keep highest priority
  const trainingGapMap = new Map<string, TrainingGap>();
  interviews.forEach(interview => {
    const gaps = (interview.training_gaps as unknown as TrainingGap[]) || [];
    gaps.forEach(gap => {
      const key = gap.area.toLowerCase();
      const existing = trainingGapMap.get(key);
      if (existing) {
        existing.affectedRoles = [...new Set([...existing.affectedRoles, ...gap.affectedRoles])];
        if ((priorityOrder[gap.priority] || 0) > (priorityOrder[existing.priority] || 0)) {
          existing.priority = gap.priority;
        }
        if (gap.suggestedTraining && !existing.suggestedTraining) {
          existing.suggestedTraining = gap.suggestedTraining;
        }
      } else {
        trainingGapMap.set(key, { ...gap, id: nanoid() });
      }
    });
  });

  // Merge handoff risks - group by from/to/process, keep highest risk
  const handoffMap = new Map<string, HandoffRisk>();
  interviews.forEach(interview => {
    const handoffs = (interview.handoff_risks as unknown as HandoffRisk[]) || [];
    handoffs.forEach(handoff => {
      const key = `${handoff.fromRole.toLowerCase()}->${handoff.toRole.toLowerCase()}:${handoff.process.toLowerCase()}`;
      const existing = handoffMap.get(key);
      if (existing) {
        if ((riskOrder[handoff.riskLevel] || 0) > (riskOrder[existing.riskLevel] || 0)) {
          existing.riskLevel = handoff.riskLevel;
        }
        if (handoff.mitigation && !existing.mitigation) existing.mitigation = handoff.mitigation;
      } else {
        handoffMap.set(key, { ...handoff, id: nanoid() });
      }
    });
  });

  return {
    workflows: Array.from(workflowMap.values()),
    painPoints: Array.from(painPointMap.values()),
    tools: Array.from(toolMap.values()),
    roles: Array.from(roleMap.values()),
    trainingGaps: Array.from(trainingGapMap.values()),
    handoffRisks: Array.from(handoffMap.values()),
    recommendations: [], // Merged analysis doesn't aggregate recommendations - they come from company summary
  };
}

/**
 * Build comprehensive role profiles from interview data
 * Aggregates roles with their dependencies, issues, and training needs
 */
export function buildRoleProfiles(interviews: Interview[]): RoleProfile[] {
  const completedInterviews = interviews.filter(i => i.analysis_status === 'completed');

  // First, aggregate basic role data
  const roleMap = new Map<string, {
    title: string;
    count: number;
    responsibilities: Set<string>;
    workflows: Set<string>;
    tools: Set<string>;
    interviewIds: string[];
  }>();

  // Collect all handoffs, pain points, and training gaps
  const allHandoffs: Array<{ fromRole: string; toRole: string; process: string }> = [];
  const allPainPoints: Array<{ description: string; severity: string; affectedRoles: string[] }> = [];
  const allTrainingGaps: Array<{ area: string; priority: string; affectedRoles: string[] }> = [];

  completedInterviews.forEach(interview => {
    // Process roles
    const roles = (interview.roles as unknown as Role[]) || [];
    roles.forEach(role => {
      const key = role.title.toLowerCase();
      const existing = roleMap.get(key);
      if (existing) {
        existing.count++;
        role.responsibilities.forEach(r => existing.responsibilities.add(r));
        role.workflows.forEach(w => existing.workflows.add(w));
        role.tools.forEach(t => existing.tools.add(t));
        existing.interviewIds.push(interview.id);
      } else {
        roleMap.set(key, {
          title: role.title,
          count: 1,
          responsibilities: new Set(role.responsibilities),
          workflows: new Set(role.workflows),
          tools: new Set(role.tools),
          interviewIds: [interview.id],
        });
      }
    });

    // Collect handoffs
    const handoffs = (interview.handoff_risks as unknown as HandoffRisk[]) || [];
    handoffs.forEach(h => {
      allHandoffs.push({ fromRole: h.fromRole, toRole: h.toRole, process: h.process });
    });

    // Collect pain points
    const painPoints = (interview.pain_points as unknown as PainPoint[]) || [];
    painPoints.forEach(pp => {
      allPainPoints.push({
        description: pp.description,
        severity: pp.severity,
        affectedRoles: pp.affectedRoles,
      });
    });

    // Collect training gaps
    const trainingGaps = (interview.training_gaps as unknown as TrainingGap[]) || [];
    trainingGaps.forEach(tg => {
      allTrainingGaps.push({
        area: tg.area,
        priority: tg.priority,
        affectedRoles: tg.affectedRoles,
      });
    });
  });

  // Build role profiles with all the cross-referenced data
  const roleProfiles: RoleProfile[] = [];

  roleMap.forEach((data) => {
    const normalizedTitle = data.title.toLowerCase();

    // Build inputsFrom (handoffs where this role receives)
    const inputsFromMap = new Map<string, { role: string; process: string; count: number }>();
    allHandoffs.forEach(h => {
      if (h.toRole.toLowerCase() === normalizedTitle) {
        const hKey = `${h.fromRole.toLowerCase()}-${h.process.toLowerCase()}`;
        const existing = inputsFromMap.get(hKey);
        if (existing) {
          existing.count++;
        } else {
          inputsFromMap.set(hKey, { role: h.fromRole, process: h.process, count: 1 });
        }
      }
    });

    // Build outputsTo (handoffs where this role sends)
    const outputsToMap = new Map<string, { role: string; process: string; count: number }>();
    allHandoffs.forEach(h => {
      if (h.fromRole.toLowerCase() === normalizedTitle) {
        const hKey = `${h.toRole.toLowerCase()}-${h.process.toLowerCase()}`;
        const existing = outputsToMap.get(hKey);
        if (existing) {
          existing.count++;
        } else {
          outputsToMap.set(hKey, { role: h.toRole, process: h.process, count: 1 });
        }
      }
    });

    // Build issues detected (pain points affecting this role)
    const issuesMap = new Map<string, { description: string; severity: string; count: number }>();
    allPainPoints.forEach(pp => {
      const affectsRole = pp.affectedRoles.some(r => r.toLowerCase() === normalizedTitle);
      if (affectsRole) {
        const iKey = pp.description.toLowerCase().slice(0, 50);
        const existing = issuesMap.get(iKey);
        if (existing) {
          existing.count++;
          // Keep highest severity
          const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          if ((severityOrder[pp.severity] || 0) > (severityOrder[existing.severity] || 0)) {
            existing.severity = pp.severity;
          }
        } else {
          issuesMap.set(iKey, { description: pp.description, severity: pp.severity, count: 1 });
        }
      }
    });

    // Build training needs (training gaps affecting this role)
    const trainingMap = new Map<string, { area: string; priority: string; count: number }>();
    allTrainingGaps.forEach(tg => {
      const affectsRole = tg.affectedRoles.some(r => r.toLowerCase() === normalizedTitle);
      if (affectsRole) {
        const tKey = tg.area.toLowerCase();
        const existing = trainingMap.get(tKey);
        if (existing) {
          existing.count++;
          // Keep highest priority
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          if ((priorityOrder[tg.priority] || 0) > (priorityOrder[existing.priority] || 0)) {
            existing.priority = tg.priority;
          }
        } else {
          trainingMap.set(tKey, { area: tg.area, priority: tg.priority, count: 1 });
        }
      }
    });

    roleProfiles.push({
      id: nanoid(),
      title: data.title,
      count: data.count,
      responsibilities: Array.from(data.responsibilities),
      workflows: Array.from(data.workflows),
      tools: Array.from(data.tools),
      inputsFrom: Array.from(inputsFromMap.values()).sort((a, b) => b.count - a.count),
      outputsTo: Array.from(outputsToMap.values()).sort((a, b) => b.count - a.count),
      issuesDetected: Array.from(issuesMap.values()).sort((a, b) => {
        const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      }),
      trainingNeeds: Array.from(trainingMap.values()).sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }),
      interviewIds: data.interviewIds,
    });
  });

  // Sort by count descending
  return roleProfiles.sort((a, b) => b.count - a.count);
}

/**
 * Build comprehensive workflow profiles from interview data
 * Aggregates workflows with steps, participants, systems, and failure points
 */
export function buildWorkflowProfiles(interviews: Interview[]): WorkflowProfile[] {
  const completedInterviews = interviews.filter(i => i.analysis_status === 'completed');

  // Aggregate workflow data
  const workflowMap = new Map<string, {
    name: string;
    count: number;
    frequency: string;
    steps: Map<string, { name: string; count: number; order: number }>;
    participants: Set<string>;
    interviewIds: string[];
    durations: string[];
    notes: string[];
  }>();

  // Collect all pain points for failure point detection
  const allPainPoints: Array<{ description: string; severity: string; relatedWorkflow?: string }> = [];

  // Collect tool data for system mapping
  const participantTools = new Map<string, Set<string>>(); // participant -> tools

  completedInterviews.forEach(interview => {
    // Process workflows
    const workflows = (interview.workflows as unknown as Workflow[]) || [];
    workflows.forEach(workflow => {
      const key = workflow.name.toLowerCase();
      const existing = workflowMap.get(key);

      if (existing) {
        existing.count++;
        workflow.participants.forEach(p => existing.participants.add(p));
        existing.interviewIds.push(interview.id);

        // Merge steps with frequency counting
        workflow.steps.forEach((stepName, idx) => {
          const stepKey = stepName.toLowerCase();
          const stepData = existing.steps.get(stepKey);
          if (stepData) {
            stepData.count++;
          } else {
            existing.steps.set(stepKey, { name: stepName, count: 1, order: idx });
          }
        });

        // Track frequency (keep most frequent)
        const freqOrder: Record<string, number> = { daily: 4, weekly: 3, monthly: 2, 'ad-hoc': 1 };
        if ((freqOrder[workflow.frequency] || 0) > (freqOrder[existing.frequency] || 0)) {
          existing.frequency = workflow.frequency;
        }

        if (workflow.duration) existing.durations.push(workflow.duration);
        if (workflow.notes) existing.notes.push(workflow.notes);
      } else {
        const stepsMap = new Map<string, { name: string; count: number; order: number }>();
        workflow.steps.forEach((stepName, idx) => {
          stepsMap.set(stepName.toLowerCase(), { name: stepName, count: 1, order: idx });
        });

        workflowMap.set(key, {
          name: workflow.name,
          count: 1,
          frequency: workflow.frequency,
          steps: stepsMap,
          participants: new Set(workflow.participants),
          interviewIds: [interview.id],
          durations: workflow.duration ? [workflow.duration] : [],
          notes: workflow.notes ? [workflow.notes] : [],
        });
      }
    });

    // Collect pain points with potential workflow associations
    const painPoints = (interview.pain_points as unknown as PainPoint[]) || [];
    painPoints.forEach(pp => {
      allPainPoints.push({
        description: pp.description,
        severity: pp.severity,
        // Try to infer related workflow from context (check if description mentions a workflow)
      });
    });

    // Map participants to tools
    const tools = (interview.tools as unknown as Tool[]) || [];
    tools.forEach(tool => {
      tool.usedBy.forEach(user => {
        const existing = participantTools.get(user.toLowerCase()) || new Set<string>();
        existing.add(tool.name);
        participantTools.set(user.toLowerCase(), existing);
      });
    });

    // Also map roles to tools from role data
    const roles = (interview.roles as unknown as Role[]) || [];
    roles.forEach(role => {
      role.tools.forEach(tool => {
        const existing = participantTools.get(role.title.toLowerCase()) || new Set<string>();
        existing.add(tool);
        participantTools.set(role.title.toLowerCase(), existing);
      });
    });
  });

  // Build workflow profiles
  const workflowProfiles: WorkflowProfile[] = [];

  workflowMap.forEach((data) => {
    // Sort steps by their average order
    const sortedSteps = Array.from(data.steps.values())
      .sort((a, b) => a.order - b.order);

    // Build WorkflowStep objects
    const steps: WorkflowStep[] = sortedSteps.map((stepData) => {
      // Try to identify owner for this step based on participant tools/roles
      // This is a heuristic - in practice, specific owner would come from more detailed analysis
      const possibleOwners = Array.from(data.participants);

      return {
        id: nanoid(),
        name: stepData.name,
        // Owner will be assigned during editing or through more detailed analysis
        owner: possibleOwners.length === 1 ? possibleOwners[0] : undefined,
        systems: [], // Will be populated from participant tools
        issues: [], // Will be populated from pain points
      };
    });

    // Collect all systems used by participants
    const systems = new Set<string>();
    data.participants.forEach(participant => {
      const tools = participantTools.get(participant.toLowerCase());
      if (tools) {
        tools.forEach(tool => systems.add(tool));
      }
    });

    // Find failure points - pain points that might relate to this workflow
    // This is a heuristic based on keyword matching
    const workflowKeywords = data.name.toLowerCase().split(/\s+/);
    const failurePoints: WorkflowProfile['failurePoints'] = [];

    allPainPoints.forEach(pp => {
      const descLower = pp.description.toLowerCase();
      // Check if pain point description mentions workflow name or any step
      const mentionsWorkflow = workflowKeywords.some(kw => kw.length > 3 && descLower.includes(kw));
      const mentionsStep = sortedSteps.some(step =>
        step.name.toLowerCase().split(/\s+/).some(kw => kw.length > 3 && descLower.includes(kw))
      );

      if (mentionsWorkflow || mentionsStep) {
        // Find which step it might relate to
        const relatedStep = sortedSteps.find(step =>
          step.name.toLowerCase().split(/\s+/).some(kw => kw.length > 3 && descLower.includes(kw))
        );

        failurePoints.push({
          stepId: relatedStep ? steps.find(s => s.name === relatedStep.name)?.id : undefined,
          description: pp.description,
          severity: pp.severity,
        });
      }
    });

    // Identify unclear steps (steps mentioned only once or very brief names)
    const unclearSteps = sortedSteps
      .filter(step => step.count === 1 && step.name.split(/\s+/).length < 3)
      .map(step => step.name);

    workflowProfiles.push({
      id: nanoid(),
      name: data.name,
      count: data.count,
      frequency: data.frequency,
      steps,
      participants: Array.from(data.participants),
      systems: Array.from(systems),
      failurePoints: failurePoints.slice(0, 10), // Limit to top 10
      unclearSteps,
      interviewIds: data.interviewIds,
    });
  });

  // Sort by count descending
  return workflowProfiles.sort((a, b) => b.count - a.count);
}

/**
 * Build comprehensive tool profiles from interview data
 * Aggregates tools with usage context, workflows, and gap analysis
 */
export function buildToolProfiles(interviews: Interview[]): ToolProfile[] {
  const completedInterviews = interviews.filter(i => i.analysis_status === 'completed');

  // Category detection based on common tool names
  const categoryPatterns: Record<string, RegExp[]> = {
    crm: [/salesforce/i, /hubspot/i, /zoho/i, /pipedrive/i, /dynamics/i, /crm/i],
    pm: [/asana/i, /monday/i, /trello/i, /jira/i, /clickup/i, /basecamp/i, /notion/i, /project/i],
    spreadsheet: [/excel/i, /sheets/i, /spreadsheet/i, /airtable/i, /smartsheet/i],
    communication: [/slack/i, /teams/i, /zoom/i, /meet/i, /email/i, /outlook/i, /gmail/i],
    erp: [/sap/i, /oracle/i, /netsuite/i, /odoo/i, /erp/i, /quickbooks/i, /sage/i],
  };

  const detectCategory = (toolName: string): ToolProfile['category'] => {
    const name = toolName.toLowerCase();
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => pattern.test(name))) {
        return category as ToolProfile['category'];
      }
    }
    return 'other';
  };

  // Aggregate tool data
  const toolMap = new Map<string, {
    name: string;
    count: number;
    category: ToolProfile['category'];
    purposes: Set<string>;
    usedByMap: Map<string, { role: string; purposes: Set<string>; count: number }>;
    workflowsMap: Map<string, { name: string; steps: Set<string>; count: number }>;
    integratesWith: Set<string>;
    limitations: Set<string>;
    frequencies: string[];
    interviewIds: string[];
  }>();

  // Collect workflow data to cross-reference
  const workflowParticipantTools = new Map<string, Set<string>>(); // workflow -> tools

  completedInterviews.forEach(interview => {
    // Process tools
    const tools = (interview.tools as unknown as Tool[]) || [];
    tools.forEach(tool => {
      const key = tool.name.toLowerCase();
      const existing = toolMap.get(key);

      if (existing) {
        existing.count++;
        if (tool.purpose) existing.purposes.add(tool.purpose);
        tool.usedBy.forEach(user => {
          const userKey = user.toLowerCase();
          const userData = existing.usedByMap.get(userKey);
          if (userData) {
            userData.count++;
            if (tool.purpose) userData.purposes.add(tool.purpose);
          } else {
            existing.usedByMap.set(userKey, {
              role: user,
              purposes: new Set(tool.purpose ? [tool.purpose] : []),
              count: 1,
            });
          }
        });
        if (tool.integrations) {
          tool.integrations.forEach(i => existing.integratesWith.add(i));
        }
        if (tool.limitations) existing.limitations.add(tool.limitations);
        if (tool.frequency) existing.frequencies.push(tool.frequency);
        existing.interviewIds.push(interview.id);
      } else {
        const usedByMap = new Map<string, { role: string; purposes: Set<string>; count: number }>();
        tool.usedBy.forEach(user => {
          usedByMap.set(user.toLowerCase(), {
            role: user,
            purposes: new Set(tool.purpose ? [tool.purpose] : []),
            count: 1,
          });
        });

        toolMap.set(key, {
          name: tool.name,
          count: 1,
          category: detectCategory(tool.name),
          purposes: new Set(tool.purpose ? [tool.purpose] : []),
          usedByMap,
          workflowsMap: new Map(),
          integratesWith: new Set(tool.integrations || []),
          limitations: new Set(tool.limitations ? [tool.limitations] : []),
          frequencies: tool.frequency ? [tool.frequency] : [],
          interviewIds: [interview.id],
        });
      }
    });

    // Process workflows to find tool associations
    const workflows = (interview.workflows as unknown as Workflow[]) || [];
    const roles = (interview.roles as unknown as Role[]) || [];

    // Map roles to their tools
    const roleTools = new Map<string, string[]>();
    roles.forEach(role => {
      roleTools.set(role.title.toLowerCase(), role.tools);
    });

    workflows.forEach(workflow => {
      // Associate tools used by workflow participants
      workflow.participants.forEach(participant => {
        const participantTools = roleTools.get(participant.toLowerCase()) || [];
        participantTools.forEach(toolName => {
          const toolKey = toolName.toLowerCase();
          const toolData = toolMap.get(toolKey);
          if (toolData) {
            const wfKey = workflow.name.toLowerCase();
            const wfData = toolData.workflowsMap.get(wfKey);
            if (wfData) {
              wfData.count++;
            } else {
              toolData.workflowsMap.set(wfKey, {
                name: workflow.name,
                steps: new Set(),
                count: 1,
              });
            }
          }

          // Also track for overlap detection
          const existing = workflowParticipantTools.get(workflow.name.toLowerCase()) || new Set<string>();
          existing.add(toolKey);
          workflowParticipantTools.set(workflow.name.toLowerCase(), existing);
        });
      });
    });
  });

  // Detect gaps for all tools
  const allToolNames = Array.from(toolMap.keys());
  const categoryTools = new Map<string, string[]>(); // category -> tool names
  toolMap.forEach((data, key) => {
    const existing = categoryTools.get(data.category) || [];
    existing.push(key);
    categoryTools.set(data.category, existing);
  });

  // Build tool profiles with gap analysis
  const toolProfiles: ToolProfile[] = [];

  toolMap.forEach((data) => {
    const gaps: ToolProfile['gaps'] = [];

    // Gap detection: Underutilized
    if (data.count === 1) {
      gaps.push({
        type: 'underutilized',
        description: 'Tool mentioned in only one interview - may not be widely adopted',
        severity: 'low',
      });
    }

    // Gap detection: Overlap - multiple tools in same category
    const sameCategory = categoryTools.get(data.category) || [];
    if (sameCategory.length > 1 && data.category !== 'other') {
      const otherTools = sameCategory
        .filter(t => t !== data.name.toLowerCase())
        .map(t => toolMap.get(t)?.name || t);
      if (otherTools.length > 0) {
        gaps.push({
          type: 'overlap',
          description: `Multiple ${data.category.toUpperCase()} tools in use: ${otherTools.slice(0, 2).join(', ')}`,
          severity: 'medium',
        });
      }
    }

    // Gap detection: Missing integration (tools in same workflow but no integration)
    data.workflowsMap.forEach((wfData, wfKey) => {
      const workflowTools = workflowParticipantTools.get(wfKey) || new Set<string>();
      workflowTools.forEach(otherToolKey => {
        if (otherToolKey !== data.name.toLowerCase()) {
          const otherTool = toolMap.get(otherToolKey);
          if (otherTool && !data.integratesWith.has(otherTool.name)) {
            // Check if this tool is commonly integrated
            const commonIntegrations = ['excel', 'sheets', 'email', 'outlook', 'gmail'];
            if (!commonIntegrations.some(c => otherToolKey.includes(c))) {
              // Only flag if not already flagged for this workflow
              const existingGap = gaps.find(
                g => g.type === 'missing-integration' && g.description.includes(otherTool.name)
              );
              if (!existingGap) {
                gaps.push({
                  type: 'missing-integration',
                  description: `No integration with ${otherTool.name} (both used in ${wfData.name})`,
                  severity: 'medium',
                });
              }
            }
          }
        }
      });
    });

    // Gap detection: Data handoff (spreadsheet usage often indicates manual data transfer)
    if (data.category === 'spreadsheet') {
      const hasOtherSystems = allToolNames.some(t => {
        const tData = toolMap.get(t);
        return tData && tData.category !== 'spreadsheet' && tData.category !== 'other';
      });
      if (hasOtherSystems) {
        gaps.push({
          type: 'data-handoff',
          description: 'Spreadsheet usage alongside other systems may indicate manual data transfer',
          severity: 'low',
        });
      }
    }

    // Check limitations for potential issues
    data.limitations.forEach(limitation => {
      const lowerLimit = limitation.toLowerCase();
      if (lowerLimit.includes('manual') || lowerLimit.includes('export') || lowerLimit.includes('copy')) {
        gaps.push({
          type: 'data-handoff',
          description: limitation,
          severity: 'medium',
        });
      }
    });

    // Determine most common frequency
    const freqCounts = new Map<string, number>();
    data.frequencies.forEach(f => {
      freqCounts.set(f, (freqCounts.get(f) || 0) + 1);
    });
    let frequency = 'unknown';
    let maxCount = 0;
    freqCounts.forEach((count, freq) => {
      if (count > maxCount) {
        maxCount = count;
        frequency = freq;
      }
    });

    toolProfiles.push({
      id: nanoid(),
      name: data.name,
      count: data.count,
      category: data.category,
      intendedPurpose: Array.from(data.purposes)[0] || 'Not specified',
      actualUsage: Array.from(data.purposes),
      frequency,
      usedBy: Array.from(data.usedByMap.values()).map(u => ({
        role: u.role,
        purpose: Array.from(u.purposes).join('; ') || 'General use',
        count: u.count,
      })).sort((a, b) => b.count - a.count),
      workflows: Array.from(data.workflowsMap.values()).map(w => ({
        name: w.name,
        step: Array.from(w.steps)[0],
        count: w.count,
      })).sort((a, b) => b.count - a.count),
      integratesWith: Array.from(data.integratesWith),
      dataFlows: [], // Would need more detailed analysis data
      gaps: gaps.slice(0, 5), // Limit to top 5 gaps
      limitations: Array.from(data.limitations),
      interviewIds: data.interviewIds,
    });
  });

  // Sort by count descending
  return toolProfiles.sort((a, b) => b.count - a.count);
}
