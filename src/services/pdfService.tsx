import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Interview, CompanySummary } from '../types/database';
import { CompanySummaryData } from '../types/analysis';
import { formatDate } from '../utils/dateFormatters';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2pt solid #4F46E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1pt solid #E2E8F0',
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  text: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
  listItem: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 6,
    paddingLeft: 15,
    lineHeight: 1.4,
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    marginRight: 5,
    marginBottom: 3,
  },
  badgeCritical: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  badgeHigh: {
    backgroundColor: '#FED7AA',
    color: '#9A3412',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  badgeLow: {
    backgroundColor: '#DBEAFE',
    color: '#1E3A8A',
  },
  card: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
    borderLeft: '3pt solid #4F46E5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  column: {
    flex: 1,
  },
  stat: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTop: '1pt solid #E2E8F0',
    paddingTop: 10,
  },
  stepNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.8,
    marginRight: 8,
  },
});

// Generate PDF for individual interview analysis
export async function generateInterviewPDF(interview: Interview): Promise<Blob> {
  const workflows = (interview.workflows as any) || [];
  const painPoints = (interview.pain_points as any) || [];
  const tools = (interview.tools as any) || [];
  const roles = (interview.roles as any) || [];
  const trainingGaps = (interview.training_gaps as any) || [];
  // handoff_risks is available in interview but not currently rendered in PDF

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Interview Analysis Report</Text>
          <Text style={styles.subtitle}>{interview.title}</Text>
          <Text style={styles.subtitle}>
            Analyzed: {interview.analyzed_at ? formatDate(interview.analyzed_at) : 'N/A'}
          </Text>
          <Text style={styles.subtitle}>
            Created: {formatDate(interview.created_at)}
          </Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.stat}>Workflows</Text>
              <Text style={styles.statValue}>{workflows.length}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.stat}>Pain Points</Text>
              <Text style={styles.statValue}>{painPoints.length}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.stat}>Tools</Text>
              <Text style={styles.statValue}>{tools.length}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.stat}>Roles</Text>
              <Text style={styles.statValue}>{roles.length}</Text>
            </View>
          </View>
        </View>

        {/* Workflows */}
        {workflows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workflows ({workflows.length})</Text>
            {workflows.slice(0, 5).map((workflow: any, idx: number) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.subsectionTitle}>{workflow.name}</Text>
                <Text style={styles.text}>Frequency: {workflow.frequency}</Text>
                {workflow.duration && (
                  <Text style={styles.text}>Duration: {workflow.duration}</Text>
                )}
                {workflow.steps && workflow.steps.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>
                      Steps:
                    </Text>
                    {workflow.steps.map((step: string, stepIdx: number) => (
                      <Text key={stepIdx} style={styles.listItem}>
                        {stepIdx + 1}. {step}
                      </Text>
                    ))}
                  </View>
                )}
                {workflow.participants && workflow.participants.length > 0 && (
                  <Text style={{ ...styles.text, marginTop: 6 }}>
                    Participants: {workflow.participants.join(', ')}
                  </Text>
                )}
              </View>
            ))}
            {workflows.length > 5 && (
              <Text style={styles.text}>
                ... and {workflows.length - 5} more workflows
              </Text>
            )}
          </View>
        )}

        {/* Pain Points */}
        {painPoints.length > 0 && (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Pain Points ({painPoints.length})</Text>
            {painPoints.slice(0, 8).map((painPoint: any, idx: number) => (
              <View key={idx} style={styles.card}>
                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <View
                    style={{
                      ...styles.badge,
                      ...(painPoint.severity === 'critical' && styles.badgeCritical),
                      ...(painPoint.severity === 'high' && styles.badgeHigh),
                      ...(painPoint.severity === 'medium' && styles.badgeMedium),
                      ...(painPoint.severity === 'low' && styles.badgeLow),
                    }}
                  >
                    <Text>{painPoint.severity?.toUpperCase()}</Text>
                  </View>
                  <View style={{ ...styles.badge, backgroundColor: '#F1F5F9', color: '#475569' }}>
                    <Text>{painPoint.category}</Text>
                  </View>
                </View>
                <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>
                  {painPoint.description}
                </Text>
                <Text style={styles.text}>Frequency: {painPoint.frequency}</Text>
                <Text style={styles.text}>Impact: {painPoint.impact}</Text>
                {painPoint.affectedRoles && painPoint.affectedRoles.length > 0 && (
                  <Text style={{ ...styles.text, marginTop: 4 }}>
                    Affected Roles: {painPoint.affectedRoles.join(', ')}
                  </Text>
                )}
                {painPoint.suggestedSolution && (
                  <View style={{ marginTop: 6, padding: 8, backgroundColor: '#F0F9FF' }}>
                    <Text style={{ ...styles.text, fontSize: 9 }}>
                      Suggested Solution: {painPoint.suggestedSolution}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {painPoints.length > 8 && (
              <Text style={styles.text}>
                ... and {painPoints.length - 8} more pain points
              </Text>
            )}
          </View>
        )}

        {/* Tools & Software */}
        {tools.length > 0 && (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Tools & Software ({tools.length})</Text>
            {tools.slice(0, 10).map((tool: any, idx: number) => (
              <View key={idx} style={{ ...styles.card, marginBottom: 8 }}>
                <Text style={styles.subsectionTitle}>{tool.name}</Text>
                {tool.purpose && <Text style={styles.text}>Purpose: {tool.purpose}</Text>}
                {tool.usedBy && tool.usedBy.length > 0 && (
                  <Text style={styles.text}>Used by: {tool.usedBy.join(', ')}</Text>
                )}
                {tool.frequency && <Text style={styles.text}>Frequency: {tool.frequency}</Text>}
              </View>
            ))}
            {tools.length > 10 && (
              <Text style={styles.text}>... and {tools.length - 10} more tools</Text>
            )}
          </View>
        )}

        {/* Training Gaps */}
        {trainingGaps.length > 0 && (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Training Gaps ({trainingGaps.length})</Text>
            {trainingGaps.slice(0, 6).map((gap: any, idx: number) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.subsectionTitle}>{gap.area}</Text>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={{ ...styles.text, fontSize: 9, marginBottom: 2 }}>
                      Current State:
                    </Text>
                    <Text style={styles.text}>{gap.currentState}</Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={{ ...styles.text, fontSize: 9, marginBottom: 2 }}>
                      Desired State:
                    </Text>
                    <Text style={styles.text}>{gap.desiredState}</Text>
                  </View>
                </View>
                {gap.affectedRoles && gap.affectedRoles.length > 0 && (
                  <Text style={{ ...styles.text, marginTop: 4 }}>
                    Affected Roles: {gap.affectedRoles.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by ConsultantAI • {new Date().toLocaleDateString()} • Powered by Claude AI
        </Text>
      </Page>
    </Document>
  );

  return await pdf(doc).toBlob();
}

// Generate PDF for company summary
export async function generateCompanySummaryPDF(summary: CompanySummary): Promise<Blob> {
  const data = summary.summary_data as any as CompanySummaryData;

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Company Summary Report</Text>
          <Text style={styles.subtitle}>{summary.title}</Text>
          <Text style={styles.subtitle}>
            Generated: {formatDate(summary.created_at)}
          </Text>
          <Text style={styles.subtitle}>
            {data.totalInterviews} interviews analyzed
          </Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.stat}>Workflows</Text>
              <Text style={styles.statValue}>{data.topWorkflows?.length || 0}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.stat}>Critical Issues</Text>
              <Text style={styles.statValue}>{data.criticalPainPoints?.length || 0}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.stat}>Tools</Text>
              <Text style={styles.statValue}>{data.commonTools?.length || 0}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.stat}>Roles</Text>
              <Text style={styles.statValue}>
                {Object.keys(data.roleDistribution || {}).length}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Workflows */}
        {data.topWorkflows && data.topWorkflows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Top Workflows ({data.topWorkflows.length})
            </Text>
            {data.topWorkflows.slice(0, 10).map((workflow: any, idx: number) => (
              <View key={idx} style={{ ...styles.card, marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.stepNumber}>
                    <Text>{idx + 1}</Text>
                  </View>
                  <Text style={{ ...styles.text, fontWeight: 'bold', flex: 1 }}>
                    {workflow.name}
                  </Text>
                  <View style={{ ...styles.badge, backgroundColor: '#DBEAFE', color: '#1E3A8A' }}>
                    <Text>{workflow.mentions} mentions</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Critical Pain Points */}
        {data.criticalPainPoints && data.criticalPainPoints.length > 0 && (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>
              Critical Pain Points ({data.criticalPainPoints.length})
            </Text>
            {data.criticalPainPoints.slice(0, 10).map((painPoint: any, idx: number) => (
              <View key={idx} style={styles.card}>
                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <View
                    style={{
                      ...styles.badge,
                      ...(painPoint.severity === 'critical' && styles.badgeCritical),
                      ...(painPoint.severity === 'high' && styles.badgeHigh),
                    }}
                  >
                    <Text>{painPoint.severity?.toUpperCase()}</Text>
                  </View>
                  <View style={{ ...styles.badge, backgroundColor: '#F1F5F9', color: '#475569' }}>
                    <Text>{painPoint.affectedCount} affected</Text>
                  </View>
                </View>
                <Text style={styles.text}>{painPoint.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Common Tools */}
        {data.commonTools && data.commonTools.length > 0 && (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>
              Common Tools & Software ({data.commonTools.length})
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {data.commonTools.slice(0, 12).map((tool: any, idx: number) => (
                <View
                  key={idx}
                  style={{
                    width: '48%',
                    marginRight: idx % 2 === 0 ? '4%' : 0,
                    ...styles.card,
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.subsectionTitle}>{tool.name}</Text>
                  <View style={{ ...styles.badge, backgroundColor: '#EDE9FE', color: '#5B21B6' }}>
                    <Text>{tool.userCount} users</Text>
                  </View>
                  {tool.roles && tool.roles.length > 0 && (
                    <Text style={{ ...styles.text, marginTop: 4, fontSize: 8 }}>
                      {tool.roles.slice(0, 3).join(', ')}
                      {tool.roles.length > 3 && ` +${tool.roles.length - 3} more`}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Role Distribution */}
        {data.roleDistribution && Object.keys(data.roleDistribution).length > 0 && (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Role Distribution</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {Object.entries(data.roleDistribution)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([role, count], idx) => (
                  <View
                    key={idx}
                    style={{
                      width: '32%',
                      marginRight: idx % 3 === 2 ? 0 : '2%',
                      padding: 8,
                      marginBottom: 8,
                      backgroundColor: '#F5F3FF',
                      borderRadius: 4,
                      borderLeft: '2pt solid #8B5CF6',
                    }}
                  >
                    <Text style={{ ...styles.text, fontSize: 9, marginBottom: 2 }}>{role}</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#7C3AED' }}>
                      {count as number}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Priority Training Gaps */}
        {data.priorityTrainingGaps && data.priorityTrainingGaps.length > 0 && (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>
              Priority Training Gaps ({data.priorityTrainingGaps.length})
            </Text>
            {data.priorityTrainingGaps.slice(0, 8).map((gap: any, idx: number) => (
              <View key={idx} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.subsectionTitle}>{gap.area}</Text>
                  <View style={{ ...styles.badge, ...styles.badgeHigh }}>
                    <Text>{gap.frequency} mentions</Text>
                  </View>
                </View>
                {gap.affectedRoles && gap.affectedRoles.length > 0 && (
                  <Text style={styles.text}>
                    Affected Roles: {gap.affectedRoles.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* High-Risk Handoffs */}
        {data.highRiskHandoffs && data.highRiskHandoffs.length > 0 && (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>
              High-Risk Handoffs ({data.highRiskHandoffs.length})
            </Text>
            {data.highRiskHandoffs.slice(0, 8).map((handoff: any, idx: number) => (
              <View key={idx} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                    {handoff.fromRole} → {handoff.toRole}
                  </Text>
                  <View style={{ ...styles.badge, ...styles.badgeHigh }}>
                    <Text>{handoff.occurrences} occurrences</Text>
                  </View>
                </View>
                <Text style={styles.text}>{handoff.process}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by ConsultantAI • {new Date().toLocaleDateString()} • Powered by Claude AI
        </Text>
      </Page>
    </Document>
  );

  return await pdf(doc).toBlob();
}

// Utility function to download PDF
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Executive Summary specific styles
const execStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '3pt solid #4F46E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 6,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: '1pt solid #E2E8F0',
  },
  maturityBox: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderLeft: '4pt solid #4F46E5',
  },
  maturityLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  maturityNotes: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.4,
  },
  findingItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  findingNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.8,
    marginRight: 10,
  },
  findingText: {
    flex: 1,
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.5,
  },
  riskItem: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
    borderLeft: '3pt solid #DC2626',
  },
  riskText: {
    fontSize: 10,
    color: '#991B1B',
    lineHeight: 1.4,
  },
  recPhase: {
    marginBottom: 12,
  },
  phaseBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: 4,
    marginBottom: 6,
  },
  phaseImmediate: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  phaseShortTerm: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  phaseLongTerm: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  recItem: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 4,
    paddingLeft: 12,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTop: '1pt solid #E2E8F0',
    paddingTop: 10,
  },
});

// Generate Executive Summary PDF (condensed 1-2 page version)
export async function generateExecutiveSummaryPDF(summary: CompanySummary): Promise<Blob> {
  const data = summary.summary_data as unknown as CompanySummaryData;

  // Extract executive summary data
  const execSummary = (data as unknown as {
    executiveSummary?: {
      narrativeSummary?: string;
      keyFindings?: string[];
      topRisks?: Array<{ id: string; text: string; rank: number }>;
      topOpportunities?: Array<{ id: string; text: string; rank: number }>;
      maturityLevel?: 1 | 2 | 3 | 4 | 5;
      maturityNotes?: string;
    };
  }).executiveSummary;

  const maturityLabels: Record<number, string> = {
    1: 'Initial - Ad hoc processes',
    2: 'Developing - Basic processes emerging',
    3: 'Defined - Standardized processes',
    4: 'Managed - Measured and controlled',
    5: 'Optimized - Continuous improvement',
  };

  // Calculate metrics
  const roleCount = Object.keys(data.roleDistribution || {}).length;
  const workflowCount = data.topWorkflows?.length || 0;
  const issueCount = data.criticalPainPoints?.length || 0;
  const toolCount = data.commonTools?.length || 0;

  // Separate recommendations by priority
  const recommendations = data.recommendations || [];
  const highPriority = recommendations.filter((r: { priority?: string }) => r.priority === 'high');
  const mediumPriority = recommendations.filter((r: { priority?: string }) => r.priority === 'medium');
  const lowPriority = recommendations.filter((r: { priority?: string }) => r.priority === 'low' || !r.priority);

  const doc = (
    <Document>
      <Page size="A4" style={execStyles.page}>
        {/* Header */}
        <View style={execStyles.header}>
          <Text style={execStyles.title}>EXECUTIVE SUMMARY</Text>
          <Text style={execStyles.companyName}>{summary.title}</Text>
          <Text style={execStyles.subtitle}>
            Process Audit Report • {formatDate(summary.created_at)} • {data.totalInterviews || 0} interviews analyzed
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={execStyles.metricsRow}>
          <View style={execStyles.metricBox}>
            <Text style={execStyles.metricValue}>{roleCount}</Text>
            <Text style={execStyles.metricLabel}>Roles</Text>
          </View>
          <View style={execStyles.metricBox}>
            <Text style={execStyles.metricValue}>{workflowCount}</Text>
            <Text style={execStyles.metricLabel}>Workflows</Text>
          </View>
          <View style={execStyles.metricBox}>
            <Text style={execStyles.metricValue}>{issueCount}</Text>
            <Text style={execStyles.metricLabel}>Issues</Text>
          </View>
          <View style={execStyles.metricBox}>
            <Text style={execStyles.metricValue}>{toolCount}</Text>
            <Text style={execStyles.metricLabel}>Tools</Text>
          </View>
        </View>

        {/* Maturity Assessment */}
        {execSummary?.maturityLevel && (
          <View style={execStyles.maturityBox}>
            <Text style={execStyles.maturityLevel}>
              Maturity Level: {execSummary.maturityLevel}/5 - {maturityLabels[execSummary.maturityLevel]?.split(' - ')[0]}
            </Text>
            {execSummary.maturityNotes && (
              <Text style={execStyles.maturityNotes}>{execSummary.maturityNotes}</Text>
            )}
          </View>
        )}

        {/* Key Findings */}
        {execSummary?.keyFindings && execSummary.keyFindings.length > 0 && (
          <View style={execStyles.section}>
            <Text style={execStyles.sectionTitle}>Key Findings</Text>
            {execSummary.keyFindings.slice(0, 5).map((finding, idx) => (
              <View key={idx} style={execStyles.findingItem}>
                <Text style={execStyles.findingNumber}>{idx + 1}</Text>
                <Text style={execStyles.findingText}>{finding}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Critical Risks */}
        {execSummary?.topRisks && execSummary.topRisks.length > 0 && (
          <View style={execStyles.section}>
            <Text style={execStyles.sectionTitle}>Critical Risks</Text>
            {execSummary.topRisks.slice(0, 4).map((risk, idx) => (
              <View key={idx} style={execStyles.riskItem}>
                <Text style={execStyles.riskText}>• {risk.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Top Recommendations by Phase */}
        {recommendations.length > 0 && (
          <View style={execStyles.section}>
            <Text style={execStyles.sectionTitle}>Top Recommendations</Text>

            {highPriority.length > 0 && (
              <View style={execStyles.recPhase}>
                <Text style={{ ...execStyles.phaseBadge, ...execStyles.phaseImmediate }}>
                  IMMEDIATE (0-30 days)
                </Text>
                {highPriority.slice(0, 3).map((rec: { text: string }, idx: number) => (
                  <Text key={idx} style={execStyles.recItem}>• {rec.text}</Text>
                ))}
              </View>
            )}

            {mediumPriority.length > 0 && (
              <View style={execStyles.recPhase}>
                <Text style={{ ...execStyles.phaseBadge, ...execStyles.phaseShortTerm }}>
                  SHORT-TERM (30-90 days)
                </Text>
                {mediumPriority.slice(0, 2).map((rec: { text: string }, idx: number) => (
                  <Text key={idx} style={execStyles.recItem}>• {rec.text}</Text>
                ))}
              </View>
            )}

            {lowPriority.length > 0 && (
              <View style={execStyles.recPhase}>
                <Text style={{ ...execStyles.phaseBadge, ...execStyles.phaseLongTerm }}>
                  LONG-TERM (90+ days)
                </Text>
                {lowPriority.slice(0, 2).map((rec: { text: string }, idx: number) => (
                  <Text key={idx} style={execStyles.recItem}>• {rec.text}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={execStyles.footer}>
          Generated by ConsultantAI • {new Date().toLocaleDateString()} • Powered by Claude AI
        </Text>
      </Page>
    </Document>
  );

  return await pdf(doc).toBlob();
}
