import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL hash
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id found in URL');
          navigate('/login');
          return;
        }

        // Exchange session_id for our app's JWT token
        const response = await axios.post(`${API}/auth/google/session`, {
          session_id: sessionId
        });

        const { access_token, user } = response.data;

        // Store token and user data
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        // Navigate to dashboard based on user role
        if (user.role === 'customer') {
          navigate('/my-orders', { state: { user }, replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin', { state: { user }, replace: true });
        } else if (user.role === 'kitchen_staff') {
          navigate('/kitchen', { state: { user }, replace: true });
        } else if (user.role === 'delivery_partner') {
          navigate('/delivery', { state: { user }, replace: true });
        } else {
          navigate('/', { state: { user }, replace: true });
        }

        // Force page reload to update auth context
        window.location.reload();
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to login on failure
        navigate('/login');
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
        <p className="text-lg text-gray-600">Signing you in...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait while we verify your account</p>
      </div>
    </div>
  );
};

export default AuthCallback;
