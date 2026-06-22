/**
 * SkillBridge — Security Middleware Stack
 *
 * Layers:
 *  1. express-mongo-sanitize  → NoSQL / MongoDB injection prevention
 *  2. xss-clean               → Cross-Site Scripting (XSS) input sanitization
 *  3. hpp                     → HTTP Parameter Pollution prevention
 *  4. sanitize-html           → Deep HTML sanitization for rich-text fields
 *  5. Custom payload guard    → Reject obviously malicious patterns
 *  6. Auth-specific rate limiter → Brute-force protection on /api/auth/*
 */

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const sanitizeHtml = require('sanitize-html');
const rateLimit = require('express-rate-limit');

// ─── 1. NoSQL / MongoDB Injection Prevention ─────────────────────────────────
// Strips keys that start with '$' or contain '.' from req.body, req.params, req.query
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',          // Replace offending characters with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  NoSQL injection attempt blocked. Key: ${key} | IP: ${req.ip}`);
  },
});

// ─── 2. XSS Prevention ───────────────────────────────────────────────────────
// Sanitizes HTML tags and JavaScript event handlers from all user inputs
const xssMiddleware = xss();

// ─── 3. HTTP Parameter Pollution Prevention ───────────────────────────────────
// When duplicate query params are sent (e.g. ?role=admin&role=customer),
// only the LAST value is used. Whitelist fields that legitimately can be arrays.
const hppMiddleware = hpp({
  whitelist: [
    'sort',
    'fields',
    'category',
    'skills',
    'tags',
  ],
});

// ─── 4. Deep HTML Sanitizer for Rich-Text Fields ─────────────────────────────
// Applied manually in controllers for fields like bio, description
const sanitizeRichText = (dirty) => {
  return sanitizeHtml(dirty, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {},   // No attributes allowed (no onclick, href etc.)
    disallowedTagsMode: 'discard',
  });
};

// ─── 5. Custom Payload Guard ─────────────────────────────────────────────────
// Reject requests with obviously malicious patterns in the body
const payloadGuard = (req, res, next) => {
  const BLOCKED_PATTERNS = [
    /\$where/i,          // MongoDB $where operator
    /javascript:/i,      // JavaScript URI scheme
    /<script/i,          // Script tag (belt-and-suspenders after xss-clean)
    /\beval\s*\(/i,      // eval() calls
    /union.*select/i,    // SQL UNION injection (defense in depth)
    /exec\s*\(/i,        // exec() calls
    /data:text\/html/i,  // Data URI XSS
  ];

  const bodyStr = JSON.stringify(req.body || '');
  const queryStr = JSON.stringify(req.query || '');
  const combined = bodyStr + queryStr;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(combined)) {
      console.warn(`🚨 Malicious payload blocked | Pattern: ${pattern} | IP: ${req.ip} | URL: ${req.originalUrl}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid request payload detected.',
      });
    }
  }

  next();
};

// ─── 6. Auth Rate Limiter ─────────────────────────────────────────────────────
// Strict limit on auth endpoints to prevent brute-force attacks
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Max 10 auth attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against limit
});

// ─── 7. Security Headers Enhancement ─────────────────────────────────────────
// Additional response headers not covered by Helmet defaults
const securityHeaders = (req, res, next) => {
  // Prevent browser from MIME-sniffing away from declared content-type
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS filter in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Remove server fingerprinting
  res.removeHeader('X-Powered-By');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy (disable unused browser features)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');
  next();
};

module.exports = {
  mongoSanitizeMiddleware,
  xssMiddleware,
  hppMiddleware,
  payloadGuard,
  authRateLimiter,
  securityHeaders,
  sanitizeRichText,   // Utility for use in controllers
};
