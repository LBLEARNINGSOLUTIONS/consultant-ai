import { useState } from 'react';
import { PainPoint, TrainingGap } from '../../types/analysis';
import { Badge } from './Badge';
import { AlertCircle, GraduationCap, Filter } from 'lucide-react';

interface PainPointsTabProps {
  painPoints: PainPoint[];
  trainingGaps: TrainingGap[];
  onUpdatePainPoints: (painPoints: PainPoint[]) => void;
  onUpdateTrainingGaps: (trainingGaps: TrainingGap[]) => void;
}

export function PainPointsTab({
  painPoints,
  trainingGaps,
  onUpdatePainPoints,
  onUpdateTrainingGaps
}: PainPointsTabProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const severityColors = {
    critical: { badge: 'red' as const, bg: 'bg-red-50', border: 'border-red-500' },
    high: { badge: 'red' as const, bg: 'bg-orange-50', border: 'border-orange-500' },
    medium: { badge: 'yellow' as const, bg: 'bg-yellow-50', border: 'border-yellow-500' },
    low: { badge: 'blue' as const, bg: 'bg-blue-50', border: 'border-blue-500' },
  };

  const categoryColors: Record<string, 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
    inefficiency: 'purple',
    bottleneck: 'red',
    'error-prone': 'red',
    manual: 'yellow',
    communication: 'blue',
    other: 'gray',
  };

  // Filter pain points
  const filteredPainPoints = painPoints
    .filter(p => severityFilter === 'all' || p.severity === severityFilter)
    .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const categories = ['all', ...Array.from(new Set(painPoints.map(p => p.category)))];
  const severities = ['all', 'critical', 'high', 'medium', 'low'];

  if (painPoints.length === 0 && trainingGaps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No pain points or training gaps identified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {painPoints.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {severities.map(severity => (
                  <option key={severity} value={severity}>
                    {severity === 'all' ? 'All Severities' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Pain Points */}
      {filteredPainPoints.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Pain Points ({filteredPainPoints.length})
          </h3>
          {filteredPainPoints.map((painPoint) => (
            <div
              key={painPoint.id}
              className={`p-5 rounded-xl border-l-4 ${severityColors[painPoint.severity].bg} ${severityColors[painPoint.severity].border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={severityColors[painPoint.severity].badge}>
                      {painPoint.severity}
                    </Badge>
                    <Badge variant={categoryColors[painPoint.category]}>
                      {painPoint.category}
                    </Badge>
                  </div>
                  <p className="text-slate-900 font-medium leading-relaxed">
                    {painPoint.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Frequency:</span>{' '}
                  <span className="text-slate-600">{painPoint.frequency}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Impact:</span>{' '}
                  <span className="text-slate-600">{painPoint.impact}</span>
                </div>
              </div>

              {painPoint.affectedRoles.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm font-semibold text-slate-700 block mb-2">
                    Affected Roles:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {painPoint.affectedRoles.map((role, idx) => (
                      <Badge key={idx} variant="purple">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {painPoint.suggestedSolution && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Suggested Solution:
                  </p>
                  <p className="text-sm text-slate-600">{painPoint.suggestedSolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Training Gaps */}
      {trainingGaps.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            Training Gaps ({trainingGaps.length})
          </h3>
          {trainingGaps.map((gap) => (
            <div
              key={gap.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-slate-900 text-lg">{gap.area}</h4>
                <Badge
                  variant={
                    gap.priority === 'high' ? 'red' : gap.priority === 'medium' ? 'yellow' : 'blue'
                  }
                >
                  {gap.priority} priority
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Current State:</p>
                  <p className="text-sm text-slate-600">{gap.currentState}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Desired State:</p>
                  <p className="text-sm text-slate-600">{gap.desiredState}</p>
                </div>
              </div>

              {gap.affectedRoles.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-semibold text-slate-700 block mb-2">
                    Affected Roles:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {gap.affectedRoles.map((role, idx) => (
                      <Badge key={idx} variant="indigo">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {gap.suggestedTraining && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-900 mb-1">
                    Suggested Training:
                  </p>
                  <p className="text-sm text-indigo-700">{gap.suggestedTraining}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
