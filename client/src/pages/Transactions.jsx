import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import {
  ArrowLeft, ArrowUpRight, ArrowDownLeft, DollarSign, Calendar, Filter, Clock
} from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState(''); // '', 'deposit', 'withdrawal', 'escrow', 'release', 'refund'

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 15 };
      if (typeFilter) params.type = typeFilter;

      const res = await api.get('/wallet/transactions', { params });
      if (res.data.success) {
        setTransactions(res.data.data);
        setPages(res.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter]);

  const handleFilterChange = (type) => {
    setTypeFilter(type);
    setPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Back Link */}
        <Link to="/wallet" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to Wallet
        </Link>

        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
            Transaction <span className="gradient-text">History</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            A complete statement of all deposits, escrow locks, releases, and withdrawals.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={{
          display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px',
          borderBottom: '1px solid var(--border-color)', marginBottom: '24px'
        }}>
          {[
            { value: '', label: 'All Transactions' },
            { value: 'deposit', label: 'Deposits' },
            { value: 'withdrawal', label: 'Withdrawals' },
            { value: 'escrow', label: 'Escrow Locks' },
            { value: 'release', label: 'Escrow Releases' },
            { value: 'refund', label: 'Refunds' }
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => handleFilterChange(btn.value)}
              style={{
                padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap',
                background: typeFilter === btn.value ? 'var(--primary-glow)' : 'var(--glass-bg)',
                color: typeFilter === btn.value ? 'var(--primary)' : 'var(--text-secondary)',
                border: `1px solid ${typeFilter === btn.value ? 'var(--primary)' : 'var(--border-color)'}`,
                fontWeight: typeFilter === btn.value ? '700' : '500',
                fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* LOG LIST */}
        {loading ? (
          <LoadingSpinner />
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--glass-bg)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💸</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              No transactions matching the selected filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map(tx => {
              const isPositive = ['deposit', 'release', 'refund'].includes(tx.type);
              return (
                <GlassCard key={tx._id} style={{ padding: '20px', display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
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
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                        {tx.description || tx.type.toUpperCase()}
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>ID: {tx._id}</span>
                        <span>•</span>
                        <span>{new Date(tx.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: isPositive ? '#10b981' : '#ef4444' }}>
                      {isPositive ? '+' : '-'}${tx.amount?.toFixed(2)}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: tx.status === 'completed' || tx.status === 'succeeded' ? '#10b981' : 'var(--warning)' }}>
                      {tx.status}
                    </span>
                  </div>
                </GlassCard>
              );
            })}

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                <AnimatedButton disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="secondary" style={{ padding: '6px 14px' }}>
                  ← Prev
                </AnimatedButton>
                <AnimatedButton disabled={page === pages} onClick={() => setPage(p => p + 1)} variant="secondary" style={{ padding: '6px 14px' }}>
                  Next →
                </AnimatedButton>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Transactions;
