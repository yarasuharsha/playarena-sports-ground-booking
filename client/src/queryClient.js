import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime in React Query v4)
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

/**
 * Clears user-specific cached queries so switching accounts or logging out
 * never presents stale data from the previous session.
 * Public ground data (['grounds'], ['ground']) is preserved.
 */
export function clearUserSpecificCache() {
  queryClient.removeQueries({ queryKey: ['my-bookings'] });
  queryClient.removeQueries({ queryKey: ['admin-bookings'] });
  queryClient.removeQueries({ queryKey: ['admin-dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
}
