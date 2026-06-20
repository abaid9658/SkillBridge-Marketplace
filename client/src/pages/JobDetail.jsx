import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import FileUpload from '../components/ui/FileUpload';
import {
  Briefcase, Calendar, DollarSign, Clock, FileText, Send, User, ChevronRight,
  ArrowLeft, ShieldCheck, FileUp, Info, UserCheck, AlertTriangle
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Proposal Form State
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.data.success) {
        setJob(res.data.data);
        
        // If user is provider, check if already applied
        if (user && user.role === 'provider') {
          const checkRes = await api.get(`/jobs/${id}/proposals`).catch(() => null);
          if (checkRes && checkRes.data.success) {
            const applied = checkRes.data.data.some(p => p.providerId?._id === user._id || p.providerId === user._id);
            setHasApplied(applied);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'provider') {
      setError('Only service providers/freelancers can submit proposals');
      return;
    }

    if (!bidAmount || !deliveryDays || !coverLetter) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        jobId: id,
        bidAmount: Number(bidAmount),
        deliveryDays: Number(deliveryDays),
        coverLetter,
        attachments: attachments.map(a => ({ url: a.url, publicId: a.publicId }))
      };

      const res = await api.post('/jobs/proposals/submit', payload);
      if (res.data.success) {
        setSubmitSuccess(true);
        setHasApplied(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error && !job) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>Error Loading Job</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
        <Link to="/jobs">
          <AnimatedButton variant="primary">Back to Job Board</AnimatedButton>
        </Link>
      </div>
    );
  }

  const isOwner = user && job && job.customerId?._id === user._id;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Back Link */}
        <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to Job Board
        </Link>

        {/* MAIN LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }} className="job-details-grid">
          
          {/* Main info panel */}
          <div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '999px',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  fontSize: '12px', fontWeight: '700', color: 'var(--primary)'
                }}>
                  {job.category}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '20px' }}>
                {job.title}
              </h1>

              {/* Quick stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <GlassCard style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <DollarSign size={20} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>${job.budget?.min} - ${job.budget?.max}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Budget Range</div>
                  </div>
                </GlassCard>

                <GlassCard style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(6,182,212,0.2)' }}>
                    <Calendar size={20} color="#06b6d4" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Flexible'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deadline</div>
                  </div>
                </GlassCard>

                <GlassCard style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <Briefcase size={20} color="#8b5cf6" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{job.status.toUpperCase()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Job Status</div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Description Section */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Project Description
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {job.description}
              </p>
            </div>

            {/* Skills Required */}
            {job.skills && job.skills.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  Required Skills & Expertise
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {job.skills.map((skill, index) => (
                    <span key={index} style={{
                      fontSize: '13px', fontWeight: '600', padding: '6px 14px',
                      borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Client Attachments */}
            {job.attachments && job.attachments.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  Project Files & References
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {job.attachments.map((file, index) => (
                    <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                      borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                      color: 'var(--primary)', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
                    }} className="file-attachment-link">
                      <FileText size={16} /> File Reference #{index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* PROPOSAL FORM FOR PROVIDERS */}
            {user && user.role === 'provider' && job.status === 'open' && (
              <div style={{ marginTop: '48px', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>
                  Submit a Proposal
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                  Provide your pricing, delivery time, and explain why you're a great fit for this project.
                </p>

                {hasApplied ? (
                  <div style={{
                    padding: '24px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', gap: '12px', alignItems: 'flex-start'
                  }}>
                    <ShieldCheck size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>Proposal Submitted Successfully</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        You have already applied to this job posting. You will be contacted via chat if the customer decides to accept your proposal.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProposalSubmit}>
                    {error && (
                      <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
                        <Info size={16} /> {error}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">Your Bid Price ($)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                          <input
                            type="number" className="form-input" style={{ paddingLeft: '32px', width: '100%' }}
                            placeholder="0.00" value={bidAmount} onChange={e => setBidAmount(e.target.value)} required
                          />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Client budget: ${job.budget?.min} - ${job.budget?.max}
                        </span>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Delivery Days</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number" className="form-input" style={{ width: '100%' }}
                            placeholder="e.g. 5" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label className="form-label">Cover Letter / Pitch</label>
                      <textarea
                        className="form-input" style={{ minHeight: '180px', width: '100%', resize: 'vertical', lineHeight: '1.5' }}
                        placeholder="Introduce yourself, highlight relevant experience, and outline your approach..."
                        value={coverLetter} onChange={e => setCoverLetter(e.target.value)} required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                      <label className="form-label">Attachments & Work Samples (Optional)</label>
                      <FileUpload
                        onUploadComplete={(files) => setAttachments(prev => [...prev, ...files])}
                        maxFiles={3}
                      />
                    </div>

                    <AnimatedButton type="submit" variant="primary" loading={submitting} style={{ width: '100%', padding: '14px' }}>
                      Send Proposal <Send size={16} />
                    </AnimatedButton>
                  </form>
                )}
              </div>
            )}

            {/* IF USER NOT LOGGED IN / OTHER ROLE */}
            {!user && (
              <div style={{
                marginTop: '48px', padding: '24px', borderRadius: '12px', background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
              }}>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>Are you a Service Provider?</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sign in to place a bid proposal on this custom request.</p>
                </div>
                <Link to="/login">
                  <AnimatedButton variant="primary" style={{ padding: '8px 20px', fontSize: '13px' }}>Login to Apply</AnimatedButton>
                </Link>
              </div>
            )}

            {user && user.role === 'customer' && !isOwner && (
              <div style={{
                marginTop: '48px', padding: '24px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)', color: 'var(--warning)', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px'
              }}>
                <AlertTriangle size={18} />
                <span>You are currently signed in as a Customer. Switch to a Provider profile or logout to apply for this job.</span>
              </div>
            )}
          </div>

          {/* Sidebar panel */}
          <aside>
            <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Job Action/Owner Box */}
              {isOwner && (
                <GlassCard style={{ padding: '24px', border: '1px solid var(--primary)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>
                    You Posted This Job
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Manage proposals and select the best candidate to start work on your project.
                  </p>
                  <Link to={`/jobs/${job._id}/proposals`} style={{ width: '100%', display: 'block' }}>
                    <AnimatedButton variant="primary" style={{ width: '100%', padding: '10px' }}>
                      View Proposals ({job.proposals?.length || 0})
                    </AnimatedButton>
                  </Link>
                </GlassCard>
              )}

              {/* Client Profile Box */}
              <GlassCard style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  About the Client
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border-color)', flexShrink: 0,
                  }}>
                    <User size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>
                      {job.customerId?.name || 'Client'}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Member since {job.customerId?.createdAt ? new Date(job.customerId.createdAt).getFullYear() : '2026'}
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Client Rating</span>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⭐ {job.customerId?.avgRating?.toFixed(1) || '5.0'} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({job.customerId?.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Verified Payment</span>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={16} /> Yes
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Safety Guide */}
              <GlassCard style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Safety Tips
                </h3>
                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Never share personal contact information before project milestones are set.</li>
                  <li>Use our secure escrow wallet for payment protection.</li>
                  <li>Keep all communications within our official workspace.</li>
                </ul>
              </GlassCard>
            </div>
          </aside>

        </div>
      </div>
      <style>{`
        @media (max-width: 992px) {
          .job-details-grid {
            grid-template-columns: 1fr !important;
          }
          aside {
            position: static !important;
            order: -1;
          }
        }
        .file-attachment-link:hover {
          background: var(--primary-glow) !important;
          border-color: var(--primary) !important;
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

export default JobDetail;
