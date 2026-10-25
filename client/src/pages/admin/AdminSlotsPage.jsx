import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groundsApi, slotsApi } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import { Calendar, Clock, PlusCircle, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DEFAULT_SLOT_TIMES = [
  { startTime: '06:00', endTime: '07:00' },
  { startTime: '07:00', endTime: '08:00' },
  { startTime: '08:00', endTime: '09:00' },
  { startTime: '16:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '18:00' },
  { startTime: '18:00', endTime: '19:00' },
  { startTime: '19:00', endTime: '20:00' },
  { startTime: '20:00', endTime: '21:00' }
];

export default function AdminSlotsPage() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const [selectedGroundId, setSelectedGroundId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [days, setDays] = useState(7);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch grounds list for selector
  const { data: groundsData, isLoading: isGroundsLoading } = useQuery({
    queryKey: ['admin-grounds-list'],
    queryFn: () => groundsApi.list({ limit: 50 })
  });

  const grounds = groundsData?.data || [];

  // Batch generation mutation
  const batchMutation = useMutation({
    mutationFn: (payload) => slotsApi.batchGenerate(payload),
    onSuccess: (res) => {
      setSuccessMessage(res.data?.message || 'Slots generated successfully!');
      setErrorMessage(null);
      queryClient.invalidateQueries(['ground-slots']);
      queryClient.invalidateQueries(['admin-dashboard']);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to generate slots.');
      setSuccessMessage(null);
    }
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!selectedGroundId) {
      setErrorMessage('Please select a target sports ground.');
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    batchMutation.mutate({
      groundId: parseInt(selectedGroundId, 10),
      startDate,
      days: parseInt(days, 10),
      slotTimes: DEFAULT_SLOT_TIMES
    });
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        <Link to="/admin/dashboard" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Batch Generate Time Slots</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Generate recurring 1-hour availability slots across calendar days for any active arena.
          </p>
        </div>

        {successMessage && (
          <div style={{
            padding: '16px',
            background: '#DCFCE7',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            color: '#166534',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle2 size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div style={{
            padding: '16px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '10px',
            color: '#991B1B',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="card" style={{ padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          {isGroundsLoading ? (
            <LoadingSpinner text="Loading grounds..." />
          ) : (
            <form onSubmit={handleGenerate}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Select Ground Arena</label>
                <select
                  value={selectedGroundId}
                  onChange={(e) => setSelectedGroundId(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">-- Choose Arena --</option>
                  {grounds.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.sportType} - {g.city}) • ₹{parseFloat(g.hourlyPrice)}/hr
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (Days)</label>
                  <select
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="form-select"
                  >
                    <option value={3}>3 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                  </select>
                </div>
              </div>

              {/* Slot Schedule preview */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '28px'
              }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                  Standard Daily Time Schedule ({DEFAULT_SLOT_TIMES.length} slots/day):
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  {DEFAULT_SLOT_TIMES.map((t, idx) => (
                    <div key={idx} style={{ background: '#FFFFFF', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                      ⏱ {t.startTime} - {t.endTime}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '10px' }}>
                  Total slots to be generated: <strong>{DEFAULT_SLOT_TIMES.length * parseInt(days, 10)} slots</strong>. Existing slots are safely preserved (skipped on conflict).
                </p>
              </div>

              <button
                type="submit"
                disabled={batchMutation.isPending}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                {batchMutation.isPending ? 'Generating Slots in Database...' : 'Generate Time Slots in Database'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
