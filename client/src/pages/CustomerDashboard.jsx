import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/ui/AnimatedButton';
import FileUpload from '../components/ui/FileUpload';
import StarRating from '../components/ui/StarRating';
import {
  Package, Briefcase, Star, Settings, RefreshCw, Eye, MessageSquare,
  Clock, DollarSign, CheckCircle, XCircle, AlertTriangle, ArrowRight,
  PlusCircle, User, MapPin, Edit2, ChevronRight, BarChart2, Heart,
  ShieldCheck, TrendingUp,
} from 'lucide-react';

/* ─── palette ─── */
const COLORS = { primary: '#818cf8', green: '#34d399', orange: '#fb923c', red: '#f87171', cyan: '#22d3ee', yellow: '#facc15', pink: '#f472b6' };

const statusColors = {
  pending: { c: '#facc15', b: 'rgba(250,204,21,0.12)' },
  accepted: { c: '#a78bfa', b: 'rgba(167,139,250,0.12)' },
  'in-progress': { c: '#818cf8', b: 'rgba(99,102,241,0.12)' },
  revision: { c: '#fb923c', b: 'rgba(251,146,60,0.12)' },
  completed: { c: '#22d3ee', b: 'rgba(34,211,238,0.12)' },
  delivered: { c: '#22d3ee', b: 'rgba(34,211,238,0.12)' },
  cancelled: { c: '#f87171', b: 'rgba(248,113,113,0.12)' },
  open: { c: '#34d399', b: 'rgba(52,211,153,0.12)' },
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
  { id: 'overview',  label: 'Overview',   icon: <BarChart2 size={15} /> },
  { id: 'orders',    label: 'My Orders',  icon: <Package size={15} /> },
  { id: 'jobs',      label: 'My Jobs',    icon: <Briefcase size={15} /> },
  { id: 'reviews',   label: 'Reviews',    icon: <Star size={15} /> },
  { id: 'profile',   label: 'Profile',    icon: <Settings size={15} /> },
];

const CustomerDashboard = () => {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [myJobs, setMyJobs] = useState([]);
  const [jobTotal, setJobTotal] = useState(0);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [profilePic, setProfilePic] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Review modal
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, jobsRes] = await Promise.all([
        api.get('/requests'),
        api.get('/jobs/me/list'),
      ]);
      if (ordersRes.data.success) { setOrders(ordersRes.data.requests || []); setOrderTotal(ordersRes.data.total || 0); }
      if (jobsRes.data.success) { setMyJobs(jobsRes.data.data || []); setJobTotal(jobsRes.data.pagination?.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg('');
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('bio', bio);
      fd.append('location', location);
      if (profilePic) fd.append('profilePicture', profilePic);
      const res = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) { updateProfileState(res.data.user); setProfileMsg('Profile updated successfully!'); }
    } catch (err) { setProfileMsg(err.response?.data?.message || 'Update failed.'); }
    finally { setUpdatingProfile(false); }
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { requestId: reviewModal._id, rating, comment });
      setReviewModal(null);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  const activeOrders = orders.filter(o => ['accepted', 'in-progress', 'revision'].includes(o.status));
  const completedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status));
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const openJobs = myJobs.filter(j => j.status === 'open');

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, rgba(52,211,153,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border-color)', padding: '36px 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(52,211,153,0.3)', overflow: 'hidden' }}>
              {user?.profilePicture ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} color="#34d399" />}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, margin: 0 }}>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span></h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Customer Dashboard · Manage your orders, jobs & profile</p>
            </div>
            <button onClick={fetchData} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <RefreshCw size={13} />Refresh
            </button>
          </div>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, background: activeTab === t.id ? 'var(--glass-bg)' : 'transparent', color: activeTab === t.id ? COLORS.green : 'var(--text-secondary)', borderBottom: activeTab === t.id ? `2px solid ${COLORS.green}` : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>{t.icon}{t.label}</button>
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
              <StatCard icon={<Package size={20} />} title="Total Orders" value={orders.length} color={COLORS.primary} sub={`${activeOrders.length} active`} />
              <StatCard icon={<Clock size={20} />} title="Active Orders" value={activeOrders.length} color={COLORS.orange} />
              <StatCard icon={<CheckCircle size={20} />} title="Completed" value={completedOrders.length} color={COLORS.green} />
              <StatCard icon={<Briefcase size={20} />} title="Job Posts" value={myJobs.length} color={COLORS.cyan} sub={`${openJobs.length} open`} />
            </div>

            {/* Active orders */}
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🔥 Active Orders ({activeOrders.length})</h3>
            {activeOrders.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 16, marginBottom: 32 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No active orders yet. <Link to="/explore" style={{ color: COLORS.green, fontWeight: 700 }}>Explore services →</Link></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {activeOrders.map(o => (
                  <div key={o._id} style={{ padding: '18px 22px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{o.service?.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Provider: {o.provider?.name} · ${o.budget}</div>
                    </div>
                    <SBadge status={o.status} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/chat?user=${o.provider?._id}`}><button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}><MessageSquare size={12} />Chat</button></Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Open job posts */}
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>📋 Your Open Job Posts ({openJobs.length})</h3>
            {openJobs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No open jobs. <Link to="/create-job" style={{ color: COLORS.cyan, fontWeight: 700 }}>Post a job →</Link></p>
              </div>
            ) : openJobs.slice(0, 3).map(j => (
              <div key={j._id} style={{ padding: '16px 20px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{j.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{j.category} · ${j.budget?.min}–${j.budget?.max} · {j.proposalCount || 0} proposals</div>
                </div>
                <SBadge status={j.status} />
                <Link to={`/jobs/${j._id}/proposals`}><button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>View Proposals</button></Link>
              </div>
            ))}
          </>
        )}

        {/* ══ ORDERS ══ */}
        {!loading && activeTab === 'orders' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Order History ({orders.length})</h2>
              <Link to="/explore"><AnimatedButton variant="primary" style={{ padding: '8px 16px', fontSize: 13 }}>Browse Services <ArrowRight size={13} /></AnimatedButton></Link>
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>📦</div><p>No orders yet.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {orders.map(o => (
                  <div key={o._id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{o.service?.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>by {o.provider?.name} · Package: {o.selectedPackage}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <SBadge status={o.status} />
                        <span style={{ fontWeight: 800, fontSize: 15, color: COLORS.green }}>${o.budget}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.requirements}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link to={`/chat?user=${o.provider?._id}`}><button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}><MessageSquare size={12} />Message Provider</button></Link>
                      {['delivered', 'completed'].includes(o.status) && !o.isReviewed && (
                        <button onClick={() => { setReviewModal(o); setRating(5); setComment(''); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.yellow}40`, background: `${COLORS.yellow}10`, color: COLORS.yellow, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}><Star size={12} />Leave Review</button>
                      )}
                      {o.isReviewed && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: COLORS.green, padding: '7px 14px' }}><CheckCircle size={12} />Reviewed</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ MY JOBS ══ */}
        {!loading && activeTab === 'jobs' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>My Job Posts ({myJobs.length})</h2>
              <Link to="/create-job"><AnimatedButton variant="primary" style={{ padding: '8px 16px', fontSize: 13 }}><PlusCircle size={14} />Post a Job</AnimatedButton></Link>
            </div>
            {myJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No job posts yet. Find experts by posting a job.</p>
                <Link to="/create-job"><AnimatedButton variant="primary">Post Your First Job</AnimatedButton></Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {myJobs.map(j => (
                  <div key={j._id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{j.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{j.category} · ${j.budget?.min}–${j.budget?.max}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <SBadge status={j.status} />
                        <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{j.proposalCount || 0} proposals</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{j.description}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/jobs/${j._id}`}><button style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>View Details</button></Link>
                      <Link to={`/jobs/${j._id}/proposals`}><button style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.primary}40`, background: `${COLORS.primary}10`, color: COLORS.primary, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>View Proposals ({j.proposalCount || 0})</button></Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ REVIEWS ══ */}
        {!loading && activeTab === 'reviews' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Your Reviews</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {completedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div><p>Complete an order to leave reviews.</p></div>
              ) : completedOrders.map(o => (
                <div key={o._id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{o.service?.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {o.provider?.name}</div>
                  </div>
                  {o.isReviewed
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: COLORS.green, fontSize: 13, fontWeight: 700 }}><CheckCircle size={15} />Reviewed</span>
                    : <button onClick={() => { setReviewModal(o); setRating(5); setComment(''); }} style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${COLORS.yellow}40`, background: `${COLORS.yellow}10`, color: COLORS.yellow, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Leave Review</button>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ PROFILE ══ */}
        {!loading && activeTab === 'profile' && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Edit Profile</h2>
            {profileMsg && (
              <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, background: profileMsg.includes('success') ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: profileMsg.includes('success') ? COLORS.green : COLORS.red, border: `1px solid ${profileMsg.includes('success') ? COLORS.green : COLORS.red}40`, fontSize: 13 }}>{profileMsg}</div>
            )}
            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 28 }}>
                {[{ label: 'Full Name', value: name, set: setName, type: 'text' }, { label: 'Location', value: location, set: setLocation, type: 'text' }].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
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

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div onClick={() => setReviewModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Rate Your Experience</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Leave a review for: <strong>{reviewModal.service?.title}</strong></p>
            <div style={{ marginBottom: 20 }}>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="Share details about your experience…" style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <AnimatedButton variant="secondary" onClick={() => setReviewModal(null)}>Cancel</AnimatedButton>
              <AnimatedButton variant="primary" onClick={submitReview} loading={submittingReview}>Submit Review</AnimatedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
