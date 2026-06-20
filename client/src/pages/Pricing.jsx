import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import { Check, ShieldAlert, Sparkles, Zap, Building, Loader2 } from 'lucide-react';

const Pricing = () => {
  const { user, updateProfileState, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const currentTier = user?.subscriptionTier || 'free';

  // Verify Stripe Checkout subscription session on redirect back
  useEffect(() => {
    const verifySubscription = async () => {
      const subParam = searchParams.get('subscription');
      const sessionIdParam = searchParams.get('session_id');
      const tierParam = searchParams.get('tier');

      if (subParam === 'success' && sessionIdParam) {
        setVerifying(true);
        setError(null);
        setMessage(null);
        try {
          const res = await api.post('/payments/verify-subscription', { sessionId: sessionIdParam, tier: tierParam });
          if (res.data.success) {
            updateProfileState(res.data.user);
            setMessage(`Successfully upgraded to the ${tierParam.toUpperCase()} plan! Welcome to premium features.`);
            setSearchParams({}, { replace: true });
          } else {
            setError('Failed to verify subscription session.');
          }
        } catch (err) {
          console.error(err);
          setError(err.response?.data?.message || 'Error verifying subscription.');
        } finally {
          setVerifying(false);
        }
      }
    };

    verifySubscription();
  }, [searchParams]);

  // Handle cancelled checkout session
  useEffect(() => {
    const cancelled = searchParams.get('cancelled');
    if (cancelled) {
      setError('Subscription checkout was cancelled. You were not charged.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handleUpgrade = async (tier) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoadingTier(tier);
    setMessage(null);
    setError(null);
    try {
      if (tier === 'free') {
        // Free tier is instant and doesn't require Stripe
        const res = await api.put('/users/subscription', { tier });
        if (res.data.success) {
          updateProfileState(res.data.user);
          setMessage(`Successfully updated subscription to ${tier.toUpperCase()}`);
        } else {
          setError('Failed to downgrade subscription. Please try again.');
        }
      } else {
        // Paid tiers create Stripe Checkout Session
        const res = await api.post('/payments/create-subscription-session', { tier });
        if (res.data.success && res.data.url) {
          window.location.href = res.data.url; // Redirect to Stripe Checkout
        } else {
          setError('Failed to initiate Stripe Checkout session.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating subscription.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0 120px' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            padding: '4px 12px', borderRadius: '999px',
            background: 'var(--primary-glow)', border: '1px solid var(--border-color)',
            fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: '16px', display: 'inline-block'
          }}>
            Subscription Plans
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
            Choose the Perfect <span className="gradient-text">Subscription Plan</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '8px' }}>
            Unlock advanced dashboard widgets, AI assistants, lower fee structures, and priority customer care.
          </p>
        </div>

        {/* Messaging banners */}
        {verifying && (
          <div style={{
            maxWidth: '600px', margin: '0 auto 30px', padding: '20px', borderRadius: '12px',
            backgroundColor: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', fontWeight: '600'
          }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', animation: 'spin 1s linear infinite' }} />
            <span>Verifying your secure subscription payment with Stripe...</span>
          </div>
        )}

        {message && (
          <div style={{
            maxWidth: '600px', margin: '0 auto 30px', padding: '16px', borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600'
          }}>
            <Sparkles size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{
            maxWidth: '600px', margin: '0 auto 30px', padding: '16px', borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600'
          }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', marginBottom: '60px' }} className="pricing-grid">
          
          {/* Card 1: Free */}
          <GlassCard style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '440px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={18} color="var(--text-muted)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Starter</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Basic Free</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '900' }}>$0</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginLeft: '4px' }}>/ month</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                <FeatureItem text="5 service listings max" checked />
                <FeatureItem text="Standard search visibility" checked />
                <FeatureItem text="5% platform contract fee" checked />
                <FeatureItem text="Basic email support" checked />
                <FeatureItem text="AI Copilot access" checked={false} />
              </div>
            </div>
            
            <AnimatedButton 
              variant="secondary" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => handleUpgrade('free')}
              disabled={currentTier === 'free' || loadingTier !== null}
            >
              {loadingTier === 'free' ? (
                <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto' }} />
              ) : currentTier === 'free' ? (
                'Current Plan'
              ) : (
                'Downgrade to Free'
              )}
            </AnimatedButton>
          </GlassCard>

          {/* Card 2: Pro */}
          <GlassCard style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '440px', border: currentTier === 'pro' ? '2px solid var(--primary)' : '1px solid var(--border-color)', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '16px', right: '16px',
              padding: '3px 10px', borderRadius: '999px',
              background: 'var(--primary-glow)', border: '1px solid var(--primary)',
              fontSize: '10px', fontWeight: '700', color: 'var(--primary)',
              textTransform: 'uppercase'
            }}>
              Most Popular
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>Professional</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Premium Pro</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '900', color: 'var(--primary)' }}>$29</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginLeft: '4px' }}>/ month</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                <FeatureItem text="Unlimited service listings" checked />
                <FeatureItem text="Featured search priority badge" checked />
                <FeatureItem text="2.5% platform contract fee" checked />
                <FeatureItem text="Priority support channel" checked />
                <FeatureItem text="Full AI Copilot Workspace" checked />
              </div>
            </div>
            
            <AnimatedButton 
              variant="primary" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => handleUpgrade('pro')}
              disabled={currentTier === 'pro' || loadingTier !== null}
            >
              {loadingTier === 'pro' ? (
                <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto' }} />
              ) : currentTier === 'pro' ? (
                'Current Plan'
              ) : (
                'Upgrade to Pro'
              )}
            </AnimatedButton>
          </GlassCard>

          {/* Card 3: Agency */}
          <GlassCard style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '440px', border: currentTier === 'agency' ? '2px solid var(--accent)' : '1px solid var(--border-color)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Building size={18} color="var(--accent)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase' }}>Agency</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Enterprise Team</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent)' }}>$99</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginLeft: '4px' }}>/ month</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                <FeatureItem text="Multi-seat accounts (5 seats)" checked />
                <FeatureItem text="Top featured priority slots" checked />
                <FeatureItem text="1% platform contract fee" checked />
                <FeatureItem text="24/7 dedicated support representative" checked />
                <FeatureItem text="Custom client invoice branding" checked />
              </div>
            </div>
            
            <AnimatedButton 
              variant="accent" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => handleUpgrade('agency')}
              disabled={currentTier === 'agency' || loadingTier !== null}
            >
              {loadingTier === 'agency' ? (
                <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto' }} />
              ) : currentTier === 'agency' ? (
                'Current Plan'
              ) : (
                'Upgrade to Agency'
              )}
            </AnimatedButton>
          </GlassCard>

        </div>

      </div>
      <style>{`
        @media (max-width: 900px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

function FeatureItem({ text, checked }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
      <Check size={14} color={checked ? '#10b981' : 'var(--text-muted)'} style={{ opacity: checked ? 1 : 0.4 }} />
      <span style={{ textDecoration: checked ? 'none' : 'line-through', opacity: checked ? 1 : 0.6 }}>{text}</span>
    </div>
  );
}

export default Pricing;
