import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface CompanyAccess {
  id: string;
  user_id: string;
  company_id: string;
  created_at: string;
}

export interface CompanyAccessWithDetails extends CompanyAccess {
  company?: {
    id: string;
    name: string;
    color: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Query keys for company access
const companyAccessKeys = {
  all: ['company_access'] as const,
  byUser: (userId: string) => [...companyAccessKeys.all, 'user', userId] as const,
  byCompany: (companyId: string) => [...companyAccessKeys.all, 'company', companyId] as const,
};

// Fetch company access records for a specific user
async function fetchUserCompanyAccess(userId: string): Promise<CompanyAccessWithDetails[]> {
  const { data, error } = await supabase
    .from('company_access')
    .select(`
      *,
      company:companies(id, name, color)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []) as CompanyAccessWithDetails[];
}

// Fetch all users who have access to a specific company
async function fetchCompanyAccessUsers(companyId: string): Promise<CompanyAccessWithDetails[]> {
  const { data, error } = await supabase
    .from('company_access')
    .select(`
      *,
      user:profiles(id, email, name)
    `)
    .eq('company_id', companyId);

  if (error) throw error;
  return (data || []) as CompanyAccessWithDetails[];
}

export function useCompanyAccess(userId?: string, companyId?: string) {
  const queryClient = useQueryClient();

  // Query for user's company access
  const {
    data: userAccess = [],
    isLoading: userAccessLoading,
  } = useQuery({
    queryKey: companyAccessKeys.byUser(userId || ''),
    queryFn: () => fetchUserCompanyAccess(userId!),
    enabled: !!userId,
  });

  // Query for company's users
  const {
    data: companyUsers = [],
    isLoading: companyUsersLoading,
  } = useQuery({
    queryKey: companyAccessKeys.byCompany(companyId || ''),
    queryFn: () => fetchCompanyAccessUsers(companyId!),
    enabled: !!companyId,
  });

  // Grant access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async ({ userId, companyId }: { userId: string; companyId: string }) => {
      const { data, error } = await supabase
        .from('company_access')
        .insert({ user_id: userId, company_id: companyId })
        .select()
        .single();

      if (error) throw error;
      return data as CompanyAccess;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: companyAccessKeys.byUser(variables.userId) });
      queryClient.invalidateQueries({ queryKey: companyAccessKeys.byCompany(variables.companyId) });
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async ({ userId, companyId }: { userId: string; companyId: string }) => {
      const { error } = await supabase
        .from('company_access')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: companyAccessKeys.byUser(variables.userId) });
      queryClient.invalidateQueries({ queryKey: companyAccessKeys.byCompany(variables.companyId) });
    },
  });

  // Wrapper functions
  const grantAccess = async (targetUserId: string, targetCompanyId: string) => {
    try {
      await grantAccessMutation.mutateAsync({ userId: targetUserId, companyId: targetCompanyId });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to grant access';
      return { error: errorMessage };
    }
  };

  const revokeAccess = async (targetUserId: string, targetCompanyId: string) => {
    try {
      await revokeAccessMutation.mutateAsync({ userId: targetUserId, companyId: targetCompanyId });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke access';
      return { error: errorMessage };
    }
  };

  // Get company IDs that a user has access to
  const accessibleCompanyIds = userAccess.map(a => a.company_id);

  return {
    userAccess,
    companyUsers,
    accessibleCompanyIds,
    loading: userAccessLoading || companyUsersLoading,
    grantAccess,
    revokeAccess,
  };
}
