import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight, Lock, Eye, Database, Globe, Bell, Trash2 } from 'lucide-react';

const sections = [
  { id: 'intro', icon: Shield, title: 'Introduction' },
  { id: 'collect', icon: Database, title: 'Data We Collect' },
  { id: 'use', icon: Eye, title: 'How We Use Data' },
  { id: 'share', icon: Globe, title: 'Data Sharing' },
  { id: 'security', icon: Lock, title: 'Security' },
  { id: 'cookies', icon: Bell, title: 'Cookies' },
  { id: 'rights', icon: Trash2, title: 'Your Rights' },
];

export default function Privacy() {
  const [active, setActive] = useState('intro');

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) setActive(id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 40px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(99,102,241,0.35)',
        }}>
          <Shield size={30} color="#fff" />
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '12px' }}
          className="gradient-text">Privacy Policy</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7' }}>
          We take your privacy seriously. This policy explains how SkillBridge collects, uses, and protects your personal information.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Last updated: June 20, 2026</p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        {/* Sticky Sidebar */}
        <aside style={{
          width: '220px', flexShrink: 0, position: 'sticky', top: '96px',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px',
        }} className="hide-on-mobile">
          <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Contents</p>
          {sections.map(({ id, icon: Icon, title }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: active === id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: active === id ? '#818cf8' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: active === id ? '700' : '500',
              transition: 'all 0.2s', marginBottom: '2px',
            }}>
              <Icon size={14} />
              {title}
              {active === id && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {[
            {
              id: 'intro', title: 'Introduction',
              content: `SkillBridge ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully. By using SkillBridge, you consent to the practices described in this policy.`
            },
            {
              id: 'collect', title: 'Data We Collect',
              content: `We collect information you provide directly to us (such as name, email, payment info), information collected automatically (usage data, device info, IP address, cookies), and information from third parties (OAuth providers like Google and GitHub). We also collect transaction records, messages sent on the platform, and any files or portfolio content you upload.`
            },
            {
              id: 'use', title: 'How We Use Your Data',
              content: `We use your information to: provide and improve our services, process payments and prevent fraud, send transactional and promotional communications, personalize your experience using AI-powered recommendation engines, comply with legal obligations, and monitor platform safety and integrity. We do not sell your personal data to third parties.`
            },
            {
              id: 'share', title: 'Data Sharing',
              content: `We share data with: service providers (Stripe, Cloudinary, Nodemailer) who help us operate our platform, law enforcement when required by law, other users only to the extent necessary to facilitate marketplace transactions, and analytics partners in aggregated, anonymized form. All our partners are bound by strict data processing agreements.`
            },
            {
              id: 'security', title: 'Security',
              content: `We implement enterprise-grade security including: AES-256 encryption for data at rest, TLS 1.3 for data in transit, bcrypt password hashing with salting, JWT with short-lived access tokens and rotating refresh tokens, rate limiting, CSRF protection, XSS sanitization, and regular security audits. No method of transmission over the internet is 100% secure.`
            },
            {
              id: 'cookies', title: 'Cookies',
              content: `SkillBridge uses essential cookies to maintain sessions and preferences, analytics cookies (opt-in) to understand usage patterns, and preference cookies to remember your theme and language settings. You can control cookie settings through your browser. Disabling certain cookies may affect platform functionality.`
            },
            {
              id: 'rights', title: 'Your Rights',
              content: `You have the right to: access and receive a copy of your personal data, correct inaccurate data, request deletion of your account and associated data, opt out of marketing communications, withdraw consent at any time, and lodge a complaint with your local data protection authority. To exercise these rights, contact us at privacy@skillbridge.dev.`
            },
          ].map(({ id, title, content }) => (
            <section key={id} id={id} style={{
              marginBottom: '48px', padding: '32px',
              background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)', borderRadius: '20px',
              scrollMarginTop: '100px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>{title}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '15px' }}>{content}</p>
            </section>
          ))}

          {/* Contact CTA */}
          <div style={{
            padding: '32px', borderRadius: '20px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>Have questions about your privacy?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              Our data protection team is here to help.
            </p>
            <Link to="/support" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .hide-on-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}
