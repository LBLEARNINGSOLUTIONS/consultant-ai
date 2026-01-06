import { memo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Interview } from '../../types/database';
import { Badge } from '../analysis/Badge';
import { formatDate, formatRelative } from '../../utils/dateFormatters';
import { preloadAnalysisViewer } from '../../App';
import {
  GripVertical,
  CheckSquare,
  Square,
  Edit2,
  Check,
  X,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface InterviewCardProps {
  interview: Interview;
  isSelected: boolean;
  isAnalyzing: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onView: () => void;
  onRename: (newTitle: string) => Promise<void>;
  onRetryAnalysis: () => void;
}

// Draggable wrapper component
function DraggableWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...listeners}
        {...attributes}
        role="button"
        aria-label="Drag to move interview to a company folder"
        tabIndex={0}
        className="absolute top-2 left-2 p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded z-10"
        title="Drag to move to a company folder"
      >
        <GripVertical className="w-4 h-4" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

function getStatusBadge(status: string, isAnalyzing: boolean) {
  if (isAnalyzing) {
    return <Badge variant="yellow">Analyzing...</Badge>;
  }

  switch (status) {
    case 'completed':
      return <Badge variant="green">Completed</Badge>;
    case 'analyzing':
      return <Badge variant="yellow">Analyzing...</Badge>;
    case 'failed':
      return <Badge variant="red">Failed</Badge>;
    case 'pending':
      return <Badge variant="gray">Pending</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
}

export const InterviewCard = memo(function InterviewCard({
  interview,
  isSelected,
  isAnalyzing,
  onToggleSelect,
  onDelete,
  onView,
  onRename,
  onRetryAnalysis,
}: InterviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const canSelect = interview.analysis_status === 'completed';

  const handleStartRename = () => {
    setIsEditing(true);
    setEditingTitle(interview.title);
  };

  const handleCancelRename = () => {
    setIsEditing(false);
    setEditingTitle('');
  };

  const handleSaveRename = async () => {
    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) {
      handleCancelRename();
      return;
    }
    await onRename(trimmedTitle);
    setIsEditing(false);
    setEditingTitle('');
  };

  return (
    <DraggableWrapper id={interview.id}>
      <div
        className={`bg-white rounded-xl border-2 p-6 pl-10 hover:shadow-lg transition-all ${
          isSelected
            ? 'border-green-500 ring-2 ring-green-200'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {canSelect && (
              <button
                onClick={onToggleSelect}
                role="checkbox"
                aria-checked={isSelected}
                aria-label={isSelected ? 'Deselect interview for summary' : 'Select interview for summary'}
                className="mt-0.5 text-slate-400 hover:text-green-600 transition-colors"
                title={isSelected ? 'Deselect for summary' : 'Select for summary'}
              >
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-green-600" aria-hidden="true" />
                ) : (
                  <Square className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            )}
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveRename();
                    } else if (e.key === 'Escape') {
                      handleCancelRename();
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelRename}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-start gap-2 group">
                <h3 className="font-semibold text-slate-900 flex-1 line-clamp-2">
                  {interview.title}
                </h3>
                <button
                  onClick={handleStartRename}
                  aria-label="Rename interview"
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Rename interview"
                >
                  <Edit2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onDelete}
            aria-label="Delete interview"
            className="ml-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete interview"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Interview Metadata */}
        {(interview.interviewee_name || interview.interviewee_role) && (
          <p className="text-xs text-slate-500 mt-0.5">
            {interview.interviewee_name}
            {interview.interviewee_name && interview.interviewee_role && ' • '}
            {interview.interviewee_role}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Status:</span>
            {getStatusBadge(interview.analysis_status, isAnalyzing)}
          </div>

          {/* Interview date and department */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {interview.interview_date && (
              <span>Interviewed: {formatDate(interview.interview_date)}</span>
            )}
            {interview.department && (
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                {interview.department}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500">
            Uploaded {formatRelative(interview.created_at)}
          </div>

          {interview.analyzed_at && (
            <div className="text-xs text-slate-500">
              Analyzed {formatDate(interview.analyzed_at)}
            </div>
          )}

          {interview.analysis_status === 'failed' && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              {interview.error_message && (
                <p className="text-xs text-red-700 mb-2">{interview.error_message}</p>
              )}
              <button
                onClick={onRetryAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Retrying...' : 'Retry Analysis'}
              </button>
            </div>
          )}

          {interview.analysis_status === 'completed' && (
            <>
              <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-600">Workflows:</span>{' '}
                  <span className="font-semibold text-slate-900">
                    {Array.isArray(interview.workflows) ? interview.workflows.length : 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Pain Points:</span>{' '}
                  <span className="font-semibold text-slate-900">
                    {Array.isArray(interview.pain_points) ? interview.pain_points.length : 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Tools:</span>{' '}
                  <span className="font-semibold text-slate-900">
                    {Array.isArray(interview.tools) ? interview.tools.length : 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Roles:</span>{' '}
                  <span className="font-semibold text-slate-900">
                    {Array.isArray(interview.roles) ? interview.roles.length : 0}
                  </span>
                </div>
              </div>

              <button
                onClick={onView}
                onMouseEnter={preloadAnalysisViewer}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                View Analysis
              </button>
            </>
          )}
        </div>
      </div>
    </DraggableWrapper>
  );
});

export default InterviewCard;
