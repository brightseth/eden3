import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiClient, formatApiError } from '@/lib/api'
import { Agent, ExtendedAgent, QueryParams, Work, AnyEvent } from '@/types/agent'
import { useToast } from '@/providers/toast-provider'

// Query keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...agentKeys.lists(), params] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  works: (id: string) => [...agentKeys.detail(id), 'works'] as const,
  worksWithParams: (id: string, params?: QueryParams) => [...agentKeys.works(id), params] as const,
  events: (id: string) => [...agentKeys.detail(id), 'events'] as const,
  analytics: (id: string) => [...agentKeys.detail(id), 'analytics'] as const,
}

// Get multiple agents with pagination
export function useAgents(params?: QueryParams) {
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: () => ApiClient.getAgents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get agents with infinite scroll
export function useInfiniteAgents(params?: QueryParams) {
  return useInfiniteQuery({
    queryKey: agentKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      ApiClient.getAgents({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

// Get single agent
export function useAgent(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => ApiClient.getAgent(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404
      if (error?.status === 404) return false
      return failureCount < 2
    },
  })
}

// Get agent works
export function useAgentWorks(id: string, params?: QueryParams, enabled: boolean = true) {
  return useQuery({
    queryKey: agentKeys.worksWithParams(id, params),
    queryFn: () => ApiClient.getAgentWorks(id, params),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  })
}

// Get agent works with infinite scroll
export function useInfiniteAgentWorks(id: string, params?: QueryParams) {
  return useInfiniteQuery({
    queryKey: agentKeys.worksWithParams(id, params),
    queryFn: ({ pageParam = 1 }) =>
      ApiClient.getAgentWorks(id, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  })
}

// Get agent events
export function useAgentEvents(id: string, params?: QueryParams, enabled: boolean = true) {
  return useQuery({
    queryKey: [...agentKeys.events(id), params],
    queryFn: () => ApiClient.getAgentEvents(id, params),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute for events
    cacheTime: 3 * 60 * 1000,
  })
}

// Get agent analytics
export function useAgentAnalytics(id: string, period: string = '30d', enabled: boolean = true) {
  return useQuery({
    queryKey: [...agentKeys.analytics(id), period],
    queryFn: () => ApiClient.getAgentAnalytics(id, period),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

// Search agents
export function useAgentSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['agents', 'search', query],
    queryFn: () => ApiClient.searchAgents(query),
    enabled: enabled && query.length > 2,
    staleTime: 30 * 1000, // 30 seconds for search
    cacheTime: 2 * 60 * 1000,
  })
}

// Training-related hooks for training mode
export function useTrainingSessions(agentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['training', 'sessions', agentId],
    queryFn: () => ApiClient.getTrainingSessions(agentId),
    enabled: enabled && !!agentId,
    staleTime: 1 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  })
}

export function useCreateTrainingSession() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  return useMutation({
    mutationFn: ({ agentId, data }: { agentId: string; data: any }) =>
      ApiClient.createTrainingSession(agentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['training', 'sessions', variables.agentId])
      queryClient.invalidateQueries(agentKeys.detail(variables.agentId))
      addToast({
        type: 'success',
        title: 'Training Session Created',
        description: 'New training session has been started successfully.',
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Failed to Create Session',
        description: formatApiError(error),
      })
    },
  })
}

export function useUpdateTrainingSession() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  return useMutation({
    mutationFn: ({
      agentId,
      sessionId,
      data,
    }: {
      agentId: string
      sessionId: string
      data: any
    }) => ApiClient.updateTrainingSession(agentId, sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['training', 'sessions', variables.agentId])
      queryClient.invalidateQueries(agentKeys.detail(variables.agentId))
      addToast({
        type: 'success',
        title: 'Training Session Updated',
        description: 'Training session has been updated successfully.',
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Failed to Update Session',
        description: formatApiError(error),
      })
    },
  })
}

// Custom hook for real-time agent status
export function useAgentStatus() {
  const queryClient = useQueryClient()

  // This would connect to WebSocket in a real implementation
  const updateAgentStatus = (agentId: string, isOnline: boolean) => {
    queryClient.setQueryData(
      agentKeys.detail(agentId),
      (old: any) => {
        if (old) {
          return {
            ...old,
            data: {
              ...old.data,
              isOnline,
              lastActivity: new Date().toISOString(),
            },
          }
        }
        return old
      }
    )
  }

  return { updateAgentStatus }
}

// Prefetch agent data
export function usePrefetchAgent() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: agentKeys.detail(id),
      queryFn: () => ApiClient.getAgent(id),
      staleTime: 2 * 60 * 1000,
    })
  }
}

// Optimistic updates for better UX
export function useOptimisticAgentUpdate() {
  const queryClient = useQueryClient()

  const updateAgent = (agentId: string, updates: Partial<ExtendedAgent>) => {
    queryClient.setQueryData(
      agentKeys.detail(agentId),
      (old: any) => {
        if (old) {
          return {
            ...old,
            data: {
              ...old.data,
              ...updates,
            },
          }
        }
        return old
      }
    )
  }

  return { updateAgent }
}