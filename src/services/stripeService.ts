import { loadStripe, Stripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { CostEstimate } from '../types';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export interface CreateCheckoutSessionParams {
  itemId: string;
  amount: number;
  paymentType: 'deposit' | 'full';
  customerEmail: string;
  itemDescription: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Creates a Stripe Checkout session via Firebase Cloud Function
 */
export const createCheckoutSession = async (
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResponse> => {
  const createSession = httpsCallable<CreateCheckoutSessionParams, CheckoutSessionResponse>(
    functions,
    'createCheckoutSession'
  );

  try {
    const result = await createSession(params);
    return result.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create payment session');
  }
};

/**
 * Redirects to Stripe Checkout
 */
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    console.error('Stripe redirect error:', error);
    throw error;
  }
};

/**
 * Calculates cost estimate based on location and item details
 */
export const calculateCostEstimate = (
  travelDistanceKm: number,
  estimatedHours: number = 2,
  itemValue: number = 0
): CostEstimate => {
  const baseRatePerHour = parseFloat(import.meta.env.VITE_BASE_RATE_PER_HOUR || '75');
  const travelRatePerKm = parseFloat(import.meta.env.VITE_TRAVEL_RATE_PER_KM || '2');
  const findersFeePercentage = parseFloat(import.meta.env.VITE_FINDERS_FEE_PERCENTAGE || '10');

  const travelCost = travelDistanceKm * travelRatePerKm;
  const labourCost = estimatedHours * baseRatePerHour;
  const equipmentFee = 50; // Base equipment fee
  const estimatedFindersFee = itemValue > 0 ? (itemValue * findersFeePercentage) / 100 : 0;

  const subtotal = travelCost + labourCost + equipmentFee;
  const total = subtotal + estimatedFindersFee;

  return {
    travelDistance: travelDistanceKm,
    travelCost,
    labourHours: estimatedHours,
    labourCost,
    equipmentFee,
    findersFeePercentage,
    estimatedFindersFee,
    subtotal,
    total
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'AUD'): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency
  }).format(amount);
};
