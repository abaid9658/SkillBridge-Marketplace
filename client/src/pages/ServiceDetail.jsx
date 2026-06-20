import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import StarRating from '../components/ui/StarRating';
import AnimatedButton from '../components/ui/AnimatedButton';
import Modal from '../components/ui/Modal';
import { Calendar, User, Clock, MessageSquare, Zap, ShieldCheck, Check } from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Request form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Packages tab selection on the sidebar
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        if (res.data.success) {
          setService(res.data.service);
          
          // Default budget based on current selected package
          const initialPkg = res.data.service.packages?.[activeTab] || {};
          setBudget((initialPkg.price || res.data.service.price).toString());
          
          // fetch reviews
          fetchReviews(res.data.service._id);
        }
      } catch (err) {
        console.error('Failed to load service', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchReviews = async (serviceId) => {
      try {
        const res = await api.get(`/reviews/service/${serviceId}`);
        if (res.data.success) {
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Adjust budget automatically when switching tabs
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSelectedPackage(tabName);
    if (service) {
      const pkg = service.packages?.[tabName];
      const pkgPrice = pkg?.price || service.price;
      setBudget(pkgPrice.toString());
    }
  };

  const handleContactProvider = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      navigate(`/chat?user=${service.provider._id}`);
    } catch (err) {
      console.error('Failed to initiate conversation', err);
    }
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!requirements || !budget || !deadline) {
      setError('Please fill in all requirements fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/requests', {
        serviceId: service._id,
        requirements,
        budget: Number(budget),
        deadline,
        selectedPackage,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        navigate('/dashboard?tab=overview&success=true');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <span className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary-glow)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Service Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>The service you requested does not exist or has been removed.</p>
        <Link to="/services">
          <AnimatedButton variant="primary">Back to Services</AnimatedButton>
        </Link>
      </div>
    );
  }

  // Safe packaging lookups
  const pkgDetails = {
    basic: service.packages?.basic || { name: 'Basic', description: 'Standard starter service execution.', price: service.price, deliveryDays: service.deliveryTime, revisions: service.revisions || 1, features: [] },
    standard: service.packages?.standard || { name: 'Standard', description: 'Advanced standard service execution.', price: Math.round(service.price * 1.5), deliveryDays: Math.max(1, service.deliveryTime - 1), revisions: (service.revisions || 1) + 1, features: [] },
    premium: service.packages?.premium || { name: 'Premium', description: 'Elite ultimate service execution.', price: service.price * 2, deliveryDays: Math.max(1, service.deliveryTime - 2), revisions: (service.revisions || 1) + 3, features: [] }
  };

  const currentPkg = pkgDetails[activeTab];

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr', gap: '40px' }} className="service-details-layout">
        
        {/* Left Side: Service Details */}
        <div>
          <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', trackingLetter: '1px' }}>
            {service.category}
          </span>
          <h1 style={{ fontSize: '36px', textAlign: 'left', margin: '8px 0 20px 0' }}>{service.title}</h1>

          {/* Image gallery */}
          <div
            style={{
              width: '100%',
              height: '420px',
              borderRadius: 'var(--border-radius-md)',
              overflow: 'hidden',
              background: 'var(--border-color)',
              marginBottom: '32px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <img
              src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'}
              alt={service.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '16px' }}>Service Description</h3>
            <div
              style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                fontSize: '15px',
              }}
            >
              {service.description}
            </div>
          </div>

          {/* Reviews section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Reviews ({reviews.length})</h3>
            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No reviews yet for this service.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map((review) => (
                  <GlassCard key={review._id} style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                          }}
                        >
                          {review.customer?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{review.customer?.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={14} readOnly />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{review.comment}</p>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Gig Pricing & Checkout (Packages Tabs) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Order packages card */}
          <GlassCard style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-hover)' }}>
            
            {/* Package Tabs Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--border-color)' }}>
              {['basic', 'standard', 'premium'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleTabChange(tier)}
                  style={{
                    padding: '16px 0',
                    fontSize: '13px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    background: activeTab === tier ? 'var(--primary-glow)' : 'transparent',
                    color: activeTab === tier ? 'var(--primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tier ? '3px solid var(--primary)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Package Details Body */}
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '800', textTransform: 'capitalize' }}>
                  {currentPkg.name || activeTab}
                </h4>
                <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>
                  ${currentPkg.price || service.price}
                </span>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
                {currentPkg.description || 'Complete premium gig delivery as requested.'}
              </p>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Clock size={16} color="var(--primary)" />
                  <span>{currentPkg.deliveryDays || currentPkg.deliveryTime} Days Delivery</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Zap size={16} color="var(--primary)" />
                  <span>{currentPkg.revisions} Revisions</span>
                </div>
              </div>

              {/* Package Features List */}
              {currentPkg.features && currentPkg.features.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Features Included</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentPkg.features.map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Check size={14} color="#10b981" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <AnimatedButton
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                style={{ width: '100%', padding: '14px' }}
              >
                Order ({activeTab.toUpperCase()})
              </AnimatedButton>
            </div>

          </GlassCard>

          {/* Provider Card Info */}
          <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700' }}>About The Provider</h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {service.provider?.profilePicture ? (
                <img
                  src={service.provider.profilePicture}
                  alt={service.provider.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--primary-glow)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                  }}
                >
                  <User size={20} />
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{service.provider?.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <StarRating rating={service.provider?.avgRating || 5} size={12} readOnly />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ({service.provider?.totalReviews || 0})
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {service.provider?.bio || 'Professional service provider verified by TEYZIX Marketplace.'}
            </p>

            <AnimatedButton
              onClick={handleContactProvider}
              variant="secondary"
              style={{ width: '100%' }}
            >
              <MessageSquare size={16} style={{ marginRight: '8px' }} />
              Contact Provider
            </AnimatedButton>
          </GlassCard>
        </div>
      </div>

      {/* Hire Submission Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Order ${activeTab.toUpperCase()} Package`}>
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleHireSubmit}>
          <div className="form-group">
            <label className="form-label">Requirement Details</label>
            <textarea
              className="form-input"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Detail your requests. Provide reference links, design colors, page list, and other guidelines..."
              rows={5}
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                className="form-input"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min={currentPkg.price || service.price}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Target Deadline</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <AnimatedButton
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              variant="primary"
              loading={submitting}
              style={{ flex: 1 }}
            >
              Submit Order
            </AnimatedButton>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 900px) {
          .service-details-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceDetail;
