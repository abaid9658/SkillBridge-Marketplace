import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import ParticleBackground from '../components/three/ParticleBackground';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    // Check if redirect due to expired session
    if (searchParams.get('expired') === 'true') {
      setInfoMsg('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'provider') navigate('/provider-dashboard');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}
    >
      <ParticleBackground />

      <div style={{ width: '100%', maxWidth: '440px' }} className="animate-fade-in">
        <GlassCard style={{ padding: '40px 32px' }}>
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '8px' }}>
            Welcome <span className="gradient-text">Back</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
            Sign in to manage projects and services
          </p>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)',
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '14px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {infoMsg && (
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: 'var(--warning)',
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '14px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <AnimatedButton
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
              style={{ width: '100%', marginTop: '12px' }}
            >
              Sign In
            </AnimatedButton>
          </form>

          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginTop: '24px',
            }}
          >
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Create Account
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
