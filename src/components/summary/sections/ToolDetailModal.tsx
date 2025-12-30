import { X, Wrench, Users, TrendingUp, AlertTriangle, Link2, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { ToolProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface ToolDetailModalProps {
  profile: ToolProfile;
  onClose: () => void;
}

const categoryLabels: Record<ToolProfile['category'], string> = {
  crm: 'Customer Relationship Management',
  pm: 'Project Management',
  spreadsheet: 'Spreadsheet',
  communication: 'Communication',
  erp: 'Enterprise Resource Planning',
  custom: 'Custom Application',
  other: 'Other',
};

const categoryColors: Record<ToolProfile['category'], string> = {
  crm: 'bg-blue-100 text-blue-700',
  pm: 'bg-purple-100 text-purple-700',
  spreadsheet: 'bg-green-100 text-green-700',
  communication: 'bg-yellow-100 text-yellow-700',
  erp: 'bg-red-100 text-red-700',
  custom: 'bg-indigo-100 text-indigo-700',
  other: 'bg-slate-100 text-slate-700',
};

const gapTypeLabels: Record<string, string> = {
  underutilized: 'Underutilized',
  misused: 'Misused',
  overlap: 'Overlap',
  'data-handoff': 'Data Handoff',
  'missing-integration': 'Missing Integration',
};

const gapSeverityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

export function ToolDetailModal({ profile, onClose }: ToolDetailModalProps) {
  const hasGaps = profile.gaps.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <div className="flex items-center gap-3 text-indigo-100 text-sm">
                <span className={`px-2 py-0.5 rounded ${categoryColors[profile.category]}`}>
                  {categoryLabels[profile.category]}
                </span>
                <span>•</span>
                <span>{profile.count} interview{profile.count !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span className="capitalize">{profile.frequency}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Purpose Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Intended Purpose
              </h3>
              <p className="text-slate-600">
                {profile.intendedPurpose || 'Not specified'}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Actual Usage
              </h3>
              {profile.actualUsage.length > 0 ? (
                <ul className="space-y-1">
                  {profile.actualUsage.map((usage, idx) => (
                    <li key={idx} className="text-sm text-blue-600">• {usage}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-blue-500 italic">No specific usage documented</p>
              )}
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Users */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Used By</span>
              </div>
              {profile.usedBy.length === 0 ? (
                <p className="text-sm text-slate-400">No users identified</p>
              ) : (
                <div className="space-y-2">
                  {profile.usedBy.slice(0, 5).map((user, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium text-slate-700">{user.role}</div>
                      <div className="text-xs text-slate-500 truncate">{user.purpose}</div>
                    </div>
                  ))}
                  {profile.usedBy.length > 5 && (
                    <p className="text-xs text-slate-400">+{profile.usedBy.length - 5} more</p>
                  )}
                </div>
              )}
            </div>

            {/* Workflows */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Workflows</span>
              </div>
              {profile.workflows.length === 0 ? (
                <p className="text-sm text-slate-400">No workflows linked</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {profile.workflows.map((wf, idx) => (
                    <Badge key={idx} variant="blue" className="text-xs">
                      {wf.name}
                      {wf.count > 1 && <span className="ml-1 opacity-70">×{wf.count}</span>}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Integrations */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Link2 className="w-4 h-4" />
                <span className="text-sm font-medium">Integrates With</span>
              </div>
              {profile.integratesWith.length === 0 ? (
                <p className="text-sm text-slate-400">No integrations documented</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {profile.integratesWith.map((tool, idx) => (
                    <Badge key={idx} variant="green" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Details Table */}
          {profile.usedBy.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">User Breakdown</h3>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Role</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Purpose</th>
                      <th className="text-right px-4 py-2 font-medium text-slate-600">Mentions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profile.usedBy.map((user, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-700">{user.role}</td>
                        <td className="px-4 py-2 text-slate-600">{user.purpose}</td>
                        <td className="px-4 py-2 text-right text-slate-500">{user.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Flows */}
          {profile.dataFlows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Data Flows</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Incoming */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Data In
                  </h4>
                  <ul className="space-y-1">
                    {profile.dataFlows
                      .filter(f => f.direction === 'in')
                      .map((flow, idx) => (
                        <li key={idx} className="text-sm text-green-600">
                          {flow.dataType} from {flow.system}
                        </li>
                      ))}
                  </ul>
                </div>
                {/* Outgoing */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Data Out
                  </h4>
                  <ul className="space-y-1">
                    {profile.dataFlows
                      .filter(f => f.direction === 'out')
                      .map((flow, idx) => (
                        <li key={idx} className="text-sm text-blue-600">
                          {flow.dataType} to {flow.system}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Gaps & Issues */}
          {hasGaps && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Identified Gaps
              </h3>
              <div className="space-y-2">
                {profile.gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${gapSeverityColors[gap.severity]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={gap.severity === 'high' ? 'red' : gap.severity === 'medium' ? 'yellow' : 'gray'}
                            className="text-[10px]"
                          >
                            {gap.severity}
                          </Badge>
                          <span className="text-sm font-medium">
                            {gapTypeLabels[gap.type] || gap.type}
                          </span>
                        </div>
                        <p className="text-sm">{gap.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitations */}
          {profile.limitations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Limitations</h3>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <ul className="space-y-1">
                  {profile.limitations.map((limitation, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Frequency */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Usage Frequency</span>
            </div>
            <p className="text-slate-700 capitalize">{profile.frequency}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
