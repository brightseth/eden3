// API client for fetching data from the backend
import { Agent, Event, Work, ExtendedAgent } from '@/types/agent';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Request failed',
      response.status,
      data.code,
      data.details
    )
  }

  return data
}

export class ApiClient {
  // Agent endpoints
  static async getAgents(source?: string): Promise<Agent[]> {
    const searchParams = new URLSearchParams()
    if (source) {
      searchParams.append('source', source)
    }

    const response = await request<ApiResponse<{ agents: Agent[], total: number }>>(
      `/v1/agents${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    )
    return response.data.agents || []
  }

  static async getAgent(slug: string): Promise<ExtendedAgent | null> {
    try {
      const response = await request<ApiResponse<ExtendedAgent>>(`/v1/agents/${slug}`)
      return response.data || null
    } catch (error) {
      console.error('Error fetching agent:', error)
      return null
    }
  }

  static async getAgentWorks(
    slug: string, 
    medium?: string,
    limit = 20,
    offset = 0
  ): Promise<Work[]> {
    const searchParams = new URLSearchParams({
      limit: String(limit),
      offset: String(offset)
    })
    
    if (medium) {
      searchParams.append('medium', medium)
    }

    const response = await request<ApiResponse<{ works: Work[], total: number }>>(
      `/v1/agents/${slug}/works?${searchParams.toString()}`
    )
    return response.data.works || []
  }

  static async getAgentFeed(
    slug: string,
    limit = 50,
    offset = 0
  ): Promise<Event[]> {
    const searchParams = new URLSearchParams({
      limit: String(limit),
      offset: String(offset)
    })

    const response = await request<ApiResponse<{ events: Event[], total: number }>>(
      `/v1/agents/${slug}/feed?${searchParams.toString()}`
    )
    return response.data.events || []
  }

  static async getAgentStats(
    slug: string,
    period = 'month'
  ): Promise<any> {
    const response = await request<ApiResponse<any>>(
      `/v1/agents/${slug}/stats?period=${period}`
    )
    return response.data
  }

  // Get recent events across all agents
  static async getRecentEvents(limit = 100): Promise<Event[]> {
    try {
      // Aggregate events from all agents
      const agents = await ApiClient.getAgents()
      const eventPromises = agents.slice(0, 5).map(agent => 
        ApiClient.getAgentFeed(agent.slug, 10, 0)
      )
      
      const eventArrays = await Promise.all(eventPromises)
      const allEvents = eventArrays.flat()
      
      // Sort by timestamp and return the most recent
      return allEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent events:', error)
      return []
    }
  }

  // System health endpoint
  static async getSystemHealth(): Promise<any> {
    return request<any>('/v1/health')
  }
}

// Utility functions
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// Get source badge info
export function getSourceBadge(source: string): { label: string; color: string; icon?: string } {
  const badges: Record<string, { label: string; color: string; icon?: string }> = {
    'eden-legacy': { label: 'Eden Legacy', color: 'bg-purple-500', icon: '🌿' },
    'claude-sdk': { label: 'Claude SDK', color: 'bg-blue-500', icon: '🤖' },
    'eden3-native': { label: 'Eden³', color: 'bg-green-500', icon: '✨' },
  };
  
  return badges[source] || { label: source, color: 'bg-gray-500' };
}

export { ApiError }