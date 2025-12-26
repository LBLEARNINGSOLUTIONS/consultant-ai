import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Interview, InsertInterview, UpdateInterview } from '../types/database';
import { analyzeTranscript } from '../services/analysisService';

export function useInterviews(userId?: string) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInterviews(data || []);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInterviews();

    // Set up real-time subscription
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
        () => {
          fetchInterviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInterviews, userId]);

  const createInterview = async (interview: InsertInterview) => {
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('interviews')
        .insert(interview)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchInterviews();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create interview';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateInterview = async (id: string, updates: UpdateInterview) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchInterviews();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update interview';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteInterview = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchInterviews();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete interview';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const assignToCompany = async (interviewId: string, companyId: string | null) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('interviews')
        .update({ company_id: companyId })
        .eq('id', interviewId);

      if (updateError) throw updateError;

      await fetchInterviews();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign interview to company';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const analyzeInterview = async (id: string, transcript: string) => {
    try {
      setError(null);

      // Set status to 'analyzing'
      await updateInterview(id, { analysis_status: 'analyzing' });

      // Call Claude API
      const result = await analyzeTranscript(transcript);

      if (result.success && result.analysis) {
        // Save analysis results
        await updateInterview(id, {
          analysis_status: 'completed',
          workflows: result.analysis.workflows as any,
          pain_points: result.analysis.painPoints as any,
          tools: result.analysis.tools as any,
          roles: result.analysis.roles as any,
          training_gaps: result.analysis.trainingGaps as any,
          handoff_risks: result.analysis.handoffRisks as any,
          raw_analysis_response: result as any,
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

      setError(errorMessage);
      return { error: errorMessage };
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
    refreshInterviews: fetchInterviews,
  };
}
