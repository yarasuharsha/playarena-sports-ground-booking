import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  History,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import GroundImage from '../components/common/GroundImage';

export default function MyBookingsPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' | 'PAST' | 'CANCELLED'
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState(null);

  // 1. Fetch user bookings with TanStack Query - keyed strictly by authenticated user ID and tab
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-bookings', user?.id, user?.role, activeTab],
    queryFn: () => bookingsApi.list({
      tab: activeTab,
      limit: 50
    }),
    enabled: !!user?.id
  });

  const bookings = data?.data || [];

  // 2. Cancellation Mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingsApi.cancel(id, reason),
    onSuccess: () => {
      setCancellingBooking(null);
      setCancellationReason('');
      setCancelError(null);
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['ground-slots'] });
    },
    onError: (err) => {
      setCancelError(err.message || 'Failed to cancel booking.');
    }
  });

  const handleOpenCancelModal = (booking) => {
    // Safety check: Never allow cancelling past or cancelled slots
    if (activeTab !== 'UPCOMING' || booking.canCancel === false || booking.isPast) {
      return;
    }
    setCancellingBooking(booking);
    setCancellationReason('');
    setCancelError(null);
  };

  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;
    cancelMutation.mutate({
      id: cancellingBooking.id,
      reason: cancellationReason.trim() || undefined
    });
  };

  const tabs = [
    { id: 'UPCOMING', label: 'Upcoming Bookings', icon: Calendar },
    { id: 'PAST', label: 'Past Bookings', icon: History },
    { id: 'CANCELLED', label: 'Cancelled Bookings', icon: XCircle }
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Admin Switch Banner */}
        {isAdmin && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#0284C7',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  Admin View Active: Showing Your Personal Bookings
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  To inspect and manage reservations booked by all players across the platform, use the Admin Bookings Directory.
                </p>
              </div>
            </div>
            <Link
              to="/admin/bookings"
              className="btn btn-primary"
              style={{
                fontSize: '0.85rem',
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Admin – All Bookings <ArrowUpRight size={16} />
            </Link>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            My Booking Reservations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Manage your match schedule, review past games, and check reservation details.
          </p>
        </div>

        {/* Booking Tabs: A. Upcoming Bookings | B. Past Bookings | C. Cancelled Bookings */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px',
          flexWrap: 'wrap'
        }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-light)',
                  background: active ? 'var(--accent-primary)' : '#FFFFFF',
                  color: active ? '#FFFFFF' : 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: active ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {active && !isLoading && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    marginLeft: '4px'
                  }}>
                    {bookings.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner fullPage text={`Retrieving ${activeTab.toLowerCase()} reservations...`} />
        ) : isError ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Failed to retrieve bookings.</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{error?.message}</p>
            <button onClick={() => refetch()} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--text-muted)'
            }}>
              <Calendar size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
              {activeTab === 'UPCOMING'
                ? 'No Upcoming Reservations'
                : activeTab === 'PAST'
                ? 'No Past Reservations'
                : 'No Cancelled Reservations'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', maxWidth: '440px', margin: '0 auto 20px' }}>
              {activeTab === 'UPCOMING'
                ? 'You do not have any confirmed future match bookings scheduled. Reserve an arena to get playing!'
                : activeTab === 'PAST'
                ? 'You have not completed any match reservations yet. Once your scheduled matches conclude, they will appear here.'
                : 'You have not cancelled any reservations.'}
            </p>
            {activeTab === 'UPCOMING' && (
              <Link to="/grounds" className="btn btn-primary">
                Explore Sports Grounds
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';
              const isCancelled = booking.status === 'CANCELLED';
              const isPastBooking = booking.isPast;

              // Display status: in Past tab, confirmed bookings are presented as COMPLETED
              const displayStatus = isCancelled
                ? 'CANCELLED'
                : isPastBooking
                ? 'COMPLETED'
                : 'CONFIRMED';

              const formattedDate = booking.slot?.date
                ? new Date(booking.slot.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Date N/A';

              // Determine border color based on status
              const borderLeftColor = isCancelled
                ? '#94A3B8'
                : isPastBooking
                ? '#3B82F6'
                : 'var(--accent-primary)';

              // Status badge style
              const badgeStyle = isCancelled
                ? { background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }
                : isPastBooking
                ? { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }
                : { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' };

              return (
                <div key={booking.id} className="card" style={{
                  padding: '24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '24px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${borderLeftColor}`,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {/* Left Column: Ground & Time Details */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                    {booking.ground?.imageUrl && (
                      <GroundImage
                        src={booking.ground.imageUrl}
                        alt={booking.ground.name}
                        sportType={booking.ground.sportType}
                        style={{
                          width: '95px',
                          height: '95px',
                          borderRadius: '12px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="badge badge-sport">{booking.ground?.sportType}</span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            ...badgeStyle
                          }}
                        >
                          {displayStatus}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                        {booking.ground?.name}
                      </h3>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={14} color="var(--accent-primary)" />
                          {formattedDate}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={14} color="var(--accent-primary)" />
                          {booking.slot?.startTime} - {booking.slot?.endTime}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={14} color="var(--accent-primary)" />
                          {booking.ground?.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Reference & Notes */}
                  <div style={{ minWidth: '180px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Booking Reference
                    </span>
                    <p style={{
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      marginTop: '2px'
                    }}>
                      {booking.bookingReference}
                    </p>
                    {booking.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '240px' }}>
                        <em>"{booking.notes}"</em>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Price and Cancellation Action */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    textAlign: 'right',
                    minWidth: '180px',
                    justifyContent: 'flex-end'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Paid</span>
                      <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        ₹{parseFloat(booking.totalAmount).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* NEVER show Cancel button for past bookings or cancelled bookings */}
                    {activeTab === 'UPCOMING' && booking.canCancel !== false && !isPastBooking && isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(booking)}
                        className="btn btn-secondary"
                        style={{
                          color: '#DC2626',
                          borderColor: '#FCA5A5',
                          padding: '8px 16px',
                          fontSize: '0.85rem'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      {cancellingBooking && (
        <Modal
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          title="Confirm Booking Cancellation"
          maxWidth="460px"
        >
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px',
              background: '#FEF2F2',
              borderRadius: '8px',
              color: '#991B1B',
              marginBottom: '20px'
            }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem' }}>
                Are you sure you want to cancel reservation <strong>{cancellingBooking.bookingReference}</strong>? The time slot will immediately be restored for other players to reserve.
              </p>
            </div>

            {cancelError && (
              <p style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '14px' }}>
                {cancelError}
              </p>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Reason for Cancellation (Optional)</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Weather, rescheduling team match"
                rows={2}
                className="form-textarea"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="btn btn-secondary"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
                className="btn btn-danger"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
