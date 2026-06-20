import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedButton from '../components/ui/AnimatedButton';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const ServerError = () => {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(239,68,68,0.1)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
        border: '1px solid rgba(239,68,68,0.3)',
        animation: 'pulse-glow-red 2s infinite'
      }}>
        <ShieldAlert size={40} color="var(--danger)" />
      </div>
      
      <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '12px' }}>
        Internal <span className="gradient-text">Server Error</span>
      </h1>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '460px', marginBottom: '32px', lineHeight: '1.6' }}>
        Our systems encountered an unexpected glitch. We are automatically tracking this and working to restore normal service.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
            background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
            color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px',
            fontWeight: '600', fontSize: '14px', transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} /> Refresh Page
        </button>
        <Link to="/">
          <AnimatedButton variant="primary" style={{ padding: '12px 24px' }}>
            Go Back Home
          </AnimatedButton>
        </Link>
      </div>

      <style>{`
        @keyframes pulse-glow-red {
          0%, 100% { opacity: 0.8; box-shadow: 0 0 15px rgba(239,68,68,0.2); }
          50% { opacity: 1; box-shadow: 0 0 30px rgba(239,68,68,0.4); }
        }
      `}</style>
    </div>
  );
};

export default ServerError;
