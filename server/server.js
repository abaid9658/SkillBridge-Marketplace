require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { socketHandler } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// ─── Allowed Origins ──────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://skill-bridge-marketplace.vercel.app',
];

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

socketHandler(io);

// Connect to MongoDB
connectDB();

// ─── Security Custom Middlewares ──────────────────────────────────────────────
const {
  mongoSanitizeMiddleware,
  xssMiddleware,
  hppMiddleware,
  payloadGuard,
  securityHeaders,
  authRateLimiter
} = require('./middleware/security');

// ─── Global Security & Optimization Middlewares ─────────────────────────────────
// Trust proxy if behind Render/Vercel load balancer
app.set('trust proxy', 1);

app.use(securityHeaders);

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin '${origin}' not allowed.`));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting (Prevent abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Apply custom security guards to API routes
app.use('/api/', mongoSanitizeMiddleware);
app.use('/api/', xssMiddleware);
app.use('/api/', hppMiddleware);
app.use('/api/', payloadGuard);

// Specific rate limiter for auth routes
app.use('/api/auth', authRateLimiter);

// ─── Stripe Webhook (MUST be before express.json() to get raw body) ──────────────
const { stripeWebhook } = require('./controllers/paymentController');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// ─── JSON & URL-Encoded Body Parsers ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Mount API Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// ─── Health Check Route ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillBridge Service Marketplace API is healthy and running.',
    timestamp: new Date(),
  });
});

// ─── 404 Route handler ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// ─── Global Error Handler Middleware ──────────────────────────────────────────
app.use(errorHandler);

// ─── Listen to Port ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Keep server running but log error
});
