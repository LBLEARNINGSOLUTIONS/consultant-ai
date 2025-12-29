import { useState, useMemo, useCallback } from 'react';
import { Interview } from '../types/database';
import { InterviewFilters, DEFAULT_FILTERS, AnalysisStatus, PainPointSeverity } from '../types/filters';
import { PainPoint, Tool } from '../types/analysis';
import { CompanyFilter } from '../components/companies/CompanySidebar';

interface UseInterviewFiltersOptions {
  interviews: Interview[];
  companyFilter: CompanyFilter;
}

interface UseInterviewFiltersReturn {
  filters: InterviewFilters;
  filteredInterviews: Interview[];
  setSearchQuery: (query: string) => void;
  setStatuses: (statuses: AnalysisStatus[]) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  setSeverities: (severities: PainPointSeverity[]) => void;
  setTools: (tools: string[]) => void;
  clearAllFilters: () => void;
  clearFilter: (filterKey: keyof InterviewFilters) => void;
  availableTools: string[];
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useInterviewFilters({
  interviews,
  companyFilter,
}: UseInterviewFiltersOptions): UseInterviewFiltersReturn {
  const [filters, setFilters] = useState<InterviewFilters>(DEFAULT_FILTERS);

  // Extract unique tools from all interviews for the filter dropdown
  const availableTools = useMemo(() => {
    const toolSet = new Set<string>();
    interviews.forEach((interview) => {
      if (Array.isArray(interview.tools)) {
        (interview.tools as Tool[]).forEach((tool) => {
          if (tool.name) toolSet.add(tool.name);
        });
      }
    });
    return Array.from(toolSet).sort();
  }, [interviews]);

  // Apply all filters
  const filteredInterviews = useMemo(() => {
    let result = interviews;

    // 1. Apply company filter first (existing logic)
    if (companyFilter === 'unassigned') {
      result = result.filter((i) => !i.company_id);
    } else if (companyFilter !== null) {
      result = result.filter((i) => i.company_id === companyFilter);
    }

    // 2. Text search (title + transcript)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.transcript_text.toLowerCase().includes(query)
      );
    }

    // 3. Status filter
    if (filters.statuses.length > 0) {
      result = result.filter((i) => filters.statuses.includes(i.analysis_status as AnalysisStatus));
    }

    // 4. Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter((i) => {
        const createdAt = new Date(i.created_at);
        if (filters.dateRange.start && createdAt < filters.dateRange.start) return false;
        if (filters.dateRange.end) {
          const endOfDay = new Date(filters.dateRange.end);
          endOfDay.setHours(23, 59, 59, 999);
          if (createdAt > endOfDay) return false;
        }
        return true;
      });
    }

    // 5. Pain point severity filter
    if (filters.severities.length > 0) {
      result = result.filter((i) => {
        if (!Array.isArray(i.pain_points)) return false;
        const painPoints = i.pain_points as PainPoint[];
        return painPoints.some((pp) => filters.severities.includes(pp.severity as PainPointSeverity));
      });
    }

    // 6. Tools filter
    if (filters.tools.length > 0) {
      result = result.filter((i) => {
        if (!Array.isArray(i.tools)) return false;
        const interviewTools = i.tools as Tool[];
        return filters.tools.some((filterTool) =>
          interviewTools.some((t) => t.name.toLowerCase() === filterTool.toLowerCase())
        );
      });
    }

    return result;
  }, [interviews, companyFilter, filters]);

  // Filter setters
  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setStatuses = useCallback((statuses: AnalysisStatus[]) => {
    setFilters((prev) => ({ ...prev, statuses }));
  }, []);

  const setDateRange = useCallback((start: Date | null, end: Date | null) => {
    setFilters((prev) => ({ ...prev, dateRange: { start, end } }));
  }, []);

  const setSeverities = useCallback((severities: PainPointSeverity[]) => {
    setFilters((prev) => ({ ...prev, severities }));
  }, []);

  const setTools = useCallback((tools: string[]) => {
    setFilters((prev) => ({ ...prev, tools }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const clearFilter = useCallback((filterKey: keyof InterviewFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: DEFAULT_FILTERS[filterKey],
    }));
  }, []);

  // Metadata
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.statuses.length > 0 ||
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null ||
      filters.severities.length > 0 ||
      filters.tools.length > 0
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.severities.length > 0) count++;
    if (filters.tools.length > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredInterviews,
    setSearchQuery,
    setStatuses,
    setDateRange,
    setSeverities,
    setTools,
    clearAllFilters,
    clearFilter,
    availableTools,
    hasActiveFilters,
    activeFilterCount,
  };
}
