import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import NewLandingPage from '@/pages/NewLandingPage';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderTrackingPage from '@/pages/OrderTrackingPage';
import AdminDashboard from '@/pages/AdminDashboard';
import WaiterDashboard from '@/pages/WaiterDashboard';
import KitchenDashboard from '@/pages/KitchenDashboard';
import DeliveryDashboard from '@/pages/DeliveryDashboard';
import CustomerDashboard from '@/pages/CustomerDashboard';
import AuthCallback from '@/pages/AuthCallback';
import '@/App.css';

// Register Service Worker for PWA
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered successfully', registration.scope);
        })
        .catch((error) => {
          console.log('PWA: Service Worker registration failed', error);
        });
    });
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  // Must be synchronous during render to prevent race conditions
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<NewLandingPage />} />
      <Route path="/order" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-tracking" element={<OrderTrackingPage />} />
      <Route path="/track/:orderId" element={<OrderTrackingPage />} />
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* Waiter module temporarily disabled
      <Route
        path="/waiter"
        element={
          <ProtectedRoute allowedRoles={['waiter']}>
            <WaiterDashboard />
          </ProtectedRoute>
        }
      />
      */}
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRoles={['kitchen_staff']}>
            <KitchenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery"
        element={
          <ProtectedRoute allowedRoles={['delivery_partner']}>
            <DeliveryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/branch-manager"
        element={
          <ProtectedRoute allowedRoles={['branch_manager', 'admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <AppRoutes />
          <PWAInstallPrompt />
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;