import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryKeys';
import { Company, InsertCompany, UpdateCompany } from '../types/database';

// Fetch companies from Supabase
async function fetchCompanies(userId: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as Company[];
}

export function useCompanies(userId?: string) {
  const queryClient = useQueryClient();

  // Query for fetching companies
  const {
    data: companies = [],
    isLoading: loading,
    error: queryError,
    refetch: refreshCompanies,
  } = useQuery({
    queryKey: queryKeys.companies.list(userId || ''),
    queryFn: () => fetchCompanies(userId!),
    enabled: !!userId,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  // Set up real-time subscription
  useEffect(() => {
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
        (payload) => {
          // Handle real-time updates efficiently
          queryClient.setQueryData<Company[]>(
            queryKeys.companies.list(userId),
            (oldData) => {
              if (!oldData) return oldData;

              if (payload.eventType === 'DELETE') {
                return oldData.filter(c => c.id !== payload.old.id);
              }
              if (payload.eventType === 'INSERT') {
                const newCompany = payload.new as Company;
                // Insert in sorted order by name
                const insertIndex = oldData.findIndex(c => c.name.localeCompare(newCompany.name) > 0);
                if (insertIndex === -1) return [...oldData, newCompany];
                return [...oldData.slice(0, insertIndex), newCompany, ...oldData.slice(insertIndex)];
              }
              if (payload.eventType === 'UPDATE') {
                return oldData
                  .map(c => c.id === payload.new.id ? payload.new as Company : c)
                  .sort((a, b) => a.name.localeCompare(b.name));
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

  // Create company mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: async (company: InsertCompany) => {
      const { data, error } = await supabase
        .from('companies')
        .insert(company)
        .select()
        .single();

      if (error) throw error;
      return data as Company;
    },
    onMutate: async (newCompany) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.companies.list(userId || '') });

      // Snapshot the previous value
      const previousCompanies = queryClient.getQueryData<Company[]>(
        queryKeys.companies.list(userId || '')
      );

      // Optimistically update with temporary ID
      const optimisticCompany: Company = {
        id: `temp-${Date.now()}`,
        name: newCompany.name,
        description: newCompany.description ?? null,
        color: newCompany.color ?? '#6366f1',
        user_id: userId || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Company[]>(
        queryKeys.companies.list(userId || ''),
        (old) => {
          if (!old) return [optimisticCompany];
          const insertIndex = old.findIndex(c => c.name.localeCompare(optimisticCompany.name) > 0);
          if (insertIndex === -1) return [...old, optimisticCompany];
          return [...old.slice(0, insertIndex), optimisticCompany, ...old.slice(insertIndex)];
        }
      );

      return { previousCompanies };
    },
    onError: (_err, _newCompany, context) => {
      // Rollback on error
      if (context?.previousCompanies) {
        queryClient.setQueryData(
          queryKeys.companies.list(userId || ''),
          context.previousCompanies
        );
      }
    },
    onSettled: () => {
      // Real-time subscription will handle the update
    },
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCompany }) => {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.companies.list(userId || '') });

      const previousCompanies = queryClient.getQueryData<Company[]>(
        queryKeys.companies.list(userId || '')
      );

      queryClient.setQueryData<Company[]>(
        queryKeys.companies.list(userId || ''),
        (old) => old?.map(c => c.id === id ? { ...c, ...updates } : c).sort((a, b) => a.name.localeCompare(b.name))
      );

      return { previousCompanies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCompanies) {
        queryClient.setQueryData(
          queryKeys.companies.list(userId || ''),
          context.previousCompanies
        );
      }
    },
  });

  // Delete company mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.companies.list(userId || '') });

      const previousCompanies = queryClient.getQueryData<Company[]>(
        queryKeys.companies.list(userId || '')
      );

      // Optimistically remove the company
      queryClient.setQueryData<Company[]>(
        queryKeys.companies.list(userId || ''),
        (old) => old?.filter(c => c.id !== id)
      );

      return { previousCompanies };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCompanies) {
        queryClient.setQueryData(
          queryKeys.companies.list(userId || ''),
          context.previousCompanies
        );
      }
    },
  });

  // Wrapper functions to maintain API compatibility
  const createCompany = async (company: InsertCompany) => {
    try {
      const data = await createMutation.mutateAsync(company);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create company';
      return { data: null, error: errorMessage };
    }
  };

  const updateCompany = async (id: string, updates: UpdateCompany) => {
    try {
      await updateMutation.mutateAsync({ id, updates });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company';
      return { error: errorMessage };
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete company';
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
    refreshCompanies,
  };
}
