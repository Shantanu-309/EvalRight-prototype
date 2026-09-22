const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5274/api';

export interface ApiError {
  message: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any> } = {}
): Promise<T> {
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Handle query parameters
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  const token = localStorage.getItem('token');
  const { params, ...fetchOptions } = options;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    // Network error - backend not reachable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend API is running on http://localhost:5274');
    }
    throw error;
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
}

const api = {
  get: <T>(endpoint: string, options?: { params?: Record<string, any> }) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export default api;

