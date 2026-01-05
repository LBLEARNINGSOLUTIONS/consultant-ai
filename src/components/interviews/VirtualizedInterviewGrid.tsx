import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Interview } from '../../types/database';
import { InterviewCard } from './InterviewCard';

interface VirtualizedInterviewGridProps {
  interviews: Interview[];
  selectedInterviewIds: Set<string>;
  analyzingIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (interview: Interview) => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onRetryAnalysis: (interview: Interview) => void;
}

// Estimate card height - adjust based on your actual card size
const CARD_HEIGHT = 320;
const GAP = 16;
const COLUMNS_DESKTOP = 2;

export function VirtualizedInterviewGrid({
  interviews,
  selectedInterviewIds,
  analyzingIds,
  onToggleSelect,
  onDelete,
  onView,
  onRename,
  onRetryAnalysis,
}: VirtualizedInterviewGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate number of rows (2 columns on desktop)
  const rowCount = Math.ceil(interviews.length / COLUMNS_DESKTOP);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => CARD_HEIGHT + GAP, []),
    overscan: 3, // Render 3 extra rows above/below viewport
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Only use virtualization for large lists
  if (interviews.length < 20) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
            isSelected={selectedInterviewIds.has(interview.id)}
            isAnalyzing={analyzingIds.has(interview.id)}
            onToggleSelect={() => onToggleSelect(interview.id)}
            onDelete={() => onDelete(interview.id)}
            onView={() => onView(interview)}
            onRename={(newTitle) => onRename(interview.id, newTitle)}
            onRetryAnalysis={() => onRetryAnalysis(interview)}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-400px)] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const startIndex = rowIndex * COLUMNS_DESKTOP;
          const rowInterviews = interviews.slice(startIndex, startIndex + COLUMNS_DESKTOP);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {rowInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    isSelected={selectedInterviewIds.has(interview.id)}
                    isAnalyzing={analyzingIds.has(interview.id)}
                    onToggleSelect={() => onToggleSelect(interview.id)}
                    onDelete={() => onDelete(interview.id)}
                    onView={() => onView(interview)}
                    onRename={(newTitle) => onRename(interview.id, newTitle)}
                    onRetryAnalysis={() => onRetryAnalysis(interview)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedInterviewGrid;
