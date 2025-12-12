import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import ReportLostItem from './pages/ReportLostItem';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AdminSetup from './pages/AdminSetup';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobDetails from './pages/admin/JobDetails';
import './index.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading, currentUser } = useAuth();
  const location = useLocation();

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

  if (!currentUser) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Logged in but not admin
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard. Please contact an administrator to grant you access.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-ocean-600 text-white px-6 py-2 rounded-lg hover:bg-ocean-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report-lost-item" element={<ReportLostItem />} />
        <Route path="/checkout/:itemId" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<AdminSetup />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs/:jobId"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
