import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import StatusBadge from '../components/ui/StatusBadge';
import {
  Briefcase, Calendar, DollarSign, Users, ChevronRight, Plus, Eye,
  ArrowRight, Search, Clock, FileText, AlertCircle
} from 'lucide-react';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'open', 'in_progress', 'closed'

  const fetchMyJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const res = await api.get('/jobs/me/list', { params });
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve your job postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0 100px' }}>
      <div className="container">
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
              My Posted <span className="gradient-text">Jobs</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
              Manage your custom project requests, view bids, and track progress.
            </p>
          </div>
          <Link to="/jobs/create">
            <AnimatedButton variant="primary" style={{ padding: '12px 24px' }}>
              <Plus size={16} /> Post a New Job
            </AnimatedButton>
          </Link>
        </div>

        {/* TAB FILTER BAR */}
        <div style={{
          display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px', marginBottom: '32px', flexWrap: 'wrap'
        }}>
          {[
            { value: '', label: 'All Jobs' },
            { value: 'open', label: 'Open Postings' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'closed', label: 'Completed / Closed' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                background: statusFilter === tab.value ? 'var(--primary-glow)' : 'transparent',
                color: statusFilter === tab.value ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: statusFilter === tab.value ? '700' : '500',
                fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* JOBS LIST */}
        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--glass-bg)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>No jobs found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              You don't have any posted project requests in this category.
            </p>
            <Link to="/jobs/create">
              <AnimatedButton variant="primary">Post Your First Job</AnimatedButton>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {jobs.map(job => (
              <GlassCard key={job._id} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyBetween: 'space-between', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  
                  {/* Left Side Details */}
                  <div style={{ flex: '1 1 400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: '4px',
                        background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                      }}>
                        {job.category}
                      </span>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
                      <Link to={`/jobs/${job._id}`} className="hover-link" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>
                        {job.title}
                      </Link>
                    </h3>

                    <p style={{
                      color: 'var(--text-secondary)', fontSize: '14px',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', marginBottom: '16px'
                    }}>
                      {job.description}
                    </p>

                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <DollarSign size={15} color="var(--primary)" /> <strong>${job.budget?.min} - ${job.budget?.max}</strong>
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={15} color="var(--primary)" /> <strong>{job.proposals?.length || job.proposalCount || 0}</strong> proposals received
                      </span>
                    </div>
                  </div>

                  {/* Right Side Status & CTA */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    justifyContent: 'space-between', minHeight: '110px', flexShrink: 0,
                    textAlign: 'right', marginLeft: 'auto'
                  }} className="myjobs-card-right">
                    <StatusBadge type={getStatusColor(job.status)} text={job.status.replace('_', ' ').toUpperCase()} />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <Link to={`/jobs/${job._id}`}>
                        <AnimatedButton variant="secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                          <Eye size={14} /> Details
                        </AnimatedButton>
                      </Link>
                      
                      {job.status === 'open' && (
                        <Link to={`/jobs/${job._id}/proposals`}>
                          <AnimatedButton variant="primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                            Proposals ({job.proposals?.length || 0}) <ArrowRight size={14} />
                          </AnimatedButton>
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </GlassCard>
            ))}
          </div>
        )}

      </div>
      <style>{`
        .hover-link:hover {
          color: var(--primary) !important;
        }
        @media (max-width: 768px) {
          .myjobs-card-right {
            align-items: flex-start !important;
            text-align: left !important;
            width: 100%;
            min-height: auto !important;
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

export default MyJobs;
