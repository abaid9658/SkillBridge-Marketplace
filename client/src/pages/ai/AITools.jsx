import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { Sparkles, FileText, LayoutGrid, ArrowRight, Brain, Lock, Wand2 } from 'lucide-react';

const AITools = () => {
  const { user } = useAuth();
  const isLocked = !user || user.subscriptionTier === 'free';

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0 120px', position: 'relative' }}>
      
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: -1
      }} />

      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '999px',
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            color: '#a78bfa', fontSize: '13px', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px'
          }}>
            <Brain size={14} /> AI Copilot Workspace
          </div>
          
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Next-Gen AI <span className="gradient-text">Automation Tools</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Maximize your marketplace efficiency. Generate service listings, draft job descriptions, and write winning proposals in seconds.
          </p>

          {isLocked && (
            <div style={{
              marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '14px', fontWeight: '600'
            }}>
              <Lock size={16} />
              <span>AI Tools are currently locked on the Free tier. Upgrade on our <Link to="/pricing" style={{ color: '#fbbf24', textDecoration: 'underline' }}>Pricing Page</Link> to unlock.</span>
            </div>
          )}
        </div>

        {/* Grid cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }} className="ai-tools-grid">
          
          {/* Card 1: Service Generator */}
          <GlassCard style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px', position: 'relative', opacity: isLocked ? 0.75 : 1 }}>
            {isLocked && (
              <div style={{
                position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '999px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '11px', fontWeight: '700'
              }}>
                <Lock size={12} /> LOCKED
              </div>
            )}
            <div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
              }}>
                <Wand2 size={24} color="#a78bfa" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>
                Service Description Generator
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                Create high-converting, professional gig descriptions. Input your keywords and category, and let the AI draft details, FAQs, and search tags.
              </p>
            </div>
            <Link to={isLocked ? "/pricing" : "/ai/service-generator"} style={{ width: '100%' }}>
              <AnimatedButton variant={isLocked ? "secondary" : "primary"} style={{ width: '100%', padding: '12px' }}>
                {isLocked ? "Unlock with Pro" : "Launch Tool"} <ArrowRight size={14} />
              </AnimatedButton>
            </Link>
          </GlassCard>

          {/* Card 2: Proposal Generator */}
          <GlassCard style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px', position: 'relative', opacity: isLocked ? 0.75 : 1 }}>
            {isLocked && (
              <div style={{
                position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '999px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '11px', fontWeight: '700'
              }}>
                <Lock size={12} /> LOCKED
              </div>
            )}
            <div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
              }}>
                <FileText size={24} color="#22d3ee" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>
                AI Proposal Pitch Generator
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                Draft winning proposal cover letters instantly. Provide the client's job requirements and get a personalized, professional application letter.
              </p>
            </div>
            <Link to={isLocked ? "/pricing" : "/ai/proposal-generator"} style={{ width: '100%' }}>
              <AnimatedButton variant={isLocked ? "secondary" : "accent"} style={{ width: '100%', padding: '12px' }}>
                {isLocked ? "Unlock with Pro" : "Launch Tool"} <ArrowRight size={14} />
              </AnimatedButton>
            </Link>
          </GlassCard>

        </div>

      </div>
      <style>{`
        @media (max-width: 768px) {
          .ai-tools-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AITools;
