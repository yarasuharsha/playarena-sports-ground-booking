import React from 'react';

export default function LoadingSpinner({ fullPage = false, text = 'Loading...' }) {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '32px'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid rgba(16, 185, 129, 0.15)',
        borderTop: '3px solid var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{text}</p>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
}
