import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Twitter = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Github = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const footerLinks = {
  Platform: [
    { label: 'Browse Services', to: '/services' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Become a Seller', to: '/register' },
    { label: 'Sign In', to: '/login' },
  ],
  Categories: [
    { label: 'Web Development', to: '/services?category=Website+Development' },
    { label: 'Logo Design', to: '/services?category=Logo+Design' },
    { label: 'Digital Marketing', to: '/services?category=SEO+%26+Digital+Marketing' },
    { label: 'Mobile Apps', to: '/services?category=Mobile+App+Development' },
  ],
  Company: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Support Center', to: '/support' },
  ],
};

const socials = [
  { icon: <Github size={16} />, href: 'https://github.com/abaid9658', label: 'GitHub' },
  { icon: <Linkedin size={16} />, href: 'https://www.linkedin.com/in/abaidullah-ghouri-0a96393b0', label: 'LinkedIn' },
];

const Footer = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.03) 100%)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(236,72,153,0.3), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Main grid */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '56px 24px 32px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr repeat(3, 1fr)',
          gap: '48px',
          marginBottom: '48px',
        }} className="footer-grid">

          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
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
            </div>

            <p style={{
              fontSize: '14px', color: 'var(--text-secondary)',
              lineHeight: '1.7', maxWidth: '280px', margin: '0 0 24px',
            }}>
              A premium real-time multi-vendor service marketplace. Connect with vetted professionals and get exceptional work done.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                    e.currentTarget.style.color = '#818cf8';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{
                fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em',
                color: 'var(--text-muted)', textTransform: 'uppercase',
                margin: '0 0 18px',
              }}>
                {heading}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map(link => (
                  link.to ? (
                    <Link key={link.label} to={link.to} style={{ textDecoration: 'none' }}>
                      <FooterLink label={link.label} />
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href} style={{ textDecoration: 'none' }}>
                      <FooterLink label={link.label} />
                    </a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            &copy; {new Date().getFullYear()} SkillBridge. All rights reserved.
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Built with <Heart size={11} color="#f87171" fill="#f87171" /> for excellence.
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
};

function FooterLink({ label }) {
  return (
    <span style={{
      fontSize: '14px', color: 'var(--text-secondary)',
      display: 'flex', alignItems: 'center', gap: '4px',
      transition: 'color 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      {label}
    </span>
  );
}

export default Footer;