import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { useAuth } from '../../context/AuthContext';
import { getLostItem, updateLostItemStatus, assignDetectorist } from '../../services/lostItemService';
import { formatCurrency } from '../../services/stripeService';
import type { LostItem } from '../../types';

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAdmin || !jobId) return;

    const fetchItem = async () => {
      try {
        const data = await getLostItem(jobId);
        setItem(data);
      } catch (error) {
        console.error('Error fetching item:', error);
        alert('Failed to load job details');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [isAdmin, jobId, navigate]);

  const handleStatusUpdate = async (newStatus: 'assigned' | 'in-progress' | 'recovered' | 'cancelled') => {
    if (!item) return;

    const confirmed = window.confirm(`Are you sure you want to mark this job as "${newStatus}"?`);
    if (!confirmed) return;

    setUpdating(true);
    try {
      await updateLostItemStatus(item.id, newStatus);
      setItem({ ...item, status: newStatus });
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading || !item) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-ocean-600 hover:text-ocean-700 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
              <p className="text-gray-600 mt-1">ID: {item.id}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              item.status === 'recovered' ? 'bg-green-100 text-green-800' :
              item.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
              item.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {item.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Item Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Item Type</label>
                  <p className="mt-1 text-gray-900 capitalize">{item.itemType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date Lost</label>
                  <p className="mt-1 text-gray-900">{item.dateLost}</p>
                </div>
                {item.timeLost && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Time Lost</label>
                    <p className="mt-1 text-gray-900">{item.timeLost}</p>
                  </div>
                )}
                {item.estimatedValue && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Value</label>
                    <p className="mt-1 text-gray-900">{formatCurrency(item.estimatedValue)}</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">{item.itemDescription}</p>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Circumstances</label>
                <p className="mt-1 text-gray-900">{item.circumstances}</p>
              </div>

              {item.photos && item.photos.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500 block mb-2">Photos</label>
                  <div className="grid grid-cols-3 gap-3">
                    {item.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Item photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>

              <p className="text-sm text-gray-600 mb-4">{item.location.address}</p>

              <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-200">
                <MapContainer
                  center={[item.location.lat, item.location.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[item.location.lat, item.location.lng]} />
                  <Circle
                    center={[item.location.lat, item.location.lng]}
                    radius={item.location.searchRadius || 100}
                    pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.1 }}
                  />
                </MapContainer>
              </div>
            </div>

            {/* Recovery Notes */}
            {item.recoveryNotes && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recovery Notes</h2>
                <p className="text-gray-900">{item.recoveryNotes}</p>

                {item.recoveryPhotos && item.recoveryPhotos.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Recovery Photos</label>
                    <div className="grid grid-cols-3 gap-3">
                      {item.recoveryPhotos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Recovery photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-gray-900">{item.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <a href={`mailto:${item.userEmail}`} className="mt-1 text-ocean-600 hover:text-ocean-700 block">
                    {item.userEmail}
                  </a>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <a href={`tel:${item.userPhone}`} className="mt-1 text-ocean-600 hover:text-ocean-700 block">
                    {item.userPhone}
                  </a>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Preferred Contact</label>
                  <p className="mt-1 text-gray-900 capitalize">{item.preferredContact}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    item.paymentStatus === 'deposit-paid' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Cost</span>
                  <span className="font-medium text-gray-900">{formatCurrency(item.estimatedCost)}</span>
                </div>
                {item.findersFee && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Finder's Fee</span>
                    <span className="font-medium text-ocean-600">{formatCurrency(item.findersFee)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment */}
            {item.assignedTo && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="mt-1 text-gray-900">{item.assignedToName || 'Unknown'}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-3">
                {item.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate('assigned')}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Assign to Detectorist
                  </button>
                )}

                {item.status === 'assigned' && (
                  <button
                    onClick={() => handleStatusUpdate('in-progress')}
                    disabled={updating}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
                  >
                    Start Recovery
                  </button>
                )}

                {(item.status === 'assigned' || item.status === 'in-progress') && (
                  <button
                    onClick={() => handleStatusUpdate('recovered')}
                    disabled={updating}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    Mark as Recovered
                  </button>
                )}

                {item.status !== 'recovered' && item.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                  >
                    Cancel Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
