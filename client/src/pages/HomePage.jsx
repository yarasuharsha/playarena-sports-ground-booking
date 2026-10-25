import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { groundsApi } from '../api/endpoints';
import {
  Search,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  Flame,
  Activity,
  Award
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GroundImage from '../components/common/GroundImage';

const SPORTS_CATEGORIES = [
  { name: 'All', icon: '⚡' },
  { name: 'Football', icon: '⚽' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Badminton', icon: '🏸' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Pickleball', icon: '🏓' }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['featured-grounds'],
    queryFn: () => groundsApi.list({ limit: 3, sortBy: 'rating', order: 'desc' })
  });

  const featuredGrounds = data?.data || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/grounds?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/grounds');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #111D3B 50%, #1C2951 100%)',
        color: '#FFFFFF',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-dark)'
      }}>
        {/* Glow backdrop decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '30px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '24px'
            }}>
              <Flame size={16} /> Real-Time Database Concurrency Guaranteed
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              marginBottom: '20px',
              letterSpacing: '-0.03em'
            }}>
              Book Premier Sports Grounds <br />
              <span style={{
                background: 'linear-gradient(135deg, #10B981 0%, #00F5D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Without Scheduling Conflicts
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-light-muted)',
              marginBottom: '36px',
              lineHeight: 1.6
            }}>
              Discover verified football turfs, cricket practice nets, wooden badminton courts, and tennis clubs. Check live slot availability and lock your booking with atomic database guarantees.
            </p>

            {/* Quick Search Form */}
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '10px',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: 'var(--shadow-xl)',
              maxWidth: '640px',
              margin: '0 auto 36px'
            }}>
              <div style={{
                flex: 1,
                minWidth: '220px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 12px'
              }}>
                <Search size={20} color="var(--accent-secondary)" />
                <input
                  type="text"
                  placeholder="Search by arena name, location, or sport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                Find Grounds
              </button>
            </form>

            {/* Quick Sport Pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px'
            }}>
              {SPORTS_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => navigate(cat.name === 'All' ? '/grounds' : `/grounds?sportType=${cat.name}`)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section style={{
        marginTop: '-36px',
        position: 'relative',
        zIndex: 20
      }}>
        <div className="container">
          <div className="card" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            padding: '28px 36px',
            background: '#FFFFFF',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#DCFCE7',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800 }}>6+</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verified Arenas</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800 }}>240+</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Daily Time Slots</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800 }}>100%</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Anti-Double Booking</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#F3E8FF',
                color: '#9333EA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Star size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800 }}>4.8 ★</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Player Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Arenas Section */}
      <section style={{ padding: '80px 0 60px' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                Top Rated Venues
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                Featured Sports Grounds
              </h2>
            </div>
            <Link to="/grounds" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              View All Grounds <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Fetching featured sports grounds..." />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px'
            }}>
              {featuredGrounds.map((ground) => (
                <div key={ground.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Image with overlay tags */}
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
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

                  {/* Card Content */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                      {ground.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      marginBottom: '14px'
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

                    {/* Facilities Pills */}
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

                    {/* Price and CTA */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starting from</span>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                          ₹{parseFloat(ground.hourlyPrice).toLocaleString('en-IN')}{' '}
                          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ hr</span>
                        </p>
                      </div>

                      <Link to={`/grounds/${ground.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                        View Slots
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why PlayArena Feature Grid */}
      <section style={{
        background: '#F1F5F9',
        padding: '80px 0',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
              Why Athletes & Ground Owners Choose PlayArena
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Designed to solve real-world scheduling disputes with strict transactional integrity and clean user experiences.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Zero Double Bookings</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Enforced at the PostgreSQL engine level with a partial unique index over active bookings. Two concurrent users can never hold the same slot.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Live Slot Availability</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Real-time query synchronization powered by TanStack Query. Immediate feedback on which hours are available, reserved, or held.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Activity size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Atomic Cancellations</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Cancelling an eligible booking safely marks the reservation as CANCELLED and atomically frees up the slot for others to reserve immediately.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
