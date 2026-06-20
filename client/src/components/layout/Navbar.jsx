import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import { Sun, Moon, MessageSquare, LogOut, Menu, X, User, ChevronDown, LayoutDashboard, Settings, CreditCard, PlusCircle, Briefcase, Image, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* ── Scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Unread count ── */
  useEffect(() => {
    if (!user) return;
    api.get('/chat/unread-count')
      .then(res => { if (res.data.success) setUnreadCount(res.data.count); })
      .catch(console.error);
  }, [user]);

  /* ── Socket listeners ── */
  useEffect(() => {
    if (!socket) return;
    const inc = () => setUnreadCount(p => p + 1);
    const reset = () => api.get('/chat/unread-count').then(r => { if (r.data.success) setUnreadCount(r.data.count); }).catch(console.error);
    socket.on('message_notification', inc);
    socket.on('new_message', reset);
    return () => { socket.off('message_notification', inc); socket.off('new_message', reset); };
  }, [socket]);

  /* ── Close profile dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Close mobile menu on route change ── */
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider-dashboard' : '/dashboard';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/services', label: 'Services' },
    { to: '/jobs', label: 'Job Board' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About Us' },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: '12px', left: 0, right: 0, zIndex: 200,
        margin: '12px 20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px',
          borderRadius: '16px',
          background: theme === 'dark' 
            ? (scrolled ? 'rgba(15,15,20,0.85)' : 'rgba(15,15,20,0.6)') 
            : (scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)'),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme === 'dark' 
            ? (scrolled ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)') 
            : (scrolled ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.08)')}`,
          boxShadow: scrolled 
            ? (theme === 'dark' 
                ? '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)' 
                : '0 8px 30px rgba(99,102,241,0.08), 0 0 0 1px rgba(99,102,241,0.05)') 
            : 'none',
          transition: 'all 0.3s ease',
        }}>

          {/* ── Brand ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{
              fontSize: '22px', fontWeight: '900',
              fontFamily: 'var(--font-heading)', letterSpacing: '-1px',
            }} className="gradient-text">
              SkillBridge
            </span>
            <span style={{
              fontSize: '9px', background: 'var(--primary)', color: '#fff',
              padding: '2px 6px', borderRadius: '4px', fontWeight: '800',
              letterSpacing: '0.05em',
            }}>
              PRO
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} active={location.pathname === link.to}>
                {link.label}
              </NavLink>
            ))}
            {user && (
              <NavLink to={dashboardPath} active={location.pathname === dashboardPath}>
                Dashboard
              </NavLink>
            )}
          </div>

          {/* ── Right actions ── */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Theme toggle */}
            <IconBtn onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </IconBtn>

            {user ? (
              <>
                {/* Chat icon */}
                <Link to="/chat" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <IconBtn as="div">
                    <MessageSquare size={17} />
                  </IconBtn>
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '0', right: '0',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: '#f87171', color: '#fff',
                      fontSize: '9px', fontWeight: '800',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid rgba(15,15,20,0.9)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile dropdown */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 12px 6px 6px',
                      borderRadius: '999px', cursor: 'pointer',
                      background: profileOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${profileOpen ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'rgba(99,102,241,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#818cf8', fontSize: '12px', fontWeight: '800',
                      }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={13} color="var(--text-muted)"
                      style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      minWidth: '200px',
                      background: 'rgba(15,15,20,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '14px',
                      padding: '8px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      zIndex: 300,
                    }}>
                      {/* User info header */}
                      <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 2px', color: 'var(--text-primary)' }}>{user.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{user.email}</p>
                        <span style={{
                          display: 'inline-block', marginTop: '6px',
                          padding: '2px 8px', borderRadius: '999px',
                          background: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.3)',
                          fontSize: '10px', fontWeight: '700', color: '#818cf8',
                          textTransform: 'capitalize',
                        }}>
                          {user.role}
                        </span>
                      </div>

                       <DropdownItem to={dashboardPath} icon={<LayoutDashboard size={15} />} label="Dashboard" onClick={() => setProfileOpen(false)} />
                      <DropdownItem to="/chat" icon={<MessageSquare size={15} />} label="Messages" onClick={() => setProfileOpen(false)} badge={unreadCount} />
                      <DropdownItem to="/wallet" icon={<CreditCard size={15} />} label="My Wallet" onClick={() => setProfileOpen(false)} />
                      
                      {user.role === 'customer' && (
                        <>
                          <DropdownItem to="/jobs/create" icon={<PlusCircle size={15} />} label="Post a Job" onClick={() => setProfileOpen(false)} />
                          <DropdownItem to="/my-jobs" icon={<Briefcase size={15} />} label="Posted Jobs" onClick={() => setProfileOpen(false)} />
                        </>
                      )}

                      {user.role === 'provider' && (
                        <>
                          <DropdownItem to="/create-service" icon={<PlusCircle size={15} />} label="Create Service" onClick={() => setProfileOpen(false)} />
                          <DropdownItem to="/ai" icon={<Sparkles size={15} />} label="AI Copilot" onClick={() => setProfileOpen(false)} />
                          <DropdownItem to="/profile/portfolio" icon={<Image size={15} />} label="Portfolio Gallery" onClick={() => setProfileOpen(false)} />
                          <DropdownItem to="/profile/edit" icon={<Settings size={15} />} label="Edit Profile" onClick={() => setProfileOpen(false)} />
                        </>
                      )}

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '6px', paddingTop: '6px' }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            width: '100%', padding: '9px 12px', borderRadius: '8px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#f87171', fontSize: '13px', fontWeight: '600',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/login">
                  <button style={{
                    padding: '8px 16px', borderRadius: '10px',
                    background: 'transparent', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button style={{
                    padding: '8px 18px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    border: 'none', color: '#fff', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '700',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'}
                  >
                    Join Now
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setIsOpen(o => !o)}
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              color: 'var(--text-primary)', cursor: 'pointer',
            }}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {isOpen && (
          <div style={{
            marginTop: '8px', borderRadius: '16px',
            background: theme === 'dark' ? 'rgba(15,15,20,0.95)' : 'rgba(255,255,255,0.98)', 
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme === 'dark' ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.12)'}`,
            padding: '12px',
            boxShadow: theme === 'dark' ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(99,102,241,0.08)',
          }}>
            {/* User header on mobile */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px 14px', borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, marginBottom: '8px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '800', color: '#818cf8',
                }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
                </div>
              </div>
            )}

             <MobileLink to="/">Home</MobileLink>
             <MobileLink to="/explore">Explore</MobileLink>
             <MobileLink to="/services">Browse Services</MobileLink>
             <MobileLink to="/jobs">Job Board</MobileLink>
             <MobileLink to="/pricing">Pricing</MobileLink>
             <MobileLink to="/about">About Us</MobileLink>
             {user && <MobileLink to={dashboardPath}>Dashboard</MobileLink>}
             {user && <MobileLink to="/chat">Messages {unreadCount > 0 && <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '999px', background: '#f87171', color: '#fff', fontSize: '10px', fontWeight: '800' }}>{unreadCount}</span>}</MobileLink>}
             {user && <MobileLink to="/wallet">My Wallet</MobileLink>}

            <div style={{ borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, marginTop: '8px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>

              {user ? (
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', padding: '4px 0' }}>
                  <Link to="/login" style={{ flex: 1 }}>
                    <button style={{ width: '100%', padding: '10px', borderRadius: '10px', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Sign In</button>
                  </Link>
                  <Link to="/register" style={{ flex: 1 }}>
                    <button style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Join Now</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
};

/* ── Small helpers ── */
function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      padding: '7px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
      color: active ? '#818cf8' : 'var(--text-secondary)',
      background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
      textDecoration: 'none', transition: 'all 0.2s',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
    >
      {children}
    </Link>
  );
}

function IconBtn({ onClick, title, children, as }) {
  const Tag = as || 'button';
  return (
    <Tag onClick={onClick} title={title} style={{
      width: '34px', height: '34px', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
      color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      {children}
    </Tag>
  );
}

function DropdownItem({ to, icon, label, onClick, badge }) {
  return (
    <Link to={to} onClick={onClick} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
        color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600',
        transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        {icon} {label}
        {badge > 0 && <span style={{ marginLeft: 'auto', padding: '1px 6px', borderRadius: '999px', background: '#f87171', color: '#fff', fontSize: '10px', fontWeight: '800' }}>{badge}</span>}
      </div>
    </Link>
  );
}

function MobileLink({ to, children }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        padding: '11px 12px', borderRadius: '10px',
        fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)',
        transition: 'all 0.15s', display: 'flex', alignItems: 'center',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#818cf8'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        {children}
      </div>
    </Link>
  );
}

export default Navbar;