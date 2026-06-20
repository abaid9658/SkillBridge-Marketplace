import React from 'react';

const AnimatedButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, accent
  className = '',
  disabled = false,
  loading = false,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'btn-secondary';
      case 'accent':
        return 'btn-accent';
      default:
        return 'btn-primary';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${getVariantClass()} ${className}`}
      style={{
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg
            className="animate-spin"
            style={{
              width: '18px',
              height: '18px',
              animation: 'spin 1s linear infinite',
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

// Add standard keyframe spin for safety in page scope if missing in css
const spinStyle = document.createElement('style');
spinStyle.innerHTML = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(spinStyle);

export default AnimatedButton;
