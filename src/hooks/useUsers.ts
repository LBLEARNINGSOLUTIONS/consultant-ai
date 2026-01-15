import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

// Query keys for users
const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export type UserRole = 'admin' | 'client' | 'Analyst';

export interface UserWithAccess extends Profile {
  company_access?: Array<{
    company_id: string;
    company: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

// Fetch all users (admin only - RLS will enforce this)
async function fetchAllUsers(): Promise<UserWithAccess[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      company_access(
        company_id,
        company:companies(id, name, color)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as UserWithAccess[];
}

// Update a user's role
async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

export function useUsers() {
  const queryClient = useQueryClient();

  // Query for all users
  const {
    data: users = [],
    isLoading: loading,
    error: queryError,
    refetch: refreshUsers,
  } = useQuery({
    queryKey: userKeys.list(),
    queryFn: fetchAllUsers,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      await updateUserRole(userId, role);
    },
    onMutate: async ({ userId, role }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.list() });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<UserWithAccess[]>(userKeys.list());

      // Optimistically update
      queryClient.setQueryData<UserWithAccess[]>(
        userKeys.list(),
        (old) => old?.map(u => u.id === userId ? { ...u, role } : u)
      );

      return { previousUsers };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(userKeys.list(), context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });

  // Wrapper function
  const setUserRole = async (userId: string, role: UserRole) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      return { error: errorMessage };
    }
  };

  // Separate users by role
  const admins = users.filter(u => u.role === 'admin');
  const clients = users.filter(u => u.role === 'client');
  const analysts = users.filter(u => u.role === 'Analyst' || !u.role);

  return {
    users,
    admins,
    clients,
    analysts,
    loading,
    error,
    setUserRole,
    refreshUsers,
  };
}
