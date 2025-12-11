import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MapPicker from '../components/MapPicker';
import CostEstimator from '../components/CostEstimator';
import { createLostItem, uploadItemPhotos } from '../services/lostItemService';
import type { Location, ItemType, CostEstimate } from '../types';

const itemTypes: { value: ItemType; label: string }[] = [
  { value: 'ring', label: 'Ring' },
  { value: 'key', label: 'Keys' },
  { value: 'watch', label: 'Watch' },
  { value: 'phone', label: 'Phone' },
  { value: 'necklace', label: 'Necklace' },
  { value: 'bracelet', label: 'Bracelet' },
  { value: 'earring', label: 'Earring' },
  { value: 'heirloom', label: 'Heirloom' },
  { value: 'coin', label: 'Coin/Medallion' },
  { value: 'other', label: 'Other' }
];

const formSchema = z.object({
  itemType: z.string().min(1, 'Please select an item type'),
  itemDescription: z.string().min(10, 'Please provide at least 10 characters'),
  estimatedValue: z.number().min(0).optional(),
  dateLost: z.string().min(1, 'Please select a date'),
  timeLost: z.string().optional(),
  circumstances: z.string().min(20, 'Please provide at least 20 characters'),
  userName: z.string().min(2, 'Name is required'),
  userEmail: z.string().email('Invalid email address'),
  userPhone: z.string().min(10, 'Valid phone number required'),
  preferredContact: z.enum(['email', 'phone', 'either'])
});

type FormData = z.infer<typeof formSchema>;

const ReportLostItem: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<Location | null>(null);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const estimatedValue = watch('estimatedValue') || 0;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - photos.length);
      setPhotos([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (!location) {
      alert('Please select a location on the map');
      return;
    }

    if (!costEstimate) {
      alert('Cost estimate not calculated');
      return;
    }

    setLoading(true);

    try {
      // Create the lost item entry
      const itemId = await createLostItem({
        userId: 'anonymous', // Will be updated if user logs in
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        preferredContact: data.preferredContact,
        itemType: data.itemType as ItemType,
        itemDescription: data.itemDescription,
        estimatedValue: data.estimatedValue,
        dateLost: data.dateLost,
        timeLost: data.timeLost,
        location,
        circumstances: data.circumstances,
        photos: [],
        estimatedCost: costEstimate.total,
        findersFee: costEstimate.estimatedFindersFee
      });

      // Upload photos if any
      if (photos.length > 0) {
        await uploadItemPhotos(itemId, photos);
      }

      // Navigate to checkout
      navigate(`/checkout/${itemId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit your report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    return (
      <>
        {/* Step 1 - Item Details */}
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us what you lost</h2>
              <p className="text-gray-600">Provide details to help us locate your item</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What did you lose? *
              </label>
              <select
                {...register('itemType')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              >
                <option value="">Select item type</option>
                {itemTypes.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              {errors.itemType && (
                <p className="mt-1 text-sm text-red-600">{errors.itemType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('itemDescription')}
                rows={4}
                placeholder="e.g., White gold wedding band with small diamond, engraved with initials 'AB & CD'"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
              {errors.itemDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.itemDescription.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Value (optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  {...register('estimatedValue', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This helps calculate the finder's fee (if recovered)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (optional, max 5)
              </label>
              <div className="space-y-3">
                {photos.length < 5 && (
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-ocean-500 hover:bg-ocean-50 transition-colors">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Click to upload photos</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-ocean-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-ocean-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>

        {/* Step 2 - Location & Circumstances */}
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-ocean-600 hover:text-ocean-700 mb-4 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">When and where?</h2>
              <p className="text-gray-600">Help us narrow down the search area</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Lost *
                </label>
                <input
                  type="date"
                  {...register('dateLost')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
                {errors.dateLost && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateLost.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approximate Time
                </label>
                <input
                  type="time"
                  {...register('timeLost')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>
            </div>

            <MapPicker onLocationSelect={setLocation} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What were you doing when you lost it? *
              </label>
              <textarea
                {...register('circumstances')}
                rows={4}
                placeholder="e.g., I was swimming at the beach, came back to towel, and noticed my ring was missing"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
              {errors.circumstances && (
                <p className="mt-1 text-sm text-red-600">{errors.circumstances.message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!location}
              className="w-full bg-ocean-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-ocean-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue to Contact Info
            </button>
          </div>
        </div>

        {/* Step 3 - Contact Information */}
        <div style={{ display: step === 3 ? 'block' : 'none' }}>
          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-ocean-600 hover:text-ocean-700 mb-4 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your contact information</h2>
              <p className="text-gray-600">We'll keep you updated on the recovery</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register('userName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
              {errors.userName && (
                <p className="mt-1 text-sm text-red-600">{errors.userName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register('userEmail')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
              {errors.userEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.userEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('userPhone')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
              {errors.userPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.userPhone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method *
              </label>
              <div className="space-y-2">
                {(['email', 'phone', 'either'] as const).map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      value={method}
                      {...register('preferredContact')}
                      className="mr-3 text-ocean-600 focus:ring-ocean-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full bg-ocean-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-ocean-700 transition-colors"
            >
              Continue to Cost Estimate
            </button>
          </div>
        </div>

        {/* Step 4 - Cost Estimate & Payment */}
        <div style={{ display: step === 4 ? 'block' : 'none' }}>
          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-ocean-600 hover:text-ocean-700 mb-4 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recovery cost estimate</h2>
              <p className="text-gray-600">Based on location and estimated effort</p>
            </div>

            {location && (
              <CostEstimator
                travelDistanceKm={15}
                estimatedItemValue={estimatedValue}
                onEstimateCalculated={setCostEstimate}
              />
            )}

            <button
              type="submit"
              disabled={loading || !costEstimate}
              className="w-full bg-ocean-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-ocean-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-sand-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? 'bg-ocean-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-ocean-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Item Details</span>
            <span>Location</span>
            <span>Contact</span>
            <span>Cost</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {renderStep()}
        </form>
      </div>
    </div>
  );
};

export default ReportLostItem;
