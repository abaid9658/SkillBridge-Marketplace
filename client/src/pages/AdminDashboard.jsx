import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import AnimatedButton from '../components/ui/AnimatedButton';
import {
  Users, Briefcase, FileSpreadsheet, Lock, Unlock, Trash2,
  ShieldAlert, History, Activity, CheckCircle, XCircle, Star,
  ArrowUpRight, Clock, Shield, BriefcaseBusiness, DollarSign,
  Search, Filter, RefreshCw, Eye, Edit2, AlertTriangle,
  TrendingUp, Package, MessageSquare, Settings, BarChart2,
  UserCheck, UserX, ChevronDown, ChevronLeft, ChevronRight,
  BadgeCheck, Ban,
} from 'lucide-react';

/* ─── Colour palette ─── */
const COLORS = {
  primary: '#818cf8',
  cyan: '#22d3ee',
  green: '#34d399',
  orange: '#fb923c',
  pink: '#f472b6',
  red: '#f87171',
  yellow: '#facc15',
  purple: '#a78bfa',
};

const roleColors = {
  admin:    { color: '#f472b6', bg: 'rgba(236,72,153,0.15)' },
  provider: { color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  customer: { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
};

const statusColors = {
  active:      { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  pending:     { color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  open:        { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  in_progress: { color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
  'in-progress':{ color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
  completed:   { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  delivered:   { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  cancelled:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  closed:      { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  deleted:     { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  inactive:    { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  revision:    { color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  accepted:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
};

function StatusBadge({ status }) {
  const s = statusColors[status] || { color: '#818cf8', bg: 'rgba(99,102,241,0.12)' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
      background: s.bg, color: s.color, border: `1px solid ${s.color}40`,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>{status?.replace(/_/g, ' ')}</span>
  );
}

function RoleBadge({ role }) {
  const r = roleColors[role] || roleColors.customer;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
      background: r.bg, color: r.color, border: `1px solid ${r.color}40`,
      textTransform: 'capitalize',
    }}>{role}</span>
  );
}

function Avatar({ name = '', size = 36, color = '#818cf8', bg = 'rgba(99,102,241,0.15)', src }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: '800', color, flexShrink: 0,
    }}>{name?.[0]?.toUpperCase() || '?'}</div>
  );
}

function StatCard({ icon, title, value, sub, color, trend }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      padding: '22px', borderRadius: '16px',
      background: hov ? `${color}08` : 'var(--glass-bg)',
      border: `1px solid ${hov ? color + '40' : 'var(--border-color)'}`,
      backdropFilter: 'blur(12px)', transition: 'all 0.25s ease',
      transform: hov ? 'translateY(-3px)' : 'none',
      boxShadow: hov ? `0 12px 40px ${color}18` : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        {trend && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: '999px', background: 'rgba(52,211,153,0.12)', color: '#34d399', fontSize: '11px', fontWeight: '700' }}><ArrowUpRight size={10} />{trend}</span>}
      </div>
      <div style={{ fontSize: 'clamp(24px,3vw,34px)', fontWeight: '900', color, lineHeight: 1, marginBottom: 5 }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

function SectionHead({ icon, title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
          {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{ position: 'relative', flex: '1 1 200px' }}>
      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 10px 8px 32px', borderRadius: '10px',
          border: '1px solid var(--border-color)', background: 'var(--glass-bg)',
          color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function SelectFilter({ value, onChange, options, style }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: '8px 28px 8px 10px', borderRadius: '10px', border: '1px solid var(--border-color)',
      background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13,
      outline: 'none', cursor: 'pointer', ...style,
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TableWrap({ headers, children, empty }) {
  return (
    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(99,102,241,0.04)' }}>
              {headers.map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
        {empty && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>{empty}
          </div>
        )}
      </div>
    </div>
  );
}

function TR({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{ borderBottom: '1px solid var(--border-color)', background: hov ? 'rgba(99,102,241,0.04)' : 'transparent', cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s' }}
    >{children}</tr>
  );
}

function TD({ children, style }) {
  return <td style={{ padding: '12px 16px', verticalAlign: 'middle', ...style }}>{children}</td>;
}

function ActionBtn({ icon, label, color = '#818cf8', onClick, danger }) {
  const [hov, setHov] = useState(false);
  const c = danger ? '#f87171' : color;
  return (
    <button onClick={e => { e.stopPropagation(); onClick?.(); }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '5px 10px', borderRadius: 7,
        background: hov ? `${c}20` : 'transparent',
        border: `1px solid ${hov ? c + '50' : 'var(--border-color)'}`,
        color: hov ? c : 'var(--text-muted)', cursor: 'pointer', fontSize: 12,
        fontWeight: 600, transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}>{icon}{label}</button>
  );
}

function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
        style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <ChevronLeft size={14} />
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)}
          style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${p === page ? 'var(--primary)' : 'var(--border-color)'}`, background: p === page ? 'var(--primary)' : 'var(--glass-bg)', color: p === page ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{p}</button>
      ))}
      <button onClick={() => onPage(Math.min(pages, page + 1))} disabled={page === pages}
        style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: page === pages ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page === pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function SkeletonBlock({ height = 56, count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height, borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--border-color)', animation: 'shimmer 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════════ */
function Modal({ open, onClose, title, children, width = 500 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: width, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><XCircle size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB DEFINITIONS
   ══════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'overview',     label: 'Overview',        icon: <BarChart2 size={15} /> },
  { id: 'users',        label: 'Users',           icon: <Users size={15} /> },
  { id: 'services',     label: 'Services',        icon: <Briefcase size={15} /> },
  { id: 'orders',       label: 'Orders',          icon: <Package size={15} /> },
  { id: 'jobs',         label: 'Jobs',            icon: <BriefcaseBusiness size={15} /> },
  { id: 'transactions', label: 'Transactions',    icon: <DollarSign size={15} /> },
  { id: 'support',      label: 'Support Tickets', icon: <MessageSquare size={15} /> },
  { id: 'reviews',      label: 'Reviews',         icon: <Star size={15} /> },
  { id: 'logs',         label: 'Activity',        icon: <History size={15} /> },
];

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Data per tab
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]); const [userTotal, setUserTotal] = useState(0); const [userPage, setUserPage] = useState(1); const [userPages, setUserPages] = useState(1);
  const [services, setServices] = useState([]); const [svcTotal, setSvcTotal] = useState(0); const [svcPage, setSvcPage] = useState(1); const [svcPages, setSvcPages] = useState(1);
  const [orders, setOrders] = useState([]); const [orderTotal, setOrderTotal] = useState(0); const [orderPage, setOrderPage] = useState(1); const [orderPages, setOrderPages] = useState(1);
  const [jobs, setJobs] = useState([]); const [jobTotal, setJobTotal] = useState(0); const [jobPage, setJobPage] = useState(1); const [jobPages, setJobPages] = useState(1);
  const [transactions, setTransactions] = useState([]); const [txTotal, setTxTotal] = useState(0); const [txPage, setTxPage] = useState(1); const [txPages, setTxPages] = useState(1);
  const [tickets, setTickets] = useState([]); const [tktTotal, setTktTotal] = useState(0); const [tktPage, setTktPage] = useState(1); const [tktPages, setTktPages] = useState(1);
  const [reviews, setReviews] = useState([]); const [reviewTotal, setReviewTotal] = useState(0); const [reviewPage, setReviewPage] = useState(1); const [reviewPages, setReviewPages] = useState(1);
  const [logs, setLogs] = useState([]);

  // Filters
  const [userSearch, setUserSearch] = useState(''); const [userRoleFilter, setUserRoleFilter] = useState('');
  const [svcSearch, setSvcSearch] = useState(''); const [svcStatusFilter, setSvcStatusFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [txTypeFilter, setTxTypeFilter] = useState('all'); const [txStatusFilter, setTxStatusFilter] = useState('all');
  const [tktSearch, setTktSearch] = useState(''); const [tktStatusFilter, setTktStatusFilter] = useState('');

  // Modal state
  const [editUserModal, setEditUserModal] = useState(null);
  const [viewOrderModal, setViewOrderModal] = useState(null);
  const [replyTicketModal, setReplyTicketModal] = useState(null);

  // Edit user form
  const [editForm, setEditForm] = useState({});

  // Support Ticket Reply form
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchTab = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const r = await api.get('/admin/stats');
        if (r.data.success) setStats(r.data.stats);
      } else if (activeTab === 'users') {
        const params = { page: userPage, limit: 15 };
        if (userSearch) params.search = userSearch;
        if (userRoleFilter) params.role = userRoleFilter;
        const r = await api.get('/admin/users', { params });
        if (r.data.success) { setUsers(r.data.users); setUserTotal(r.data.total); setUserPages(r.data.pages); }
      } else if (activeTab === 'services') {
        const params = { page: svcPage, limit: 15 };
        if (svcSearch) params.search = svcSearch;
        if (svcStatusFilter) params.status = svcStatusFilter;
        const r = await api.get('/admin/services', { params });
        if (r.data.success) { setServices(r.data.services); setSvcTotal(r.data.total); setSvcPages(r.data.pages); }
      } else if (activeTab === 'orders') {
        const params = { page: orderPage, limit: 15 };
        if (orderStatusFilter) params.status = orderStatusFilter;
        const r = await api.get('/admin/orders', { params });
        if (r.data.success) { setOrders(r.data.orders); setOrderTotal(r.data.total); setOrderPages(r.data.pages); }
      } else if (activeTab === 'jobs') {
        const params = { page: jobPage, limit: 15, status: jobStatusFilter };
        const r = await api.get('/admin/jobs', { params });
        if (r.data.success) { setJobs(r.data.jobs); setJobTotal(r.data.total); setJobPages(r.data.pages); }
      } else if (activeTab === 'reviews') {
        const r = await api.get('/admin/reviews', { params: { page: reviewPage, limit: 15 } });
        if (r.data.success) { setReviews(r.data.reviews); setReviewTotal(r.data.total); setReviewPages(r.data.pages); }
      } else if (activeTab === 'transactions') {
        const params = { page: txPage, limit: 15 };
        if (txTypeFilter !== 'all') params.type = txTypeFilter;
        if (txStatusFilter !== 'all') params.status = txStatusFilter;
        const r = await api.get('/admin/transactions', { params });
        if (r.data.success) { setTransactions(r.data.transactions); setTxTotal(r.data.total); setTxPages(r.data.pages); }
      } else if (activeTab === 'support') {
        const params = { page: tktPage, limit: 15 };
        if (tktStatusFilter) params.status = tktStatusFilter;
        if (tktSearch) params.search = tktSearch;
        const r = await api.get('/support', { params });
        if (r.data.success) { setTickets(r.data.tickets); setTktTotal(r.data.total); setTktPages(r.data.pages); }
      } else if (activeTab === 'logs') {
        const r = await api.get('/admin/activity-logs', { params: { limit: 80 } });
        if (r.data.success) setLogs(r.data.logs);
      }
    } catch (err) { console.error('Admin fetch error', err); }
    finally { setLoading(false); }
  }, [activeTab, userPage, userSearch, userRoleFilter, svcPage, svcSearch, svcStatusFilter, orderPage, orderStatusFilter, jobPage, jobStatusFilter, reviewPage, txPage, txTypeFilter, txStatusFilter, tktPage, tktStatusFilter, tktSearch]);

  useEffect(() => { fetchTab(); }, [fetchTab]);

  /* ── Actions ── */
  const toggleBan = async (id) => {
    await api.put(`/admin/users/${id}/status`);
    fetchTab();
  };
  const verifyUser = async (id) => {
    await api.put(`/admin/users/${id}/verify`);
    fetchTab();
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    await api.delete(`/admin/users/${id}`);
    fetchTab();
  };
  const openEditUser = async (u) => {
    setEditForm({ name: u.name, email: u.email, role: u.role, bio: u.bio || '', location: u.location || '', isVerified: u.isVerified });
    setEditUserModal(u);
  };
  const saveEditUser = async () => {
    await api.put(`/admin/users/${editUserModal._id}`, editForm);
    setEditUserModal(null);
    fetchTab();
  };

  const updateSvcStatus = async (id, status) => {
    await api.put(`/admin/services/${id}/status`, { status });
    fetchTab();
  };
  const deleteSvc = async (id) => {
    if (!window.confirm('Remove this service?')) return;
    await api.delete(`/admin/services/${id}`);
    fetchTab();
  };

  const forceOrderStatus = async (id, status) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    setViewOrderModal(null);
    fetchTab();
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await api.delete(`/admin/jobs/${id}`);
    fetchTab();
  };
  const closeJob = async (id) => {
    await api.put(`/admin/jobs/${id}`, { status: 'closed' });
    fetchTab();
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/admin/reviews/${id}`);
    fetchTab();
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await api.put(`/support/${replyTicketModal._id}/reply`, { replyMessage: replyText });
      setReplyTicketModal(null);
      setReplyText('');
      fetchTab();
    } catch (err) {
      console.error('Failed to reply to ticket:', err);
      alert('Error sending reply: ' + (err.response?.data?.message || err.message));
    } finally {
      setReplyLoading(false);
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm('Delete this support ticket permanently?')) return;
    try {
      await api.delete(`/support/${id}`);
      fetchTab();
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    }
  };

  /* ── Month names helper ── */
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>

      {/* PAGE HEADER */}
      <div style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.07) 0%, transparent 100%)', borderBottom: '1px solid var(--border-color)', padding: '36px 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="#818cf8" />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--primary)', margin: 0, textTransform: 'uppercase' }}>Admin Control Panel</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                Platform <span className="gradient-text">Dashboard</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>Full control — Users, Services, Orders, Jobs, Reviews & Activity</p>
            </div>
            <button onClick={fetchTab} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} />Refresh
            </button>
          </div>

          {/* Tab Bar */}
          <div style={{ display: 'flex', gap: 2, marginTop: 24, overflowX: 'auto', paddingBottom: 0 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: '10px 10px 0 0',
                border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                background: activeTab === tab.id ? 'var(--glass-bg)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>{tab.icon}{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container" style={{ paddingTop: 32 }}>

        {/* ══ OVERVIEW ══ */}
        {activeTab === 'overview' && (
          loading ? <SkeletonBlock height={120} count={4} /> : stats ? (
            <>
              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 36 }}>
                <StatCard icon={<Users size={22} />} title="Total Users" value={stats.users?.total || 0} sub={`${stats.users?.providers || 0} Providers · ${stats.users?.customers || 0} Clients · ${stats.users?.banned || 0} Banned`} color={COLORS.primary} trend="+12%" />
                <StatCard icon={<Briefcase size={22} />} title="Services" value={stats.services?.total || 0} sub={`${stats.services?.active || 0} Active · ${stats.services?.pending || 0} Pending`} color={COLORS.cyan} trend="+8%" />
                <StatCard icon={<Package size={22} />} title="Orders" value={stats.requests?.total || 0} sub={`${stats.requests?.completed || 0} Done · ${stats.requests?.pending || 0} Pending · ${stats.requests?.cancelled || 0} Cancelled`} color={COLORS.green} trend="+23%" />
                <StatCard icon={<BriefcaseBusiness size={22} />} title="Jobs Posted" value={stats.jobs?.total || 0} sub={`${stats.jobs?.open || 0} Open`} color={COLORS.pink} trend="+15%" />
                <StatCard icon={<Star size={22} />} title="Reviews" value={stats.reviews?.total || 0} sub="Platform-wide" color={COLORS.yellow} trend="+5%" />
                <StatCard icon={<DollarSign size={22} />} title="Total Revenue" value={`$${(stats.revenue?.total || 0).toLocaleString()}`} sub="Delivered orders" color={COLORS.green} trend="+31%" />
              </div>

              {/* Revenue by month chart (simple bars) */}
              {stats.revenueByMonth?.length > 0 && (
                <div style={{ marginBottom: 36, background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: 24 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 20 }}>📈 Monthly Revenue (Last 12 Months)</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, overflowX: 'auto' }}>
                    {stats.revenueByMonth.map(m => {
                      const maxRev = Math.max(...stats.revenueByMonth.map(x => x.revenue || 0), 1);
                      const pct = ((m.revenue || 0) / maxRev) * 100;
                      return (
                        <div key={m._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '1 0 40px' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>${(m.revenue || 0).toLocaleString()}</span>
                          <div style={{ width: '100%', height: `${pct}%`, minHeight: 4, background: 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease' }} title={`${m.orders} orders`} />
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{MONTHS[(m._id - 1) % 12]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Users */}
              <SectionHead icon={<Users size={16} color={COLORS.primary} />} title="Recently Registered" sub={`Last 6 signups`} />
              <TableWrap headers={['User', 'Email', 'Role', 'Status', 'Joined']} empty={!stats.recent?.users?.length && 'No users yet.'}>
                {stats.recent?.users?.map(u => (
                  <TR key={u._id}>
                    <TD><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={u.name} size={32} color={(roleColors[u.role] || roleColors.customer).color} bg={(roleColors[u.role] || roleColors.customer).bg} /><span style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</span></div></TD>
                    <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</span></TD>
                    <TD><RoleBadge role={u.role} /></TD>
                    <TD><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></TD>
                    <TD><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</span></TD>
                  </TR>
                ))}
              </TableWrap>

              {/* Recent Orders */}
              <div style={{ marginTop: 36 }}>
                <SectionHead icon={<Package size={16} color={COLORS.green} />} title="Recent Orders" sub="Latest 6 service requests" />
                <TableWrap headers={['Customer', 'Service', 'Budget', 'Status', 'Date']} empty={!stats.recent?.requests?.length && 'No orders yet.'}>
                  {stats.recent?.requests?.map(r => (
                    <TR key={r._id}>
                      <TD><span style={{ fontWeight: 700, fontSize: 13 }}>{r.customer?.name || '—'}</span></TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.service?.title || '—'}</span></TD>
                      <TD><span style={{ fontWeight: 700, color: COLORS.green }}>${r.budget || 0}</span></TD>
                      <TD><StatusBadge status={r.status} /></TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span></TD>
                    </TR>
                  ))}
                </TableWrap>
              </div>
            </>
          ) : <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Failed to load stats.</div>
        )}

        {/* ══ USERS ══ */}
        {activeTab === 'users' && (
          <>
            <SectionHead icon={<Users size={16} color={COLORS.primary} />} title="User Management" sub={`${userTotal.toLocaleString()} registered accounts`} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <SearchInput value={userSearch} onChange={v => { setUserSearch(v); setUserPage(1); }} placeholder="Search name or email…" />
              <SelectFilter value={userRoleFilter} onChange={v => { setUserRoleFilter(v); setUserPage(1); }} options={[{ value: '', label: 'All Roles' }, { value: 'admin', label: 'Admin' }, { value: 'provider', label: 'Provider' }, { value: 'customer', label: 'Customer' }]} />
            </div>
            {loading ? <SkeletonBlock count={8} /> : (
              <>
                <TableWrap headers={['User', 'Email', 'Role', 'Status', 'Verified', 'Joined', 'Actions']} empty={!users.length && 'No users found.'}>
                  {users.map(u => (
                    <TR key={u._id}>
                      <TD>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={u.name} size={34} color={(roleColors[u.role] || roleColors.customer).color} bg={(roleColors[u.role] || roleColors.customer).bg} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                            {u.location && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.location}</div>}
                          </div>
                        </div>
                      </TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</span></TD>
                      <TD><RoleBadge role={u.role} /></TD>
                      <TD><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></TD>
                      <TD>
                        {u.isVerified
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: COLORS.cyan }}><BadgeCheck size={13} />Verified</span>
                          : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unverified</span>}
                      </TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</span></TD>
                      <TD>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <ActionBtn icon={<Edit2 size={12} />} label="Edit" onClick={() => openEditUser(u)} />
                          {!u.isVerified && u.role !== 'admin' && <ActionBtn icon={<BadgeCheck size={12} />} label="Verify" color={COLORS.cyan} onClick={() => verifyUser(u._id)} />}
                          {u.role !== 'admin' && (
                            <ActionBtn icon={u.isActive ? <Ban size={12} /> : <CheckCircle size={12} />} label={u.isActive ? 'Ban' : 'Unban'} color={u.isActive ? COLORS.orange : COLORS.green} onClick={() => toggleBan(u._id)} />
                          )}
                          {u.role !== 'admin' && <ActionBtn icon={<Trash2 size={12} />} label="Delete" danger onClick={() => deleteUser(u._id)} />}
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TableWrap>
                <Pagination page={userPage} pages={userPages} onPage={setUserPage} />
              </>
            )}
          </>
        )}

        {/* ══ SERVICES ══ */}
        {activeTab === 'services' && (
          <>
            <SectionHead icon={<Briefcase size={16} color={COLORS.cyan} />} title="Service Moderation" sub={`${svcTotal.toLocaleString()} listings on platform`} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <SearchInput value={svcSearch} onChange={v => { setSvcSearch(v); setSvcPage(1); }} placeholder="Search service title…" />
              <SelectFilter value={svcStatusFilter} onChange={v => { setSvcStatusFilter(v); setSvcPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'inactive', label: 'Inactive' }, { value: 'deleted', label: 'Deleted' }]} />
            </div>
            {loading ? <SkeletonBlock count={8} /> : (
              <>
                <TableWrap headers={['Service', 'Provider', 'Category', 'Price', 'Rating', 'Status', 'Actions']} empty={!services.length && 'No services found.'}>
                  {services.map(s => (
                    <TR key={s._id}>
                      <TD>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {s.images?.[0]?.url && <img src={s.images[0].url} alt="" style={{ width: 40, height: 32, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />}
                          <span style={{ fontWeight: 700, fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{s.title}</span>
                        </div>
                      </TD>
                      <TD>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar name={s.provider?.name} size={26} color="#818cf8" bg="rgba(99,102,241,0.15)" />
                          <span style={{ fontSize: 12 }}>{s.provider?.name}</span>
                          {s.provider?.isVerified && <BadgeCheck size={12} color={COLORS.cyan} />}
                        </div>
                      </TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.category}</span></TD>
                      <TD><span style={{ fontWeight: 700, color: COLORS.green }}>${s.price}</span></TD>
                      <TD><span style={{ fontSize: 12 }}>⭐ {s.avgRating?.toFixed(1) || '—'} ({s.totalReviews || 0})</span></TD>
                      <TD><StatusBadge status={s.status} /></TD>
                      <TD>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {s.status !== 'active' && <ActionBtn icon={<CheckCircle size={12} />} label="Approve" color={COLORS.green} onClick={() => updateSvcStatus(s._id, 'active')} />}
                          {s.status === 'active' && <ActionBtn icon={<XCircle size={12} />} label="Suspend" color={COLORS.orange} onClick={() => updateSvcStatus(s._id, 'inactive')} />}
                          {s.status !== 'deleted' && <ActionBtn icon={<Trash2 size={12} />} label="Delete" danger onClick={() => deleteSvc(s._id)} />}
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TableWrap>
                <Pagination page={svcPage} pages={svcPages} onPage={setSvcPage} />
              </>
            )}
          </>
        )}

        {/* ══ ORDERS ══ */}
        {activeTab === 'orders' && (
          <>
            <SectionHead icon={<Package size={16} color={COLORS.green} />} title="Order Management" sub={`${orderTotal.toLocaleString()} total orders`} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <SelectFilter value={orderStatusFilter} onChange={v => { setOrderStatusFilter(v); setOrderPage(1); }} options={[
                { value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'accepted', label: 'Accepted' },
                { value: 'in-progress', label: 'In Progress' }, { value: 'revision', label: 'Revision' },
                { value: 'completed', label: 'Completed' }, { value: 'delivered', label: 'Delivered' }, { value: 'cancelled', label: 'Cancelled' },
              ]} />
            </div>
            {loading ? <SkeletonBlock count={8} /> : (
              <>
                <TableWrap headers={['Order ID', 'Customer', 'Provider', 'Service', 'Budget', 'Payment', 'Status', 'Actions']} empty={!orders.length && 'No orders found.'}>
                  {orders.map(o => (
                    <TR key={o._id} onClick={() => setViewOrderModal(o)}>
                      <TD><span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{o._id.slice(-6).toUpperCase()}</span></TD>
                      <TD>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={o.customer?.name} size={28} color="#34d399" bg="rgba(52,211,153,0.15)" />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{o.customer?.name}</span>
                        </div>
                      </TD>
                      <TD>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={o.provider?.name} size={28} color="#818cf8" bg="rgba(99,102,241,0.15)" />
                          <span style={{ fontSize: 13 }}>{o.provider?.name}</span>
                        </div>
                      </TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{o.service?.title}</span></TD>
                      <TD><span style={{ fontWeight: 700, color: COLORS.green }}>${o.budget}</span></TD>
                      <TD>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: o.paymentStatus === 'paid' ? 'rgba(52,211,153,0.12)' : 'rgba(250,204,21,0.12)', color: o.paymentStatus === 'paid' ? COLORS.green : COLORS.yellow }}>
                          {o.paymentStatus}
                        </span>
                      </TD>
                      <TD><StatusBadge status={o.status} /></TD>
                      <TD>
                        <ActionBtn icon={<Eye size={12} />} label="View" onClick={() => setViewOrderModal(o)} />
                      </TD>
                    </TR>
                  ))}
                </TableWrap>
                <Pagination page={orderPage} pages={orderPages} onPage={setOrderPage} />
              </>
            )}
          </>
        )}

        {/* ══ JOBS ══ */}
        {activeTab === 'jobs' && (
          <>
            <SectionHead icon={<BriefcaseBusiness size={16} color={COLORS.pink} />} title="Job Board Management" sub={`${jobTotal.toLocaleString()} job postings`} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <SelectFilter value={jobStatusFilter} onChange={v => { setJobStatusFilter(v); setJobPage(1); }} options={[{ value: 'all', label: 'All Statuses' }, { value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'closed', label: 'Closed' }]} />
            </div>
            {loading ? <SkeletonBlock count={8} /> : (
              <>
                <TableWrap headers={['Title', 'Posted By', 'Category', 'Budget', 'Proposals', 'Views', 'Status', 'Actions']} empty={!jobs.length && 'No jobs found.'}>
                  {jobs.map(j => (
                    <TR key={j._id}>
                      <TD><span style={{ fontWeight: 700, fontSize: 13, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{j.title}</span></TD>
                      <TD>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={j.customerId?.name} size={26} color="#34d399" bg="rgba(52,211,153,0.15)" />
                          <span style={{ fontSize: 12 }}>{j.customerId?.name}</span>
                        </div>
                      </TD>
                      <TD><span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{j.category}</span></TD>
                      <TD>
                        {j.budget ? (
                          <span style={{ fontWeight: 700, color: COLORS.green, fontSize: 13 }}>
                            ${j.budget.min}–${j.budget.max}{j.budget.type === 'hourly' ? '/hr' : ''}
                          </span>
                        ) : '—'}
                      </TD>
                      <TD><span style={{ fontSize: 13, fontWeight: 700 }}>{j.proposalCount || 0}</span></TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{j.views || 0}</span></TD>
                      <TD><StatusBadge status={j.status} /></TD>
                      <TD>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {j.status === 'open' && <ActionBtn icon={<XCircle size={12} />} label="Close" color={COLORS.orange} onClick={() => closeJob(j._id)} />}
                          <ActionBtn icon={<Trash2 size={12} />} label="Delete" danger onClick={() => deleteJob(j._id)} />
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TableWrap>
                <Pagination page={jobPage} pages={jobPages} onPage={setJobPage} />
              </>
            )}
          </>
        )}

        {/* ══ REVIEWS ══ */}
        {activeTab === 'reviews' && (
          <>
            <SectionHead icon={<Star size={16} color={COLORS.yellow} />} title="Review Moderation" sub={`${reviewTotal.toLocaleString()} total reviews`} />
            {loading ? <SkeletonBlock count={8} /> : (
              <>
                <TableWrap headers={['Customer', 'Provider', 'Service', 'Rating', 'Comment', 'Date', 'Action']} empty={!reviews.length && 'No reviews found.'}>
                  {reviews.map(r => (
                    <TR key={r._id}>
                      <TD>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={r.customer?.name} size={28} color="#34d399" bg="rgba(52,211,153,0.15)" />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{r.customer?.name}</span>
                        </div>
                      </TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.provider?.name}</span></TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.service?.title}</span></TD>
                      <TD>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, fontSize: 13 }}>
                          {'⭐'.repeat(Math.round(r.rating || 0))} {r.rating?.toFixed(1)}
                        </span>
                      </TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.comment || '—'}</span></TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span></TD>
                      <TD><ActionBtn icon={<Trash2 size={12} />} label="Remove" danger onClick={() => deleteReview(r._id)} /></TD>
                    </TR>
                  ))}
                </TableWrap>
                <Pagination page={reviewPage} pages={reviewPages} onPage={setReviewPage} />
              </>
            )}
          </>
        )}

        {/* ══ TRANSACTIONS ══ */}
        {activeTab === 'transactions' && (
          <>
            <SectionHead icon={<DollarSign size={16} color={COLORS.green} />} title="Financial Transactions" sub={`${txTotal.toLocaleString()} transactions recorded`} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <SelectFilter value={txTypeFilter} onChange={v => { setTxTypeFilter(v); setTxPage(1); }} options={[
                { value: 'all', label: 'All Types' },
                { value: 'deposit', label: 'Deposit' },
                { value: 'subscription', label: 'Subscription' },
                { value: 'withdrawal', label: 'Withdrawal' },
                { value: 'escrow_hold', label: 'Escrow Hold' },
                { value: 'escrow_release', label: 'Escrow Release' },
                { value: 'refund', label: 'Refund' }
              ]} />
              <SelectFilter value={txStatusFilter} onChange={v => { setTxStatusFilter(v); setTxPage(1); }} options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]} />
            </div>
            {loading ? <SkeletonBlock count={8} /> : (
              <>
                <TableWrap headers={['ID', 'User', 'Type', 'Amount', 'Description', 'Stripe Session', 'Date', 'Status']} empty={!transactions.length && 'No transactions found.'}>
                  {transactions.map(t => {
                    const isPositive = ['deposit', 'escrow_release', 'refund', 'subscription'].includes(t.type);
                    return (
                      <TR key={t._id}>
                        <TD><span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{t._id.slice(-6).toUpperCase()}</span></TD>
                        <TD>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 12 }}>{t.userId?.name || 'Unknown'}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.userId?.role}</div>
                            </div>
                          </div>
                        </TD>
                        <TD><span style={{ fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{t.type?.replace('_', ' ')}</span></TD>
                        <TD><span style={{ fontWeight: 900, color: isPositive ? COLORS.green : COLORS.red }}>{isPositive ? '+' : '-'}${t.amount?.toFixed(2)}</span></TD>
                        <TD><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.description || '—'}</span></TD>
                        <TD><span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{t.stripeSessionId || '—'}</span></TD>
                        <TD><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</span></TD>
                        <TD><StatusBadge status={t.status} /></TD>
                      </TR>
                    );
                  })}
                </TableWrap>
                <Pagination page={txPage} pages={txPages} onPage={setTxPage} />
              </>
            )}
          </>
        )}

        {/* ══ SUPPORT TICKETS ══ */}
        {activeTab === 'support' && (
          <>
            <SectionHead icon={<MessageSquare size={16} color={COLORS.purple} />} title="Support Tickets" sub={`${tktTotal.toLocaleString()} tickets submitted`} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <SearchInput value={tktSearch} onChange={v => { setTktSearch(v); setTktPage(1); }} placeholder="Search name, subject, message…" />
              <SelectFilter value={tktStatusFilter} onChange={v => { setTktStatusFilter(v); setTktPage(1); }} options={[
                { value: '', label: 'All Statuses' },
                { value: 'open', label: 'Open' },
                { value: 'resolved', label: 'Resolved' }
              ]} />
            </div>
            {loading ? <SkeletonBlock count={8} /> : (
              <>
                <TableWrap headers={['Ticket ID', 'Sender', 'Subject & Message', 'Category', 'Status', 'Date', 'Actions']} empty={!tickets.length && 'No support tickets found.'}>
                  {tickets.map(tk => (
                    <TR key={tk._id}>
                      <TD><span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{tk._id.slice(-6).toUpperCase()}</span></TD>
                      <TD>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{tk.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tk.email}</div>
                        </div>
                      </TD>
                      <TD>
                        <div style={{ maxWidth: 300 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tk.subject}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tk.message}</div>
                          {tk.replyMessage && (
                            <div style={{ fontSize: 11, color: COLORS.purple, marginTop: 4, background: 'rgba(167,139,250,0.06)', padding: '4px 8px', borderRadius: 4, borderLeft: `2px solid ${COLORS.purple}` }}>
                              <strong>Reply:</strong> {tk.replyMessage}
                            </div>
                          )}
                        </div>
                      </TD>
                      <TD><span style={{ fontSize: 12, textTransform: 'capitalize' }}>{tk.category}</span></TD>
                      <TD><StatusBadge status={tk.status} /></TD>
                      <TD><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(tk.createdAt).toLocaleDateString()}</span></TD>
                      <TD>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {tk.status === 'open' ? (
                            <ActionBtn icon={<MessageSquare size={12} />} label="Reply" color={COLORS.purple} onClick={() => { setReplyTicketModal(tk); setReplyText(''); }} />
                          ) : (
                            <span style={{ fontSize: 11, color: COLORS.cyan, fontWeight: '700', padding: '5px' }}>Resolved</span>
                          )}
                          <ActionBtn icon={<Trash2 size={12} />} label="Delete" danger onClick={() => deleteTicket(tk._id)} />
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TableWrap>
                <Pagination page={tktPage} pages={tktPages} onPage={setTktPage} />
              </>
            )}
          </>
        )}

        {/* ══ ACTIVITY LOGS ══ */}
        {activeTab === 'logs' && (
          <>
            <SectionHead icon={<History size={16} color={COLORS.orange} />} title="Activity Logs" sub={`${logs.length} recent events`} />
            {loading ? <SkeletonBlock count={10} height={48} /> : (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
                {logs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>📭 No activity logged yet.</div>
                ) : logs.map((log, i) => {
                  const actionColor = log.action?.includes('delete') || log.action?.includes('ban') ? COLORS.red
                    : log.action?.includes('create') ? COLORS.green
                    : log.action?.includes('verify') || log.action?.includes('approve') ? COLORS.cyan
                    : COLORS.primary;
                  return (
                    <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderBottom: i < logs.length - 1 ? '1px solid var(--border-color)' : 'none', gap: 12, flexWrap: 'wrap', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: actionColor, boxShadow: `0 0 6px ${actionColor}`, flexShrink: 0 }} />
                        <div style={{ fontSize: 13 }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{log.user?.name || 'System'}</span>
                          <span style={{ color: 'var(--text-secondary)' }}> — </span>
                          <span style={{ padding: '2px 8px', borderRadius: 4, background: `${actionColor}18`, color: actionColor, fontSize: 12, fontWeight: 700 }}>{log.action}</span>
                        </div>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                        <Clock size={11} />{new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ EDIT USER MODAL ══ */}
      <Modal open={!!editUserModal} onClose={() => setEditUserModal(null)} title={`Edit User — ${editUserModal?.name}`} width={480}>
        {editUserModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: 'Full Name', type: 'text' },
              { key: 'email', label: 'Email Address', type: 'email' },
              { key: 'location', label: 'Location', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{field.label}</label>
                <input type={field.type} value={editForm[field.key] || ''} onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Role</label>
              <select value={editForm.role || ''} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Bio</label>
              <textarea value={editForm.bio || ''} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={editForm.isVerified || false} onChange={e => setEditForm(f => ({ ...f, isVerified: e.target.checked }))} />
              Mark as Verified Provider
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, justifyContent: 'flex-end' }}>
              <AnimatedButton variant="secondary" onClick={() => setEditUserModal(null)}>Cancel</AnimatedButton>
              <AnimatedButton variant="primary" onClick={saveEditUser}>Save Changes</AnimatedButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ VIEW ORDER MODAL ══ */}
      <Modal open={!!viewOrderModal} onClose={() => setViewOrderModal(null)} title={`Order Details — #${viewOrderModal?._id?.slice(-6).toUpperCase()}`} width={560}>
        {viewOrderModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InfoBlock label="Customer" value={viewOrderModal.customer?.name} />
              <InfoBlock label="Provider" value={viewOrderModal.provider?.name} />
              <InfoBlock label="Service" value={viewOrderModal.service?.title} />
              <InfoBlock label="Package" value={viewOrderModal.selectedPackage} />
              <InfoBlock label="Budget" value={`$${viewOrderModal.budget}`} color={COLORS.green} />
              <InfoBlock label="Amount Paid" value={`$${viewOrderModal.amountPaid || 0}`} color={COLORS.cyan} />
              <InfoBlock label="Payment" value={viewOrderModal.paymentStatus} />
              <InfoBlock label="Status" value={<StatusBadge status={viewOrderModal.status} />} />
              <InfoBlock label="Created" value={new Date(viewOrderModal.createdAt).toLocaleString()} />
              {viewOrderModal.deadline && <InfoBlock label="Deadline" value={new Date(viewOrderModal.deadline).toLocaleDateString()} />}
            </div>
            {viewOrderModal.requirements && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 6px' }}>Requirements</p>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 14px', margin: 0 }}>{viewOrderModal.requirements}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Force Status Override (Admin)</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['accepted','in-progress','completed','delivered','cancelled'].map(s => (
                  <button key={s} onClick={() => forceOrderStatus(viewOrderModal._id, s)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${(statusColors[s] || statusColors.pending).color}40`, background: `${(statusColors[s] || statusColors.pending).color}12`, color: (statusColors[s] || statusColors.pending).color, cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s', textTransform: 'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ REPLY SUPPORT TICKET MODAL ══ */}
      <Modal open={!!replyTicketModal} onClose={() => setReplyTicketModal(null)} title={`Reply to Ticket — #${replyTicketModal?._id?.slice(-6).toUpperCase()}`} width={480}>
        {replyTicketModal && (
          <form onSubmit={handleReplyTicket} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 3px', textTransform: 'uppercase' }}>Ticket Details</p>
              <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, fontSize: 13 }}>
                <p style={{ margin: '0 0 4px' }}><strong>Sender:</strong> {replyTicketModal.name} ({replyTicketModal.email})</p>
                <p style={{ margin: '0 0 4px' }}><strong>Subject:</strong> {replyTicketModal.subject}</p>
                <p style={{ margin: 0 }}><strong>Message:</strong> {replyTicketModal.message}</p>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Your Reply Message (Sent via Email)</label>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write your response to the customer here..."
                required
                rows={6}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <AnimatedButton variant="secondary" onClick={() => setReplyTicketModal(null)}>Cancel</AnimatedButton>
              <AnimatedButton type="submit" variant="primary" loading={replyLoading}>Send Reply & Resolve</AnimatedButton>
            </div>
          </form>
        )}
      </Modal>

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @media (max-width: 768px) {
          table { font-size: 12px; }
          th, td { padding: 8px 10px !important; }
        }
      `}</style>
    </div>
  );
};

function InfoBlock({ label, value, color }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <div style={{ fontSize: 14, fontWeight: 600, color: color || 'var(--text-primary)' }}>{value || '—'}</div>
    </div>
  );
}

export default AdminDashboard;