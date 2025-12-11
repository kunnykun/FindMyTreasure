import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError('You must be signed in to set up admin access');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create/Update user document with admin role
      await setDoc(doc(db, 'users', currentUser.uid), {
        id: currentUser.uid,
        email: currentUser.email,
        name: name || currentUser.displayName || 'Admin User',
        phone: phone || '',
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
        window.location.reload(); // Reload to refresh auth context
      }, 2000);
    } catch (err: any) {
      console.error('Error setting up admin:', err);
      setError(err.message || 'Failed to set up admin access');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-sand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Signed In</h2>
          <p className="text-gray-600 mb-6">
            You must be signed in to set up admin access.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-ocean-600 text-white px-6 py-2 rounded-lg hover:bg-ocean-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-sand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Granted!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been set up with admin privileges.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-sand-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ocean-600 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Setup</h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete your profile and grant admin access
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Current User:</strong> {currentUser.email}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+61 400 000 000"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ocean-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting Up Admin Access...
              </span>
            ) : (
              'Grant Admin Access'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
