import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Trophy } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center'
    }}>
      <div className="card" style={{ maxWidth: '480px', padding: '48px 36px', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Compass size={36} />
        </div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '12px 0 8px' }}>
          Pitch Out of Bounds
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.6 }}>
          The page or sports venue URL you are looking for does not exist or may have been relocated.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Home size={16} /> Return Home
          </Link>
          <Link to="/grounds" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={16} /> Explore Grounds
          </Link>
        </div>
      </div>
    </div>
  );
}
