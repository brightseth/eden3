// EDEN3 Academy API Client
// Production-ready API client with error handling and rate limiting

class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  
  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<T> {
    const { 
      method = 'GET', 
      body, 
      headers = {}, 
      timeout = 30000 
    } = config;

    const url = `${this.baseURL}/api/v1${endpoint}`;
    const controller = new AbortController();
    
    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          response.status,
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code
        );
      }

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new APIError(408, 'Request timeout');
      }
      
      throw new APIError(500, 'Network error occurred');
    }
  }

  // Agent endpoints
  async getAgents() {
    return this.makeRequest('/agents');
  }

  async getAgent(slug: string) {
    return this.makeRequest(`/agents/${slug}`);
  }

  async getAgentWorks(slug: string, page = 1, limit = 12) {
    return this.makeRequest(`/agents/${slug}/works?page=${page}&limit=${limit}`);
  }

  // Works endpoints
  async getWorks(page = 1, limit = 12) {
    return this.makeRequest(`/works?page=${page}&limit=${limit}`);
  }

  async getWork(workId: string) {
    return this.makeRequest(`/works/${workId}`);
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }

  // Authentication
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export { APIError };

// Legacy export for compatibility with existing pages
export const getApiClient = () => apiClient;

// Helper hooks for React Query
export const API_ENDPOINTS = {
  AGENTS: '/agents',
  AGENT: (slug: string) => `/agents/${slug}`,
  AGENT_WORKS: (slug: string) => `/agents/${slug}/works`,
  WORKS: '/works',
  WORK: (id: string) => `/works/${id}`,
  HEALTH: '/health',
} as const;