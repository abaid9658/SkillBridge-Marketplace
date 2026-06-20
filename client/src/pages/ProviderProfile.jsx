import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import StarRating from '../components/ui/StarRating';
import AnimatedButton from '../components/ui/AnimatedButton';
import { User, MessageSquare, MapPin, Tag, Star, Briefcase, ArrowLeft, Award } from 'lucide-react';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80';

const skillColors = [
  { color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  { color: '#f472b6', bg: 'rgba(236,72,153,0.15)' },
  { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  { color: '#22d3ee', bg: 'rgba(34,211,238,0.15)' },
  { color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
  { color: '#facc15', bg: 'rgba(250,204,21,0.15)' },
];

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, servicesRes, reviewsRes] = await Promise.all([
          api.get(`/users/providers/${id}`),
          api.get(`/services?provider=${id}`),
          api.get(`/reviews/provider/${id}`),
        ]);
        if (profileRes.data.success) setProvider(profileRes.data.provider);
        if (servicesRes.data.success) {
          setServices(servicesRes.data.services.filter(s => s.provider?._id === id || s.provider === id));
        }
        if (reviewsRes.data.success) setReviews(reviewsRes.data.reviews);
      } catch (err) {
        console.error('Failed to load provider profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: '44px', height: '44px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!provider) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Provider Not Found</h2>
      <Link to="/services"><AnimatedButton variant="primary">Explore Services</AnimatedButton></Link>
    </div>
  );

  const avgRating = provider.avgRating || 5;
  const totalReviews = provider.totalReviews || 0;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>

      {/* ── Hero banner ── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '32px 0 0',
        marginBottom: '40px',
      }}>
        <div className="container">
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600',
              marginBottom: '20px', padding: 0, transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Profile hero row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', paddingBottom: '32px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {provider.profilePicture ? (
                <img src={provider.profilePicture} alt={provider.name}
                  style={{ width: '96px', height: '96px', borderRadius: '24px', objectFit: 'cover', border: '3px solid rgba(99,102,241,0.3)', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }} />
              ) : (
                <div style={{
                  width: '96px', height: '96px', borderRadius: '24px',
                  background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', fontWeight: '900', color: '#818cf8',
                }}>
                  {provider.name?.[0]?.toUpperCase()}
                </div>
              )}
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: '6px', right: '6px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#34d399', border: '2px solid var(--bg-primary)',
                boxShadow: '0 0 8px #34d399',
              }} />
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '900', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                {provider.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <StarRating rating={avgRating} size={14} readOnly />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#facc15' }}>{avgRating.toFixed(1)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({totalReviews} reviews)</span>
                </div>
                {provider.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <MapPin size={13} /> {provider.location}
                  </span>
                )}
              </div>

              {provider.bio && (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '560px', lineHeight: '1.6' }}>
                  {provider.bio}
                </p>
              )}
            </div>

            {/* CTA */}
            <div style={{ flexShrink: 0 }}>
              <button
                onClick={() => navigate(`/chat?user=${provider._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '700',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)'}
              >
                <MessageSquare size={16} /> Contact Provider
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }} className="profile-layout">

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Stats */}
            <div style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              backdropFilter: 'blur(12px)',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
            }}>
              {[
                { label: 'Rating', value: avgRating.toFixed(1), icon: <Star size={14} color="#facc15" fill="#facc15" />, color: '#facc15' },
                { label: 'Reviews', value: totalReviews, icon: <Award size={14} color="#818cf8" />, color: '#818cf8' },
                { label: 'Services', value: services.length, icon: <Briefcase size={14} color="#34d399" />, color: '#34d399' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <SideCard title="Skills & Expertise" icon={<Tag size={15} color="#818cf8" />}>
              {provider.skills?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {provider.skills.map((skill, i) => {
                    const { color, bg } = skillColors[i % skillColors.length];
                    return (
                      <span key={skill} style={{
                        padding: '4px 12px', borderRadius: '999px',
                        background: bg, color,
                        border: `1px solid ${color}40`,
                        fontSize: '12px', fontWeight: '700',
                      }}>
                        {skill}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No skills listed.</p>
              )}
            </SideCard>

            {/* Experience */}
            {provider.experience && (
              <SideCard title="Experience" icon={<Award size={15} color="#facc15" />}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  {provider.experience}
                </p>
              </SideCard>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

            {/* Services */}
            <div>
              <SectionHeading icon={<Briefcase size={17} color="#818cf8" />} title="Active Services" count={services.length} />
              {services.length === 0 ? (
                <EmptyBox label="No active listings yet." />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {services.map(s => <ServiceCard key={s._id} service={s} />)}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <SectionHeading icon={<Star size={17} color="#facc15" />} title="Client Reviews" count={reviews.length} />
              {reviews.length === 0 ? (
                <EmptyBox label="No reviews yet." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .profile-layout { grid-template-columns: 1fr !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

/* ── Sub-components ── */

function SideCard({ title, icon, children }) {
  return (
    <div style={{
      padding: '20px', borderRadius: '16px',
      background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
        {icon}
        <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{title}</h2>
      {count > 0 && (
        <span style={{ padding: '2px 10px', borderRadius: '999px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontSize: '12px', fontWeight: '700' }}>
          {count}
        </span>
      )}
    </div>
  );
}

function ServiceCard({ service }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/services/${service._id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: '14px', overflow: 'hidden',
          background: 'var(--glass-bg)',
          border: `1px solid ${hovered ? 'rgba(99,102,241,0.35)' : 'var(--border-color)'}`,
          backdropFilter: 'blur(12px)',
          transition: 'all 0.22s ease',
          transform: hovered ? 'translateY(-3px)' : 'none',
          boxShadow: hovered ? '0 12px 40px rgba(99,102,241,0.15)' : 'none',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ height: '140px', overflow: 'hidden', background: 'var(--border-color)' }}>
          <img
            src={service.images?.[0]?.url || DEFAULT_IMG}
            alt={service.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          />
        </div>
        <div style={{ padding: '14px' }}>
          <h4 style={{
            fontSize: '14px', fontWeight: '700', margin: '0 0 12px', lineHeight: '1.4',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            color: hovered ? '#818cf8' : 'var(--text-primary)', transition: 'color 0.2s',
          }}>
            {service.title}
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starting at</span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#818cf8' }}>${service.price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ReviewCard({ review }) {
  return (
    <div style={{
      padding: '20px', borderRadius: '14px',
      background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
      backdropFilter: 'blur(12px)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'rgba(99,102,241,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '800', color: '#818cf8',
          }}>
            {review.customer?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{review.customer?.name}</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Verified Client</p>
          </div>
        </div>
        <StarRating rating={review.rating} size={13} readOnly />
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
        {review.comment}
      </p>
    </div>
  );
}

function EmptyBox({ label }) {
  return (
    <div style={{
      textAlign: 'center', padding: '40px',
      borderRadius: '14px',
      background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
      color: 'var(--text-muted)', fontSize: '14px',
    }}>
      📭 {label}
    </div>
  );
}

export default ProviderProfile;