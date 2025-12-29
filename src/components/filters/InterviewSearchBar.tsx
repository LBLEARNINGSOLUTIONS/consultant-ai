import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, AlertTriangle, Wrench, ChevronDown } from 'lucide-react';
import { InterviewFilters, AnalysisStatus, PainPointSeverity } from '../../types/filters';
import { FilterDropdown } from './FilterDropdown';
import { DateRangePicker } from './DateRangePicker';
import { ActiveFilters } from './ActiveFilters';

interface InterviewSearchBarProps {
  filters: InterviewFilters;
  onSearchChange: (query: string) => void;
  onStatusChange: (statuses: AnalysisStatus[]) => void;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  onSeverityChange: (severities: PainPointSeverity[]) => void;
  onToolsChange: (tools: string[]) => void;
  onClearAll: () => void;
  onClearFilter: (key: keyof InterviewFilters) => void;
  availableTools: string[];
  hasActiveFilters: boolean;
  resultCount: number;
  totalCount: number;
}

const STATUS_OPTIONS: ReadonlyArray<{ value: AnalysisStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const SEVERITY_OPTIONS: ReadonlyArray<{ value: PainPointSeverity; label: string }> = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function InterviewSearchBar({
  filters,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onSeverityChange,
  onToolsChange,
  onClearAll,
  onClearFilter,
  availableTools,
  hasActiveFilters,
  resultCount,
  totalCount,
}: InterviewSearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toolOptions = availableTools.map((t) => ({ value: t, label: t }));

  return (
    <div className="space-y-3">
      {/* Search bar row */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search interviews by title or content... (Cmd+K)"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors
            ${showFilters || hasActiveFilters
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              !
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Filter dropdowns row */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          {/* Status filter */}
          <FilterDropdown
            label="Status"
            icon={<div className="w-2 h-2 rounded-full bg-current" />}
            options={STATUS_OPTIONS}
            selectedValues={filters.statuses}
            onChange={onStatusChange}
          />

          {/* Date range */}
          <DateRangePicker
            startDate={filters.dateRange.start}
            endDate={filters.dateRange.end}
            onChange={onDateRangeChange}
          />

          {/* Severity filter */}
          <FilterDropdown
            label="Pain Point Severity"
            icon={<AlertTriangle className="w-4 h-4" />}
            options={SEVERITY_OPTIONS}
            selectedValues={filters.severities}
            onChange={onSeverityChange}
          />

          {/* Tools filter */}
          {toolOptions.length > 0 && (
            <FilterDropdown
              label="Tools Mentioned"
              icon={<Wrench className="w-4 h-4" />}
              options={toolOptions}
              selectedValues={filters.tools}
              onChange={onToolsChange}
            />
          )}

          {/* Clear all button */}
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="ml-auto flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Active filters display + result count */}
      <ActiveFilters
        filters={filters}
        onClearFilter={onClearFilter}
        resultCount={resultCount}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
