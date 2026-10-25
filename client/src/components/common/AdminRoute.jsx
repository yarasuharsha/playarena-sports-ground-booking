import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage text="Verifying administrative credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '36px' }}>
          <h2 style={{ color: '#EF4444', marginBottom: '12px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            This management zone is reserved exclusively for PlayArena administrators. Please sign in with an administrator account to access.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
}
