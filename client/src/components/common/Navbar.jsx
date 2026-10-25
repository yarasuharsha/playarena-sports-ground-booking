import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Calendar,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  Compass,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--bg-dark)',
      borderBottom: '1px solid var(--border-dark)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      background: 'rgba(11, 19, 43, 0.95)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #00F5D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Trophy size={22} color="#0B132B" strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.03em'
          }}>
            Play<span style={{ color: 'var(--accent-primary)' }}>Arena</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          <NavLink
            to="/grounds"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent-primary)' : 'var(--text-light-muted)',
              fontWeight: 500,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color var(--transition-fast)'
            })}
          >
            <Compass size={18} />
            Explore Grounds
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/my-bookings"
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent-primary)' : 'var(--text-light-muted)',
                fontWeight: 500,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color var(--transition-fast)'
              })}
            >
              <Calendar size={18} />
              My Bookings
            </NavLink>
          )}

          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NavLink
                to="/admin/dashboard"
                style={({ isActive }) => ({
                  color: isActive ? '#38BDF8' : '#7DD3FC',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                })}
              >
                <Shield size={16} />
                Admin Portal
              </NavLink>

              <NavLink
                to="/admin/bookings"
                style={({ isActive }) => ({
                  color: isActive ? '#38BDF8' : '#7DD3FC',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                })}
              >
                <Calendar size={16} />
                All Bookings
              </NavLink>
            </div>
          )}
        </div>

        {/* Right CTA / User Profile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-card-dark)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '30px',
                  padding: '6px 14px 6px 8px',
                  color: 'var(--text-light)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  background: 'var(--bg-card-dark)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-xl)',
                  width: '230px',
                  padding: '8px',
                  zIndex: 60
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-dark)', marginBottom: '6px' }}>
                    <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</p>
                    <p style={{ color: 'var(--text-light-muted)', fontSize: '0.75rem' }}>{user?.email}</p>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: isAdmin ? '#38BDF8' : '#10B981'
                    }}>
                      {user?.role} ACCOUNT
                    </span>
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-light)',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Calendar size={16} />
                    My Bookings
                  </Link>

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          color: '#38BDF8',
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                      <Link
                        to="/admin/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          color: '#38BDF8',
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}
                      >
                        <Shield size={16} />
                        Admin – All Bookings
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      color: '#F87171',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: '4px',
                      borderTop: '1px solid var(--border-dark)'
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer'
            }}
            className="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
