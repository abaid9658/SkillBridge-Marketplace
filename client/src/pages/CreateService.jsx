import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AnimatedButton from '../components/ui/AnimatedButton';
import FileUpload from '../components/ui/FileUpload';
import { SERVICE_CATEGORIES } from '../utils/constants';
import {
  Type, AlignLeft, Tag, DollarSign, Clock, RefreshCw,
  Hash, ImagePlus, ArrowLeft, Sparkles, CheckCircle2,
  Package, LayoutGrid, Check
} from 'lucide-react';

const catMeta = {
  'Website Development': { color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
  'Logo Design': { color: '#f472b6', bg: 'rgba(236,72,153,0.12)' },
  'Social Media Management': { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  'Content Writing': { color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  'Mobile App Development': { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  'UI/UX Design': { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  'Video Editing': { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  'SEO & Digital Marketing': { color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
};

const CreateService = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [revisions, setRevisions] = useState('3');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Packages state
  const [customPackages, setCustomPackages] = useState(false);
  
  // Basic Package State
  const [basicDesc, setBasicDesc] = useState('');
  const [basicPrice, setBasicPrice] = useState('');
  const [basicDelivery, setBasicDelivery] = useState('');
  const [basicRevisions, setBasicRevisions] = useState('1');
  const [basicFeatures, setBasicFeatures] = useState('');

  // Standard Package State
  const [standardDesc, setStandardDesc] = useState('');
  const [standardPrice, setStandardPrice] = useState('');
  const [standardDelivery, setStandardDelivery] = useState('');
  const [standardRevisions, setStandardRevisions] = useState('3');
  const [standardFeatures, setStandardFeatures] = useState('');

  // Premium Package State
  const [premiumDesc, setPremiumDesc] = useState('');
  const [premiumPrice, setPremiumPrice] = useState('');
  const [premiumDelivery, setPremiumDelivery] = useState('');
  const [premiumRevisions, setPremiumRevisions] = useState('5');
  const [premiumFeatures, setPremiumFeatures] = useState('');

  const accent = catMeta[category] || { color: '#818cf8', bg: 'rgba(99,102,241,0.12)' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title || !description || !price || !deliveryTime) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('category', category);
      fd.append('price', price);
      fd.append('deliveryTime', deliveryTime);
      fd.append('revisions', revisions);
      fd.append('tags', tags);
      if (imageFile) fd.append('images', imageFile);

      // Add packages structured object
      const pkgObject = {
        basic: {
          name: 'Basic',
          description: customPackages ? basicDesc : 'Basic package containing starter execution.',
          price: customPackages ? Number(basicPrice) : Number(price),
          deliveryDays: customPackages ? Number(basicDelivery) : Number(deliveryTime),
          revisions: customPackages ? Number(basicRevisions) : Number(revisions),
          features: customPackages ? basicFeatures.split(',').map(f => f.trim()).filter(Boolean) : []
        },
        standard: {
          name: 'Standard',
          description: customPackages ? standardDesc : 'Standard package containing expanded execution.',
          price: customPackages ? Number(standardPrice) : Math.round(Number(price) * 1.5),
          deliveryDays: customPackages ? Number(standardDelivery) : Math.max(1, Number(deliveryTime) - 1),
          revisions: customPackages ? Number(standardRevisions) : Number(revisions) + 1,
          features: customPackages ? standardFeatures.split(',').map(f => f.trim()).filter(Boolean) : []
        },
        premium: {
          name: 'Premium',
          description: customPackages ? premiumDesc : 'Premium package containing comprehensive execution.',
          price: customPackages ? Number(premiumPrice) : Number(price) * 2,
          deliveryDays: customPackages ? Number(premiumDelivery) : Math.max(1, Number(deliveryTime) - 2),
          revisions: customPackages ? Number(premiumRevisions) : Number(revisions) + 3,
          features: customPackages ? premiumFeatures.split(',').map(f => f.trim()).filter(Boolean) : []
        }
      };

      fd.append('packages', JSON.stringify(pkgObject));

      const res = await api.post('/services', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        const newServiceId = res.data.service?._id || res.data.data?._id;
        if (newServiceId) {
          navigate(`/services/${newServiceId}?created=1`);
        } else {
          navigate('/provider-dashboard?tab=my-services');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Page header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '40px 0 32px',
        marginBottom: '40px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <button
            onClick={() => navigate('/provider-dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600',
              marginBottom: '16px', padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={17} color="#818cf8" />
            </div>
            <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--primary)', margin: 0, textTransform: 'uppercase' }}>
              New Listing
            </p>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '900', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Create a <span className="gradient-text">Service</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            Publish a professional gig listing and start earning orders.
          </p>
        </div>
      </div>

      {/* Form content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderRadius: '12px', marginBottom: '24px',
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171', fontSize: '14px', fontWeight: '600',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Title */}
          <FormCard>
            <FieldLabel icon={<Type size={14} color="#818cf8" />} label="Service Title" required />
            <PremiumInput
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. I will build a stunning React web application"
              required
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 0' }}>
              Be specific. A clear title gets more clicks.
            </p>
          </FormCard>

          {/* Category */}
          <FormCard>
            <FieldLabel icon={<Tag size={14} color="#818cf8" />} label="Category" required />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginTop: '4px' }}>
              {SERVICE_CATEGORIES.map(cat => {
                const meta = catMeta[cat] || { color: '#818cf8', bg: 'rgba(99,102,241,0.12)' };
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: isActive ? '700' : '500',
                      textAlign: 'left',
                      background: isActive ? meta.bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? meta.color + '60' : 'var(--border-color)'}`,
                      color: isActive ? meta.color : 'var(--text-secondary)',
                      transition: 'all 0.18s',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    {isActive && <CheckCircle2 size={12} color={meta.color} />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </FormCard>

          {/* Description */}
          <FormCard>
            <FieldLabel icon={<AlignLeft size={14} color="#818cf8" />} label="Description & Details" required />
            <PremiumTextarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your service in detail — tools used, deliverables, process, timeline..."
              rows={7}
              required
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 0' }}>
              {description.length} / 2000 characters
            </p>
          </FormCard>

          {/* Pricing Row (Fallback base details) */}
          <FormCard>
            <FieldLabel icon={<DollarSign size={14} color="#34d399" />} label="Pricing & Delivery" required />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="pricing-grid">
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Base Price ($)
                </p>
                <PremiumInput
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="50"
                  min="5"
                  required
                  prefix={<DollarSign size={14} color="var(--text-muted)" />}
                />
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Delivery (Days)
                </p>
                <PremiumInput
                  type="number"
                  value={deliveryTime}
                  onChange={e => setDeliveryTime(e.target.value)}
                  placeholder="5"
                  min="1"
                  required
                  prefix={<Clock size={14} color="var(--text-muted)" />}
                />
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Revisions
                </p>
                <PremiumInput
                  type="number"
                  value={revisions}
                  onChange={e => setRevisions(e.target.value)}
                  placeholder="3"
                  min="0"
                  prefix={<RefreshCw size={14} color="var(--text-muted)" />}
                />
              </div>
            </div>
          </FormCard>

          {/* Toggle for Custom Packages */}
          <FormCard>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={customPackages}
                onChange={e => setCustomPackages(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Customize Package Tiers (Basic, Standard, Premium)
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Offer custom pricing packages for different scopes. Fallback pricing will be used if disabled.
                </p>
              </div>
            </label>
          </FormCard>

          {/* CUSTOM PACKAGES FORM FIELDS */}
          {customPackages && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Basic Package Box */}
              <FormCard style={{ borderLeft: '4px solid #818cf8' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} /> Basic Package
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. Starter codebase with basic pages"
                    value={basicDesc} onChange={e => setBasicDesc(e.target.value)} required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <label className="form-label">Price ($)</label>
                    <PremiumInput type="number" value={basicPrice} onChange={e => setBasicPrice(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Delivery (Days)</label>
                    <PremiumInput type="number" value={basicDelivery} onChange={e => setBasicDelivery(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Revisions</label>
                    <PremiumInput type="number" value={basicRevisions} onChange={e => setBasicRevisions(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label">Features included (comma separated)</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. Clean code, 1 UI page, responsive"
                    value={basicFeatures} onChange={e => setBasicFeatures(e.target.value)}
                  />
                </div>
              </FormCard>

              {/* Standard Package Box */}
              <FormCard style={{ borderLeft: '4px solid #a78bfa' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} /> Standard Package
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. Full standard deployment with custom dashboard integration"
                    value={standardDesc} onChange={e => setStandardDesc(e.target.value)} required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <label className="form-label">Price ($)</label>
                    <PremiumInput type="number" value={standardPrice} onChange={e => setStandardPrice(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Delivery (Days)</label>
                    <PremiumInput type="number" value={standardDelivery} onChange={e => setStandardDelivery(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Revisions</label>
                    <PremiumInput type="number" value={standardRevisions} onChange={e => setStandardRevisions(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label">Features included (comma separated)</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. SEO, database connect, admin panel"
                    value={standardFeatures} onChange={e => setStandardFeatures(e.target.value)}
                  />
                </div>
              </FormCard>

              {/* Premium Package Box */}
              <FormCard style={{ borderLeft: '4px solid #f472b6' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#f472b6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} /> Premium Package
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. Elite SaaS solution, responsive UI/UX design, custom assets"
                    value={premiumDesc} onChange={e => setPremiumDesc(e.target.value)} required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <label className="form-label">Price ($)</label>
                    <PremiumInput type="number" value={premiumPrice} onChange={e => setPremiumPrice(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Delivery (Days)</label>
                    <PremiumInput type="number" value={premiumDelivery} onChange={e => setPremiumDelivery(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Revisions</label>
                    <PremiumInput type="number" value={premiumRevisions} onChange={e => setPremiumRevisions(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label">Features included (comma separated)</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. Premium support, custom assets, 1 month guarantee"
                    value={premiumFeatures} onChange={e => setPremiumFeatures(e.target.value)}
                  />
                </div>
              </FormCard>

            </div>
          )}

          {/* Tags */}
          <FormCard>
            <FieldLabel icon={<Hash size={14} color="#818cf8" />} label="Search Tags" />
            <PremiumInput
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. react, nodejs, website (comma separated)"
            />
          </FormCard>

          {/* Image */}
          <FormCard>
            <FieldLabel icon={<ImagePlus size={14} color="#818cf8" />} label="Cover Image" />
            <div style={{
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
              padding: '4px',
            }}>
              <FileUpload onFileSelect={file => setImageFile(file)} label="Select Service Cover Image" />
            </div>
          </FormCard>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => navigate('/provider-dashboard')}
              style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2, padding: '14px', borderRadius: '12px',
                background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #818cf8)',
                border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '700',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? 'Publishing…' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .pricing-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

/* helpers */
function FormCard({ children, style }) {
  return (
    <div style={{
      padding: '24px',
      borderRadius: '16px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--border-color)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', gap: '10px',
      ...style
    }}>
      {children}
    </div>
  );
}

function FieldLabel({ icon, label, required }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
      {icon}
      <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
        {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
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

function PremiumTextarea({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        width: '100%', padding: '12px 14px',
        borderRadius: '10px', resize: 'vertical',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${focused ? 'rgba(99,102,241,0.5)' : 'var(--border-color)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
        color: 'var(--text-primary)', fontSize: '14px',
        outline: 'none', lineHeight: '1.6',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        ...style,
      }}
    />
  );
}

export default CreateService;