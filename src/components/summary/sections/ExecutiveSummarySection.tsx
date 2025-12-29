import { FileText, AlertTriangle, GitMerge, Lightbulb } from 'lucide-react';
import { CompanySummaryData } from '../../../types/analysis';

interface ExecutiveSummarySectionProps {
  data: CompanySummaryData;
  recommendations: Array<{ id: string; text: string; priority: 'high' | 'medium' | 'low' }>;
}

export function ExecutiveSummarySection({ data, recommendations }: ExecutiveSummarySectionProps) {
  const highPriorityRecs = recommendations.filter(r => r.priority === 'high').slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Executive Summary
        </h2>
        <p className="text-slate-600">
          High-level overview of findings from {data.totalInterviews} interviews analyzed.
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Interviews</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{data.totalInterviews}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Workflows</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{data.topWorkflows.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Critical Issues</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{data.criticalPainPoints.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Tools</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{data.commonTools.length}</p>
        </div>
      </div>

      {/* Critical Findings */}
      {data.criticalPainPoints.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Critical Findings
          </h3>
          <ul className="space-y-2">
            {data.criticalPainPoints.slice(0, 3).map((pp, idx) => (
              <li key={idx} className="text-slate-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5 font-bold">•</span>
                <span>{pp.description}</span>
              </li>
            ))}
            {data.criticalPainPoints.length > 3 && (
              <li className="text-sm text-slate-500 italic ml-4">
                +{data.criticalPainPoints.length - 3} more critical issues
              </li>
            )}
          </ul>
        </div>
      )}

      {/* High-Risk Handoffs Summary */}
      {data.highRiskHandoffs.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-orange-500" />
            High-Risk Handoffs
          </h3>
          <p className="text-slate-700">
            <span className="font-bold text-orange-600">{data.highRiskHandoffs.length}</span> high-risk handoff{data.highRiskHandoffs.length !== 1 ? 's' : ''} identified between roles that require attention.
          </p>
        </div>
      )}

      {/* Top Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-500" />
            Top Recommendations
          </h3>
          {highPriorityRecs.length > 0 ? (
            <ul className="space-y-2">
              {highPriorityRecs.map((rec, idx) => (
                <li key={idx} className="text-slate-700 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 font-bold">•</span>
                  <span>{rec.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">
              No high-priority recommendations yet. Add recommendations in the Recommendations section.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
