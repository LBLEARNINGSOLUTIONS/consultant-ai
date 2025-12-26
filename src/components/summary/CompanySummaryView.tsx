import { useState } from 'react';
import { CompanySummaryData } from '../../types/analysis';
import { CompanySummary } from '../../types/database';
import { Badge } from '../analysis/Badge';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Users,
  GraduationCap,
  GitMerge,
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatters';
import { generateCompanySummaryPDF, downloadPDF } from '../../services/pdfService';

interface CompanySummaryViewProps {
  summary: CompanySummary;
  onBack: () => void;
}

export function CompanySummaryView({ summary, onBack }: CompanySummaryViewProps) {
  const data = summary.summary_data as any as CompanySummaryData;
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/\s+/g, '_')}_summary.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const blob = await generateCompanySummaryPDF(summary);
      const filename = `${summary.title.replace(/\s+/g, '_')}_summary.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-indigo-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Interviews
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{summary.title}</h1>
              <p className="text-indigo-100">
                Generated {formatDate(summary.created_at)} • {data.totalInterviews} interviews analyzed
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExportingPDF ? 'Generating...' : 'PDF'}
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Workflows</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.topWorkflows.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Critical Issues</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.criticalPainPoints.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Wrench className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Tools</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.commonTools.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Roles</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {Object.keys(data.roleDistribution).length}
            </p>
          </div>
        </div>

        {/* Top Workflows */}
        {data.topWorkflows.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top Workflows
            </h2>
            <div className="space-y-3">
              {data.topWorkflows.slice(0, 10).map((workflow, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-900">{workflow.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="blue">{workflow.mentions} mentions</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Pain Points */}
        {data.criticalPainPoints.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Critical Pain Points
            </h2>
            <div className="space-y-3">
              {data.criticalPainPoints.slice(0, 10).map((painPoint, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    painPoint.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-orange-50 border-orange-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-slate-900 font-medium flex-1">{painPoint.description}</p>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={painPoint.severity === 'critical' ? 'red' : 'yellow'}>
                        {painPoint.severity}
                      </Badge>
                      <Badge variant="gray">{painPoint.affectedCount} affected</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Tools */}
        {data.commonTools.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              Common Tools & Software
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.commonTools.slice(0, 10).map((tool, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                    <Badge variant="indigo">{tool.userCount} users</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.roles.slice(0, 5).map((role, roleIdx) => (
                      <Badge key={roleIdx} variant="purple" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                    {tool.roles.length > 5 && (
                      <Badge variant="gray" className="text-xs">
                        +{tool.roles.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role Distribution */}
        {Object.keys(data.roleDistribution).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Role Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(data.roleDistribution)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([role, count]) => (
                  <div key={role} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-semibold text-purple-900">{role}</p>
                    <p className="text-2xl font-bold text-purple-600">{count as number}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Training Gaps */}
        {data.priorityTrainingGaps.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              Priority Training Gaps
            </h2>
            <div className="space-y-3">
              {data.priorityTrainingGaps.slice(0, 10).map((gap, idx) => (
                <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{gap.area}</h3>
                    <Badge variant="red">{gap.frequency} mentions</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {gap.affectedRoles.map((role, roleIdx) => (
                      <Badge key={roleIdx} variant="yellow" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High-Risk Handoffs */}
        {data.highRiskHandoffs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-orange-600" />
              High-Risk Handoffs
            </h2>
            <div className="space-y-3">
              {data.highRiskHandoffs.slice(0, 10).map((handoff, idx) => (
                <div key={idx} className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{handoff.fromRole}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-slate-900">{handoff.toRole}</span>
                    </div>
                    <Badge variant="red">{handoff.occurrences} occurrences</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{handoff.process}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
