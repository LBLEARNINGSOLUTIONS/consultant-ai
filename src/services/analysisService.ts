import { anthropic, DEFAULT_MODEL, MAX_TOKENS, DEFAULT_TEMPERATURE } from '../lib/anthropic';
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
  ]
}

Be thorough but concise. Focus on actionable insights. Generate unique IDs for each item.`;

/**
 * Analyze a single interview transcript using Claude AI
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
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: DEFAULT_TEMPERATURE,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this interview transcript and extract structured insights:\n\n${transcript}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    // Extract JSON from response (Claude sometimes wraps it in markdown)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const analysis = JSON.parse(jsonText) as InterviewAnalysis;

    // Validate and ensure IDs exist
    analysis.workflows = analysis.workflows.map(w => ({ ...w, id: w.id || nanoid() }));
    analysis.painPoints = analysis.painPoints.map(p => ({ ...p, id: p.id || nanoid() }));
    analysis.tools = analysis.tools.map(t => ({ ...t, id: t.id || nanoid() }));
    analysis.roles = analysis.roles.map(r => ({ ...r, id: r.id || nanoid() }));
    analysis.trainingGaps = analysis.trainingGaps.map(g => ({ ...g, id: g.id || nanoid() }));
    analysis.handoffRisks = analysis.handoffRisks.map(h => ({ ...h, id: h.id || nanoid() }));

    return {
      success: true,
      analysis,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error('Claude API error:', error);

    if (error instanceof Error) {
      // Handle specific API errors
      if (error.message.includes('401') || error.message.includes('authentication')) {
        return {
          success: false,
          error: 'Invalid Anthropic API key. Please check your environment variables.',
        };
      }
      if (error.message.includes('429')) {
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
 * Generate a company-wide summary from multiple interview analyses
 */
export async function generateCompanySummary(
  analyses: InterviewAnalysis[],
  dates: string[]
): Promise<CompanySummaryData> {
  // Use local aggregation for speed and cost efficiency
  // Alternative: Could use Claude for more intelligent summarization
  return aggregateAnalyses(analyses, dates);
}

/**
 * Analyze multiple transcripts in batch (with concurrency control)
 */
export async function analyzeMultipleTranscripts(
  transcripts: Array<{ id: string; text: string }>,
  onProgress?: (id: string, result: ClaudeAnalysisResponse) => void
): Promise<Map<string, ClaudeAnalysisResponse>> {
  const results = new Map<string, ClaudeAnalysisResponse>();
  const concurrencyLimit = 3; // Process 3 at a time to avoid rate limits

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

    // Small delay between batches to be respectful of rate limits
    if (i + concurrencyLimit < transcripts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
