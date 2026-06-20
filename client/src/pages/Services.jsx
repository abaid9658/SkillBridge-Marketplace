import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import SearchBar from '../components/ui/SearchBar';
import StarRating from '../components/ui/StarRating';
import AnimatedButton from '../components/ui/AnimatedButton';
import { SERVICE_CATEGORIES } from '../utils/constants';
import {
  User, Filter, X, ChevronLeft, ChevronRight,
  Code, Palette, Share2, PenTool, Smartphone, Monitor, TrendingUp,
  SlidersHorizontal, Clock, DollarSign, Star,
} from 'lucide-react';

/* ─── Category icon + colour map ─── */
const catMeta = {
  'Website Development': { icon: Code, color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  'Logo Design': { icon: Palette, color: '#f472b6', bg: 'rgba(236,72,153,0.15)' },
  'Social Media Management': { icon: Share2, color: '#22d3ee', bg: 'rgba(34,211,238,0.15)' },
  'Content Writing': { icon: PenTool, color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
  'Mobile App Development': { icon: Smartphone, color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  'UI/UX Design': { icon: Palette, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  'Video Editing': { icon: Monitor, color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  'SEO & Digital Marketing': { icon: TrendingUp, color: '#facc15', bg: 'rgba(250,204,21,0.15)' },
};

const DEFAULT_COLOR = '#818cf8';
const DEFAULT_BG = 'rgba(99,102,241,0.15)';
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80';

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const scrollRef = useRef(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;
      if (sort) params.sort = sort;

      const res = await api.get('/services', { params });
      if (res.data.success) {
        setServices(res.data.services);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [category, search, minPrice, maxPrice, minRating, sort, page]);

  const handleSearchSubmit = (query) => {
    setSearch(query);
    setPage(1);
    setSearchParams({ search: query, category });
  };

  const handleCategoryClick = (cat) => {
    const next = category === cat ? '' : cat;
    setCategory(next);
    setPage(1);
    setSearchParams({ search, category: next });
  };

  const resetFilters = () => {
    setCategory(''); setSearch(''); setMinPrice('');
    setMaxPrice(''); setMinRating(''); setSort('-createdAt');
    setPage(1); setSearchParams({});
  };

  const scrollCats = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  const activeFiltersCount = [category, minPrice, maxPrice, minRating].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>

      {/* ─── PAGE HEADER ─── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '48px 0 32px',
        marginBottom: '32px',
      }}>
        <div className="container">
          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Marketplace
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '900', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Explore <span className="gradient-text">Services</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: '0 0 28px' }}>
            {total > 0 ? `${total.toLocaleString()} services from vetted professionals` : 'Find top-rated experts for any project'}
          </p>

          {/* Search row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <SearchBar onSearch={handleSearchSubmit} placeholder="Search services, skills, experts…" />
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                background: activeFiltersCount > 0 ? 'rgba(99,102,241,0.15)' : 'var(--glass-bg)',
                border: `1px solid ${activeFiltersCount > 0 ? 'rgba(99,102,241,0.4)' : 'var(--border-color)'}`,
                color: activeFiltersCount > 0 ? '#818cf8' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              }}
              className="filters-mobile-btn"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#818cf8', color: '#fff',
                  fontSize: '11px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── CATEGORY PILLS ROW ─── */}
      <div className="container" style={{ marginBottom: '32px', position: 'relative' }}>
        {/* Scroll shadow left */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px',
          background: 'linear-gradient(90deg, var(--bg-primary, #0f0f14) 0%, transparent 100%)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        {/* Scroll shadow right */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px',
          background: 'linear-gradient(270deg, var(--bg-primary, #0f0f14) 0%, transparent 100%)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Scroll left arrow */}
        <button onClick={() => scrollCats(-1)} className="cat-scroll-btn cat-scroll-left" aria-label="Scroll left">
          <ChevronLeft size={18} />
        </button>

        {/* Pills track */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex', gap: '10px',
            overflowX: 'auto', scrollbarWidth: 'none',
            padding: '4px 44px',
            scrollSnapType: 'x mandatory',
          }}
        >
          {/* "All" pill */}
          <CategoryPill
            label="All Categories"
            icon={null}
            active={!category}
            color="#818cf8"
            bg="rgba(99,102,241,0.15)"
            onClick={() => handleCategoryClick('')}
          />

          {SERVICE_CATEGORIES.map((cat) => {
            const meta = catMeta[cat] || { icon: Code, color: DEFAULT_COLOR, bg: DEFAULT_BG };
            const Icon = meta.icon;
            return (
              <CategoryPill
                key={cat}
                label={cat}
                icon={<Icon size={14} />}
                active={category === cat}
                color={meta.color}
                bg={meta.bg}
                onClick={() => handleCategoryClick(cat)}
              />
            );
          })}
        </div>

        {/* Scroll right arrow */}
        <button onClick={() => scrollCats(1)} className="cat-scroll-btn cat-scroll-right" aria-label="Scroll right">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ─── MAIN LAYOUT: Sidebar + Grid ─── */}
      <div className="container services-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>

        {/* ── FILTERS SIDEBAR ── */}
        <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Mobile overlay backdrop */}
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />

          <div className="sidebar-inner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="var(--primary)" />
                <span style={{ fontWeight: '700', fontSize: '16px' }}>Filters</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: '600' }}
                >
                  Clear all
                </button>
              )}
              <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Active filter chips */}
            {activeFiltersCount > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {category && (
                  <FilterChip label={category} onRemove={() => handleCategoryClick(category)} />
                )}
                {minPrice && <FilterChip label={`Min $${minPrice}`} onRemove={() => setMinPrice('')} />}
                {maxPrice && <FilterChip label={`Max $${maxPrice}`} onRemove={() => setMaxPrice('')} />}
                {minRating && <FilterChip label={`★ ${minRating}+`} onRemove={() => setMinRating('')} />}
              </div>
            )}

            {/* Price Range */}
            <FilterSection icon={<DollarSign size={14} color="var(--primary)" />} title="Budget ($)">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <StyledInput
                  type="number" placeholder="Min" value={minPrice}
                  onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
                <StyledInput
                  type="number" placeholder="Max" value={maxPrice}
                  onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                />
              </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection icon={<Star size={14} color="var(--primary)" />} title="Minimum Rating">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[['', 'Any rating'], ['4.5', '4.5 & up ★★★★★'], ['4.0', '4.0 & up ★★★★'], ['3.5', '3.5 & up ★★★½'], ['3.0', '3.0 & up ★★★']].map(([val, lbl]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 0' }}>
                    <input
                      type="radio" name="minRating" value={val}
                      checked={minRating === val}
                      onChange={() => { setMinRating(val); setPage(1); }}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '13px', color: minRating === val ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: minRating === val ? '600' : '400' }}>
                      {lbl}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Sort */}
            <FilterSection icon={<Clock size={14} color="var(--primary)" />} title="Sort By">
              <StyledSelect value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low → High</option>
                <option value="-price">Price: High → Low</option>
                <option value="-avgRating">Highest Rated</option>
              </StyledSelect>
            </FilterSection>

            <AnimatedButton onClick={resetFilters} variant="secondary" style={{ width: '100%', padding: '10px', marginTop: '8px' }}>
              Reset All Filters
            </AnimatedButton>
          </div>
        </aside>

        {/* ── SERVICES GRID ── */}
        <main>
          {/* Result count + sort (desktop inline) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              {loading ? 'Loading…' : total > 0 ? `Showing ${services.length} of ${total} results` : ''}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort:</span>
              <StyledSelect value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: '6px 10px', fontSize: '13px' }}>
                <option value="-createdAt">Newest</option>
                <option value="price">Price ↑</option>
                <option value="-price">Price ↓</option>
                <option value="-avgRating">Top Rated</option>
              </StyledSelect>
            </div>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : services.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px',
              }}>
                {services.map((service, i) => (
                  <ServiceCard key={service._id} service={service} index={i} />
                ))}
              </div>

              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px', flexWrap: 'wrap' }}>
                  <AnimatedButton disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="secondary" style={{ padding: '8px 18px' }}>
                    ← Prev
                  </AnimatedButton>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          width: '38px', height: '38px', borderRadius: '8px',
                          background: page === p ? 'var(--primary)' : 'var(--glass-bg)',
                          border: `1px solid ${page === p ? 'var(--primary)' : 'var(--border-color)'}`,
                          color: page === p ? '#fff' : 'var(--text-secondary)',
                          fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <AnimatedButton disabled={page === pages} onClick={() => setPage(p => p + 1)} variant="secondary" style={{ padding: '8px 18px' }}>
                    Next →
                  </AnimatedButton>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        /* ── Category pills scrollbar hide ── */
        div::-webkit-scrollbar { display: none; }

        /* ── Cat scroll buttons ── */
        .cat-scroll-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 3; width: 32px; height: 32px; border-radius: 50%;
          background: var(--glass-bg); border: 1px solid var(--border-color);
          color: var(--text-secondary); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .cat-scroll-btn:hover { background: var(--primary-glow); color: var(--primary); border-color: var(--primary); }
        .cat-scroll-left  { left: 0; }
        .cat-scroll-right { right: 0; }

        /* ── Sidebar desktop ── */
        .filters-sidebar { height: fit-content; }
        .sidebar-inner {
          background: var(--glass-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 24px;
          backdrop-filter: blur(12px);
          position: sticky; top: 80px;
        }
        .sidebar-backdrop { display: none; }
        .sidebar-close-btn { display: none; }

        /* ── Sidebar mobile ── */
        @media (max-width: 768px) {
          .services-layout { grid-template-columns: 1fr !important; }
          .filters-sidebar {
            position: fixed; inset: 0; z-index: 200;
            pointer-events: none;
          }
          .filters-sidebar.open { pointer-events: all; }
          .sidebar-backdrop {
            display: block;
            position: absolute; inset: 0;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
            opacity: 0; transition: opacity 0.3s;
          }
          .filters-sidebar.open .sidebar-backdrop { opacity: 1; }
          .sidebar-inner {
            position: absolute; right: 0; top: 0; bottom: 0;
            width: 300px; border-radius: 0; overflow-y: auto;
            transform: translateX(100%); transition: transform 0.3s ease;
          }
          .filters-sidebar.open .sidebar-inner { transform: translateX(0); }
          .sidebar-close-btn {
            display: flex; align-items: center; justify-content: center;
            background: none; border: none; cursor: pointer;
            color: var(--text-secondary);
          }
          .filters-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .filters-mobile-btn { display: none !important; }
          .sidebar-close-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

/* ════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════ */

function CategoryPill({ label, icon, active, color, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        padding: '9px 18px', borderRadius: '999px',
        whiteSpace: 'nowrap', scrollSnapAlign: 'start',
        fontSize: '13px', fontWeight: active ? '700' : '500',
        cursor: 'pointer',
        background: active ? bg : 'var(--glass-bg)',
        border: `1px solid ${active ? color + '60' : 'var(--border-color)'}`,
        color: active ? color : 'var(--text-secondary)',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        boxShadow: active ? `0 4px 20px ${color}20` : 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.borderColor = color + '40';
          e.currentTarget.style.color = color;
          e.currentTarget.style.background = bg;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'var(--glass-bg)';
        }
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterSection({ icon, title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        {icon}
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
      fontSize: '11px', fontWeight: '600', color: '#818cf8',
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', display: 'flex', padding: 0 }}>
        <X size={10} />
      </button>
    </span>
  );
}

function StyledInput({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '8px 10px',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--text-primary)',
        fontSize: '13px', outline: 'none',
        transition: 'border-color 0.2s',
        ...style,
      }}
      onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    />
  );
}

function StyledSelect({ style, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '8px 10px',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        fontSize: '13px', outline: 'none', cursor: 'pointer',
        ...style,
      }}
    />
  );
}

function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false);
  const meta = catMeta[service.category] || { color: DEFAULT_COLOR, bg: DEFAULT_BG };

  return (
    <Link to={`/services/${service._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--glass-bg)',
          border: `1px solid ${hovered ? meta.color + '40' : 'var(--border-color)'}`,
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? `0 16px 48px ${meta.color}18` : 'none',
          display: 'flex', flexDirection: 'column',
          animationFillMode: 'both',
        }}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', width: '100%', height: '168px', overflow: 'hidden', background: 'var(--border-color)' }}>
          <img
            src={service.images?.[0]?.url || DEFAULT_IMG}
            alt={service.title}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
          {/* Category badge */}
          {service.category && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
              padding: '4px 10px', borderRadius: '999px',
              background: meta.bg, backdropFilter: 'blur(8px)',
              border: `1px solid ${meta.color}40`,
              fontSize: '11px', fontWeight: '700', color: meta.color,
            }}>
              {service.category}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {/* Provider row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {service.provider?.profilePicture ? (
              <img
                src={service.provider.profilePicture}
                alt={service.provider.name}
                style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${meta.color}40` }}
              />
            ) : (
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={12} color={meta.color} />
              </div>
            )}
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {service.provider?.name || 'Freelancer'}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '15px', fontWeight: '700', lineHeight: '1.4',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', margin: 0,
            color: hovered ? meta.color : 'var(--text-primary)',
            transition: 'color 0.2s',
          }}>
            {service.title}
          </h3>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
            <StarRating rating={service.avgRating || 5} size={13} readOnly />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ({service.totalReviews || 0})
            </span>
          </div>

          {/* Price footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: '12px', borderTop: '1px solid var(--border-color)',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Starting at
            </span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: meta.color }}>
              ${service.price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Skeleton loader grid */
function LoadingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}>
          <div style={{ height: '168px', background: 'var(--border-color)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ height: '12px', width: '60%', borderRadius: '4px', background: 'var(--border-color)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            <div style={{ height: '16px', width: '90%', borderRadius: '4px', background: 'var(--border-color)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            <div style={{ height: '16px', width: '70%', borderRadius: '4px', background: 'var(--border-color)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div style={{
      textAlign: 'center', padding: '80px 24px',
      background: 'var(--glass-bg)', borderRadius: 'var(--border-radius-md)',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
      <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>No services found</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
        Try broadening your search or adjusting your filters to find what you need.
      </p>
      <AnimatedButton onClick={onReset} variant="primary">Clear Filters</AnimatedButton>
    </div>
  );
}

export default Services;