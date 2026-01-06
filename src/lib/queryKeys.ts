/**
 * Query key factory for React Query
 * Provides type-safe, consistent query keys across the application
 */
export const queryKeys = {
  interviews: {
    all: ['interviews'] as const,
    lists: () => [...queryKeys.interviews.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.interviews.lists(), userId] as const,
    details: () => [...queryKeys.interviews.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.interviews.details(), id] as const,
  },
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.companies.lists(), userId] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.companies.details(), id] as const,
  },
  summaries: {
    all: ['summaries'] as const,
    lists: () => [...queryKeys.summaries.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.summaries.lists(), userId] as const,
    details: () => [...queryKeys.summaries.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.summaries.details(), id] as const,
  },
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => [...queryKeys.profile.all, userId] as const,
  },
};
