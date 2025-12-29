import { FileSearch, Eye, Calendar } from 'lucide-react';
import { Interview } from '../../../types/database';
import { formatDate } from '../../../utils/dateFormatters';
import { Badge } from '../../analysis/Badge';

interface EvidenceSectionProps {
  interviews: Interview[];
  onViewInterview?: (interview: Interview) => void;
}

export function EvidenceSection({ interviews, onViewInterview }: EvidenceSectionProps) {
  const completedInterviews = interviews.filter(i => i.analysis_status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <FileSearch className="w-6 h-6 text-slate-600" />
          Supporting Evidence
        </h2>
        <p className="text-slate-600">
          {completedInterviews.length} interview{completedInterviews.length !== 1 ? 's' : ''} used to generate this summary.
        </p>
      </div>

      {completedInterviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileSearch className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No interviews available.</p>
          <p className="text-sm text-slate-400 mt-1">The source interviews may have been deleted.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {completedInterviews.map((interview) => (
            <div
              key={interview.id}
              className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 truncate">{interview.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  {interview.analyzed_at && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Analyzed {formatDate(interview.analyzed_at)}
                    </span>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    {interview.workflows && (
                      <Badge variant="blue" className="text-xs">
                        {(interview.workflows as unknown[]).length} workflows
                      </Badge>
                    )}
                    {interview.pain_points && (
                      <Badge variant="red" className="text-xs">
                        {(interview.pain_points as unknown[]).length} pain points
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {onViewInterview && (
                <button
                  onClick={() => onViewInterview(interview)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Eye className="w-4 h-4" />
                  View Analysis
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
