import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../api/endpoints';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  MapPin
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => analyticsApi.getDashboard()
  });

  const dashboardData = data?.data;
  const summary = dashboardData?.summary || {};
  const recentBookings = dashboardData?.recentBookings || [];
  const groundsPopularity = dashboardData?.groundsPopularity || [];

  if (isLoading) {
    return <LoadingSpinner fullPage text="Compiling administrative analytics..." />;
  }

  if (isError) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '36px', maxWidth: '500px', margin: '0 auto', color: '#EF4444' }}>
          <p style={{ fontWeight: 600 }}>Error loading dashboard statistics.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{error?.message}</p>
          <button onClick={() => refetch()} className="btn btn-secondary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Top Header & Quick Actions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '36px'
        }}>
          <div>
            <span style={{ color: '#0284C7', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Management Portal
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
              Platform Operations Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/admin/grounds" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
              Manage Grounds
            </Link>
            <Link to="/admin/slots" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
              Generate Slots
            </Link>
            <Link to="/admin/bookings" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
              All Bookings
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #10B981' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL REVENUE</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '6px' }}>
              ₹{summary.totalRevenue?.toLocaleString('en-IN') || 0}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>
              From {summary.confirmedBookings || 0} confirmed bookings
            </p>
          </div>

          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #3B82F6' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIRMED BOOKINGS</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3B82F6', marginTop: '6px' }}>
              {summary.confirmedBookings || 0}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {summary.cancelledBookings || 0} cancelled reservations
            </p>
          </div>

          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #F59E0B' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SLOT UTILIZATION</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B', marginTop: '6px' }}>
              {summary.utilizationRate || 0}%
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {summary.bookedSlots || 0} / {summary.totalSlots || 0} slots reserved
            </p>
          </div>

          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #8B5CF6' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE GROUNDS</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8B5CF6', marginTop: '6px' }}>
              {summary.totalGrounds || 0}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across {groundsPopularity.length} sports categories
            </p>
          </div>
        </div>

        {/* Two-Column Layout: Grounds Popularity & Recent Bookings */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '28px'
        }}>
          {/* Ground Popularity breakdown */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
              Ground Booking Popularity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {groundsPopularity.map((ground) => (
                <div key={ground.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{ground.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {ground.totalBookings} bookings ({ground.sportType})
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: '#E2E8F0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, (ground.totalBookings / (summary.totalBookings || 1)) * 100)}%`,
                      height: '100%',
                      background: 'var(--accent-primary)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reservations Table */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Recent Reservations</h3>
              <Link to="/admin/bookings" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No bookings recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentBookings.map((b) => (
                  <div key={b.id} style={{
                    padding: '12px',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {b.ground?.name}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        User: {b.user?.name} • {b.slot?.startTime} - {b.slot?.endTime}
                      </p>
                    </div>
                    <span className={b.status === 'CONFIRMED' ? 'badge badge-confirmed' : 'badge badge-cancelled'}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
