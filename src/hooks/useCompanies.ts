import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Company, InsertCompany, UpdateCompany } from '../types/database';

export function useCompanies(userId?: string) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setCompanies(data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCompanies();

    // Set up real-time subscription
    if (!userId) return;

    const channel = supabase
      .channel('companies_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchCompanies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCompanies, userId]);

  const createCompany = async (company: InsertCompany) => {
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('companies')
        .insert(company)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchCompanies();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create company';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateCompany = async (id: string, updates: UpdateCompany) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchCompanies();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchCompanies();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete company';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  return {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    refreshCompanies: fetchCompanies,
  };
}
