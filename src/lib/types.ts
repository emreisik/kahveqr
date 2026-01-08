// Types for KahveQR app

export interface CafeBrand {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  stampsRequired: number;
  rewardName: string;
  loyaltySettings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CafeBranch {
  id: string;
  brandId: string;
  name: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  openNow: boolean;
  workingHours?: any;
  notificationSettings?: any;
  createdAt: string;
  updatedAt: string;
}

// Legacy type for compatibility
export interface Cafe {
  id: string;
  name: string;
  distanceKm: number;
  address: string;
  phone?: string;
  openNow: boolean;
  category: string;
  program: {
    stampsRequired: number;
    rewardName: string;
  };
}

export interface Membership {
  brandId: string;
  stamps: number;
  joinedAt: string;
  lastStampAt?: string;
  brand?: CafeBrand;
}

export interface Activity {
  id: string;
  type: 'earn' | 'redeem';
  brandId: string;
  branchId: string;
  delta: number; // +1 for stamp, -stampsRequired for redeem
  createdAt: string;
  branch?: CafeBranch;
  brand?: CafeBrand;
}

export interface AppState {
  version?: number; // For state migration
  userId: string; // Unique user ID for QR code
  memberships: Membership[];
  activities: Activity[];
  locationPermission: 'granted' | 'denied' | 'prompt';
}

// Business User Types
export type BusinessRole = 'OWNER' | 'BRANCH_MANAGER' | 'STAFF';

export interface BusinessUser {
  id: string;
  email: string;
  name: string;
  role: BusinessRole;
  brandId: string | null;
  branchId: string | null;
  isActive: boolean;
  createdBy?: string;
  lastLoginAt?: string;
  createdAt: string;
  brand?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: BusinessRole;
  isActive: boolean;
  createdBy?: string;
  lastLoginAt?: string;
  createdAt: string;
  brand?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}