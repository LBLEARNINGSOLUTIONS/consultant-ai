import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryKeys';
import { CompanySummary, InsertCompanySummary, Interview, Json } from '../types/database';
import { generateCompanySummary } from '../services/analysisService';
import { InterviewAnalysis } from '../types/analysis';

// Fetch summaries from Supabase
async function fetchSummaries(userId: string): Promise<CompanySummary[]> {
  const { data, error } = await supabase
    .from('company_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as CompanySummary[];
}

export function useCompanySummary(userId?: string) {
  const queryClient = useQueryClient();

  // Query for fetching summaries
  const {
    data: summaries = [],
    isLoading: loading,
    error: queryError,
    refetch: refreshSummaries,
  } = useQuery({
    queryKey: queryKeys.summaries.list(userId || ''),
    queryFn: () => fetchSummaries(userId!),
    enabled: !!userId,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  // Set up real-time subscription
  useEffect(() => {
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
        (payload) => {
          // Handle real-time updates efficiently
          queryClient.setQueryData<CompanySummary[]>(
            queryKeys.summaries.list(userId),
            (oldData) => {
              if (!oldData) return oldData;

              if (payload.eventType === 'DELETE') {
                return oldData.filter(s => s.id !== payload.old.id);
              }
              if (payload.eventType === 'INSERT') {
                const newSummary = payload.new as CompanySummary;
                return [newSummary, ...oldData];
              }
              if (payload.eventType === 'UPDATE') {
                return oldData.map(s =>
                  s.id === payload.new.id ? payload.new as CompanySummary : s
                );
              }
              return oldData;
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Create summary mutation
  const createMutation = useMutation({
    mutationFn: async (summary: InsertCompanySummary) => {
      const { data, error } = await supabase
        .from('company_summaries')
        .insert(summary)
        .select()
        .single();

      if (error) throw error;
      return data as CompanySummary;
    },
    onMutate: async (newSummary) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.summaries.list(userId || '') });

      const previousSummaries = queryClient.getQueryData<CompanySummary[]>(
        queryKeys.summaries.list(userId || '')
      );

      // Optimistically add summary
      const optimisticSummary: CompanySummary = {
        id: `temp-${Date.now()}`,
        user_id: userId || '',
        title: newSummary.title,
        interview_ids: newSummary.interview_ids || [],
        summary_data: newSummary.summary_data || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<CompanySummary[]>(
        queryKeys.summaries.list(userId || ''),
        (old) => old ? [optimisticSummary, ...old] : [optimisticSummary]
      );

      return { previousSummaries };
    },
    onError: (_err, _newSummary, context) => {
      if (context?.previousSummaries) {
        queryClient.setQueryData(
          queryKeys.summaries.list(userId || ''),
          context.previousSummaries
        );
      }
    },
  });

  // Update summary mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { summary_data?: Json; title?: string } }) => {
      const { error } = await supabase
        .from('company_summaries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.summaries.list(userId || '') });

      const previousSummaries = queryClient.getQueryData<CompanySummary[]>(
        queryKeys.summaries.list(userId || '')
      );

      queryClient.setQueryData<CompanySummary[]>(
        queryKeys.summaries.list(userId || ''),
        (old) => old?.map(s => s.id === id ? { ...s, ...updates } : s)
      );

      return { previousSummaries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousSummaries) {
        queryClient.setQueryData(
          queryKeys.summaries.list(userId || ''),
          context.previousSummaries
        );
      }
    },
  });

  // Delete summary mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_summaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.summaries.list(userId || '') });

      const previousSummaries = queryClient.getQueryData<CompanySummary[]>(
        queryKeys.summaries.list(userId || '')
      );

      // Optimistically remove the summary
      queryClient.setQueryData<CompanySummary[]>(
        queryKeys.summaries.list(userId || ''),
        (old) => old?.filter(s => s.id !== id)
      );

      return { previousSummaries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousSummaries) {
        queryClient.setQueryData(
          queryKeys.summaries.list(userId || ''),
          context.previousSummaries
        );
      }
    },
  });

  // Wrapper functions to maintain API compatibility
  const createSummary = async (summary: InsertCompanySummary) => {
    try {
      const data = await createMutation.mutateAsync(summary);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create summary';
      return { data: null, error: errorMessage };
    }
  };

  const updateSummary = async (id: string, updates: { summary_data?: Json; title?: string }) => {
    try {
      await updateMutation.mutateAsync({ id, updates });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update summary';
      return { error: errorMessage };
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete summary';
      return { error: errorMessage };
    }
  };

  const generateSummaryFromInterviews = async (
    title: string,
    selectedInterviews: Interview[]
  ) => {
    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      // Convert interviews to analyses
      const analyses: InterviewAnalysis[] = selectedInterviews.map(interview => ({
        workflows: (interview.workflows as unknown as InterviewAnalysis['workflows']) || [],
        painPoints: (interview.pain_points as unknown as InterviewAnalysis['painPoints']) || [],
        tools: (interview.tools as unknown as InterviewAnalysis['tools']) || [],
        roles: (interview.roles as unknown as InterviewAnalysis['roles']) || [],
        trainingGaps: (interview.training_gaps as unknown as InterviewAnalysis['trainingGaps']) || [],
        handoffRisks: (interview.handoff_risks as unknown as InterviewAnalysis['handoffRisks']) || [],
        recommendations: [],
      }));

      const dates = selectedInterviews.map(i => i.created_at);

      // Generate aggregated summary
      const summaryData = await generateCompanySummary(analyses, dates);

      // Save to database
      const { data, error: saveError } = await createSummary({
        user_id: userId,
        title,
        interview_ids: selectedInterviews.map(i => i.id),
        summary_data: summaryData as unknown as Json,
      });

      if (saveError) throw new Error(saveError);

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
      return { data: null, error: errorMessage };
    }
  };

  return {
    summaries,
    loading,
    error,
    createSummary,
    updateSummary,
    deleteSummary,
    generateSummary: generateSummaryFromInterviews,
    refreshSummaries,
  };
}
