import React from 'react';
import { REQUEST_STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status = 'pending', text }) => {
  const color = REQUEST_STATUS_COLORS[status.toLowerCase()] || '#94a3b8';
  const label = text || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: `${color}15`, // HSL/Hex with opacity
        color: color,
        border: `1px solid ${color}30`,
        textTransform: 'capitalize',
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
