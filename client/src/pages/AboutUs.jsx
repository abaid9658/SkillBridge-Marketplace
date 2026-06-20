import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import { Award, ShieldCheck, Heart, Sparkles, Target, Users, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div style={{ minHeight: '100vh', padding: '60px 0 120px' }}>
      
      {/* HEADER HERO */}
      <div style={{ textAlign: 'center', marginBottom: '80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        
        <span style={{
          padding: '4px 12px', borderRadius: '999px',
          background: 'var(--primary-glow)', border: '1px solid var(--border-color)',
          fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase',
          letterSpacing: '0.08em', marginBottom: '16px', display: 'inline-block'
        }}>
          About SkillBridge
        </span>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: '900', letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.15 }}>
          Redefining the Future of <span className="gradient-text">Remote Collaboration</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          We connect talented service providers with clients globally, facilitating secure escrow contract execution and premium AI-assisted remote workflows.
        </p>
      </div>

      {/* MISSION & VISION */}
      <div className="container" style={{ marginBottom: '100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }} className="mission-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={24} color="var(--primary)" />
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>Our Mission</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
              At SkillBridge, our mission is to empower global freelancers and companies to collaborate seamlessly without borders. We remove payment friction, build mutual trust via smart escrow mechanisms, and equip agencies and freelancers with AI-powered toolkits to accelerate their productivity.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={24} color="var(--secondary)" />
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>Our Vision</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
              We envision a world where skill is the only currency. Whether you are a solo developer, creative designer, or scaling digital marketing agency, our platform acts as your digital HQ to handle clients, payouts, project briefs, and AI assistance.
            </p>
          </div>
          
          <GlassCard style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Platform Highlights</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Active Users</span>
                <span style={{ fontWeight: '800', color: 'var(--primary)' }}>50,000+</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Completed Gigs</span>
                <span style={{ fontWeight: '800', color: 'var(--secondary)' }}>200,000+</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Transaction Volume</span>
                <span style={{ fontWeight: '800', color: 'var(--accent)' }}>$12.5M+</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Customer Satisfaction</span>
                <span style={{ fontWeight: '800', color: '#10b981' }}>99.2%</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* CORE VALUES */}
      <div className="container" style={{ marginBottom: '100px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px', textAlign: 'center' }}>
          What Sets <span className="gradient-text">SkillBridge</span> Apart
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="values-grid">
          
          <GlassCard style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldCheck size={28} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Secure Work Escrow</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              All financial contracts are processed securely using milestone-based escrow balances to protect both parties.
            </p>
          </GlassCard>

          <GlassCard style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sparkles size={28} color="var(--secondary)" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>AI Automation Copilot</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Leverage custom AI engines to generate high converting gig descriptions and write winning proposal cover letters.
            </p>
          </GlassCard>

          <GlassCard style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(236,72,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Users size={28} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Vetted Top Experts</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Every provider profile is curated with review histories, custom portfolios, and skill tags to guarantee premium service execution.
            </p>
          </GlassCard>

        </div>
      </div>

      {/* TEAM SECTION */}
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px' }}>Meet Our Leadership</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }} className="team-grid">
          
          <GlassCard style={{ padding: '24px' }}>
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80" alt="CEO" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>Sarah Jenkins</h3>
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700', display: 'block', marginBottom: '12px' }}>Co-Founder & CEO</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Former product lead with 12+ years of experience building remote work platforms.</p>
          </GlassCard>

          <GlassCard style={{ padding: '24px' }}>
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80" alt="CTO" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>Marcus Chen</h3>
            <span style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: '700', display: 'block', marginBottom: '12px' }}>Chief Technology Officer</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Passionate about AI models, smart contract escrows, and ultra-fast web architectures.</p>
          </GlassCard>

          <GlassCard style={{ padding: '24px' }}>
            <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80" alt="VP Product" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>Elena Rostova</h3>
            <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '700', display: 'block', marginBottom: '12px' }}>VP of Product Experience</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Design evangelist focused on premium glassmorphism interfaces and fluid interactions.</p>
          </GlassCard>

        </div>

        <div style={{ marginTop: '60px' }}>
          <Link to="/explore">
            <GlassCard style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 32px', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '15px', fontWeight: '800' }}>Ready to start? Explore current offerings</span>
              <ArrowRight size={18} color="var(--primary)" />
            </GlassCard>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .mission-grid, .values-grid, .team-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
