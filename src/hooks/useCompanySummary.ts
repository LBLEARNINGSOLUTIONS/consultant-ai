import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CompanySummary, InsertCompanySummary, Interview } from '../types/database';
import { generateCompanySummary } from '../services/analysisService';
import { InterviewAnalysis } from '../types/analysis';

export function useCompanySummary(userId?: string) {
  const [summaries, setSummaries] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('company_summaries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSummaries(data || []);
    } catch (err) {
      console.error('Error fetching summaries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch summaries');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSummaries();

    // Set up real-time subscription
    if (!userId) return;

    const channel = supabase
      .channel('summaries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_summaries',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchSummaries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSummaries, userId]);

  const createSummary = async (summary: InsertCompanySummary) => {
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('company_summaries')
        .insert(summary)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchSummaries();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create summary';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('company_summaries')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchSummaries();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete summary';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const generateSummary = async (
    title: string,
    selectedInterviews: Interview[]
  ) => {
    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setError(null);

      // Convert interviews to analyses
      const analyses: InterviewAnalysis[] = selectedInterviews.map(interview => ({
        workflows: (interview.workflows as any) || [],
        painPoints: (interview.pain_points as any) || [],
        tools: (interview.tools as any) || [],
        roles: (interview.roles as any) || [],
        trainingGaps: (interview.training_gaps as any) || [],
        handoffRisks: (interview.handoff_risks as any) || [],
      }));

      const dates = selectedInterviews.map(i => i.created_at);

      // Generate aggregated summary
      const summaryData = await generateCompanySummary(analyses, dates);

      // Save to database
      const { data, error: saveError } = await createSummary({
        user_id: userId,
        title,
        interview_ids: selectedInterviews.map(i => i.id),
        summary_data: summaryData as any,
      });

      if (saveError) throw new Error(saveError);

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  return {
    summaries,
    loading,
    error,
    createSummary,
    deleteSummary,
    generateSummary,
    refreshSummaries: fetchSummaries,
  };
}
