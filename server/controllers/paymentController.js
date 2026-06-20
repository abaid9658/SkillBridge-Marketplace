const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/* ─────────────────────────────────────────────────────────────────
   Subscription price map (Stripe Price IDs or amounts for one-off)
   For simplicity we create a one-time Payment Intent per upgrade.
   Replace with real Stripe Price IDs if you set up recurring billing.
───────────────────────────────────────────────────────────────── */
const SUBSCRIPTION_PRICES = {
  pro:    { amount: 2900, label: 'Pro Monthly Subscription' },   // $29.00
  agency: { amount: 7900, label: 'Agency Monthly Subscription' }, // $79.00
};

// ─── @POST /api/payments/create-intent ───────────────────────────────────────
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { requestId } = req.body;

    const request = await ServiceRequest.findById(requestId)
      .populate('service', 'title')
      .populate('provider', 'name');

    if (!request) return next(new AppError('Request not found.', 404));
    if (request.customer.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized.', 403));
    }
    if (request.paymentStatus === 'paid') {
      return next(new AppError('This request is already paid.', 400));
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.budget * 100),
      currency: 'usd',
      metadata: {
        requestId: requestId.toString(),
        customerId: req.user._id.toString(),
        providerId: request.provider._id.toString(),
        serviceTitle: request.service?.title || 'Service',
      },
      description: `Payment for: ${request.service?.title || 'Service'} — TEYZIX Marketplace`,
    });

    await ServiceRequest.findByIdAndUpdate(requestId, { paymentIntentId: paymentIntent.id });

    await ActivityLog.log({
      user: req.user._id,
      action: 'payment.initiated',
      details: { requestId, amount: request.budget },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: request.budget,
    });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/payments/confirm ──────────────────────────────────────────────
exports.confirmPayment = async (req, res, next) => {
  try {
    const { requestId, paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return next(new AppError('Payment not confirmed by Stripe.', 400));
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { paymentStatus: 'paid', amountPaid: paymentIntent.amount / 100 },
      { new: true }
    );

    await ActivityLog.log({
      user: req.user._id,
      action: 'payment.completed',
      details: { requestId, amount: paymentIntent.amount / 100 },
    });

    res.status(200).json({ success: true, message: 'Payment confirmed!', request });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/payments/create-deposit-session ───────────────────────────────
// Creates a Stripe Checkout Session for wallet deposit
exports.createDepositSession = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const amountNum = Number(amount);
    if (!amountNum || amountNum < 5) return next(new AppError('Minimum deposit is $5', 400));
    if (amountNum > 10000) return next(new AppError('Maximum deposit is $10,000', 400));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Wallet Deposit — SkillBridge',
            description: `Add $${amountNum} to your SkillBridge marketplace wallet.`,
            images: [],
          },
          unit_amount: Math.round(amountNum * 100),
        },
        quantity: 1,
      }],
      metadata: {
        type: 'wallet_deposit',
        userId: req.user._id.toString(),
        amount: amountNum.toString(),
      },
      success_url: `${CLIENT_URL}/wallet?deposit=success&amount=${amountNum}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${CLIENT_URL}/deposit?cancelled=true`,
    });

    res.status(200).json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/payments/create-subscription-session ─────────────────────────
// Creates a Stripe Checkout Session for plan upgrade
exports.createSubscriptionSession = async (req, res, next) => {
  try {
    const { tier } = req.body;
    const plan = SUBSCRIPTION_PRICES[tier];
    if (!plan) return next(new AppError('Invalid subscription tier.', 400));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan — SkillBridge`,
            description: plan.label,
          },
          unit_amount: plan.amount,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'subscription',
        userId: req.user._id.toString(),
        tier,
      },
      success_url: `${CLIENT_URL}/pricing?subscription=success&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${CLIENT_URL}/pricing?cancelled=true`,
    });

    res.status(200).json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/payments/webhook ──────────────────────────────────────────────
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const meta = session.metadata || {};

      if (meta.type === 'wallet_deposit') {
        const userId = meta.userId;
        const amount = parseFloat(meta.amount);

        await Promise.all([
          Wallet.findOneAndUpdate(
            { userId },
            { $inc: { balance: amount } },
            { upsert: true, new: true }
          ),
          Transaction.create({
            userId,
            type: 'deposit',
            amount,
            status: 'completed',
            description: `Stripe wallet deposit of $${amount}`,
            stripeSessionId: session.id,
          }),
          ActivityLog.log({
            user: userId,
            action: 'wallet.deposit',
            details: { amount, sessionId: session.id },
          }),
        ]);
      } else if (meta.type === 'subscription') {
        const userId = meta.userId;
        const tier = meta.tier;
        const amount = session.amount_total ? (session.amount_total / 100) : (SUBSCRIPTION_PRICES[tier] ? SUBSCRIPTION_PRICES[tier].amount / 100 : 0);

        await Promise.all([
          User.findByIdAndUpdate(userId, { subscriptionTier: tier }),
          Transaction.create({
            userId,
            type: 'subscription',
            amount,
            status: 'completed',
            description: `${tier.toUpperCase()} Subscription upgrade payment`,
            stripeSessionId: session.id,
          }),
          ActivityLog.log({
            user: userId,
            action: 'user.subscription_update',
            details: { tier, sessionId: session.id, via: 'stripe' },
          }),
        ]);
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const requestId = pi.metadata?.requestId;
      if (requestId) {
        await ServiceRequest.findByIdAndUpdate(requestId, {
          paymentStatus: 'paid',
          amountPaid: pi.amount / 100,
        });
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  res.json({ received: true });
};

// ─── @POST /api/payments/verify-deposit ───────────────────────────────────────
// Called after redirect back from Stripe — verify session and credit wallet if webhook missed
exports.verifyDepositSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return next(new AppError('Session ID required', 400));

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return next(new AppError('Payment not completed', 400));
    }

    const meta = session.metadata || {};
    const metaUserId = meta.userId;
    const reqUserId = req.user._id.toString();
    const userEmail = req.user.email?.toLowerCase();
    const sessionEmail = (session.customer_email || session.customer_details?.email)?.toLowerCase();

    const isUserMatch = metaUserId === reqUserId || (sessionEmail && sessionEmail === userEmail);

    if (meta.type !== 'wallet_deposit' || !isUserMatch) {
      console.warn('Deposit session verification mismatch:', {
        metaType: meta.type,
        metaUserId,
        reqUserId,
        sessionEmail,
        userEmail
      });
      if (process.env.NODE_ENV === 'development' || session.livemode === false) {
        console.log('Proceeding with deposit verification in development/test mode despite mismatch.');
      } else {
        return next(new AppError('Session mismatch', 403));
      }
    }

    // Idempotency: check if already credited
    const existing = await Transaction.findOne({ stripeSessionId: sessionId });
    if (existing) {
      const wallet = await Wallet.findOne({ userId: req.user._id });
      return res.json({ success: true, alreadyCredited: true, wallet });
    }

    const amount = parseFloat(meta.amount) || (session.amount_total / 100);
    const [wallet] = await Promise.all([
      Wallet.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { balance: amount } },
        { upsert: true, new: true }
      ),
      Transaction.create({
        userId: req.user._id,
        type: 'deposit',
        amount,
        status: 'completed',
        description: `Stripe wallet deposit of $${amount}`,
        stripeSessionId: sessionId,
      }),
    ]);

    res.json({ success: true, wallet, amount });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/payments/verify-subscription ──────────────────────────────────
exports.verifySubscriptionSession = async (req, res, next) => {
  try {
    const { sessionId, tier } = req.body;
    if (!sessionId) return next(new AppError('Session ID required', 400));

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return next(new AppError('Payment not completed', 400));
    }

    const meta = session.metadata || {};
    const metaUserId = meta.userId;
    const reqUserId = req.user._id.toString();
    const userEmail = req.user.email?.toLowerCase();
    const sessionEmail = (session.customer_email || session.customer_details?.email)?.toLowerCase();

    const isUserMatch = metaUserId === reqUserId || (sessionEmail && sessionEmail === userEmail);

    if (meta.type !== 'subscription' || !isUserMatch) {
      console.warn('Subscription session verification mismatch:', {
        metaType: meta.type,
        metaUserId,
        reqUserId,
        sessionEmail,
        userEmail
      });
      if (process.env.NODE_ENV === 'development' || session.livemode === false) {
        console.log('Proceeding with subscription verification in development/test mode despite mismatch.');
      } else {
        return next(new AppError('Session mismatch', 403));
      }
    }

    const upgradeTier = tier || meta.tier;
    const amount = session.amount_total ? (session.amount_total / 100) : (SUBSCRIPTION_PRICES[upgradeTier] ? SUBSCRIPTION_PRICES[upgradeTier].amount / 100 : 0);
    
    // Idempotency: log transaction if not logged already
    const existingTx = await Transaction.findOne({ stripeSessionId: sessionId });
    if (!existingTx) {
      await Transaction.create({
        userId: req.user._id,
        type: 'subscription',
        amount,
        status: 'completed',
        description: `${upgradeTier.toUpperCase()} Subscription upgrade payment`,
        stripeSessionId: sessionId,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscriptionTier: upgradeTier },
      { new: true }
    ).select('-password');

    await ActivityLog.log({
      user: req.user._id,
      action: 'user.subscription_update',
      details: { tier: upgradeTier, sessionId, via: 'stripe_verify' },
    });

    res.json({ success: true, user, tier: upgradeTier });
  } catch (err) {
    next(err);
  }
};
