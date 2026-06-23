const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// ==========================================
// 1. CORS CONFIGURATION (Sab se upar hona zaroori hai)
// ==========================================
const allowedOrigins = [
  'http://localhost:5173',
  'https://skillbridge-marketplace.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Local host ya explicit allowed domains
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Vercel ke saare dynamic preview subdomains ko allow karne ke liye regex
    if (/^[a-zA-Z0-9.-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Blocked by CORS policy!'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==========================================
// 2. STRIPE WEBHOOK ROUTE (express.json() se PEHLE)
// ==========================================
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // stripe package require yahan handle ho rha hai
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(
      req.body, // Raw buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Webhook Event Logic
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`💳 Payment successful for session: ${session.id}`);
    // Yahan apni order/booking fulfillment ki logic add karein
  }

  res.json({ received: true });
});

// ==========================================
// 3. GLOBAL MIDDLEWARES (Webhook ke baad)
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware config agar aap use kar rhe hain
try {
  const securityMiddleware = require('./middleware/security');
  app.use(securityMiddleware);
} catch (e) {
  console.log("ℹ️ Optional security middleware not initialized yet.");
}

// ==========================================
// 4. API ROUTES
// ==========================================
// Apne routes ko yahan require aur map karein
// app.use('/auth', require('./routes/authRoutes'));
// app.use('/api', require('./routes/apiRoutes'));

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV });
});

// Global 404 Fallback Catch-all Router
app.use((req, res) => {
  res.status(404).json({ success: false, message: `API Route not found: ${req.originalUrl}` });
});

// ==========================================
// 5. DATABASE CONNECTION & SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });