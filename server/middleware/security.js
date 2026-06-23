/**
 * SkillBridge — Security Middleware Stack (Express 5 Compatible)
 *
 * Layers:
 *  1. Custom NoSQL Sanitizer  → Replaces abandoned express-mongo-sanitize
 *                               (reads req.body only — does NOT mutate req.query
 *                               which is a read-only getter in Express 5)
 *  2. Custom XSS Sanitizer    → Replaces deprecated xss-clean
 *                               Uses the maintained `xss` npm package
 *  3. hpp                     → HTTP Parameter Pollution prevention
 *  4. sanitize-html           → Deep HTML sanitization for rich-text fields
 *  5. Custom payload guard    → Reject obviously malicious patterns
 *  6. Auth-specific rate limiter → Brute-force protection on /api/auth/*
 *  7. Security response headers
 */

const xssLib = require('xss');
const hpp = require('hpp');
const sanitizeHtml = require('sanitize-html');
const rateLimit = require('express-rate-limit');

// ─── Helper: Deep sanitize an object ─────────────────────────────────────────
// Recursively walks an object and transforms all string values.
// Does NOT replace the parent object reference — only mutates string values in-place.
const deepSanitize = (obj, transformFn) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = transformFn(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepSanitize(obj[key], transformFn);
    }
  }
};

// ─── Helper: Strip dangerous MongoDB operator keys ────────────────────────────
// Recursively removes keys that start with '$' or contain '.' from any object.
const stripMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`⚠️  NoSQL injection key stripped: "${key}"`);
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      stripMongoOperators(obj[key]);
    }
  }
};

// ─── 1. NoSQL / MongoDB Injection Prevention ─────────────────────────────────
// Express 5 made req.query a read-only getter — we must NOT assign to it.
// We sanitize req.body (mutable) and log a warning for suspicious query params.
const mongoSanitizeMiddleware = (req, res, next) => {
  // Sanitize the request body (always mutable)
  if (req.body && typeof req.body === 'object') {
    stripMongoOperators(req.body);
  }

  // For query: we can read it but cannot replace it; log any suspicious keys
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`⚠️  Suspicious query param detected: "${key}" | IP: ${req.ip}`);
      }
    }
  }

  next();
};

// ─── 2. XSS Prevention ───────────────────────────────────────────────────────
// Sanitizes HTML/script tags from req.body string values using the maintained
// `xss` package. Does NOT touch req.query (Express 5 read-only getter).
const xssMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    deepSanitize(req.body, (val) => xssLib(val));
  }
  next();
};

// ─── 3. HTTP Parameter Pollution Prevention ───────────────────────────────────
const hppMiddleware = hpp({
  whitelist: ['sort', 'fields', 'category', 'skills', 'tags'],
});

// ─── 4. Deep HTML Sanitizer for Rich-Text Fields ─────────────────────────────
// Utility — call manually in controllers for fields like bio, description
const sanitizeRichText = (dirty) => {
  return sanitizeHtml(dirty, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
};

// ─── 5. Custom Payload Guard ─────────────────────────────────────────────────
// Belt-and-suspenders: rejects requests with obviously malicious string patterns
const payloadGuard = (req, res, next) => {
  const BLOCKED_PATTERNS = [
    /\$where/i,          // MongoDB $where operator
    /javascript:/i,      // JavaScript URI scheme
    /<script/i,          // Script tag
    /\beval\s*\(/i,      // eval() calls
    /union.*select/i,    // SQL UNION injection
    /exec\s*\(/i,        // exec() calls
    /data:text\/html/i,  // Data URI XSS
  ];

  const bodyStr = JSON.stringify(req.body || '');
  // Read req.query safely — do NOT assign back
  const queryStr = JSON.stringify({ ...req.query } || '');
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
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// ─── 7. Security Headers Enhancement ─────────────────────────────────────────
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.removeHeader('X-Powered-By');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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
  sanitizeRichText,
};
