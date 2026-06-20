import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import SearchBar from '../components/ui/SearchBar';
import AnimatedButton from '../components/ui/AnimatedButton';
import { SERVICE_CATEGORIES } from '../utils/constants';
import {
  Briefcase, Calendar, DollarSign, Filter, SlidersHorizontal, X, User,
  Code, Palette, Share2, PenTool, Smartphone, Monitor, TrendingUp,
  Tag, ArrowRight, Clock, Award
} from 'lucide-react';

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

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sort, setSort] = useState('recent');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, status: 'open' };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minBudget) params.minBudget = minBudget;
      if (maxBudget) params.maxBudget = maxBudget;
      if (sort) params.sort = sort;

      const res = await api.get('/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.data);
        setTotal(res.data.pagination.total);
        setPages(res.data.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category, search, minBudget, maxBudget, sort, page]);

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
    setCategory('');
    setSearch('');
    setMinBudget('');
    setMaxBudget('');
    setSort('recent');
    setPage(1);
    setSearchParams({});
  };

  const activeFiltersCount = [category, minBudget, maxBudget].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '48px 0 32px',
        marginBottom: '32px',
      }}>
        <div className="container">
          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Job Board
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '900', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Browse <span className="gradient-text">Job Postings</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: '0 0 28px' }}>
            {total > 0 ? `${total.toLocaleString()} active projects looking for experts` : 'Find freelance work and custom client requests'}
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <SearchBar onSearch={handleSearchSubmit} placeholder="Search jobs, key skills, client terms…" />
            </div>
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

      {/* MAIN CONTAINER */}
      <div className="container jobs-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
        {/* SIDEBAR */}
        <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
          <div className="sidebar-inner">
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="var(--primary)" />
                <span style={{ fontWeight: '700', fontSize: '16px' }}>Filters</span>
              </div>
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: '600' }}>
                  Clear all
                </button>
              )}
              <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Category selection */}
            <FilterSection icon={<Briefcase size={14} color="var(--primary)" />} title="Category">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => handleCategoryClick('')}
                  style={{
                    textAlign: 'left', padding: '6px 10px', borderRadius: '6px',
                    background: !category ? 'var(--primary-glow)' : 'transparent',
                    color: !category ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: !category ? '600' : '400', fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  All Categories
                </button>
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      textAlign: 'left', padding: '6px 10px', borderRadius: '6px',
                      background: category === cat ? 'var(--primary-glow)' : 'transparent',
                      color: category === cat ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: category === cat ? '600' : '400', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Budget section */}
            <FilterSection icon={<DollarSign size={14} color="var(--primary)" />} title="Budget Range ($)">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number" placeholder="Min" value={minBudget}
                  onChange={e => { setMinBudget(e.target.value); setPage(1); }}
                  style={{
                    width: '100%', padding: '8px 10px',
                    border: '1px solid var(--border-color)', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)',
                    fontSize: '13px', outline: 'none',
                  }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
                <input
                  type="number" placeholder="Max" value={maxBudget}
                  onChange={e => { setMaxBudget(e.target.value); setPage(1); }}
                  style={{
                    width: '100%', padding: '8px 10px',
                    border: '1px solid var(--border-color)', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)',
                    fontSize: '13px', outline: 'none',
                  }}
                />
              </div>
            </FilterSection>

            {/* Sort order */}
            <FilterSection icon={<Clock size={14} color="var(--primary)" />} title="Sort By">
              <select
                value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid var(--border-color)', borderRadius: '8px',
                  background: 'var(--glass-bg)', color: 'var(--text-primary)',
                  fontSize: '13px', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="recent">Newest Postings</option>
                <option value="budget_high">Budget: High → Low</option>
                <option value="budget_low">Budget: Low → High</option>
              </select>
            </FilterSection>

            <AnimatedButton onClick={resetFilters} variant="secondary" style={{ width: '100%', padding: '10px', marginTop: '8px' }}>
              Reset Filters
            </AnimatedButton>
          </div>
        </aside>

        {/* LISTINGS CONTAINER */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              {loading ? 'Loading…' : total > 0 ? `Showing ${jobs.length} of ${total} jobs` : 'No jobs found'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort:</span>
              <select
                value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                style={{
                  padding: '6px 10px', fontSize: '13px', borderRadius: '8px',
                  border: '1px solid var(--border-color)', background: 'var(--glass-bg)',
                  color: 'var(--text-primary)', cursor: 'pointer',
                }}
              >
                <option value="recent">Newest</option>
                <option value="budget_high">Budget: Max</option>
                <option value="budget_low">Budget: Min</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingList />
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--glass-bg)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>No active jobs</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                There are no open job requests that match your search filters.
              </p>
              <AnimatedButton onClick={resetFilters} variant="primary">Clear All Filters</AnimatedButton>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {jobs.map((job) => {
                  const meta = catMeta[job.category] || { color: DEFAULT_COLOR, bg: DEFAULT_BG };
                  const Icon = meta.icon || Briefcase;
                  return (
                    <GlassCard key={job._id} style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyBetween: 'space-between', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div style={{ flex: '1 1 400px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${meta.color}30`, flexShrink: 0,
                          }}>
                            <Icon size={22} color={meta.color} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: meta.color, letterSpacing: '0.04em' }}>
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
                              overflow: 'hidden', marginBottom: '14px',
                            }}>
                              {job.description}
                            </p>
                            {job.skills && job.skills.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {job.skills.map((skill, index) => (
                                  <span key={index} style={{
                                    fontSize: '11px', fontWeight: '600', padding: '3px 8px',
                                    borderRadius: '6px', background: 'var(--border-color)', color: 'var(--text-secondary)'
                                  }}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right side stats & action */}
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                          justifyContent: 'space-between', minHeight: '120px', flexShrink: 0,
                          textAlign: 'right', marginLeft: 'auto',
                        }} className="job-card-right">
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>
                              ${job.budget?.min} - ${job.budget?.max}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Est. Project Budget
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              <strong>{job.proposals?.length || job.proposalCount || 0}</strong> proposals
                            </span>
                            <Link to={`/jobs/${job._id}`}>
                              <AnimatedButton variant="primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                Apply <ArrowRight size={14} />
                              </AnimatedButton>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
                  <AnimatedButton disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="secondary" style={{ padding: '8px 18px' }}>
                    ← Prev
                  </AnimatedButton>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
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
                  ))}
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
        .sidebar-backdrop { display: none; }
        .sidebar-close-btn { display: none; }
        .sidebar-inner {
          background: var(--glass-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 24px;
          backdrop-filter: blur(12px);
          position: sticky; top: 80px;
        }
        .hover-link:hover {
          color: var(--primary) !important;
        }
        @media (max-width: 768px) {
          .jobs-layout { grid-template-columns: 1fr !important; }
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
          .job-card-right {
            align-items: flex-start !important;
            text-align: left !important;
            min-height: auto !important;
            width: 100%;
          }
        }
        @media (min-width: 769px) {
          .filters-mobile-btn { display: none !important; }
          .sidebar-close-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

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

function LoadingList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ padding: '24px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--border-color)', animation: 'shimmer 1.5s infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '12px', width: '20%', background: 'var(--border-color)', animation: 'shimmer 1.5s infinite', marginBottom: '10px' }} />
              <div style={{ height: '18px', width: '60%', background: 'var(--border-color)', animation: 'shimmer 1.5s infinite', marginBottom: '10px' }} />
              <div style={{ height: '14px', width: '90%', background: 'var(--border-color)', animation: 'shimmer 1.5s infinite' }} />
            </div>
          </div>
        </div>
      ))}
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

export default Jobs;
