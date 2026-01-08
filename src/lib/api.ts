// API service for KahveQR backend integration

// For Netlify deployment, API requests are redirected to /.netlify/functions/api
// In development, use local Express server
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? '/api'  // Netlify will redirect /api/* to /.netlify/functions/api/*
    : 'http://localhost:3001/api');

// Storage for auth token
const TOKEN_KEY = 'kahveqr_auth_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// API client with auth headers
async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: async (data: { email?: string; phone?: string; name?: string; password?: string }) => {
    return apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email?: string; phone?: string; password?: string }) => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  demoLogin: async () => {
    return apiClient('/auth/demo', { method: 'POST' });
  },
};

// Business Auth API (Separate from customer auth)
export const businessAuthAPI = {
  login: async (data: { email: string; password: string }) => {
    return apiClient('/business-auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Business Stats API
export const businessAPI = {
  getDashboard: async () => {
    return apiClient('/business/dashboard');
  },

  getCustomers: async () => {
    return apiClient('/business/customers');
  },

  getTransactions: async (params?: { type?: string; dateRange?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient(`/business/transactions${query ? `?${query}` : ''}`);
  },

  getStatistics: async (dateRange: string = 'week') => {
    return apiClient(`/business/statistics?dateRange=${dateRange}`);
  },

  getSettings: async () => {
    return apiClient('/business/settings');
  },

  updateSettings: async (data: {
    businessInfo?: {
      name?: string;
      address?: string;
      phone?: string;
      category?: string;
      stampsRequired?: number;
      rewardName?: string;
    };
    workingHours?: any;
    notifications?: any;
  }) => {
    return apiClient('/business/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getLoyaltyProgram: async () => {
    return apiClient('/business/loyalty');
  },

  updateLoyaltyProgram: async (data: {
    stampsRequired?: number;
    rewardName?: string;
    isActive?: boolean;
    validityDays?: number;
    maxStampsPerDay?: number;
  }) => {
    return apiClient('/business/loyalty', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Business Staff Management API
export const staffAPI = {
  getAll: async () => {
    return apiClient('/business/staff');
  },

  create: async (data: {
    email: string;
    name: string;
    password: string;
    role: string;
    cafeId?: string;
  }) => {
    return apiClient('/business/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    return apiClient(`/business/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiClient(`/business/staff/${id}`, {
      method: 'DELETE',
    });
  },

  activate: async (id: string) => {
    return apiClient(`/business/staff/${id}/activate`, {
      method: 'POST',
    });
  },

  resetPassword: async (id: string, newPassword: string) => {
    return apiClient(`/business/staff/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },
};

// Branch Management API
export const branchesAPI = {
  getAll: async () => {
    return apiClient('/business/branches');
  },

  create: async (data: {
    name: string;
    address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    workingHours?: any;
  }) => {
    return apiClient('/business/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    openNow?: boolean;
    workingHours?: any;
    notificationSettings?: any;
  }) => {
    return apiClient(`/business/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiClient(`/business/branches/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (id: string) => {
    return apiClient(`/business/branches/${id}/stats`);
  },
};

// Cafes API
export const cafesAPI = {
  getAll: async () => {
    return apiClient('/cafes');
  },

  getNearby: async (lat?: number, lng?: number) => {
    const params = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
    return apiClient(`/cafes/nearby${params}`);
  },

  getById: async (id: string) => {
    return apiClient(`/cafes/${id}`);
  },
};

// Memberships API
export const membershipsAPI = {
  getAll: async () => {
    return apiClient('/memberships');
  },

  getById: async (cafeId: string) => {
    return apiClient(`/memberships/${cafeId}`);
  },

  join: async (cafeId: string) => {
    return apiClient('/memberships/join', {
      method: 'POST',
      body: JSON.stringify({ cafeId }),
    });
  },

  addStamp: async (cafeId: string) => {
    return apiClient('/memberships/stamp', {
      method: 'POST',
      body: JSON.stringify({ cafeId }),
    });
  },

  redeem: async (cafeId: string) => {
    return apiClient('/memberships/redeem', {
      method: 'POST',
      body: JSON.stringify({ cafeId }),
    });
  },
};

// Activities API
export const activitiesAPI = {
  getAll: async (params?: { type?: 'earn' | 'redeem'; cafeId?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.cafeId) query.append('cafeId', params.cafeId);
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const queryString = query.toString();
    return apiClient(`/activities${queryString ? `?${queryString}` : ''}`);
  },

  getStats: async () => {
    return apiClient('/activities/stats');
  },
};

// Users API
export const usersAPI = {
  getMe: async () => {
    return apiClient('/users/me');
  },

  updateMe: async (data: { name?: string; email?: string; phone?: string }) => {
    return apiClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

