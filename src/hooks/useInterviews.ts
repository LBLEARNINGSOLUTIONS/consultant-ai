import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryKeys';
import { Interview, InsertInterview, UpdateInterview } from '../types/database';
import { analyzeTranscript } from '../services/analysisService';
import { mergeAnalysisData } from '../utils/analysisHelpers';

// Fetch interviews from Supabase
async function fetchInterviews(userId: string): Promise<Interview[]> {
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Interview[];
}

export function useInterviews(userId?: string) {
  const queryClient = useQueryClient();

  // Query for fetching interviews
  const {
    data: interviews = [],
    isLoading: loading,
    error: queryError,
    refetch: refreshInterviews,
  } = useQuery({
    queryKey: queryKeys.interviews.list(userId || ''),
    queryFn: () => fetchInterviews(userId!),
    enabled: !!userId,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('interviews_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interviews',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Handle real-time updates efficiently
          queryClient.setQueryData<Interview[]>(
            queryKeys.interviews.list(userId),
            (oldData) => {
              if (!oldData) return oldData;

              if (payload.eventType === 'DELETE') {
                return oldData.filter(i => i.id !== payload.old.id);
              }
              if (payload.eventType === 'INSERT') {
                const newInterview = payload.new as Interview;
                return [newInterview, ...oldData];
              }
              if (payload.eventType === 'UPDATE') {
                return oldData.map(i =>
                  i.id === payload.new.id ? payload.new as Interview : i
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

  // Create interview mutation
  const createMutation = useMutation({
    mutationFn: async (interview: InsertInterview) => {
      const { data, error } = await supabase
        .from('interviews')
        .insert(interview)
        .select()
        .single();

      if (error) throw error;
      return data as Interview;
    },
    onMutate: async (newInterview) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.interviews.list(userId || '') });

      const previousInterviews = queryClient.getQueryData<Interview[]>(
        queryKeys.interviews.list(userId || '')
      );

      // Optimistically add interview
      const optimisticInterview: Interview = {
        id: `temp-${Date.now()}`,
        user_id: userId || '',
        title: newInterview.title,
        transcript_text: newInterview.transcript_text,
        analysis_status: newInterview.analysis_status || 'pending',
        company_id: newInterview.company_id || null,
        interviewee_name: newInterview.interviewee_name || null,
        interviewee_role: newInterview.interviewee_role || null,
        department: newInterview.department || null,
        interview_date: newInterview.interview_date || null,
        workflows: null,
        pain_points: null,
        tools: null,
        roles: null,
        training_gaps: null,
        handoff_risks: null,
        raw_analysis_response: null,
        analyzed_at: null,
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Interview[]>(
        queryKeys.interviews.list(userId || ''),
        (old) => old ? [optimisticInterview, ...old] : [optimisticInterview]
      );

      return { previousInterviews };
    },
    onError: (_err, _newInterview, context) => {
      if (context?.previousInterviews) {
        queryClient.setQueryData(
          queryKeys.interviews.list(userId || ''),
          context.previousInterviews
        );
      }
    },
  });

  // Update interview mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateInterview }) => {
      const { error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.interviews.list(userId || '') });

      const previousInterviews = queryClient.getQueryData<Interview[]>(
        queryKeys.interviews.list(userId || '')
      );

      queryClient.setQueryData<Interview[]>(
        queryKeys.interviews.list(userId || ''),
        (old) => old?.map(i => i.id === id ? { ...i, ...updates } : i)
      );

      return { previousInterviews };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousInterviews) {
        queryClient.setQueryData(
          queryKeys.interviews.list(userId || ''),
          context.previousInterviews
        );
      }
    },
  });

  // Delete interview mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.interviews.list(userId || '') });

      const previousInterviews = queryClient.getQueryData<Interview[]>(
        queryKeys.interviews.list(userId || '')
      );

      queryClient.setQueryData<Interview[]>(
        queryKeys.interviews.list(userId || ''),
        (old) => old?.filter(i => i.id !== id)
      );

      return { previousInterviews };
    },
    onError: (_err, _id, context) => {
      if (context?.previousInterviews) {
        queryClient.setQueryData(
          queryKeys.interviews.list(userId || ''),
          context.previousInterviews
        );
      }
    },
  });

  // Wrapper functions to maintain API compatibility
  const createInterview = async (interview: InsertInterview) => {
    try {
      const data = await createMutation.mutateAsync(interview);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create interview';
      return { data: null, error: errorMessage };
    }
  };

  const updateInterview = async (id: string, updates: UpdateInterview) => {
    try {
      await updateMutation.mutateAsync({ id, updates });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update interview';
      return { error: errorMessage };
    }
  };

  const deleteInterview = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete interview';
      return { error: errorMessage };
    }
  };

  const assignToCompany = async (interviewId: string, companyId: string | null) => {
    try {
      await updateMutation.mutateAsync({
        id: interviewId,
        updates: { company_id: companyId }
      });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign interview to company';
      return { error: errorMessage };
    }
  };

  const analyzeInterview = async (id: string, transcript: string) => {
    try {
      // Optimistically set status to 'analyzing'
      await updateInterview(id, { analysis_status: 'analyzing' });

      // Call Claude API
      const result = await analyzeTranscript(transcript);

      if (result.success && result.analysis) {
        // Save analysis results
        await updateInterview(id, {
          analysis_status: 'completed',
          workflows: result.analysis.workflows as unknown as Interview['workflows'],
          pain_points: result.analysis.painPoints as unknown as Interview['pain_points'],
          tools: result.analysis.tools as unknown as Interview['tools'],
          roles: result.analysis.roles as unknown as Interview['roles'],
          training_gaps: result.analysis.trainingGaps as unknown as Interview['training_gaps'],
          handoff_risks: result.analysis.handoffRisks as unknown as Interview['handoff_risks'],
          raw_analysis_response: result as unknown as Interview['raw_analysis_response'],
          analyzed_at: new Date().toISOString(),
        });

        return { error: null };
      } else {
        // Analysis failed
        await updateInterview(id, {
          analysis_status: 'failed',
          error_message: result.error || 'Analysis failed',
        });

        return { error: result.error || 'Analysis failed' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during analysis';

      // Update status to failed
      await updateInterview(id, {
        analysis_status: 'failed',
        error_message: errorMessage,
      });

      return { error: errorMessage };
    }
  };

  const mergeInterviews = async (title: string, sourceInterviews: Interview[]) => {
    if (!userId || sourceInterviews.length < 2) {
      return { data: null, error: 'Need at least 2 interviews to merge' };
    }

    try {
      // Combine transcripts with separators
      const combinedTranscript = sourceInterviews
        .map((interview, idx) => `--- Interview ${idx + 1}: ${interview.title} ---\n\n${interview.transcript_text}`)
        .join('\n\n');

      // Merge analysis data
      const mergedAnalysis = mergeAnalysisData(sourceInterviews);

      // Create the merged interview
      const { data, error: insertError } = await supabase
        .from('interviews')
        .insert({
          user_id: userId,
          title,
          transcript_text: combinedTranscript,
          analysis_status: 'completed',
          workflows: mergedAnalysis.workflows as unknown as Interview['workflows'],
          pain_points: mergedAnalysis.painPoints as unknown as Interview['pain_points'],
          tools: mergedAnalysis.tools as unknown as Interview['tools'],
          roles: mergedAnalysis.roles as unknown as Interview['roles'],
          training_gaps: mergedAnalysis.trainingGaps as unknown as Interview['training_gaps'],
          handoff_risks: mergedAnalysis.handoffRisks as unknown as Interview['handoff_risks'],
          analyzed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Invalidate to refetch with new interview
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.list(userId) });

      return { data: data as Interview, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to merge interviews';
      return { data: null, error: errorMessage };
    }
  };

  return {
    interviews,
    loading,
    error,
    createInterview,
    updateInterview,
    deleteInterview,
    assignToCompany,
    analyzeInterview,
    mergeInterviews,
    refreshInterviews,
  };
}
