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
      className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
      onClick={onView}
    >
      {/* Gradient accent bar at top */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mb-5 -mt-1" />

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
          className="ml-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Delete summary"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-500 font-medium">
          Created {formatRelative(summary.created_at)}
        </div>

        {data && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditStats();
            }}
            className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs w-full text-left hover:bg-slate-50 rounded-xl -mx-2 px-2 py-2.5 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-indigo-100 rounded">
                <FileText className="w-3 h-3 text-indigo-600" />
              </div>
              <span className="text-slate-500">Interviews:</span>{' '}
              <span className="font-bold text-slate-900">
                {data.totalInterviews || summary.interview_ids?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-blue-100 rounded">
                <TrendingUp className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-slate-500">Workflows:</span>{' '}
              <span className="font-bold text-slate-900">
                {data.topWorkflows?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-amber-100 rounded">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
              </div>
              <span className="text-slate-500">Pain Points:</span>{' '}
              <span className="font-bold text-slate-900">
                {data.criticalPainPoints?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-slate-100 rounded">
                <Wrench className="w-3 h-3 text-slate-600" />
              </div>
              <span className="text-slate-500">Tools:</span>{' '}
              <span className="font-bold text-slate-900">
                {data.commonTools?.length || 0}
              </span>
            </div>
          </button>
        )}

        <button
          onClick={onView}
          onMouseEnter={preloadCompanySummaryView}
          className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all text-sm font-semibold shadow-lg shadow-indigo-500/20"
        >
          <Eye className="w-4 h-4" />
          View Summary
        </button>
      </div>
    </div>
  );
});

export default SummaryCard;
