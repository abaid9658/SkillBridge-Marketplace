import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { ArrowLeft, Wand2, Copy, Check, Sparkles } from 'lucide-react';

const ProposalGenerator = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skills, setSkills] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle) {
      setError('Please provide the job posting title.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);
    try {
      const res = await api.post('/ai/proposal-generator', {
        jobTitle,
        jobDescription,
        skills
      });

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to AI server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Back Link */}
        <Link to="/ai" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to AI Tools
        </Link>

        {/* Title */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
            AI Proposal <span className="gradient-text">Generator</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Draft customized, persuasive proposal pitch letters matching target client jobs in real time.
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <GlassCard style={{ padding: '28px' }}>
            {error && (
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', marginBottom: '20px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Client Job Title</label>
                <input
                  type="text" className="form-input" style={{ width: '100%' }}
                  placeholder="e.g. Need Senior Full-Stack NextJS Developer"
                  value={jobTitle} onChange={e => setJobTitle(e.target.value)} required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements / Job Description Context</label>
                <textarea
                  className="form-input" style={{ minHeight: '100px', width: '100%', resize: 'vertical' }}
                  placeholder="Paste snippets or details from the client requirements description..."
                  value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Your Skills & Tech Stack (Comma separated)</label>
                <input
                  type="text" className="form-input" style={{ width: '100%' }}
                  placeholder="e.g. Next.js, Redux, PostgreSQL, Stripe integration"
                  value={skills} onChange={e => setSkills(e.target.value)}
                />
              </div>

              <AnimatedButton type="submit" variant="accent" loading={loading} style={{ width: '100%', padding: '12px' }}>
                Generate Proposal Draft <Wand2 size={16} />
              </AnimatedButton>
            </form>
          </GlassCard>

          {/* Result */}
          {result && (
            <GlassCard style={{ padding: '32px', border: '1px solid var(--accent)' }} className="animate-fade-in">
              <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--accent)" /> Generated Pitch Cover Letter
                </h3>
                <AnimatedButton variant="secondary" onClick={handleCopy} style={{ padding: '6px 12px', fontSize: '12px' }}>
                  {copied ? <><Check size={14} color="#10b981" /> Copied</> : <><Copy size={14} /> Copy Pitch Draft</>}
                </AnimatedButton>
              </div>

              <pre style={{
                background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px',
                color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-sans)', border: '1px solid var(--border-color)',
                lineHeight: '1.6'
              }}>
                {result.coverLetter}
              </pre>
            </GlassCard>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProposalGenerator;
