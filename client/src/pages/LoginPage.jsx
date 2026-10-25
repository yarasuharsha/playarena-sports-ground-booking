import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, AlertCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [authError, setAuthError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setAuthError(null);
      setSubmitting(true);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemoUser = () => {
    setValue('email', 'user@playarena.com');
    setValue('password', 'Password123!');
    setAuthError(null);
  };

  const handleFillDemoAdmin = () => {
    setValue('email', 'admin@playarena.com');
    setValue('password', 'AdminPass123!');
    setAuthError(null);
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px'
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '36px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #00F5D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px'
          }}>
            <Trophy size={24} color="#0B132B" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to manage and view your sports ground bookings
          </p>
        </div>

        {/* Demo Accounts Quick Fill Pill Box */}
        <div style={{
          background: '#F8FAFC',
          border: '1px dashed var(--border-light)',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            ⚡ Quick Evaluation Demo Accounts:
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleFillDemoUser}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#FFFFFF',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <UserCheck size={14} color="#10B981" /> Fill User Demo
            </button>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#FFFFFF',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#0284C7'
              }}
            >
              <Shield size={14} color="#0284C7" /> Fill Admin Demo
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {authError && (
          <div style={{
            padding: '12px 14px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            color: '#991B1B',
            fontSize: '0.875rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="name@example.com"
                className="form-input"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="form-input"
              {...register('password', {
                required: 'Password is required'
              })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        {/* Register Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
