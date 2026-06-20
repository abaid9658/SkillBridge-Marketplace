import React from 'react';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/three/ParticleBackground';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';

const NotFound = () => {
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

      <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }} className="animate-fade-in">
        <GlassCard style={{ padding: '48px 32px' }}>
          <h1
            style={{
              fontSize: '120px',
              lineHeight: '1',
              margin: '0 0 16px 0',
              fontFamily: 'var(--font-heading)',
              fontWeight: '900',
            }}
            className="gradient-text animate-float"
          >
            404
          </h1>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Lost in Space?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
            The page you are looking for has either moved, changed, or does not exist in our system. Let's redirect you back to the home portal.
          </p>
          <Link to="/">
            <AnimatedButton variant="primary">Return to Home Portal</AnimatedButton>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
};

export default NotFound;
