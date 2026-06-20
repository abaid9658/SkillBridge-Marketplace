import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import { ArrowLeft, CreditCard, ShieldAlert, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

const Deposit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle return from Stripe Checkout
  useEffect(() => {
    const cancelled = searchParams.get('cancelled');
    if (cancelled) {
      setError('Payment was cancelled. You were not charged.');
    }
  }, [searchParams]);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const finalAmount = Number(amount);
    if (!finalAmount || finalAmount < 5) {
      setError('Minimum deposit is $5.');
      return;
    }
    if (finalAmount > 10000) {
      setError('Maximum deposit is $10,000.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/payments/create-deposit-session', { amount: finalAmount });
      if (res.data.success && res.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = res.data.url;
      } else {
        setError('Failed to initiate payment. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Secure payment gateway connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (val) => {
    setAmount(val.toString());
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '540px' }}>

        {/* Back Link */}
        <Link to="/wallet" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', marginBottom: '32px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Wallet
        </Link>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.2)',
          }}>
            <CreditCard size={28} color="#818cf8" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
            Deposit <span className="gradient-text">Funds</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            Securely add funds via Stripe. You'll be redirected to complete payment.
          </p>
        </div>

        <GlassCard style={{ padding: '36px' }}>
          {error && (
            <div style={{
              padding: '14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', marginBottom: '20px',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <ShieldAlert size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', marginBottom: '20px',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <CheckCircle size={15} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleDepositSubmit}>

            {/* Presets */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Quick Amount
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[20, 50, 100, 250].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePresetSelect(val)}
                    style={{
                      padding: '12px 0', borderRadius: '10px',
                      background: amount === val.toString() ? 'rgba(99,102,241,0.15)' : 'var(--glass-bg)',
                      color: amount === val.toString() ? '#818cf8' : 'var(--text-secondary)',
                      border: `1px solid ${amount === val.toString() ? 'rgba(99,102,241,0.5)' : 'var(--border-color)'}`,
                      fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Custom Amount (USD)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '16px', fontWeight: '700' }}>$</span>
                <input
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '100%', fontSize: '16px' }}
                  placeholder="0.00"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                  required
                  min={5}
                  max={10000}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                Min: $5.00 · Max: $10,000.00
              </span>
            </div>

            <AnimatedButton
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', padding: '15px', fontSize: '15px', fontWeight: '700' }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting to Stripe…</>
              ) : (
                <>Continue to Secure Payment <Sparkles size={15} /></>
              )}
            </AnimatedButton>
          </form>
        </GlassCard>

        {/* Security badge */}
        <div style={{
          display: 'flex', gap: '12px', padding: '16px', borderRadius: '12px',
          background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border-color)',
          marginTop: '20px', alignItems: 'flex-start'
        }}>
          <ShieldAlert size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
            Powered by <strong style={{ color: 'var(--text-primary)' }}>Stripe</strong> — PCI DSS Level 1 certified. SkillBridge never stores your card details. All payments are encrypted with TLS.
          </p>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Deposit;
