import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import StatsCard from '../components/ui/StatsCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Calendar, DollarSign,
  TrendingUp, Award, ShieldAlert, FileText, ArrowRight, Info, Plus
} from 'lucide-react';

const Wallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stripe redirect search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Withdrawal states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  const fetchWalletData = async () => {
    setLoading(true);
    setError('');
    try {
      const [walletRes, transRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions?limit=5')
      ]);

      if (walletRes.data.success) {
        setWallet(walletRes.data.data);
      }
      if (transRes.data.success) {
        setTransactions(transRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch wallet information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyAndFetch = async () => {
      const depositParam = searchParams.get('deposit');
      const sessionIdParam = searchParams.get('session_id');
      const amountParam = searchParams.get('amount');
      
      if (depositParam === 'success' && sessionIdParam) {
        setVerifying(true);
        setError('');
        setSuccessMsg('');
        try {
          const res = await api.post('/payments/verify-deposit', { sessionId: sessionIdParam });
          if (res.data.success) {
            setSuccessMsg(`Deposit of $${amountParam || ''} verified and credited to your wallet!`);
            // Clean URL query parameters
            setSearchParams({}, { replace: true });
          }
        } catch (err) {
          console.error(err);
          setError(err.response?.data?.message || 'Error verifying deposit.');
        } finally {
          setVerifying(false);
        }
      }
      fetchWalletData();
    };

    verifyAndFetch();
  }, [searchParams]);

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      setError('Please specify a valid withdrawal amount.');
      return;
    }
    if (Number(withdrawAmount) > wallet.balance) {
      setError('Insufficient funds.');
      return;
    }
    
    setWithdrawing(true);
    setError('');
    setWithdrawSuccess('');
    try {
      const res = await api.post('/wallet/withdraw', {
        amount: Number(withdrawAmount),
        payoutMethod: 'PayPal/Bank Transfer',
        payoutDetails: withdrawAddress
      });

      if (res.data.success) {
        setWithdrawSuccess('Withdrawal request submitted! It will be reviewed by administrators.');
        setWithdrawAmount('');
        setWithdrawAddress('');
        // Refresh wallet
        const wRes = await api.get('/wallet');
        if (wRes.data.success) setWallet(wRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0 100px' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
            My Digital <span className="gradient-text">Wallet</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
            Manage secure payments, view transaction histories, and request payouts.
          </p>
        </div>

        {verifying && (
          <div style={{
            padding: '20px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', marginBottom: '24px',
            display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Verifying your secure deposit payment with Stripe...</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldAlert size={16} /> {successMsg}
          </div>
        )}

        {error && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Info size={16} /> {error}
          </div>
        )}
        {withdrawSuccess && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldAlert size={16} /> {withdrawSuccess}
          </div>
        )}

        {/* TOP METRICS & QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' }} className="wallet-overview-grid">
          
          {/* Available balance */}
          <GlassCard style={{ padding: '28px', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', justifyContent: 'space-between', minHeight: '180px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Available Balance
              </span>
              <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '8px' }}>
                ${wallet?.balance?.toFixed(2) || '0.00'}
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <Link to="/wallet/deposit" style={{ flex: 1 }}>
                <AnimatedButton variant="primary" style={{ width: '100%', padding: '10px', fontSize: '13px' }}>
                  <Plus size={14} /> Deposit
                </AnimatedButton>
              </Link>
            </div>
          </GlassCard>

          {/* Escrow balance */}
          <GlassCard style={{ padding: '28px', borderLeft: '4px solid var(--secondary)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', justifyContent: 'space-between', minHeight: '180px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Escrow Balance
              </span>
              <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--secondary)', marginTop: '8px' }}>
                ${wallet?.escrowBalance?.toFixed(2) || '0.00'}
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0 0' }}>
              Funds held securely during active project work milestones.
            </p>
          </GlassCard>

          {/* User/Role stats card */}
          <GlassCard style={{ padding: '28px', borderLeft: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', justifyContent: 'space-between', minHeight: '180px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Platform Currency
              </span>
              <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent)', marginTop: '8px' }}>
                USD ($)
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0 0' }}>
              All invoices and deposits are processed securely in USD.
            </p>
          </GlassCard>

        </div>

        {/* BOTTOM SECTION: WITHDRAW + TRANSACTION LIST */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px' }} className="wallet-details-grid">
          
          {/* Withdrawal Box */}
          <GlassCard style={{ padding: '28px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpRight size={18} color="var(--primary)" /> Request Withdrawal
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Withdraw funds from your available balance to your bank account or PayPal.
            </p>

            <form onSubmit={handleWithdrawalRequest}>
              <div className="form-group">
                <label className="form-label">Withdrawal Amount ($)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number" className="form-input" style={{ paddingLeft: '32px', width: '100%' }}
                    placeholder="0.00" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} required
                    max={wallet?.balance || 0} min={1}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Payout Details (PayPal email or Bank Routing)</label>
                <textarea
                  className="form-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                  placeholder="e.g. paypal-merchant@example.com"
                  value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} required
                />
              </div>

              <AnimatedButton type="submit" variant="primary" loading={withdrawing} style={{ width: '100%', padding: '10px' }} disabled={!wallet || wallet.balance <= 0}>
                Confirm Withdrawal
              </AnimatedButton>
            </form>
          </GlassCard>

          {/* Transactions List */}
          <GlassCard style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                Recent Transactions
              </h3>
              <Link to="/wallet/transactions" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                No recent financial activities.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {transactions.map(tx => {
                  const isPositive = ['deposit', 'release', 'refund'].includes(tx.type);
                  return (
                    <div key={tx._id} style={{
                      display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center',
                      paddingBottom: '12px', borderBottom: '1px solid var(--border-color)',
                      flexWrap: 'wrap', gap: '10px'
                    }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isPositive ? (
                            <ArrowDownLeft size={16} color="#10b981" />
                          ) : (
                            <ArrowUpRight size={16} color="#ef4444" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>
                            {tx.description || tx.type.toUpperCase()}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(tx.createdAt).toLocaleDateString()} • ID: {tx._id.slice(-6)}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '15px', fontWeight: '900',
                          color: isPositive ? '#10b981' : '#ef4444'
                        }}>
                          {isPositive ? '+' : '-'}${tx.amount?.toFixed(2)}
                        </div>
                        <span style={{
                          fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                          color: tx.status === 'completed' || tx.status === 'succeeded' ? '#10b981' : 'var(--warning)'
                        }}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

        </div>

      </div>
      <style>{`
        @media (max-width: 992px) {
          .wallet-overview-grid {
            grid-template-columns: 1fr !important;
          }
          .wallet-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Wallet;
