import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { getLostItem } from '../services/lostItemService';
import { createCheckoutSession, getStripe, formatCurrency } from '../services/stripeService';
import type { LostItem } from '../types';

const Checkout: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;

      try {
        const itemData = await getLostItem(itemId);
        setItem(itemData);
      } catch (error) {
        console.error('Error fetching item:', error);
        alert('Failed to load item details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, navigate]);

  const handlePayment = async () => {
    if (!item) return;

    setProcessing(true);

    try {
      const depositAmount = item.estimatedCost * 0.5; // 50% deposit
      const amount = paymentType === 'deposit' ? depositAmount : item.estimatedCost;

      console.log('Creating checkout session...', {
        itemId: item.id,
        amount: amount * 100,
        paymentType,
        customerEmail: item.userEmail
      });

      const session = await createCheckoutSession({
        itemId: item.id,
        amount: amount * 100, // Convert to cents
        paymentType,
        customerEmail: item.userEmail,
        itemDescription: `Recovery service for ${item.itemType}`
      });

      console.log('Checkout session created:', session);

      // Redirect to Stripe Checkout using the URL
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Failed to process payment: ${error.message || 'Please try again.'}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Item not found</p>
        </div>
      </div>
    );
  }

  const depositAmount = item.estimatedCost * 0.5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-sand-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Secure your recovery appointment with payment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recovery Details</h2>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Item Type</span>
                  <span className="font-medium text-gray-900 capitalize">{item.itemType}</span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs truncate">
                    {item.location.address}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Date Lost</span>
                  <span className="font-medium text-gray-900">{item.dateLost}</span>
                </div>

                <div className="py-3">
                  <span className="text-gray-600 block mb-2">Description</span>
                  <p className="text-sm text-gray-700">{item.itemDescription}</p>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Options</h2>

              <div className="space-y-3">
                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-ocean-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentType"
                    value="deposit"
                    checked={paymentType === 'deposit'}
                    onChange={(e) => setPaymentType(e.target.value as 'deposit')}
                    className="mt-1 text-ocean-600 focus:ring-ocean-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Pay Deposit (50%)</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay {formatCurrency(depositAmount)} now, balance due upon recovery
                        </p>
                      </div>
                      <span className="text-lg font-bold text-ocean-600">
                        {formatCurrency(depositAmount)}
                      </span>
                    </div>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-ocean-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={paymentType === 'full'}
                    onChange={(e) => setPaymentType(e.target.value as 'full')}
                    className="mt-1 text-ocean-600 focus:ring-ocean-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Pay in Full</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay the complete amount now (excluding finder's fee)
                        </p>
                      </div>
                      <span className="text-lg font-bold text-ocean-600">
                        {formatCurrency(item.estimatedCost)}
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full mt-6 bg-ocean-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-ocean-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Secure Payment
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secured by Stripe
              </div>
            </div>
          </div>

          {/* Cost Breakdown Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.estimatedCost - (item.findersFee || 0))}
                  </span>
                </div>

                {item.findersFee && item.findersFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Fee</span>
                    <span className="font-medium text-ocean-600">
                      {formatCurrency(item.findersFee)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-ocean-600">
                      {formatCurrency(item.estimatedCost)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-sand-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-gray-900 mb-2">What's included:</p>
                <ul className="space-y-1 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-ocean-600 mr-2">✓</span>
                    Professional metal detection
                  </li>
                  <li className="flex items-start">
                    <span className="text-ocean-600 mr-2">✓</span>
                    Travel to location
                  </li>
                  <li className="flex items-start">
                    <span className="text-ocean-600 mr-2">✓</span>
                    Recovery documentation
                  </li>
                  <li className="flex items-start">
                    <span className="text-ocean-600 mr-2">✓</span>
                    Safe item return
                  </li>
                </ul>
              </div>

              {item.findersFee && item.findersFee > 0 && (
                <div className="mt-4 p-3 bg-ocean-50 rounded-lg text-xs text-gray-600">
                  <strong className="text-ocean-700">Note:</strong> Success fee is only charged if your item is successfully recovered.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
