import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Star, ArrowRight, UserCheck, Briefcase, CreditCard, MessageSquare, CheckCircle } from 'lucide-react';

const steps = {
  customer: [
    { icon: Search, title: 'Browse & Discover', desc: 'Explore thousands of services across dozens of categories. Use smart filters to find the perfect match.' },
    { icon: UserCheck, title: 'Review Providers', desc: 'Check provider ratings, reviews, portfolios, and response rates. Compare service packages side-by-side.' },
    { icon: CreditCard, title: 'Secure Payment', desc: 'Pay safely via our Stripe-powered escrow system. Your money is protected until you approve the delivery.' },
    { icon: MessageSquare, title: 'Collaborate', desc: 'Communicate directly with your provider via real-time chat. Share files, track progress, and give feedback.' },
    { icon: Star, title: 'Approve & Review', desc: 'Once you\'re happy, approve the delivery. Funds are released and you can leave a verified review.' },
  ],
  provider: [
    { icon: UserCheck, title: 'Create Your Profile', desc: 'Build a compelling profile showcasing your skills, experience, portfolio, and service offerings.' },
    { icon: Briefcase, title: 'List Your Services', desc: 'Create detailed service listings with tiered packages (Basic, Standard, Premium) and use AI to generate optimized descriptions.' },
    { icon: MessageSquare, title: 'Communicate', desc: 'Respond to inquiries quickly using our real-time chat. Maintain a high response rate to boost your ranking.' },
    { icon: CheckCircle, title: 'Deliver Excellence', desc: 'Complete orders on time with high quality. Use the project workspace to manage milestones and share deliverables.' },
    { icon: CreditCard, title: 'Get Paid', desc: 'Funds are released to your wallet within 24 hours of order approval. Withdraw to your bank via Stripe Connect anytime.' },
  ],
};

export default function HowItWorks() {
  const [activeTab, setActiveTab] = React.useState('customer');

  return (
    <div style={{ minHeight: '100vh', paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 56px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px',
          borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '12px', fontWeight: '700', color: '#818cf8', marginBottom: '20px', letterSpacing: '0.05em',
        }}>How It Works</div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1.15', marginBottom: '16px' }}>
          A marketplace built for <span className="gradient-text">trust & results</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '17px', lineHeight: '1.7' }}>
          Whether you're hiring talent or offering services, SkillBridge makes the entire process secure, transparent, and effortless.
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '52px' }}>
          {['customer', 'provider'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 28px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
              background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'var(--glass-bg)',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
              border: activeTab === tab ? 'none' : '1px solid var(--border-color)',
              transition: 'all 0.3s', backdropFilter: 'blur(12px)',
            }}>
              {tab === 'customer' ? 'For Clients' : 'For Providers'}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div style={{ position: 'relative' }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute', left: '31px', top: '32px', bottom: '32px', width: '2px',
            background: 'linear-gradient(to bottom, rgba(99,102,241,0.5), rgba(99,102,241,0.05))',
          }} className="hide-on-mobile" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps[activeTab].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px', flexShrink: 0, position: 'relative', zIndex: 1,
                  background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 6px var(--bg-app), 0 0 0 8px rgba(99,102,241,0.15)',
                }}>
                  <Icon size={24} color="#fff" />
                  <div style={{
                    position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px',
                    borderRadius: '50%', background: '#030014', border: '2px solid #6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: '900', color: '#818cf8',
                  }}>{i + 1}</div>
                </div>
                <div className="glass-card" style={{ flex: 1, padding: '24px', cursor: 'default' }}>
                  <h3 style={{ fontWeight: '800', marginBottom: '8px', fontSize: '17px' }}>{title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Section */}
        <div style={{
          marginTop: '72px', padding: '48px 40px', borderRadius: '24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.04))',
          border: '1px solid rgba(99,102,241,0.15)',
        }}>
          <Shield size={36} color="#818cf8" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontWeight: '900', fontSize: '28px', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Protected at every step
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.7' }}>
            Every transaction on SkillBridge is protected by our escrow system, fraud detection, and 24/7 dispute resolution team.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', maxWidth: '600px', margin: '0 auto 32px' }}>
            {['Escrow Protection', 'Secure Payments', 'Fraud Detection', '24/7 Support'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <CheckCircle size={14} color="#10b981" />{f}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: '8px' }}>
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/services" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Browse Services
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) { .hide-on-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}
