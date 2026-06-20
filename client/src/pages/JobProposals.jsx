import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import StatusBadge from '../components/ui/StatusBadge';
import {
  ArrowLeft, Briefcase, Calendar, DollarSign, Clock, Users, User, Star,
  Check, X, FileText, Info, MessageSquare, AlertTriangle, ShieldCheck
} from 'lucide-react';

const JobProposals = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // 'accept-ID' or 'reject-ID'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchJobAndProposals = async () => {
    setLoading(true);
    setError('');
    try {
      const [jobRes, propRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/jobs/${jobId}/proposals`)
      ]);

      if (jobRes.data.success) {
        setJob(jobRes.data.data);
      }
      if (propRes.data.success) {
        setProposals(propRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load proposals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndProposals();
  }, [jobId]);

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm('Are you sure you want to accept this proposal? This will mark your job as In Progress and reject all other pending proposals.')) {
      return;
    }
    setActionLoading(`accept-${proposalId}`);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/jobs/proposals/${proposalId}/accept`);
      if (res.data.success) {
        setSuccessMsg('Proposal accepted successfully! The project is now active.');
        await fetchJobAndProposals();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept proposal.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProposal = async (proposalId) => {
    if (!window.confirm('Are you sure you want to reject this proposal?')) {
      return;
    }
    setActionLoading(`reject-${proposalId}`);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/jobs/proposals/${proposalId}/reject`);
      if (res.data.success) {
        setSuccessMsg('Proposal rejected successfully.');
        setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status: 'rejected' } : p));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject proposal.');
    } finally {
      setActionLoading(null);
    }
  };

  const startChat = async (provider) => {
    try {
      // Directs to chat with the provider
      navigate('/chat', { state: { directChatUser: provider } });
    } catch (err) {
      console.error('Failed to open chat', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 100px' }}>
      <div className="container">
        
        {/* Back Link */}
        <Link to="/my-jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to My Jobs
        </Link>

        {/* JOB INFO SUMMARY */}
        {job && (
          <GlassCard style={{ padding: '24px', marginBottom: '32px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                  {job.category}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px', marginBottom: '8px' }}>
                  {job.title}
                </h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span>Budget: <strong>${job.budget?.min} - ${job.budget?.max}</strong></span>
                  <span>•</span>
                  <span>Proposals: <strong>{proposals.length}</strong></span>
                </div>
              </div>
              <StatusBadge type={job.status === 'open' ? 'success' : 'warning'} text={job.status.replace('_', ' ').toUpperCase()} />
            </div>
          </GlassCard>
        )}

        {/* MESSAGES */}
        {error && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Info size={16} /> {error}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={16} /> {successMsg}
          </div>
        )}

        {/* PROPOSALS LIST */}
        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px' }}>
          Received Proposals
        </h3>

        {proposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--glass-bg)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📨</div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No proposals yet</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Your job posting is open. Freelancers will submit proposals soon.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {proposals.map(proposal => {
              const isPending = proposal.status === 'pending';
              const isAccepted = proposal.status === 'accepted';
              const isRejected = proposal.status === 'rejected';

              return (
                <GlassCard key={proposal._id} style={{
                  padding: '28px',
                  border: isAccepted ? '1px solid #10b981' : isRejected ? '1px solid rgba(239,68,68,0.15)' : '1px solid var(--border-color)',
                  opacity: isRejected ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }} className="proposal-inner">
                    
                    {/* Provider Profile Info */}
                    <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid var(--border-color)', paddingRight: '20px' }} className="proposal-profile-side">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        {proposal.providerId?.profilePicture ? (
                          <img
                            src={proposal.providerId.profilePicture}
                            alt={proposal.providerId.name}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <User size={20} color="var(--primary)" />
                          </div>
                        )}
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>
                            {proposal.providerId?.name || 'Freelancer'}
                          </h4>
                          <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            ⭐ {proposal.providerId?.avgRating?.toFixed(1) || '5.0'}
                            <span style={{ color: 'var(--text-muted)' }}>({proposal.providerId?.totalReviews || 0})</span>
                          </div>
                        </div>
                      </div>

                      {proposal.providerId?.skills && proposal.providerId.skills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '14px' }}>
                          {proposal.providerId.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} style={{
                              fontSize: '10px', fontWeight: '600', padding: '2px 6px',
                              borderRadius: '4px', background: 'var(--border-color)', color: 'var(--text-secondary)'
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Proposal Details & Pitch */}
                    <div style={{ flex: 1 }} className="proposal-detail-side">
                      <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Bid Amount</span>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>${proposal.bidAmount}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Delivery Time</span>
                            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '3px' }}>{proposal.deliveryDays} days</div>
                          </div>
                        </div>
                        <StatusBadge
                          type={isAccepted ? 'success' : isRejected ? 'danger' : 'neutral'}
                          text={proposal.status.toUpperCase()}
                        />
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Cover Letter / Pitch</span>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                          {proposal.coverLetter}
                        </p>
                      </div>

                      {/* Attachments */}
                      {proposal.attachments && proposal.attachments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Work Samples</span>
                          {proposal.attachments.map((file, idx) => (
                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" style={{
                              display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--primary)', fontWeight: '600'
                            }}>
                              <FileText size={14} /> Attachment Reference #{idx + 1}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <AnimatedButton
                          variant="secondary"
                          onClick={() => startChat(proposal.providerId)}
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                          <MessageSquare size={14} /> Chat with Freelancer
                        </AnimatedButton>

                        {isPending && job.status === 'open' && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <AnimatedButton
                              variant="secondary"
                              onClick={() => handleRejectProposal(proposal._id)}
                              loading={actionLoading === `reject-${proposal._id}`}
                              style={{ padding: '8px 16px', fontSize: '13px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                            >
                              <X size={14} /> Reject
                            </AnimatedButton>
                            <AnimatedButton
                              variant="primary"
                              onClick={() => handleAcceptProposal(proposal._id)}
                              loading={actionLoading === `accept-${proposal._id}`}
                              style={{ padding: '8px 16px', fontSize: '13px' }}
                            >
                              <Check size={14} /> Accept Proposal
                            </AnimatedButton>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

      </div>
      <style>{`
        @media (max-width: 768px) {
          .proposal-inner {
            flex-direction: column !important;
          }
          .proposal-profile-side {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-color) !important;
            padding-right: 0 !important;
            padding-bottom: 20px !important;
            margin-bottom: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default JobProposals;
