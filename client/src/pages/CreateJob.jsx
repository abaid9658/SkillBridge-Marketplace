import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import FileUpload from '../components/ui/FileUpload';
import { SERVICE_CATEGORIES } from '../utils/constants';
import {
  Briefcase, Calendar, DollarSign, ArrowRight, ArrowLeft, Send, CheckCircle, Info,
  AlertCircle, Sparkles
} from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [skillsInput, setSkillsInput] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && (!title || !description || !category)) {
      setError('Please enter a title, description and category.');
      return;
    }
    if (step === 2 && (!minBudget || !maxBudget)) {
      setError('Please specify the budget range.');
      return;
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const skillsArray = skillsInput
        ? skillsInput.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      
      const payload = {
        title,
        description,
        category,
        skills: skillsArray,
        budget: {
          min: Number(minBudget),
          max: Number(maxBudget),
        },
        deadline: deadline || undefined,
        attachments: attachments.map(a => ({ url: a.url, publicId: a.publicId }))
      };

      const res = await api.post('/jobs', payload);
      if (res.data.success) {
        navigate('/jobs');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit job request.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (step / 3) * 100;

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            padding: '4px 12px', borderRadius: '999px',
            background: 'var(--primary-glow)', border: '1px solid var(--border-color)',
            fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase'
          }}>
            Client Dashboard
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', letterSpacing: '-0.02em', margin: '12px 0 8px' }}>
            Post a Custom <span className="gradient-text">Project Request</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Describe your project requirements and receive competitive proposals from expert freelancers.
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', marginBottom: '40px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: `${progressPercentage}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>

        {/* Form Container */}
        <GlassCard style={{ padding: '36px' }}>
          {error && (
            <div style={{
              padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)',
              marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="var(--primary)" /> Step 1: Project Details
              </h3>

              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text" className="form-input" style={{ width: '100%' }}
                  placeholder="e.g. Build a Modern React E-commerce Web App"
                  value={title} onChange={e => setTitle(e.target.value)} required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input" style={{ width: '100%', cursor: 'pointer' }}
                  value={category} onChange={e => setCategory(e.target.value)}
                >
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Requirements description</label>
                <textarea
                  className="form-input" style={{ minHeight: '180px', width: '100%', resize: 'vertical', lineHeight: '1.5' }}
                  placeholder="Clearly outline requirements, technology stack, scope of work, and expected deliverables..."
                  value={description} onChange={e => setDescription(e.target.value)} required
                />
              </div>

              <AnimatedButton type="submit" variant="primary" style={{ width: '100%', padding: '12px' }}>
                Continue <ArrowRight size={16} />
              </AnimatedButton>
            </form>
          )}

          {/* STEP 2: Budget & Deadline */}
          {step === 2 && (
            <form onSubmit={handleNext}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} color="var(--primary)" /> Step 2: Budget & Timeline
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Minimum Budget ($)</label>
                  <input
                    type="number" className="form-input" style={{ width: '100%' }}
                    placeholder="Min" value={minBudget} onChange={e => setMinBudget(e.target.value)} required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Budget ($)</label>
                  <input
                    type="number" className="form-input" style={{ width: '100%' }}
                    placeholder="Max" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Target Deadline (Optional)</label>
                <input
                  type="date" className="form-input" style={{ width: '100%', cursor: 'pointer' }}
                  value={deadline} onChange={e => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <AnimatedButton type="button" variant="secondary" onClick={handleBack} style={{ flex: 1, padding: '12px' }}>
                  <ArrowLeft size={16} /> Back
                </AnimatedButton>
                <AnimatedButton type="submit" variant="primary" style={{ flex: 2, padding: '12px' }}>
                  Continue <ArrowRight size={16} />
                </AnimatedButton>
              </div>
            </form>
          )}

          {/* STEP 3: Skills & Attachments */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--primary)" /> Step 3: Skills & Reference Files
              </h3>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Required Skills (Comma separated)</label>
                <input
                  type="text" className="form-input" style={{ width: '100%' }}
                  placeholder="e.g. React, NextJS, TypeScript, Tailwind"
                  value={skillsInput} onChange={e => setSkillsInput(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Separate individual skills with commas (e.g. React, GraphQL)
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="form-label">Project Attachments (Mockups, specs, or assets)</label>
                <FileUpload
                  onUploadComplete={(files) => setAttachments(prev => [...prev, ...files])}
                  maxFiles={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <AnimatedButton type="button" variant="secondary" onClick={handleBack} style={{ flex: 1, padding: '12px' }}>
                  <ArrowLeft size={16} /> Back
                </AnimatedButton>
                <AnimatedButton type="submit" variant="primary" loading={loading} style={{ flex: 2, padding: '12px' }}>
                  Post Request <Send size={16} />
                </AnimatedButton>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default CreateJob;
