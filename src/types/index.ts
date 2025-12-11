import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin' | 'detectorist';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ItemType =
  | 'ring'
  | 'key'
  | 'watch'
  | 'phone'
  | 'necklace'
  | 'bracelet'
  | 'earring'
  | 'heirloom'
  | 'coin'
  | 'other';

export type LostItemStatus = 'pending' | 'assigned' | 'in-progress' | 'recovered' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'deposit-paid' | 'paid' | 'refunded';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  searchRadius?: number; // in meters
}

export interface LostItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  preferredContact: 'email' | 'phone' | 'either';

  // Item details
  itemType: ItemType;
  itemDescription: string;
  estimatedValue?: number;

  // When & Where
  dateLost: string;
  timeLost?: string;
  location: Location;
  circumstances: string;

  // Media
  photos: string[];

  // Status tracking
  status: LostItemStatus;
  assignedTo?: string; // detectorist ID
  assignedToName?: string;

  // Payment
  paymentStatus: PaymentStatus;
  estimatedCost: number;
  depositAmount?: number;
  finalCost?: number;
  findersFee?: number;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  recoveredAt?: Timestamp;

  // Notes
  adminNotes?: string;
  recoveryNotes?: string;
  recoveryPhotos?: string[];
}

export interface Payment {
  id: string;
  userId: string;
  itemId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentType: 'deposit' | 'full' | 'finder-fee';
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface Detectorist extends User {
  role: 'detectorist';
  availability: boolean;
  location: Location;
  specializations: string[];
  equipment: string[];
  activeJobs: number;
  completedJobs: number;
  rating?: number;
}

export interface CostEstimate {
  travelDistance: number; // km
  travelCost: number;
  labourHours: number;
  labourCost: number;
  equipmentFee: number;
  findersFeePercentage: number;
  estimatedFindersFee: number;
  subtotal: number;
  total: number;
}

export interface JobAssignment {
  itemId: string;
  detectoristId: string;
  assignedAt: Timestamp;
  acceptedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'declined';
}
