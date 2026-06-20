import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '500px' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: maxWidth,
          animationDuration: '0.3s',
        }}
      >
        <GlassCard
          style={{
            position: 'relative',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-hover)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            {children}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Modal;
