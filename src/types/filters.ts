export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';
export type PainPointSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface InterviewFilters {
  searchQuery: string;
  statuses: AnalysisStatus[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  severities: PainPointSeverity[];
  tools: string[];
}

export const DEFAULT_FILTERS: InterviewFilters = {
  searchQuery: '',
  statuses: [],
  dateRange: { start: null, end: null },
  severities: [],
  tools: [],
};

export interface FilterOption<T> {
  value: T;
  label: string;
}
