import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import { ArrowLeft, User, Mail, Phone, MapPin, Award, BookOpen, CreditCard, Camera, Info, ShieldCheck } from 'lucide-react';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user: authUser, login } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [pricing, setPricing] = useState('');
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile');
      if (res.data.success) {
        const u = res.data.user;
        setName(u.name || '');
        setBio(u.bio || '');
        setLocation(u.location || '');
        setPhone(u.phone || '');
        setSkills(Array.isArray(u.skills) ? u.skills.join(', ') : u.skills || '');
        setExperience(u.experience || '');
        setPricing(u.pricing?.toString() || '');
        setImagePreview(u.profilePicture || '');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('bio', bio);
      fd.append('location', location);
      fd.append('phone', phone);
      fd.append('skills', skills);
      fd.append('experience', experience);
      if (pricing) fd.append('pricing', Number(pricing));
      if (profileImage) fd.append('profilePicture', profileImage);

      const res = await api.put('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccess('Profile updated successfully.');
        // Refresh contexts
        if (login) {
          // If authContext exports a method to refresh user
          // we can just re-login or let it sync
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save updates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        
        {/* Back Link */}
        <Link to="/provider-dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
            Edit My <span className="gradient-text">Profile</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Update your public profile details, skills checklist, bio and hourly pricing rate.
          </p>
        </div>

        {error && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
            <Info size={16} /> {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
            <ShieldCheck size={16} /> {success}
          </div>
        )}

        {/* Edit Form */}
        <GlassCard style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit}>
            
            {/* Avatar Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', background: 'var(--border-color)', border: '2px solid var(--primary)' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="var(--text-muted)" />
                  </div>
                )}
                <label style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px',
                  background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.2s'
                }} className="avatar-upload-label">
                  <Camera size={14} color="#fff" />
                  <input type="file" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                </label>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Click to upload profile photo</span>
            </div>

            {/* Basic Info */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <PremiumInput type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Location (City, Country)</label>
                <PremiumInput type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, US" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <PremiumInput type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 555 0199" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Bio / Introduction</label>
              <textarea
                className="form-input" style={{ width: '100%', minHeight: '120px', resize: 'vertical', lineHeight: '1.6' }}
                placeholder="Write a brief professional summary to display on your profile page..."
                value={bio} onChange={e => setBio(e.target.value)}
              />
            </div>

            {/* Provider fields */}
            {authUser && authUser.role === 'provider' && (
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '24px', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: 'var(--primary)' }}>
                  Freelancer Settings
                </h3>

                <div className="form-group">
                  <label className="form-label">Expertise Skills (Comma separated)</label>
                  <PremiumInput
                    type="text" value={skills} onChange={e => setSkills(e.target.value)}
                    placeholder="e.g. React, NextJS, TypeScript, NodeJS"
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Separate individual skills with commas.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Hourly Rate ($)</label>
                    <PremiumInput type="number" value={pricing} onChange={e => setPricing(e.target.value)} placeholder="50" min="5" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <PremiumInput type="text" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 5+ years" />
                  </div>
                </div>
              </div>
            )}

            <AnimatedButton type="submit" variant="primary" loading={saving} style={{ width: '100%', padding: '12px', marginTop: '24px' }}>
              Save Profile Updates
            </AnimatedButton>
          </form>
        </GlassCard>

      </div>
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

function PremiumInput({ prefix, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 14px', borderRadius: '10px',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${focused ? 'rgba(99,102,241,0.5)' : 'var(--border-color)'}`,
      boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
      transition: 'all 0.2s',
      flex: 1,
      width: '100%',
    }}>
      {prefix}
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: 'var(--text-primary)', fontSize: '14px',
          width: '100%',
          ...style,
        }}
      />
    </div>
  );
}

export default ProfileEdit;
