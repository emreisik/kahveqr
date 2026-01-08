// API-only store (no localStorage fallback)
// All data comes from backend API

import { AppState, Membership, Activity, Cafe } from './types';
import { authAPI, businessAuthAPI, membershipsAPI, activitiesAPI, cafesAPI, getToken, setToken, removeToken } from './api';

const USER_KEY = 'kahveqr-user';
const BUSINESS_USER_KEY = 'kahveqr-business-user';

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Get user info from localStorage
export const getCurrentUser = () => {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

// Login with email/phone
export const login = async (credentials: { email?: string; phone?: string; password?: string }) => {
  try {
    const response = await authAPI.login(credentials);
    setToken(response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return response.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Register new user
export const register = async (data: { email?: string; phone?: string; name?: string; password?: string }) => {
  try {
    const response = await authAPI.register(data);
    setToken(response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return response.user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Business Login (separate from customer login)
export const businessLogin = async (credentials: { email: string; password: string }) => {
  try {
    const response = await businessAuthAPI.login(credentials);
    setToken(response.token);
    localStorage.setItem(BUSINESS_USER_KEY, JSON.stringify(response.businessUser));
    return response.businessUser;
  } catch (error) {
    console.error('Business login failed:', error);
    throw error;
  }
};

// Get business user info from localStorage
export const getCurrentBusinessUser = () => {
  const stored = localStorage.getItem(BUSINESS_USER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

// Check if user is business user
export const isBusinessUser = (): boolean => {
  return !!getCurrentBusinessUser();
};

// Logout
export const logout = (): void => {
  removeToken();
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(BUSINESS_USER_KEY);
  window.location.href = '/';
};

// Get state from API (requires authentication)
export const getState = async (): Promise<AppState> => {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }

  try {
    const [memberships, activities] = await Promise.all([
      membershipsAPI.getAll(),
      activitiesAPI.getAll({ limit: 100 }),
    ]);

    const user = getCurrentUser();
    
    return {
      version: 2,
      userId: user?.id || '',
      memberships: memberships.map((m: any) => ({
        cafeId: m.cafeId,
        stamps: m.stamps,
        joinedAt: m.joinedAt,
        lastStampAt: m.lastStampAt,
      })),
      activities: activities.map((a: any) => ({
        id: a.id,
        type: a.type,
        cafeId: a.cafeId,
        delta: a.delta,
        createdAt: a.createdAt,
      })),
      locationPermission: 'prompt',
    };
  } catch (error) {
    console.error('Failed to fetch state from API:', error);
    throw error;
  }
};

// Get cafes from API
export const getCafes = async (): Promise<Cafe[]> => {
  try {
    const cafes = await cafesAPI.getNearby();
    return cafes.map((c: any) => ({
      id: c.id,
      name: c.name,
      distanceKm: c.distanceKm || 0,
      address: c.address || '',
      openNow: c.openNow,
      category: c.category || '',
      program: {
        stampsRequired: c.stampsRequired,
        rewardName: c.rewardName,
      },
    }));
  } catch (error) {
    console.error('Failed to fetch cafes:', error);
    throw error;
  }
};

// Join cafe
export const joinCafe = async (cafeId: string): Promise<AppState> => {
  try {
    await membershipsAPI.join(cafeId);
    return await getState();
  } catch (error) {
    console.error('Failed to join cafe:', error);
    throw error;
  }
};

// Add stamp
export const addStamp = async (cafeId: string): Promise<AppState> => {
  try {
    await membershipsAPI.addStamp(cafeId);
    return await getState();
  } catch (error) {
    console.error('Failed to add stamp:', error);
    throw error;
  }
};

// Redeem reward
export const redeemReward = async (cafeId: string, stampsRequired: number): Promise<AppState> => {
  try {
    await membershipsAPI.redeem(cafeId);
    return await getState();
  } catch (error) {
    console.error('Failed to redeem reward:', error);
    throw error;
  }
};

// Get membership
export const getMembership = async (cafeId: string): Promise<Membership | undefined> => {
  const state = await getState();
  return state.memberships.find((m) => m.cafeId === cafeId);
};

// Reset state (logout)
export const resetState = (): void => {
  logout();
};

// Get user ID
export const getUserId = (): string => {
  const user = getCurrentUser();
  return user?.id || '';
};

