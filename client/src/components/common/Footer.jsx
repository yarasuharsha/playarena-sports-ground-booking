import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-dark)',
      borderTop: '1px solid var(--border-dark)',
      color: 'var(--text-light-muted)',
      padding: '48px 0 24px',
      marginTop: '60px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '40px'
        }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #00F5D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trophy size={18} color="#0B132B" />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#FFFFFF'
              }}>
                Play<span style={{ color: 'var(--accent-primary)' }}>Arena</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '16px' }}>
              The modern sports ground booking and arena management platform. Discover verified turf, compare transparent pricing, and book guaranteed time slots instantly.
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#10B981' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> ACID Safe
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} /> Instant Concurrency Protection
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '16px', fontWeight: 600 }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><Link to="/grounds" style={{ transition: 'color 0.2s' }}>All Sports Grounds</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* Sports Categories */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '16px', fontWeight: 600 }}>
              Popular Sports
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><Link to="/grounds?sportType=Football">Football Turfs</Link></li>
              <li><Link to="/grounds?sportType=Cricket">Cricket Pitches & Nets</Link></li>
              <li><Link to="/grounds?sportType=Badminton">Indoor Badminton Courts</Link></li>
              <li><Link to="/grounds?sportType=Tennis">Clay & Synthetic Tennis</Link></li>
              <li><Link to="/grounds?sportType=Basketball">Basketball Arenas</Link></li>
            </ul>
          </div>

          {/* Project Alignment */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '16px', fontWeight: 600 }}>
              Academic Micro Project
            </h4>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
              Built for Kalvium Micro Project:
              <br />• Full Stack Web Development
              <br />• Back-End Web Development
              <br />• Advanced Database Systems
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '12px', color: '#94A3B8' }}>
              Student: Y Harsha Vardhan Reddy
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-dark)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.8rem'
        }}>
          <p>© 2026 PlayArena. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Engineered with <Heart size={14} color="#EF4444" fill="#EF4444" /> using React, Express, Prisma & PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
