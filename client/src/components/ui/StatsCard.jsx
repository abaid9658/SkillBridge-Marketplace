import React from 'react';
import GlassCard from './GlassCard';

const StatsCard = ({ title, value, icon: Icon, color = 'var(--primary)', trend, description }) => {
  return (
    <GlassCard
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow decorator */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: color,
          opacity: 0.08,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
          {title}
        </span>
        <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
          {value}
        </span>
        {description && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {description}
          </span>
        )}
        {trend && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </GlassCard>
  );
};

export default StatsCard;
