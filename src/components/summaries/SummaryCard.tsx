import { memo } from 'react';
import { CompanySummary } from '../../types/database';
import { CompanySummaryData } from '../../types/analysis';
import { EditableTitleDark } from '../summary/EditableTitle';
import { formatRelative } from '../../utils/dateFormatters';
import { preloadCompanySummaryView } from '../../App';
import { Trash2, Eye, FileText, TrendingUp, AlertTriangle, Wrench } from 'lucide-react';

interface SummaryCardProps {
  summary: CompanySummary;
  onView: () => void;
  onDelete: () => void;
  onEditStats: () => void;
  onRename: (newTitle: string) => Promise<void>;
}

export const SummaryCard = memo(function SummaryCard({
  summary,
  onView,
  onDelete,
  onEditStats,
  onRename,
}: SummaryCardProps) {
  const data = summary.summary_data as CompanySummaryData | null;

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-4">
        <EditableTitleDark
          value={summary.title}
          onSave={onRename}
          size="sm"
          className="flex-1"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete summary"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-500">
          Created {formatRelative(summary.created_at)}
        </div>

        {data && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditStats();
            }}
            className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs w-full text-left hover:bg-slate-50 rounded-lg -mx-2 px-2 py-2 transition-colors"
          >
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span className="text-slate-600">Interviews:</span>{' '}
              <span className="font-semibold text-slate-900">
                {data.totalInterviews || summary.interview_ids?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-slate-600">Workflows:</span>{' '}
              <span className="font-semibold text-slate-900">
                {data.topWorkflows?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span className="text-slate-600">Pain Points:</span>{' '}
              <span className="font-semibold text-slate-900">
                {data.criticalPainPoints?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Wrench className="w-3 h-3 text-slate-500" />
              <span className="text-slate-600">Tools:</span>{' '}
              <span className="font-semibold text-slate-900">
                {data.commonTools?.length || 0}
              </span>
            </div>
          </button>
        )}

        <button
          onClick={onView}
          onMouseEnter={preloadCompanySummaryView}
          className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View Summary
        </button>
      </div>
    </div>
  );
});

export default SummaryCard;
