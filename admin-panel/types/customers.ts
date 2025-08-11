export type CustomerTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type CustomerStatus = 'Active' | 'Inactive' | 'Blocked';
export type Gender = 'Male' | 'Female' | 'Other';

export interface CustomerAddress {
  id: string;
  title: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
}

export interface CustomerPreferences {
  favoriteItems: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  preferredPaymentMethod: string;
  deliveryInstructions?: string;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  favoriteCategory: string;
  loyaltyPoints: number;
  lifetimeValue: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: Gender;
  tier: CustomerTier;
  status: CustomerStatus;
  addresses: CustomerAddress[];
  preferences: CustomerPreferences;
  stats: CustomerStats;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
