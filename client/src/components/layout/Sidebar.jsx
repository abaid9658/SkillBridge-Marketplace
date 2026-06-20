import React from 'react';
import {
  LayoutDashboard, Briefcase, PlusCircle, FileSpreadsheet,
  Users, History, Settings, MessageSquare, Shield, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ── Role accent colours ── */
const roleAccent = {
  admin: { color: '#f472b6', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)' },
  provider: { color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
  customer: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
};

const menuConfig = {
  admin: [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'logs', label: 'Activity Logs', icon: History },
  ],
  provider: [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-services', label: 'My Services', icon: Briefcase },
    { id: 'create-service', label: 'Create Service', icon: PlusCircle },
    { id: 'orders', label: 'Orders', icon: FileSpreadsheet },
    { id: 'settings', label: 'Edit Profile', icon: Settings },
  ],
  customer: [
    { id: 'overview', label: 'My Requests', icon: FileSpreadsheet },
    { id: 'settings', label: 'Edit Profile', icon: Settings },
  ],
};

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const role = user?.role || 'customer';
  const accent = roleAccent[role] || roleAccent.customer;
  const items = menuConfig[role] || menuConfig.customer;

  return (
    <aside style={{
      width: '240px',
      height: 'fit-content',
      position: 'sticky',
      top: '88px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      {/* Header card */}
      <div style={{
        borderRadius: '14px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
        padding: '16px',
        marginBottom: '8px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        {/* Avatar */}
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: accent.bg,
          border: `1px solid ${accent.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: '900', color: accent.color,
        }}>
          {user?.name?.[0]?.toUpperCase() || <Shield size={18} />}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'User'}
          </p>
          <span style={{
            display: 'inline-block', marginTop: '3px',
            padding: '2px 8px', borderRadius: '999px',
            background: accent.bg,
            border: `1px solid ${accent.border}`,
            fontSize: '10px', fontWeight: '800',
            color: accent.color, textTransform: 'capitalize',
            letterSpacing: '0.04em',
          }}>
            {role}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div style={{
        borderRadius: '14px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
        padding: '8px',
        overflow: 'hidden',
      }}>
        <p style={{
          fontSize: '10px', fontWeight: '800', letterSpacing: '0.1em',
          color: 'var(--text-muted)', textTransform: 'uppercase',
          padding: '6px 10px 10px', margin: 0,
        }}>
          Navigation
        </p>

        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 12px',
                borderRadius: '10px', textAlign: 'left',
                fontSize: '13px', fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                background: isActive ? accent.bg : 'transparent',
                border: `1px solid ${isActive ? accent.border : 'transparent'}`,
                color: isActive ? accent.color : 'var(--text-secondary)',
                transition: 'all 0.18s ease',
                marginBottom: i < items.length - 1 ? '2px' : '0',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              {/* Icon wrapper */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                background: isActive ? `${accent.color}22` : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.18s',
              }}>
                <Icon size={14} color={isActive ? accent.color : 'inherit'} />
              </div>

              <span style={{ flex: 1 }}>{item.label}</span>

              {/* Active indicator arrow */}
              {isActive && (
                <ChevronRight size={13} color={accent.color} style={{ opacity: 0.7 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: '8px' }}>
        <a href="/chat" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 14px', borderRadius: '14px',
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={14} color="#818cf8" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#818cf8' }}>Messages</span>
          </div>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;