/**
 * API Client Utilities
 * Handles authenticated API requests with JWT tokens
 */

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Make an authenticated API request
 * Automatically includes JWT token from localStorage
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<{ data: T; status: number; error?: any }> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add Authorization header if authentication is required
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      // No token available
      throw new Error('No authentication token found');
    }
  }

  try {
    const response = await fetch(endpoint, {
      ...restOptions,
      headers: requestHeaders,
    });

    const data = await response.json();

    // Handle authentication errors
    if (response.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
      throw new Error('Authentication required');
    }

    if (response.status === 403) {
      throw new Error(data.error?.message || 'Access denied');
    }

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return { data, status: response.status };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

/**
 * Example usage:
 * 
 * // GET request
 * const { data } = await api.get('/api/recipient/dashboard');
 * 
 * // POST request
 * const { data } = await api.post('/api/recipient/pre-register', {
 *   trackingId: 'TRACK123',
 *   courier: 'DHL'
 * });
 * 
 * // Request without authentication
 * const { data } = await api.post('/api/auth/signin', 
 *   { email, password }, 
 *   { requiresAuth: false }
 * );
 */
