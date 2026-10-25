import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { groundsApi } from '../api/endpoints';
import {
  Search,
  Filter,
  MapPin,
  Star,
  SlidersHorizontal,
  RotateCcw,
  Calendar,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import GroundImage from '../components/common/GroundImage';

const SPORTS = ['All', 'Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Pickleball'];
const CITIES = ['All', 'Bangalore', 'Hyderabad', 'Mumbai'];

export default function GroundsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL search params for seamless browser back/forward and bookmarking
  const sportType = searchParams.get('sportType') || 'All';
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || 'All';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  // Local search input state for smooth typing
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Query Grounds with TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grounds', { sportType, search, city, minPrice, maxPrice, sortBy, order, page }],
    queryFn: () => groundsApi.list({
      sportType: sportType === 'All' ? undefined : sportType,
      search: search || undefined,
      city: city === 'All' ? undefined : city,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sortBy,
      order,
      page,
      limit: 6
    }),
    keepPreviousData: true
  });

  const grounds = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') {
      nextParams.set('page', '1');
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Discover Sports Arenas & Grounds
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Browse top-rated facilities, filter by your favorite sport, and reserve verified time slots.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="card" style={{ padding: '24px', marginBottom: '36px', boxShadow: 'var(--shadow-sm)' }}>
          {/* Top row: Search and Sort */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
              minWidth: '280px',
              maxWidth: '520px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0 12px',
                background: '#FFFFFF'
              }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search arenas by name, address, or amenity..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    padding: '10px 0',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
                Search
              </button>
            </form>

            {/* Sort & City controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>City:</span>
                <select
                  value={city}
                  onChange={(e) => updateParam('city', e.target.value)}
                  className="form-select"
                  style={{ padding: '8px 12px', width: 'auto', fontSize: '0.85rem' }}
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort By:</span>
                <select
                  value={`${sortBy}-${order}`}
                  onChange={(e) => {
                    const [newSortBy, newOrder] = e.target.value.split('-');
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.set('sortBy', newSortBy);
                    nextParams.set('order', newOrder);
                    setSearchParams(nextParams);
                  }}
                  className="form-select"
                  style={{ padding: '8px 12px', width: 'auto', fontSize: '0.85rem' }}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="hourlyPrice-asc">Price: Low to High</option>
                  <option value="hourlyPrice-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>

              {(search || sportType !== 'All' || city !== 'All' || minPrice || maxPrice) && (
                <button
                  onClick={handleResetFilters}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#EF4444' }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Sport Categories Tabs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '16px'
          }}>
            {SPORTS.map((sport) => {
              const active = sportType === sport;
              return (
                <button
                  key={sport}
                  onClick={() => updateParam('sportType', sport)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '30px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-light)',
                    background: active ? 'var(--accent-primary)' : '#FFFFFF',
                    color: active ? '#FFFFFF' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results summary bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-main)' }}>{grounds.length}</strong> of{' '}
            <strong style={{ color: 'var(--text-main)' }}>{meta.total}</strong> available grounds
          </p>
        </div>

        {/* Grounds Grid / States */}
        {isLoading ? (
          <LoadingSpinner fullPage text="Loading sports grounds from database..." />
        ) : isError ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Failed to load grounds.</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{error?.message}</p>
            <button onClick={() => refetch()} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        ) : grounds.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--text-muted)'
            }}>
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Sports Grounds Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              We could not find any venues matching your current search or filter parameters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '28px'
            }}>
              {grounds.map((ground) => (
                <div key={ground.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Image Container */}
                  <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                    <GroundImage
                      src={ground.imageUrl}
                      alt={ground.name}
                      sportType={ground.sportType}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <span className="badge badge-sport" style={{ background: 'rgba(11, 19, 43, 0.85)', color: '#FFFFFF' }}>
                        {ground.sportType}
                      </span>
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(255, 255, 255, 0.92)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: '#0F172A'
                    }}>
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      {ground.rating}
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                      {ground.name}
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      marginBottom: '12px'
                    }}>
                      <MapPin size={16} color="var(--accent-primary)" />
                      <span>{ground.location}, {ground.city}</span>
                    </div>

                    <p style={{
                      fontSize: '0.875rem',
                      color: '#475569',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {ground.description}
                    </p>

                    {/* Facilities Tags */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '20px'
                    }}>
                      {ground.facilities?.slice(0, 3).map((f) => (
                        <span key={f} style={{
                          background: '#F1F5F9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: '#475569'
                        }}>
                          {f}
                        </span>
                      ))}
                      {ground.facilities?.length > 3 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                          +{ground.facilities.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Footer / Pricing & CTA */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price per hour</span>
                        <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                          ₹{parseFloat(ground.hourlyPrice).toLocaleString('en-IN')}{' '}
                          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ hr</span>
                        </p>
                      </div>

                      <Link
                        to={`/grounds/${ground.id}`}
                        className="btn btn-primary"
                        style={{ padding: '9px 18px', fontSize: '0.875rem' }}
                      >
                        Book Slot
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(newPage) => updateParam('page', newPage.toString())}
            />
          </>
        )}
      </div>
    </div>
  );
}
