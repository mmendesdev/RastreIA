import { Platform } from 'react-native';
import { StolenItem } from '@/types';

// API base URL
const API_BASE_URL = 'https://api.example.com/v1';

// Check network status
export const isNetworkConnected = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return navigator.onLine;
  }
  
  // For native platforms, we would use NetInfo
  // Since we don't have NetInfo imported, we'll return true for demo
  return true;
};

// Generic fetch function with error handling
const fetchApi = async (
  endpoint: string,
  method = 'GET',
  body: any = null,
  headers: Record<string, string> = {}
) => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Authentication API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi('/auth/login', 'POST', { email, password }),
  
  register: (name: string, email: string, password: string, role: string) =>
    fetchApi('/auth/register', 'POST', { name, email, password, role }),
  
  logout: (token: string) =>
    fetchApi('/auth/logout', 'POST', null, { Authorization: `Bearer ${token}` }),
};

// Stolen items API
export const itemsApi = {
  getAll: (token: string) =>
    fetchApi('/items', 'GET', null, { Authorization: `Bearer ${token}` }),
  
  getById: (id: string, token: string) =>
    fetchApi(`/items/${id}`, 'GET', null, { Authorization: `Bearer ${token}` }),
  
  create: (item: Omit<StolenItem, 'id'>, token: string) =>
    fetchApi('/items', 'POST', item, { Authorization: `Bearer ${token}` }),
  
  update: (id: string, item: Partial<StolenItem>, token: string) =>
    fetchApi(`/items/${id}`, 'PUT', item, { Authorization: `Bearer ${token}` }),
  
  delete: (id: string, token: string) =>
    fetchApi(`/items/${id}`, 'DELETE', null, { Authorization: `Bearer ${token}` }),
  
  search: (query: string, token: string) =>
    fetchApi(`/items/search?q=${encodeURIComponent(query)}`, 'GET', null, { Authorization: `Bearer ${token}` }),
};

// Export default
export default {
  isNetworkConnected,
  auth: authApi,
  items: itemsApi,
};