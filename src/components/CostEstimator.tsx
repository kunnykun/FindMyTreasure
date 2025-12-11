import React, { useState, useEffect } from 'react';
import { calculateCostEstimate, formatCurrency } from '../services/stripeService';
import type { CostEstimate } from '../types';

interface CostEstimatorProps {
  travelDistanceKm: number;
  estimatedItemValue?: number;
  onEstimateCalculated: (estimate: CostEstimate) => void;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({
  travelDistanceKm,
  estimatedItemValue = 0,
  onEstimateCalculated
}) => {
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [labourHours, setLabourHours] = useState(2);

  useEffect(() => {
    const newEstimate = calculateCostEstimate(
      travelDistanceKm,
      labourHours,
      estimatedItemValue
    );
    setEstimate(newEstimate);
    onEstimateCalculated(newEstimate);
  }, [travelDistanceKm, labourHours, estimatedItemValue, onEstimateCalculated]);

  if (!estimate) return null;

  return (
    <div className="bg-white border-2 border-ocean-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cost Estimate</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-ocean-100 text-ocean-800">
          Estimate
        </span>
      </div>

      <div className="space-y-3">
        {/* Travel Cost */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Travel</p>
            <p className="text-xs text-gray-500">{estimate.travelDistance.toFixed(1)} km</p>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(estimate.travelCost)}
          </p>
        </div>

        {/* Labour Cost */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Labour</p>
            <div className="flex items-center mt-1 space-x-2">
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={labourHours}
                onChange={(e) => setLabourHours(parseFloat(e.target.value))}
                className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ocean-600"
              />
              <span className="text-xs text-gray-500 min-w-[60px]">
                {labourHours} {labourHours === 1 ? 'hour' : 'hours'}
              </span>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(estimate.labourCost)}
          </p>
        </div>

        {/* Equipment Fee */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Equipment</p>
            <p className="text-xs text-gray-500">Metal detector & tools</p>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(estimate.equipmentFee)}
          </p>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">Subtotal</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(estimate.subtotal)}
          </p>
        </div>

        {/* Finder's Fee */}
        {estimatedItemValue > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-ocean-700">Success Fee</p>
              <p className="text-xs text-gray-500">
                {estimate.findersFeePercentage}% of item value (if recovered)
              </p>
            </div>
            <p className="text-sm font-semibold text-ocean-700">
              {formatCurrency(estimate.estimatedFindersFee)}
            </p>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
          <p className="text-lg font-bold text-gray-900">Estimated Total</p>
          <p className="text-2xl font-bold text-ocean-600">
            {formatCurrency(estimate.total)}
          </p>
        </div>
      </div>

      <div className="bg-sand-50 rounded-lg p-4 mt-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-ocean-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">How it works</p>
            <ul className="text-xs text-gray-600 mt-1 space-y-1">
              <li>• Pay a deposit to secure your recovery appointment</li>
              <li>• Balance due upon successful recovery</li>
              <li>• Success fee only applies if item is found</li>
              <li>• Full refund if we can't locate the search area</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimator;
