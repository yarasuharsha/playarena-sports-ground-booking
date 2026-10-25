import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '36px'
    }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-secondary"
        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
      >
        <ChevronLeft size={16} /> Previous
      </button>

      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, margin: '0 8px' }}>
        Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-secondary"
        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
