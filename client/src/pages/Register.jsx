import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import ParticleBackground from '../components/three/ParticleBackground';
import { User, Briefcase } from 'lucide-react';

const Register = () => {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // customer or provider
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const res = await register(name, email, password, role);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}
    >
      <ParticleBackground />

      <div style={{ width: '100%', maxWidth: '480px' }} className="animate-fade-in">
        <GlassCard style={{ padding: '40px 32px' }}>
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '8px' }}>
            Get Started <span className="gradient-text">Today</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
            Choose your account role and join TEYZIX
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

          <form onSubmit={handleSubmit}>
            {/* Role Switcher Widget */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div
                onClick={() => setRole('customer')}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: `2px solid ${role === 'customer' ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: role === 'customer' ? 'var(--primary-glow)' : 'var(--glass-bg)',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <User size={24} color={role === 'customer' ? 'var(--primary)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '14px', fontWeight: '700', color: role === 'customer' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  Customer
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  I want to hire providers
                </span>
              </div>

              <div
                onClick={() => setRole('provider')}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: `2px solid ${role === 'provider' ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: role === 'provider' ? 'var(--primary-glow)' : 'var(--glass-bg)',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Briefcase size={24} color={role === 'provider' ? 'var(--primary)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '14px', fontWeight: '700', color: role === 'provider' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  Provider
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  I want to offer services
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
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
                placeholder="At least 6 characters"
                className="form-input"
                required
              />
            </div>

            <AnimatedButton
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: '12px' }}
            >
              Create Account
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
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Sign In
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Register;
