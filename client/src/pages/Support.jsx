import React, { useState } from 'react';
import api from '../utils/api';
import { MessageCircle, Mail, Book, ChevronDown, CheckCircle, Send, AlertCircle } from 'lucide-react';

const faqs = [
  { q: 'How do I get a refund?', a: 'Refunds are processed through our escrow dispute system. If a provider doesn\'t deliver as promised, open a dispute from your order page within 14 days. Our team resolves disputes within 5-7 business days.' },
  { q: 'How long does order delivery take?', a: 'Delivery time depends on the specific service package chosen. Each service lists estimated delivery days. Providers can also negotiate custom deadlines through the chat system.' },
  { q: 'How do I verify my identity?', a: 'Visit your profile settings and select "Verify Identity". You\'ll need a valid government ID. Verified providers receive a trust badge which increases conversion rates by up to 40%.' },
  { q: 'Can I upgrade my subscription?', a: 'Yes! Navigate to Account Settings → Billing → Subscription Plans. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.' },
  { q: 'How does the escrow system work?', a: 'When you place an order, funds are held in escrow. The provider delivers work, you approve it, and funds are released. If you\'re not satisfied, open a dispute. Funds are never released without your approval.' },
  { q: 'How do I become a verified provider?', a: 'Complete your profile (100%), connect a payment method, pass the identity verification, complete 3 successful orders, and maintain a minimum 4.5 star rating. Verified status is reviewed monthly.' },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', category: 'general', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/support', form);
      if (res.data.success) {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', category: 'general', message: '' });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error submitting support ticket.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['general', 'payment', 'order', 'account', 'technical', 'dispute'];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 48px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(16,185,129,0.25)',
        }}>
          <MessageCircle size={30} color="#fff" />
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '12px' }}
          className="gradient-text">Help & Support</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7' }}>
          Can't find what you're looking for? Our support team is here 24/7 to help.
        </p>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
          {[['< 2 hrs', 'Response Time'], ['98%', 'Resolution Rate'], ['24/7', 'Availability']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#818cf8' }}>{v}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {/* Quick Contact Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '56px' }}>
          {[
            { icon: Mail, title: 'Email Support', desc: 'support@skillbridge.dev', sub: 'Reply within 2 hours', color: '#818cf8' },
            { icon: MessageCircle, title: 'Live Chat', desc: 'Start a live conversation', sub: 'Available 24/7', color: '#10b981' },
            { icon: Book, title: 'Documentation', desc: 'Browse knowledge base', sub: '200+ articles', color: '#f59e0b' },
          ].map(({ icon: Icon, title, desc, sub, color }) => (
            <div key={title} className="glass-card" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color + '40'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 14px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontWeight: '700', marginBottom: '6px', fontSize: '15px' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{desc}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }} className="support-grid">
          {/* FAQ */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map(({ q, a }, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} style={{
                    background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                    border: `1px solid ${isOpen ? 'rgba(99,102,241,0.25)' : 'var(--border-color)'}`,
                    borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s',
                  }}>
                    <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '12px', padding: '16px 18px', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px',
                    }}>
                      {q}
                      <ChevronDown size={16} style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', color: 'var(--text-muted)' }} />
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 18px 16px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.7' }}>{a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Submit a Ticket</h2>
            {submitted ? (
              <div style={{
                padding: '48px 32px', borderRadius: '20px', textAlign: 'center',
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>Ticket Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  We'll get back to you within 2 hours. Check your email for a confirmation.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn btn-secondary" style={{ marginTop: '20px' }}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-color)', borderRadius: '20px', padding: '28px',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                {errorMsg && (
                  <div style={{
                    padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <AlertCircle size={15} />
                    {errorMsg}
                  </div>
                )}
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                  { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Brief description of your issue' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{label}</label>
                    <input type={type} placeholder={placeholder} required className="form-input"
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="form-input" style={{ cursor: 'pointer' }}>
                    {categories.map(c => <option key={c} value={c} style={{ background: 'var(--bg-app)' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Message</label>
                  <textarea rows={5} placeholder="Describe your issue in detail..." required className="form-input"
                    style={{ resize: 'vertical', minHeight: '120px' }}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: '8px' }}>
                  {loading ? (
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  ) : <Send size={16} />}
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                  <AlertCircle size={14} color="#818cf8" />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>We respond within 2 hours during business hours.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .support-grid { grid-template-columns: 1fr !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
