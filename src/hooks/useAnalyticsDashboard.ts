import { useMemo } from 'react';
import { Interview } from '../types/database';
import { DashboardMetrics } from '../types/dashboard';
import { calculateDashboardMetrics } from '../utils/analysisHelpers';

/**
 * Hook to calculate dashboard metrics from interviews
 * Uses useMemo to avoid recalculating on every render
 */
export function useAnalyticsDashboard(interviews: Interview[]): {
  metrics: DashboardMetrics;
  loading: boolean;
} {
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(interviews);
  }, [interviews]);

  return {
    metrics,
    loading: false,
  };
}
