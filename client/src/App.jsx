import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded route components for performance optimization
const HomePage = lazy(() => import('./pages/HomePage'));
const GroundsPage = lazy(() => import('./pages/GroundsPage'));
const GroundDetailsPage = lazy(() => import('./pages/GroundDetailsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminGroundsPage = lazy(() => import('./pages/admin/AdminGroundsPage'));
const AdminSlotsPage = lazy(() => import('./pages/admin/AdminSlotsPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Suspense fallback={<LoadingSpinner fullPage text="Loading PlayArena view..." />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/grounds" element={<GroundsPage />} />
                    <Route path="/grounds/:id" element={<GroundDetailsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Authenticated Player Routes */}
                    <Route
                      path="/my-bookings"
                      element={
                        <ProtectedRoute>
                          <MyBookingsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Admin Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <AdminRoute>
                          <AdminDashboardPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/grounds"
                      element={
                        <AdminRoute>
                          <AdminGroundsPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/slots"
                      element={
                        <AdminRoute>
                          <AdminSlotsPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/bookings"
                      element={
                        <AdminRoute>
                          <AdminBookingsPage />
                        </AdminRoute>
                      }
                    />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
