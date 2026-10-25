import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groundsApi, slotsApi, bookingsApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Star,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  Info
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import GroundImage from '../components/common/GroundImage';

export default function GroundDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // Selected date state (defaults to today's local date YYYY-MM-DD)
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // 1. Fetch Ground Details
  const {
    data: groundData,
    isLoading: isGroundLoading,
    isError: isGroundError,
    error: groundError
  } = useQuery({
    queryKey: ['ground', id],
    queryFn: () => groundsApi.getById(id)
  });

  const ground = groundData?.data;

  // 2. Fetch Slots for selected ground and date
  const {
    data: slotsData,
    isLoading: isSlotsLoading,
    refetch: refetchSlots
  } = useQuery({
    queryKey: ['ground-slots', id, selectedDate],
    queryFn: () => slotsApi.getGroundSlots(id, selectedDate),
    enabled: !!id
  });

  const rawSlots = slotsData?.data || [];

  // Guarantee each time slot appears exactly once for the selected ground and date
  const slots = useMemo(() => {
    const slotMap = new Map();
    for (const slot of rawSlots) {
      if (!slotMap.has(slot.startTime)) {
        slotMap.set(slot.startTime, slot);
      } else {
        const existing = slotMap.get(slot.startTime);
        if (existing.isPast && !slot.isPast) {
          slotMap.set(slot.startTime, slot);
        }
      }
    }
    return Array.from(slotMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [rawSlots]);

  // 3. Booking Mutation with TanStack Query
  const bookingMutation = useMutation({
    mutationFn: (bookingPayload) => bookingsApi.create(bookingPayload),
    onSuccess: (response) => {
      setBookingError(null);
      setConfirmedBooking(response.data);
      setSelectedSlot(null);
      setNotes('');
      // Invalidate slots cache so the booked slot immediately flips to unavailable
      queryClient.invalidateQueries(['ground-slots', id, selectedDate]);
      queryClient.invalidateQueries(['my-bookings']);
    },
    onError: (err) => {
      setBookingError(err.message || 'Booking conflict or error occurred.');
      // Refetch slots to reflect latest database state
      refetchSlots();
    }
  });

  const handleDateChange = (newDate) => {
    if (newDate < today) {
      setBookingError('Reservations cannot be made for past dates. Please pick today or a future date.');
      setSelectedDate(newDate);
      setSelectedSlot(null);
      return;
    }
    setSelectedDate(newDate);
    setSelectedSlot(null);
    setBookingError(null);
  };

  const handleSlotSelect = (slot) => {
    if (slot.isPast || !slot.isAvailable) {
      setBookingError('This time slot is in the past or unavailable. Please choose an upcoming available slot.');
      return;
    }
    setSelectedSlot(slot);
    setBookingError(null);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/grounds/${id}` } });
      return;
    }
    if (!selectedSlot || selectedSlot.isPast || !selectedSlot.isAvailable) {
      setBookingError('Cannot book a past or unavailable slot. Please select a valid upcoming slot.');
      return;
    }

    bookingMutation.mutate({
      slotId: selectedSlot.id,
      notes: notes.trim() || undefined
    });
  };

  // Helper date buttons
  const dateOptions = [0, 1, 2, 3, 4].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { dateStr, label };
  });

  if (isGroundLoading) {
    return <LoadingSpinner fullPage text="Loading ground details..." />;
  }

  if (isGroundError || !ground) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <AlertCircle size={44} color="#EF4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: '8px' }}>Ground Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {groundError?.message || 'The requested sports facility does not exist or has been deactivated.'}
          </p>
          <Link to="/grounds" className="btn btn-primary">
            Return to Grounds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link to="/grounds" style={{ color: 'var(--text-muted)' }}>Grounds</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ground.name}</span>
        </div>

        {/* Main Grid: Ground Details (Left) + Booking System (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 0.95fr)',
          gap: '36px',
          alignItems: 'start'
        }}>
          {/* Left Column: Image, Details, Amenities */}
          <div>
            {/* Hero Image */}
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              height: '380px',
              position: 'relative',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '28px'
            }}>
              <GroundImage
                src={ground.imageUrl}
                alt={ground.name}
                sportType={ground.sportType}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
                gap: '8px'
              }}>
                <span className="badge badge-sport" style={{ background: 'rgba(11, 19, 43, 0.9)', color: '#FFFFFF' }}>
                  {ground.sportType}
                </span>
              </div>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '6px 12px',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                color: '#0F172A',
                boxShadow: 'var(--shadow-md)'
              }}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                {ground.rating} / 5.0
              </div>
            </div>

            {/* Title & Location Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
                {ground.name}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.95rem'
              }}>
                <MapPin size={18} color="var(--accent-primary)" />
                <span>{ground.location}, {ground.city}</span>
              </div>
            </div>

            {/* Description */}
            <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>About this Arena</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {ground.description}
              </p>
            </div>

            {/* Facilities & Amenities */}
            <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Facilities & Amenities</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px'
              }}>
                {ground.facilities?.map((f) => (
                  <div key={f} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.9rem',
                    color: '#334155'
                  }}>
                    <CheckCircle2 size={16} color="var(--accent-primary)" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Conflict Guarantee Note */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: '#F0FDF4',
              borderRadius: '12px',
              border: '1px solid #BBF7D0',
              color: '#166534',
              fontSize: '0.875rem'
            }}>
              <ShieldCheck size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Guaranteed Anti-Double Booking Protection:</strong> Every reservation at PlayArena is backed by PostgreSQL atomic transaction boundaries and partial unique constraints. Once confirmed, your time slot cannot be double-booked.
              </div>
            </div>
          </div>

          {/* Right Column: Slot Selection and Instant Booking */}
          <div>
            <div className="card" style={{ padding: '28px', position: 'sticky', top: '96px', boxShadow: 'var(--shadow-lg)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
                Select Date & Time Slot
              </h2>

              {/* Date Quick Pills */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> Choose Date:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {dateOptions.map((opt) => {
                    const active = selectedDate === opt.dateStr;
                    return (
                      <button
                        key={opt.dateStr}
                        type="button"
                        onClick={() => handleDateChange(opt.dateStr)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-light)',
                          background: active ? 'var(--accent-primary)' : '#FFFFFF',
                          color: active ? '#FFFFFF' : 'var(--text-main)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Date Picker Input */}
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="form-input"
                  style={{ marginTop: '10px', fontSize: '0.9rem' }}
                />
              </div>

              {/* Time Slots Grid */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 0 }}>
                    <Clock size={16} /> Available Slots ({slots.filter(s => s.isAvailable && !s.isPast).length} open):
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    🟢 Open | 🔴 Booked | ⚪ Ended
                  </span>
                </div>

                {selectedDate < today && (
                  <div style={{
                    padding: '10px 14px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    color: '#92400E',
                    fontSize: '0.8rem',
                    marginBottom: '12px'
                  }}>
                    ⚠️ You are viewing a past date. Time slots for past dates cannot be reserved.
                  </div>
                )}

                {isSlotsLoading ? (
                  <LoadingSpinner text="Checking live slot availability..." />
                ) : slots.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-light)'
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      No slots generated for {selectedDate}.
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    paddingRight: '4px'
                  }}>
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const isPast = slot.isPast || slot.status === 'ENDED' || slot.status === 'EXPIRED';
                      const isBooked = !isPast && (!slot.isAvailable || slot.status === 'BOOKED');
                      const isAvail = !isPast && !isBooked && slot.isAvailable;

                      let badgeText = 'OPEN';
                      let badgeColor = '#059669';
                      let textColor = '#065F46';
                      let bg = '#F0FDF4';
                      let border = '1px solid #A7F3D0';

                      if (isPast) {
                        badgeText = 'ENDED';
                        badgeColor = '#64748B';
                        textColor = '#64748B';
                        bg = '#F1F5F9';
                        border = '1px solid #E2E8F0';
                      } else if (isBooked) {
                        badgeText = 'BOOKED';
                        badgeColor = '#DC2626';
                        textColor = '#991B1B';
                        bg = '#FEF2F2';
                        border = '1px solid #FECACA';
                      } else if (isSelected) {
                        bg = '#ECFDF5';
                        border = '2px solid var(--accent-primary)';
                      }

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          disabled={!isAvail}
                          title={isPast ? 'This time slot has already ended.' : !isAvail ? 'This time slot is already booked.' : 'Click to select slot'}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            textAlign: 'left',
                            cursor: isAvail ? 'pointer' : 'not-allowed',
                            opacity: isAvail ? 1 : 0.6,
                            border,
                            background: bg,
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              color: textColor
                            }}>
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: badgeColor
                            }}>
                              {badgeText}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: isPast ? '#94A3B8' : 'var(--text-muted)', marginTop: '2px' }}>
                            ₹{parseFloat(slot.price).toLocaleString('en-IN')}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {bookingError && (
                <div style={{
                  padding: '12px 16px',
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  color: '#991B1B',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Selected Slot Pricing Breakdown */}
              {selectedSlot ? (
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Selected Time:</span>
                    <strong>{selectedSlot.startTime} - {selectedSlot.endTime}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Slot Fee:</span>
                    <span>₹{parseFloat(selectedSlot.price).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Taxes & Platform Fee:</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>₹0 (Free)</span>
                  </div>
                  <div style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.1rem',
                    fontWeight: 800
                  }}>
                    <span>Total Amount:</span>
                    <span style={{ color: 'var(--accent-primary)' }}>
                      ₹{parseFloat(selectedSlot.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Notes Field */}
                  <div style={{ marginTop: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>
                      Special Requests / Notes (Optional):
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. friendly match, bringing extra balls"
                      rows={2}
                      className="form-textarea"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  background: '#EFF6FF',
                  borderRadius: '8px',
                  color: '#1D4ED8',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  <Info size={16} />
                  <span>Click an available slot above to review pricing & book.</span>
                </div>
              )}

              {/* Action Button */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleBookingSubmit}
                  disabled={!selectedSlot || bookingMutation.isPending}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                >
                  {bookingMutation.isPending ? 'Confirming Reservation...' : 'Confirm & Book Slot Now'}
                </button>
              ) : (
                <Link
                  to="/login"
                  state={{ from: `/grounds/${id}` }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                >
                  Sign In to Book This Ground
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Success Modal */}
      {confirmedBooking && (
        <Modal
          isOpen={!!confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          title="Booking Confirmed!"
          maxWidth="500px"
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#DCFCE7',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              Your Ground is Reserved!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Your reservation has been atomically persisted in PostgreSQL.
            </p>

            <div style={{
              background: '#F8FAFC',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'left',
              border: '1px solid var(--border-light)',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Booking Reference:</span>
                <p style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                  {confirmedBooking.bookingReference}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ground:</span>
                <strong>{confirmedBooking.ground?.name || ground.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Time Slot:</span>
                <strong>{confirmedBooking.slot?.startTime} - {confirmedBooking.slot?.endTime}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                <strong style={{ color: '#059669' }}>₹{parseFloat(confirmedBooking.totalAmount).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Book Another Slot
              </button>
              <Link
                to="/my-bookings"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                View My Bookings <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
