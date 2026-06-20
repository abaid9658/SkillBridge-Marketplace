import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/ui/AnimatedButton';
import FileUpload from '../components/ui/FileUpload';
import {
  BarChart2, Briefcase, Package, Star, Settings, DollarSign,
  TrendingUp, Clock, CheckCircle, MessageSquare, PlusCircle,
  RefreshCw, Eye, Edit2, Trash2, AlertCircle, User, BadgeCheck,
  ArrowRight, Send,
} from 'lucide-react';

const COLORS = { primary: '#818cf8', green: '#34d399', orange: '#fb923c', red: '#f87171', cyan: '#22d3ee', yellow: '#facc15', pink: '#f472b6' };

const statusColors = {
  pending:     { c: '#facc15', b: 'rgba(250,204,21,0.12)' },
  accepted:    { c: '#a78bfa', b: 'rgba(167,139,250,0.12)' },
  'in-progress':{ c: '#818cf8', b: 'rgba(99,102,241,0.12)' },
  revision:    { c: '#fb923c', b: 'rgba(251,146,60,0.12)' },
  completed:   { c: '#22d3ee', b: 'rgba(34,211,238,0.12)' },
  delivered:   { c: '#22d3ee', b: 'rgba(34,211,238,0.12)' },
  cancelled:   { c: '#f87171', b: 'rgba(248,113,113,0.12)' },
  active:      { c: '#34d399', b: 'rgba(52,211,153,0.12)' },
  inactive:    { c: '#6b7280', b: 'rgba(107,114,128,0.12)' },
};
function SBadge({ status }) {
  const s = statusColors[status] || { c: '#818cf8', b: 'rgba(99,102,241,0.12)' };
  return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.b, color: s.c, border: `1px solid ${s.c}40`, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{status?.replace(/-/g, ' ')}</span>;
}
function StatCard({ icon, title, value, color, sub }) {
  return (
    <div style={{ padding: 20, borderRadius: 16, background: 'var(--glass-bg)', border: '1px solid var(--border-color)', backdropFilter: 'blur(12px)' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const TABS = [
  { id: 'overview',       label: 'Overview',        icon: <BarChart2 size={15} /> },
  { id: 'orders',         label: 'Orders',           icon: <Package size={15} /> },
  { id: 'my-services',    label: 'My Services',      icon: <Briefcase size={15} /> },
  { id: 'my-proposals',   label: 'My Proposals',     icon: <Send size={15} /> },
  { id: 'profile',        label: 'Profile',          icon: <Settings size={15} /> },
];

const ProviderDashboard = () => {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [proposals, setProposals] = useState([]);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [profilePic, setProfilePic] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, svcRes, ordersRes] = await Promise.all([
        api.get('/users/stats').catch(() => ({ data: {} })),
        api.get('/services/my-services'),
        api.get('/requests'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (svcRes.data.success) setServices(svcRes.data.services || []);
      if (ordersRes.data.success) setOrders(ordersRes.data.requests || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchProposals = useCallback(async () => {
    // Get jobs from the board and check which ones this provider applied to
    // For now, we simulate by getting all open jobs and filtering locally
    try {
      const res = await api.get('/jobs?limit=50&status=open');
      // In a real implementation we'd have GET /jobs/my-proposals
      // For now show available jobs to apply to
      if (res.data.success) setProposals(res.data.data || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchData();
    fetchProposals();
  }, [fetchData, fetchProposals]);

  const handleUpdateStatus = async (id, status, note = '') => {
    try {
      await api.put(`/requests/${id}/status`, { status, note });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Status update failed.'); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchData();
    } catch (err) { alert('Failed to delete.'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg('');
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('bio', bio);
      fd.append('location', location);
      fd.append('skills', JSON.stringify(skills.split(',').map(s => s.trim()).filter(Boolean)));
      if (profilePic) fd.append('profilePicture', profilePic);
      const res = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) { updateProfileState(res.data.user); setProfileMsg('Profile updated!'); }
    } catch (err) { setProfileMsg(err.response?.data?.message || 'Update failed.'); }
    finally { setUpdatingProfile(false); }
  };

  const activeOrders = orders.filter(o => ['accepted', 'in-progress', 'revision'].includes(o.status));
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status));

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.07) 0%, transparent 100%)', borderBottom: '1px solid var(--border-color)', padding: '36px 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(99,102,241,0.3)', overflow: 'hidden', flexShrink: 0 }}>
              {user?.profilePicture ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} color="#818cf8" />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 'clamp(18px,3vw,30px)', fontWeight: 900, margin: 0 }}>{user?.name}</h1>
                {user?.isVerified && <BadgeCheck size={18} color={COLORS.cyan} />}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Provider Dashboard · ⭐ {user?.avgRating?.toFixed(1) || '—'} · {user?.completedProjects || 0} completed</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
              <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}><RefreshCw size={13} />Refresh</button>
              <Link to="/create-service"><AnimatedButton variant="primary" style={{ padding: '8px 16px', fontSize: 13 }}><PlusCircle size={14} />New Service</AnimatedButton></Link>
            </div>
          </div>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, background: activeTab === t.id ? 'var(--glass-bg)' : 'transparent', color: activeTab === t.id ? COLORS.primary : 'var(--text-secondary)', borderBottom: activeTab === t.id ? `2px solid ${COLORS.primary}` : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>{t.icon}{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>}

        {/* ══ OVERVIEW ══ */}
        {!loading && activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard icon={<DollarSign size={20} />} title="Total Earnings" value={`$${(stats?.totalEarnings || user?.totalEarnings || 0).toLocaleString()}`} color={COLORS.green} sub="All-time" />
              <StatCard icon={<CheckCircle size={20} />} title="Completed" value={stats?.completedProjects || user?.completedProjects || 0} color={COLORS.cyan} />
              <StatCard icon={<Clock size={20} />} title="Active Orders" value={activeOrders.length} color={COLORS.orange} />
              <StatCard icon={<AlertCircle size={20} />} title="New Requests" value={pendingOrders.length} color={COLORS.yellow} />
              <StatCard icon={<Briefcase size={20} />} title="Services" value={services.length} color={COLORS.primary} sub={`${services.filter(s=>s.status==='active').length} active`} />
            </div>

            {/* Pending requests */}
            {pendingOrders.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.yellow, display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />New Requests ({pendingOrders.length})</h3>
                {pendingOrders.map(o => (
                  <div key={o._id} style={{ marginBottom: 12, padding: '18px 22px', background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{o.service?.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>from {o.customer?.name} · ${o.budget}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleUpdateStatus(o._id, 'accepted', 'Accepted by provider.')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.1)', color: COLORS.green, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Accept</button>
                      <button onClick={() => handleUpdateStatus(o._id, 'cancelled', 'Declined by provider.')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.1)', color: COLORS.red, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Decline</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Active orders */}
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, marginTop: 24 }}>🔥 Active Orders ({activeOrders.length})</h3>
            {activeOrders.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 14 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No active orders. <Link to="/jobs" style={{ color: COLORS.primary, fontWeight: 700 }}>Browse job board →</Link></p>
              </div>
            ) : activeOrders.map(o => (
              <div key={o._id} style={{ marginBottom: 12, padding: '18px 22px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{o.service?.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Client: {o.customer?.name} · Budget: ${o.budget}</div>
                  </div>
                  <SBadge status={o.status} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/chat?user=${o.customer?._id}`}><button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}><MessageSquare size={12} />Message</button></Link>
                  {o.status === 'accepted' && <button onClick={() => handleUpdateStatus(o._id, 'in-progress', 'Work started.')} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${COLORS.primary}40`, background: `${COLORS.primary}10`, color: COLORS.primary, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Start Work</button>}
                  {o.status === 'in-progress' && <button onClick={() => handleUpdateStatus(o._id, 'completed', 'Deliverable submitted.')} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${COLORS.green}40`, background: `${COLORS.green}10`, color: COLORS.green, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Mark Delivered</button>}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ══ ORDERS ══ */}
        {!loading && activeTab === 'orders' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>All Orders ({orders.length})</h2>
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>📦</div><p>No orders yet. Create services and get discovered!</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {orders.map(o => (
                  <div key={o._id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{o.service?.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Client: {o.customer?.name} · Package: {o.selectedPackage}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <SBadge status={o.status} />
                        <span style={{ fontWeight: 800, fontSize: 15, color: COLORS.green }}>${o.budget}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.requirements}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link to={`/chat?user=${o.customer?._id}`}><button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}><MessageSquare size={12} />Chat</button></Link>
                      {o.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(o._id, 'accepted')} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.green}40`, background: `${COLORS.green}10`, color: COLORS.green, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Accept</button>
                          <button onClick={() => handleUpdateStatus(o._id, 'cancelled')} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.red}40`, background: `${COLORS.red}10`, color: COLORS.red, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Decline</button>
                        </>
                      )}
                      {o.status === 'accepted' && <button onClick={() => handleUpdateStatus(o._id, 'in-progress')} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.primary}40`, background: `${COLORS.primary}10`, color: COLORS.primary, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Start Work</button>}
                      {o.status === 'in-progress' && <button onClick={() => handleUpdateStatus(o._id, 'completed')} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.green}40`, background: `${COLORS.green}10`, color: COLORS.green, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Deliver</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ MY SERVICES ══ */}
        {!loading && activeTab === 'my-services' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>My Services ({services.length})</h2>
              <Link to="/create-service"><AnimatedButton variant="primary" style={{ padding: '8px 16px', fontSize: 13 }}><PlusCircle size={14} />Add New</AnimatedButton></Link>
            </div>
            {services.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No services yet. Create your first gig!</p>
                <Link to="/create-service"><AnimatedButton variant="primary">Create Service</AnimatedButton></Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
                {services.map(s => (
                  <div key={s._id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 150, overflow: 'hidden', position: 'relative' }}>
                      <img src={s.images?.[0]?.url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80'} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 10, right: 10 }}><SBadge status={s.status} /></div>
                    </div>
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{s.category} · ⭐ {s.avgRating?.toFixed(1) || '—'} ({s.totalReviews || 0})</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: COLORS.green }}>${s.price}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/services/${s._id}`}><button title="View" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button></Link>
                          <button title="Delete" onClick={() => handleDeleteService(s._id)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.red}40`, background: 'none', color: COLORS.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ MY PROPOSALS (browse job board) ══ */}
        {!loading && activeTab === 'my-proposals' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Job Board — Apply to Jobs</h2>
              <Link to="/jobs"><AnimatedButton variant="primary" style={{ padding: '8px 16px', fontSize: 13 }}>Browse All Jobs <ArrowRight size={13} /></AnimatedButton></Link>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Open job postings from clients looking for your skills. Click any job to submit a proposal.</p>
            {proposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><p>No open jobs found right now. Check back soon!</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {proposals.map(j => (
                  <div key={j._id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{j.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{j.category} · Budget: ${j.budget?.min}–${j.budget?.max} · {j.proposalCount || 0} proposals</div>
                    </div>
                    <Link to={`/jobs/${j._id}`}><AnimatedButton variant="primary" style={{ padding: '7px 16px', fontSize: 13 }}>Apply Now</AnimatedButton></Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ PROFILE ══ */}
        {!loading && activeTab === 'profile' && (
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Provider Profile</h2>
            {profileMsg && (
              <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, background: profileMsg.includes('success') || profileMsg.includes('updated') ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: profileMsg.includes('success') || profileMsg.includes('updated') ? COLORS.green : COLORS.red, border: `1px solid ${profileMsg.includes('success') || profileMsg.includes('updated') ? COLORS.green : COLORS.red}40`, fontSize: 13 }}>{profileMsg}</div>
            )}
            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 28 }}>
                {[
                  { label: 'Full Name', value: name, set: setName },
                  { label: 'Location', value: location, set: setLocation },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>{f.label}</label>
                    <input value={f.value} onChange={e => f.set(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Professional Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Skills (comma-separated)</label>
                  <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, Figma, Python…" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Profile Picture</label>
                  <FileUpload onFileSelect={setProfilePic} label="Choose Photo" />
                </div>
                <AnimatedButton type="submit" variant="primary" loading={updatingProfile}>Save Changes</AnimatedButton>
              </div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
};

export default ProviderDashboard;
