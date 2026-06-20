import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroScene from '../components/three/HeroScene';
import ParticleBackground from '../components/three/ParticleBackground';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import SearchBar from '../components/ui/SearchBar';
import {
  Code, Palette, Share2, PenTool, Smartphone, Monitor,
  ShieldCheck, TrendingUp, Star, ArrowRight, Zap, Globe, Award
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../utils/constants';

/* ─── Category icon map ─── */
const categoryIcons = {
  'Website Development': Code,
  'Logo Design': Palette,
  'Social Media Management': Share2,
  'Content Writing': PenTool,
  'Mobile App Development': Smartphone,
  'UI/UX Design': Palette,
  'Video Editing': Monitor,
  'SEO & Digital Marketing': TrendingUp,
};

/* ─── Category accent colours ─── */
const categoryColors = [
  { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  { bg: 'rgba(236,72,153,0.15)', color: '#f472b6' },
  { bg: 'rgba(34,211,238,0.15)', color: '#22d3ee' },
  { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
  { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  { bg: 'rgba(250,204,21,0.15)', color: '#facc15' },
];

/* ─── Animated counter hook ─── */
function useCounter(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) { setStarted(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

/* ─── Main Component ─── */
const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const { count: freelancerCount, ref: ref1 } = useCounter(10000);
  const { count: projectCount, ref: ref2 } = useCounter(50000);
  const { count: satisfactionCount, ref: ref3 } = useCounter(999);

  /* Mouse parallax */
  useEffect(() => {
    const onMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* Scroll parallax */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (query) => {
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <ParticleBackground />

      {/* ─── Ambient glow orbs ─── */}
      <div style={{
        position: 'fixed', top: '10%', left: '5%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
        transition: 'transform 0.8s ease',
      }} />
      <div style={{
        position: 'fixed', bottom: '20%', right: '5%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        transform: `translate(${-mousePos.x * 0.2}px, ${-mousePos.y * 0.2}px)`,
        transition: 'transform 1s ease',
      }} />

      {/* ════════════════════════════════
          SCENE 1 — HERO
      ════════════════════════════════ */}
      <section
        ref={heroRef}
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 0.7fr',
          gap: '48px',
          alignItems: 'center',
          paddingTop: '80px',
          paddingBottom: '100px',
          minHeight: '88vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left — headline + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Eyebrow badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '999px',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              fontSize: '13px', fontWeight: '600', color: '#818cf8',
              letterSpacing: '0.04em',
            }}>
              <Zap size={13} /> TRUSTED MARKETPLACE
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            lineHeight: '1.08',
            fontWeight: '900',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Hire Premium{' '}
            <span className="gradient-text" style={{ display: 'inline-block' }}>
              Freelancers
            </span>{' '}
            <br />For Your Next{' '}
            <span style={{
              position: 'relative', display: 'inline-block',
            }}>
              Venture
              <span style={{
                position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                borderRadius: '2px',
              }} />
            </span>
          </h1>

          <p style={{
            fontSize: '18px', lineHeight: '1.7',
            color: 'var(--text-secondary)',
            maxWidth: '520px', margin: 0,
          }}>
            Connect with vetted professionals for design, development, marketing, and more.
            Real-time tracking. Secure payments. Results guaranteed.
          </p>

          <div style={{ marginTop: '4px' }}>
            <SearchBar onSearch={handleSearchSubmit} placeholder="Try 'website development' or 'logo design'…" />
          </div>

          {/* Popular tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['UI/UX Design', 'React Dev', 'Logo', 'SEO', 'Video Editing'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/services?search=${encodeURIComponent(tag)}`)}
                style={{
                  padding: '5px 14px', borderRadius: '999px', fontSize: '12px',
                  fontWeight: '600', cursor: 'pointer',
                  background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
            <Link to="/services">
              <AnimatedButton variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Explore Services <ArrowRight size={16} />
              </AnimatedButton>
            </Link>
            <Link to="/register">
              <AnimatedButton variant="secondary">Join as Provider</AnimatedButton>
            </Link>
          </div>

          {/* Social proof row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                  width: '32px', height: '32px', borderRadius: '50%', marginLeft: i > 1 ? '-10px' : '0',
                  background: `hsl(${i * 60}, 70%, 55%)`,
                  border: '2px solid var(--bg-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700', color: '#fff',
                }}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="#facc15" color="#facc15" />)}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Trusted by <strong style={{ color: 'var(--text-primary)' }}>10,000+</strong> businesses
              </p>
            </div>
          </div>
        </div>

        {/* Right — 3D Scene */}
        <div style={{ position: 'relative' }}>
          {/* Glow ring */}
          <div style={{
            position: 'absolute', inset: '-20px',
            borderRadius: 'var(--border-radius-lg)',
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div
            className="glass-panel"
            style={{
              height: '420px',
              borderRadius: 'var(--border-radius-lg)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(99,102,241,0.15), var(--shadow-lg)',
              border: '1px solid rgba(99,102,241,0.2)',
              transform: `perspective(1000px) rotateY(${mousePos.x * 0.02}deg) rotateX(${-mousePos.y * 0.015}deg)`,
              transition: 'transform 0.5s ease',
            }}
          >
            <HeroScene />
          </div>

          {/* Floating stat badges */}
          <FloatingBadge
            top="-18px" left="-24px"
            icon={<Award size={16} color="#facc15" />}
            label="Top Rated" value="99.9%" color="#facc15"
            delay="0s"
          />
          <FloatingBadge
            bottom="-18px" right="-24px"
            icon={<Globe size={16} color="#34d399" />}
            label="Projects Done" value="50k+" color="#34d399"
            delay="0.3s"
          />
        </div>
      </section>

      {/* ════════════════════════════════
          SCENE 2 — ANIMATED STATS
      ════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.04) 50%, transparent 100%)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '60px 0',
        marginBottom: '100px',
        position: 'relative', zIndex: 1,
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          textAlign: 'center',
        }}>
          <StatBlock
            refProp={ref1}
            value={freelancerCount >= 10000 ? '10k+' : freelancerCount.toLocaleString()}
            label="Active Freelancers"
            color="#818cf8"
            icon={<Award size={20} color="#818cf8" />}
          />
          <StatBlock
            refProp={ref2}
            value={projectCount >= 50000 ? '50k+' : projectCount.toLocaleString()}
            label="Projects Delivered"
            color="#f472b6"
            icon={<TrendingUp size={20} color="#f472b6" />}
          />
          <StatBlock
            refProp={ref3}
            value={satisfactionCount >= 999 ? '99.9%' : `${(satisfactionCount / 10).toFixed(1)}%`}
            label="Customer Satisfaction"
            color="#34d399"
            icon={<Star size={20} color="#34d399" />}
          />
        </div>
      </section>

      {/* ════════════════════════════════
          SCENE 3 — CATEGORIES GRID
      ════════════════════════════════ */}
      <section className="container" style={{ marginBottom: '100px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase' }}>
            What are you looking for?
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Browse Popular <span className="gradient-text">Categories</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
            Explore services matching your industry demands
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}>
          {SERVICE_CATEGORIES.map((cat, i) => {
            const Icon = categoryIcons[cat] || Code;
            const { bg, color } = categoryColors[i % categoryColors.length];
            return (
              <Link key={cat} to={`/services?category=${encodeURIComponent(cat)}`} style={{ textDecoration: 'none' }}>
                <CategoryCard Icon={Icon} cat={cat} bg={bg} color={color} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════
          SCENE 4 — WHY US / FEATURE STRIP
      ════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(236,72,153,0.04) 100%)',
        border: '1px solid var(--border-color)',
        padding: '80px 0',
        marginBottom: '100px',
        position: 'relative', zIndex: 1,
        overflow: 'hidden',
      }}>
        {/* Decorative line */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '1px', height: '100%',
          background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.3), transparent)',
          pointerEvents: 'none',
        }} />

        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Why Choose <span className="gradient-text">SkillBridge</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
              Built for serious work. Designed for great outcomes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {[
              { icon: <ShieldCheck size={28} />, color: '#34d399', title: 'Verified Experts', desc: 'Every provider is manually vetted for skills, portfolio quality, and communication.' },
              { icon: <Zap size={28} />, color: '#818cf8', title: 'Real-time Tracking', desc: 'Monitor project progress live. Get updates the moment things move forward.' },
              { icon: <Globe size={28} />, color: '#22d3ee', title: 'Secure Payments', desc: 'Funds held in escrow. Released only when you approve the final delivery.' },
              { icon: <Star size={28} />, color: '#facc15', title: 'Satisfaction Guarantee', desc: 'Not happy? We work with you until the job meets your standard.' },
            ].map((feat) => (
              <FeatureCard key={feat.title} {...feat} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          SCENE 5 — CTA FINAL
      ════════════════════════════════ */}
      <section className="container" style={{ paddingBottom: '100px', position: 'relative', zIndex: 1 }}>
        <div style={{
          borderRadius: 'var(--border-radius-lg)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(236,72,153,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          padding: 'clamp(48px, 8vw, 80px) clamp(32px, 6vw, 80px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* BG glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px', height: '300px',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase' }}>
            Ready to start?
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', margin: '0 0 20px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Your next great project <br />
            <span className="gradient-text">starts here.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Join thousands of businesses that trust SkillBridge to get exceptional work done.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/services">
              <AnimatedButton variant="primary" style={{ fontSize: '16px', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Browse Services <ArrowRight size={18} />
              </AnimatedButton>
            </Link>
            <Link to="/register">
              <AnimatedButton variant="secondary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                Become a Seller
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          section.container {
            grid-template-columns: 1fr !important;
          }
          h1 { text-align: center !important; font-size: 40px !important; }
          p { text-align: center !important; }
          section.container > div:first-child { align-items: center; }
          section.container > div:first-child > div { justify-content: center !important; }
        }
      `}</style>
    </div>
  );
};

/* ─── Sub-components ─── */

function FloatingBadge({ top, bottom, left, right, icon, label, value, color, delay }) {
  return (
    <div style={{
      position: 'absolute', top, bottom, left, right,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-hover)',
      borderRadius: '12px',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: 'var(--shadow-md)',
      animation: `floatY 3s ease-in-out infinite`,
      animationDelay: delay,
      zIndex: 2,
    }}>
      {icon}
      <div>
        <div style={{ fontSize: '16px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
      </div>
      <style>{`@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}

function StatBlock({ refProp, value, label, color, icon }) {
  return (
    <div ref={refProp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '4px',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '900', color, margin: 0, lineHeight: 1 }}>
        {value}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontWeight: '500', margin: 0 }}>{label}</p>
    </div>
  );
}

function CategoryCard({ Icon, cat, bg, color }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 20px',
        borderRadius: 'var(--border-radius-md)',
        background: hovered ? bg : 'var(--glass-bg)',
        border: `1px solid ${hovered ? color + '50' : 'var(--border-color)'}`,
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '14px', textAlign: 'center',
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'none',
        boxShadow: hovered ? `0 12px 40px ${color}25` : 'none',
      }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.25s',
        transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'none',
      }}>
        <Icon size={26} color={color} />
      </div>
      <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: hovered ? color : 'var(--text-primary)', transition: 'color 0.2s' }}>
        {cat}
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
        Find top specialists
      </p>
    </div>
  );
}

function FeatureCard({ icon, color, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '32px 24px',
        borderRadius: 'var(--border-radius-md)',
        background: hovered ? `${color}10` : 'var(--glass-bg)',
        border: `1px solid ${hovered ? color + '40' : 'var(--border-color)'}`,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px', color,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{desc}</p>
    </div>
  );
}

export default Home;