import { callAnalyzeFunction } from '../lib/anthropic';
import { InterviewAnalysis, ClaudeAnalysisResponse, CompanySummaryData } from '../types/analysis';
import { aggregateAnalyses } from '../utils/analysisHelpers';
import { nanoid } from 'nanoid';

const SYSTEM_PROMPT = `You are an expert business process analyst with deep expertise in operational efficiency, organizational design, and workflow optimization. Your task is to analyze interview transcripts from business stakeholders and extract actionable insights.

Analyze the transcript and identify:

1. **Workflows** - Recurring business processes with their steps, frequency, and participants
2. **Pain Points** - Inefficiencies, bottlenecks, manual tasks, and operational friction
3. **Tools & Software** - Applications and systems mentioned, their purpose, and users
4. **Roles** - Job titles, responsibilities, and team structures
5. **Training Gaps** - Areas where documentation, training, or skill development is needed
6. **Handoff Risks** - Critical points where work transfers between people or systems
7. **Recommendations** - Actionable suggestions for improvements based on the analysis

Return your analysis as strictly valid JSON matching this exact schema:

{
  "workflows": [
    {
      "id": "unique-id",
      "name": "Workflow name",
      "steps": ["Step 1", "Step 2", ...],
      "frequency": "daily" | "weekly" | "monthly" | "ad-hoc",
      "participants": ["Role 1", "Role 2", ...],
      "duration": "optional time estimate",
      "notes": "optional additional context"
    }
  ],
  "painPoints": [
    {
      "id": "unique-id",
      "category": "inefficiency" | "bottleneck" | "error-prone" | "manual" | "communication" | "other",
      "description": "Clear description of the pain point",
      "severity": "low" | "medium" | "high" | "critical",
      "affectedRoles": ["Role 1", ...],
      "frequency": "How often this occurs",
      "impact": "Business impact description",
      "suggestedSolution": "optional recommendation"
    }
  ],
  "tools": [
    {
      "id": "unique-id",
      "name": "Tool name",
      "purpose": "What it's used for",
      "usedBy": ["Role 1", ...],
      "frequency": "How often it's used",
      "integrations": ["optional connected systems"],
      "limitations": "optional issues or gaps"
    }
  ],
  "roles": [
    {
      "id": "unique-id",
      "title": "Job title",
      "responsibilities": ["Responsibility 1", ...],
      "workflows": ["Related workflow names"],
      "tools": ["Tool names used"],
      "teamSize": optional number
    }
  ],
  "trainingGaps": [
    {
      "id": "unique-id",
      "area": "Area needing training",
      "affectedRoles": ["Role 1", ...],
      "priority": "low" | "medium" | "high",
      "currentState": "Current situation",
      "desiredState": "Target state",
      "suggestedTraining": "optional recommendation"
    }
  ],
  "handoffRisks": [
    {
      "id": "unique-id",
      "fromRole": "Originating role",
      "toRole": "Receiving role",
      "process": "What's being handed off",
      "riskLevel": "low" | "medium" | "high",
      "description": "Description of the risk",
      "mitigation": "optional mitigation strategy"
    }
  ],
  "recommendations": [
    {
      "id": "unique-id",
      "text": "Clear, actionable recommendation",
      "priority": "high" | "medium" | "low",
      "category": "process" | "training" | "technology" | "organization" | "risk-mitigation",
      "source": "optional - what finding this recommendation addresses"
    }
  ]
}

Be thorough but concise. Focus on actionable insights. Generate unique IDs for each item. For recommendations, synthesize the pain points, training gaps, and handoff risks into 3-7 prioritized, actionable improvement suggestions.`;

/**
 * Parse Claude's response text into clean JSON
 */
function extractJson(text: string): string {
  let jsonText = text.trim();

  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  return jsonText;
}

/**
 * Analyze a single interview transcript using Claude AI via Edge Function
 */
export async function analyzeTranscript(
  transcript: string
): Promise<ClaudeAnalysisResponse> {
  if (!transcript || transcript.trim().length < 50) {
    return {
      success: false,
      error: 'Transcript is too short. Please provide a meaningful interview transcript.',
    };
  }

  try {
    const message = await callAnalyzeFunction({
      transcript: `Analyze this interview transcript and extract structured insights.

CRITICAL: You MUST respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON. Start your response with { and end with }.

Interview transcript:

${transcript}`,
      systemPrompt: SYSTEM_PROMPT,
      type: 'analyze',
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    const jsonText = extractJson(content.text);

    let analysis: InterviewAnalysis;
    try {
      analysis = JSON.parse(jsonText) as InterviewAnalysis;
    } catch (parseError) {
      throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate and ensure IDs exist
    analysis.workflows = analysis.workflows.map(w => ({ ...w, id: w.id || nanoid() }));
    analysis.painPoints = analysis.painPoints.map(p => ({ ...p, id: p.id || nanoid() }));
    analysis.tools = analysis.tools.map(t => ({ ...t, id: t.id || nanoid() }));
    analysis.roles = analysis.roles.map(r => ({ ...r, id: r.id || nanoid() }));
    analysis.trainingGaps = analysis.trainingGaps.map(g => ({ ...g, id: g.id || nanoid() }));
    analysis.handoffRisks = analysis.handoffRisks.map(h => ({ ...h, id: h.id || nanoid() }));
    analysis.recommendations = (analysis.recommendations || []).map(r => ({ ...r, id: r.id || nanoid() }));

    return {
      success: true,
      analysis,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('Unauthorized')) {
        return {
          success: false,
          error: 'Authentication failed. Please sign in again.',
        };
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'API rate limit exceeded. Please try again in a moment.',
        };
      }
      if (error.message.includes('JSON')) {
        return {
          success: false,
          error: 'Failed to parse Claude response. The AI output was not valid JSON.',
        };
      }

      return {
        success: false,
        error: `Analysis failed: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred during analysis.',
    };
  }
}

/**
 * Generate AI-powered executive summary from aggregated data
 */
async function generateExecutiveSummary(
  summaryData: CompanySummaryData
): Promise<CompanySummaryData['executiveSummary']> {
  const prompt = `You are an expert business consultant. Based on the aggregated interview data below, generate an executive summary.

## Data from ${summaryData.totalInterviews || 0} interviews:

### Critical Pain Points:
${summaryData.criticalPainPoints?.slice(0, 8).map(p =>
  `- ${p.description} (${p.severity} severity, affects ${p.affectedCount} interviews)`
).join('\n') || 'None identified'}

### Top Workflows:
${summaryData.topWorkflows?.slice(0, 5).map(w =>
  `- ${w.name} (mentioned ${w.mentions} times, frequency: ${w.frequency})`
).join('\n') || 'None identified'}

### Tools in Use:
${summaryData.commonTools?.slice(0, 8).map(t =>
  `- ${t.name}: used by ${t.userCount} users (${t.roles.join(', ')})`
).join('\n') || 'None identified'}

### Training Gaps:
${summaryData.priorityTrainingGaps?.slice(0, 5).map(g =>
  `- ${g.area} (${g.priority} priority, affects: ${g.affectedRoles.join(', ')})`
).join('\n') || 'None identified'}

### High Risk Handoffs:
${summaryData.highRiskHandoffs?.slice(0, 5).map(h =>
  `- ${h.fromRole} → ${h.toRole}: ${h.process} (${h.occurrences} occurrences)`
).join('\n') || 'None identified'}

### Key Recommendations:
${summaryData.recommendations?.slice(0, 5).map(r =>
  `- ${r.text}`
).join('\n') || 'None identified'}

Generate a JSON response with this exact structure:
{
  "narrativeSummary": "3-5 paragraphs summarizing the current operational state, key challenges discovered, strengths observed, and overall assessment of organizational health",
  "keyFindings": ["finding1", "finding2", "finding3", "finding4", "finding5", "finding6", "finding7"],
  "topRisks": [
    {"id": "risk-1", "text": "Description of risk 1", "rank": 1},
    {"id": "risk-2", "text": "Description of risk 2", "rank": 2},
    {"id": "risk-3", "text": "Description of risk 3", "rank": 3},
    {"id": "risk-4", "text": "Description of risk 4", "rank": 4},
    {"id": "risk-5", "text": "Description of risk 5", "rank": 5}
  ],
  "topOpportunities": [
    {"id": "opp-1", "text": "Description of opportunity 1", "rank": 1},
    {"id": "opp-2", "text": "Description of opportunity 2", "rank": 2},
    {"id": "opp-3", "text": "Description of opportunity 3", "rank": 3},
    {"id": "opp-4", "text": "Description of opportunity 4", "rank": 4},
    {"id": "opp-5", "text": "Description of opportunity 5", "rank": 5}
  ],
  "maturityLevel": <number 1-5>,
  "maturityNotes": "Explanation of the maturity assessment"
}

Maturity Scale:
1 = Ad-hoc: Processes are undocumented, reactive, and person-dependent
2 = Developing: Some documentation exists, but inconsistent execution
3 = Defined: Standardized processes documented and followed
4 = Managed: Processes measured and controlled with metrics
5 = Optimizing: Continuous improvement culture with proactive optimization

CRITICAL: Respond with ONLY valid JSON. Do not include any text before or after the JSON object.`;

  try {
    const response = await callAnalyzeFunction({
      transcript: prompt,
      type: 'executive-summary',
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    const jsonText = extractJson(content.text);

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      narrativeSummary: parsed.narrativeSummary || '',
      keyFindings: parsed.keyFindings || [],
      topRisks: parsed.topRisks || [],
      topOpportunities: parsed.topOpportunities || [],
      maturityLevel: parsed.maturityLevel || 1,
      maturityNotes: parsed.maturityNotes || '',
    };
  } catch (error) {
    return {
      narrativeSummary: '',
      keyFindings: [],
      topRisks: [],
      topOpportunities: [],
      maturityLevel: 1,
      maturityNotes: 'Assessment pending - AI generation failed. Please edit manually.',
    };
  }
}

/**
 * Generate a company-wide summary from multiple interview analyses
 */
export async function generateCompanySummary(
  analyses: InterviewAnalysis[],
  dates: string[]
): Promise<CompanySummaryData> {
  const summaryData = aggregateAnalyses(analyses, dates);
  const executiveSummary = await generateExecutiveSummary(summaryData);

  return {
    ...summaryData,
    executiveSummary,
  };
}

/**
 * Analyze multiple transcripts in batch (with concurrency control)
 */
export async function analyzeMultipleTranscripts(
  transcripts: Array<{ id: string; text: string }>,
  onProgress?: (id: string, result: ClaudeAnalysisResponse) => void
): Promise<Map<string, ClaudeAnalysisResponse>> {
  const results = new Map<string, ClaudeAnalysisResponse>();
  const concurrencyLimit = 3;

  for (let i = 0; i < transcripts.length; i += concurrencyLimit) {
    const batch = transcripts.slice(i, i + concurrencyLimit);

    const batchPromises = batch.map(async ({ id, text }) => {
      const result = await analyzeTranscript(text);
      results.set(id, result);

      if (onProgress) {
        onProgress(id, result);
      }

      return { id, result };
    });

    await Promise.all(batchPromises);

    if (i + concurrencyLimit < transcripts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
