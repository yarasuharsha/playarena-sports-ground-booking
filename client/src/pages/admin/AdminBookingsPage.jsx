import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, groundsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Search,
  Filter,
  X,
  User,
  Shield,
  Layers
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [groundFilter, setGroundFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState(null);

  // Fetch grounds list for ground filter dropdown
  const { data: groundsData } = useQuery({
    queryKey: ['admin-filter-grounds'],
    queryFn: () => groundsApi.list({ limit: 50 })
  });
  const availableGrounds = groundsData?.data || [];

  // Fetch all bookings for admin using dedicated admin endpoint
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-bookings', user?.id, statusFilter, groundFilter, dateFilter, search, page],
    queryFn: () => bookingsApi.listAll({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      groundId: groundFilter || undefined,
      date: dateFilter || undefined,
      search: search.trim() || undefined,
      page,
      limit: 10
    }),
    enabled: !!user && user.role === 'ADMIN',
    keepPreviousData: true
  });

  const bookings = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingsApi.cancel(id, reason),
    onSuccess: () => {
      setCancellingBooking(null);
      setCancelReason('');
      setCancelError(null);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ground-slots'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err) => {
      setCancelError(err.message || 'Failed to cancel reservation.');
    }
  });

  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;
    cancelMutation.mutate({
      id: cancellingBooking.id,
      reason: cancelReason || 'Administrative cancellation'
    });
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setGroundFilter('');
    setDateFilter('');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = statusFilter !== 'ALL' || groundFilter !== '' || dateFilter !== '' || search !== '';

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/admin/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: '8px'
          }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Admin – All Platform Bookings
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Complete administrative directory of match reservations across all registered players and arenas.
              </p>
            </div>
            {!isLoading && (
              <span style={{
                background: '#F1F5F9',
                color: 'var(--text-main)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '1px solid var(--border-light)'
              }}>
                {meta.total} Total Reservations
              </span>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'flex-end'
          }}>
            {/* Search Input */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} /> Search Player or Ref:
              </label>
              <input
                type="text"
                placeholder="Name, email, or PA-..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} /> Reservation Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Ground Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Filter by Arena:
              </label>
              <select
                value={groundFilter}
                onChange={(e) => { setGroundFilter(e.target.value); setPage(1); }}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              >
                <option value="">All Arenas</option>
                {availableGrounds.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} ({g.sportType})</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Filter by Date:
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              />
            </div>

            {/* Reset Filters Action */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <X size={14} /> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <LoadingSpinner fullPage text="Retrieving platform reservations..." />
        ) : isError ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#EF4444' }}>
            <p>{error?.message || 'Failed to load bookings'}</p>
            <button onClick={() => refetch()} className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Calendar size={44} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3>No Reservations Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              {hasActiveFilters
                ? 'No bookings match your selected filter criteria. Try clearing some filters.'
                : 'No bookings are currently recorded on the platform.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-secondary"
                style={{ marginTop: '16px' }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="card" style={{ overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Booking Ref</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Player Account</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Arena / Sport</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Slot Schedule</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const formattedDate = b.slot?.date
                      ? new Date(b.slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'N/A';

                    const isConfirmed = b.status === 'CONFIRMED';
                    const isCancelled = b.status === 'CANCELLED';
                    const isPast = b.isPast;

                    // Display badge
                    const badgeText = isCancelled
                      ? 'CANCELLED'
                      : isPast
                      ? 'COMPLETED'
                      : 'CONFIRMED';

                    const badgeStyle = isCancelled
                      ? { background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }
                      : isPast
                      ? { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }
                      : { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' };

                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>
                          {b.bookingReference}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <strong style={{ color: 'var(--text-main)' }}>{b.user?.name || 'Unknown Player'}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {b.user?.email}
                          </span>
                          {b.user?.phone && (
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              📞 {b.user.phone}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <strong style={{ color: 'var(--text-main)' }}>{b.ground?.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {b.ground?.sportType} • {b.ground?.city}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 600 }}>{formattedDate}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ⏱ {b.slot?.startTime} - {b.slot?.endTime}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                          ₹{parseFloat(b.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            ...badgeStyle
                          }}>
                            {badgeText}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          {isConfirmed && !isPast && (
                            <button
                              onClick={() => { setCancellingBooking(b); setCancelReason(''); setCancelError(null); }}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </>
        )}

        {/* Cancellation Modal */}
        {cancellingBooking && (
          <Modal
            isOpen={!!cancellingBooking}
            onClose={() => setCancellingBooking(null)}
            title="Admin Booking Cancellation"
            maxWidth="480px"
          >
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#FEF2F2',
                borderRadius: '8px',
                color: '#991B1B',
                marginBottom: '16px',
                fontSize: '0.85rem'
              }}>
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <span>
                  Cancelling will mark booking <strong>{cancellingBooking.bookingReference}</strong> as CANCELLED and restore the time slot for other players.
                </span>
              </div>

              {cancelError && (
                <p style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '14px' }}>
                  {cancelError}
                </p>
              )}

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Administrative Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Facility emergency maintenance / tournament reschedule"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="btn btn-secondary"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelMutation.isPending}
                  className="btn btn-danger"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
