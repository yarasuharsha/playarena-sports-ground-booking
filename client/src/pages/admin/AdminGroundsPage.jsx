import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { groundsApi } from '../../api/endpoints';
import { PlusCircle, Edit3, Trash2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import GroundImage from '../../components/common/GroundImage';

const AVAILABLE_FACILITIES = [
  'Floodlights',
  'Changing Rooms',
  'Drinking Water',
  'Parking',
  'Equipment Rental',
  'Showers',
  'Locker Room',
  'Cafeteria',
  'First Aid Station'
];

export default function AdminGroundsPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState(null);

  // Fetch all grounds
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-grounds'],
    queryFn: () => groundsApi.list({ limit: 50, sortBy: 'createdAt', order: 'desc' })
  });

  const grounds = data?.data || [];

  // Create Ground Mutation
  const createMutation = useMutation({
    mutationFn: (newGround) => groundsApi.create(newGround),
    onSuccess: () => {
      setIsCreateModalOpen(false);
      setFormError(null);
      reset();
      queryClient.invalidateQueries(['admin-grounds']);
      queryClient.invalidateQueries(['grounds']);
    },
    onError: (err) => {
      setFormError(err.message || 'Failed to create sports ground.');
    }
  });

  // Deactivate Ground Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => groundsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-grounds']);
      queryClient.invalidateQueries(['grounds']);
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      sportType: 'Football',
      description: '',
      location: '',
      city: 'Bangalore',
      hourlyPrice: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      facilities: ['Floodlights', 'Changing Rooms', 'Parking']
    }
  });

  const onSubmit = (formData) => {
    setFormError(null);
    createMutation.mutate({
      ...formData,
      hourlyPrice: parseFloat(formData.hourlyPrice),
      facilities: Array.isArray(formData.facilities) ? formData.facilities : [formData.facilities]
    });
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div>
            <Link to="/admin/dashboard" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginBottom: '6px'
            }}>
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Manage Sports Grounds</h1>
          </div>

          <button
            onClick={() => { reset(); setIsCreateModalOpen(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusCircle size={18} /> Add New Ground
          </button>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <LoadingSpinner fullPage text="Loading grounds inventory..." />
        ) : isError ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
            <p>{error?.message}</p>
            <button onClick={() => refetch()} className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Arena</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Sport</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>City</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Hourly Price</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Rating</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grounds.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <GroundImage
                          src={g.imageUrl}
                          alt={g.name}
                          sportType={g.sportType}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ display: 'block', color: 'var(--text-main)' }}>{g.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.location}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge badge-sport">{g.sportType}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>{g.city}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      ₹{parseFloat(g.hourlyPrice).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>⭐ {g.rating}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: g.isActive ? '#DCFCE7' : '#FEE2E2',
                        color: g.isActive ? '#166534' : '#991B1B'
                      }}>
                        {g.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {g.isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Deactivate ground "${g.name}"?`)) {
                              deleteMutation.mutate(g.id);
                            }
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#DC2626' }}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Ground Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Sports Arena"
          maxWidth="600px"
        >
          {formError && (
            <div style={{
              padding: '10px 14px',
              background: '#FEE2E2',
              borderRadius: '6px',
              color: '#991B1B',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Ground Name</label>
              <input
                type="text"
                placeholder="e.g. StrikePoint Football Turf"
                className="form-input"
                {...register('name', { required: 'Ground name is required' })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Sport Type</label>
                <select className="form-select" {...register('sportType', { required: true })}>
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Pickleball">Pickleball</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  className="form-input"
                  {...register('city', { required: 'City is required' })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location Address</label>
              <input
                type="text"
                placeholder="e.g. 100 Feet Road, Indiranagar"
                className="form-input"
                {...register('location', { required: 'Location is required' })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Price (₹)</label>
              <input
                type="number"
                step="50"
                min="100"
                className="form-input"
                {...register('hourlyPrice', { required: 'Price is required', min: 1 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="form-input"
                {...register('imageUrl', { required: 'Image URL is required' })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                placeholder="Describe ground specifications, dimensions, turf quality..."
                className="form-textarea"
                {...register('description', { required: 'Description is required' })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Facilities</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {AVAILABLE_FACILITIES.map((fac) => (
                  <label key={fac} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    <input type="checkbox" value={fac} {...register('facilities')} />
                    <span>{fac}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary"
              >
                {createMutation.isPending ? 'Saving...' : 'Create Sports Ground'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
