import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, Users, CreditCard, AlertTriangle, Ban, RefreshCw, Globe } from 'lucide-react';

const terms = [
  {
    id: 'acceptance', icon: FileText, title: '1. Acceptance of Terms',
    body: `By accessing or using the SkillBridge platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you may not access or use our Service. These terms apply to all visitors, users, and others who access or use the Service.`
  },
  {
    id: 'eligibility', icon: Users, title: '2. Eligibility',
    body: `You must be at least 18 years of age to use SkillBridge. By creating an account, you represent that you are at least 18 years old, have not previously been suspended from the platform, and that your use complies with all applicable local, state, national, and international laws and regulations.`
  },
  {
    id: 'accounts', icon: Scale, title: '3. User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to immediately notify us of any unauthorized use of your account. SkillBridge cannot be held liable for any loss or damage arising from your failure to comply with this security obligation. Each user may maintain only one account.`
  },
  {
    id: 'payments', icon: CreditCard, title: '4. Payments & Escrow',
    body: `All transactions on SkillBridge are processed through our secure escrow system powered by Stripe. When a customer places an order, funds are held in escrow until project completion is confirmed. SkillBridge charges a platform commission of 10-20% on all transactions. Providers receive payouts within 7-14 business days of order completion.`
  },
  {
    id: 'prohibited', icon: Ban, title: '5. Prohibited Activities',
    body: `You agree not to: engage in fraudulent transactions, circumvent the platform's fee system, harass or harm other users, upload malicious content, reverse engineer the platform, use automated bots or scripts without authorization, engage in spam, or violate any intellectual property rights. Violations may result in immediate account suspension.`
  },
  {
    id: 'disputes', icon: AlertTriangle, title: '6. Disputes & Resolution',
    body: `SkillBridge provides a structured dispute resolution system. If an order dispute cannot be resolved between parties, either party may escalate to SkillBridge support. We reserve the right to make final decisions on disputes including refunds. We strive to resolve all disputes within 5-7 business days.`
  },
  {
    id: 'modifications', icon: RefreshCw, title: '7. Modifications',
    body: `SkillBridge reserves the right to modify these Terms at any time. We will provide notice of material changes via email or prominent notice on our platform. Your continued use after changes take effect constitutes acceptance of the new terms. We recommend reviewing these Terms periodically.`
  },
  {
    id: 'governing', icon: Globe, title: '8. Governing Law',
    body: `These Terms shall be governed by the laws of the jurisdiction in which SkillBridge operates, without regard to conflict of law provisions. Any disputes arising from these Terms shall be resolved through binding arbitration, except where prohibited by law. You waive any right to a jury trial.`
  },
];

export default function Terms() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 56px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(6,182,212,0.25)',
        }}>
          <Scale size={30} color="#fff" />
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '12px' }}
          className="gradient-text">Terms of Service</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7' }}>
          Please read these terms carefully before using SkillBridge. By using our platform, you agree to these terms.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Last updated: June 20, 2026 · Effective immediately</p>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px' }}>
        {/* Quick Summary Banner */}
        <div style={{
          padding: '20px 24px', borderRadius: '16px', marginBottom: '40px',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(99,102,241,0.06))',
          border: '1px solid rgba(6,182,212,0.2)',
          display: 'flex', gap: '16px', alignItems: 'flex-start',
        }}>
          <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontWeight: '700', marginBottom: '4px', fontSize: '14px' }}>Quick Summary</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
              You must be 18+, maintain honest dealings, and use our escrow system for all payments. Violations lead to account termination. Platform takes 10–20% commission. Disputes resolved within 7 days.
            </p>
          </div>
        </div>

        {/* Accordion Terms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {terms.map(({ id, icon: Icon, title, body }) => {
            const isOpen = expanded === id;
            return (
              <div key={id} style={{
                background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                border: `1px solid ${isOpen ? 'rgba(99,102,241,0.25)' : 'var(--border-color)'}`,
                borderRadius: '16px', overflow: 'hidden',
                transition: 'border-color 0.3s ease',
              }}>
                <button onClick={() => setExpanded(isOpen ? null : id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', color: 'var(--text-primary)',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: isOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}>
                    <Icon size={17} color={isOpen ? '#818cf8' : 'var(--text-muted)'} />
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '15px', flex: 1 }}>{title}</span>
                  <span style={{
                    fontSize: '20px', color: 'var(--text-muted)', fontWeight: '300',
                    transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s',
                    lineHeight: 1,
                  }}>+</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 24px 24px', paddingLeft: '76px' }}>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '14px' }}>{body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '48px', padding: '36px', borderRadius: '20px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.04))',
          border: '1px solid rgba(99,102,241,0.15)',
        }}>
          <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>Questions about these terms?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            Our legal team is available to clarify any section.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/support" className="btn btn-primary" style={{ textDecoration: 'none' }}>Contact Support</Link>
            <Link to="/privacy" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
