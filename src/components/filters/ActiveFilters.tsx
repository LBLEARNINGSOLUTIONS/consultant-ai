import { X } from 'lucide-react';
import { InterviewFilters } from '../../types/filters';
import { format } from 'date-fns';

interface ActiveFiltersProps {
  filters: InterviewFilters;
  onClearFilter: (key: keyof InterviewFilters) => void;
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
}

export function ActiveFilters({
  filters,
  onClearFilter,
  resultCount,
  totalCount,
  hasActiveFilters,
}: ActiveFiltersProps) {
  if (!hasActiveFilters) {
    return null;
  }

  const filterChips: Array<{ key: keyof InterviewFilters; label: string }> = [];

  if (filters.searchQuery) {
    filterChips.push({ key: 'searchQuery', label: `Search: "${filters.searchQuery}"` });
  }

  if (filters.statuses.length > 0) {
    filterChips.push({ key: 'statuses', label: `Status: ${filters.statuses.join(', ')}` });
  }

  if (filters.dateRange.start || filters.dateRange.end) {
    let dateLabel = 'Date: ';
    if (filters.dateRange.start && filters.dateRange.end) {
      dateLabel += `${format(filters.dateRange.start, 'MMM d')} - ${format(filters.dateRange.end, 'MMM d')}`;
    } else if (filters.dateRange.start) {
      dateLabel += `From ${format(filters.dateRange.start, 'MMM d')}`;
    } else if (filters.dateRange.end) {
      dateLabel += `Until ${format(filters.dateRange.end, 'MMM d')}`;
    }
    filterChips.push({ key: 'dateRange', label: dateLabel });
  }

  if (filters.severities.length > 0) {
    filterChips.push({ key: 'severities', label: `Severity: ${filters.severities.join(', ')}` });
  }

  if (filters.tools.length > 0) {
    filterChips.push({ key: 'tools', label: `Tools: ${filters.tools.slice(0, 2).join(', ')}${filters.tools.length > 2 ? ` +${filters.tools.length - 2}` : ''}` });
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-500">
          Showing {resultCount} of {totalCount} interviews
        </span>
        <span className="text-slate-300">|</span>
        {filterChips.map((chip) => (
          <span
            key={chip.key}
            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs"
          >
            {chip.label}
            <button
              onClick={() => onClearFilter(chip.key)}
              className="p-0.5 hover:bg-indigo-100 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
