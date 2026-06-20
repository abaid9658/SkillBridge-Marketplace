import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import SearchBar from '../components/ui/SearchBar';
import AnimatedButton from '../components/ui/AnimatedButton';
import {
  Code, Palette, Share2, PenTool, Smartphone, Monitor, TrendingUp,
  Search, ArrowRight, Star, Users, Brain, ShieldCheck, Zap
} from 'lucide-react';

const catMeta = [
  { name: 'Website Development', icon: Code, color: '#818cf8', count: '1,240' },
  { name: 'Logo Design', icon: Palette, color: '#f472b6', count: '890' },
  { name: 'Social Media Management', icon: Share2, color: '#22d3ee', count: '650' },
  { name: 'Content Writing', icon: PenTool, color: '#fb923c', count: '940' },
  { name: 'Mobile App Development', icon: Smartphone, color: '#34d399', count: '420' },
  { name: 'UI/UX Design', icon: Palette, color: '#a78bfa', count: '780' },
  { name: 'Video Editing', icon: Monitor, color: '#f87171', count: '510' },
  { name: 'SEO & Digital Marketing', icon: TrendingUp, color: '#facc15', count: '1,100' }
];

const Explore = () => {
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExploreData = async () => {
    setLoading(true);
    try {
      const [servicesRes, providersRes] = await Promise.all([
        api.get('/services?limit=4&sort=-avgRating'),
        api.get('/users/providers?limit=4&sort=-avgRating')
      ]);

      if (servicesRes.data.success) {
        setFeaturedServices(servicesRes.data.services);
      }
      if (providersRes.data.success) {
        setTopProviders(providersRes.data.providers);
      }
    } catch (err) {
      console.error('Failed to fetch explore page resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreData();
  }, []);

  const handleSearch = (query) => {
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* HERO / SEARCH HEADER */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '80px 0 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '80%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{
            padding: '4px 12px', borderRadius: '999px',
            background: 'var(--primary-glow)', border: '1px solid var(--border-color)',
            fontSize: '12px', fontWeight: '700', color: 'var(--primary)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', display: 'inline-block'
          }}>
            Explore Services & Talent
          </span>
          
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '20px' }}>
            Find the Perfect <span className="gradient-text">Freelance Solution</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Instantly connect with top vetted experts, post custom projects, and hire standard agencies.
          </p>

          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <SearchBar onSearch={handleSearch} placeholder="What service are you looking for today? (e.g. Logo Design, Website)" />
          </div>
        </div>
      </div>

      {/* BROWSE BY CATEGORY */}
      <div className="container" style={{ marginTop: '60px' }}>
        <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Browse Categories</h2>
          <Link to="/services" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            See All Services <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {catMeta.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <GlassCard
                key={idx}
                onClick={() => navigate(`/services?category=${encodeURIComponent(cat.name)}`)}
                style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.25s' }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `rgba(${parseInt(cat.color.slice(1,3), 16) || 99}, ${parseInt(cat.color.slice(3,5), 16) || 102}, ${parseInt(cat.color.slice(5,7), 16) || 241}, 0.15)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Icon size={20} color={cat.color} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>{cat.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.count} listings</span>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* TOP RATED FREELANCERS */}
      <div className="container" style={{ marginTop: '80px' }}>
        <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Top Rated Experts</h2>
        </div>

        {loading ? (
          <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {topProviders.map(provider => (
              <GlassCard key={provider._id} style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden' }}>
                  <img src={provider.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>{provider.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>⭐ {provider.avgRating?.toFixed(1) || '5.0'}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({provider.totalReviews || 0})</span>
                </div>
                <p style={{
                  fontSize: '12px', color: 'var(--text-secondary)',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', minHeight: '36px', marginBottom: '16px'
                }}>
                  {provider.bio || 'Professional service provider.'}
                </p>
                <Link to={`/profile/${provider._id}`}>
                  <AnimatedButton variant="secondary" style={{ width: '100%', padding: '6px 0', fontSize: '12px' }}>
                    View Profile
                  </AnimatedButton>
                </Link>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Explore;
