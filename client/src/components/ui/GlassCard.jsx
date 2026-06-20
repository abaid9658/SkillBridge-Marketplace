import React from 'react';

const GlassCard = ({ children, className = '', onClick, style = {} }) => {
  return (
    <div
      className={`glass-card ${className}`}
      onClick={onClick}
      style={{
        padding: '24px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
