/**
 * SkillBridge — Database Seed Script
 * Run: node server/seed.js
 * Seeds: 1 Admin + 5 Providers + 3 Customers + 13 Services + 10 Jobs
 */
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

const User = require('./models/User');
const Service = require('./models/Service');
const Job = require('./models/Job');

/* ─── Helpers ────────────────────────────────────────────── */
function img(url) {
  return [{ url, publicId: '' }];
}

/* ─── User Seeds ─────────────────────────────────────────── */
const usersData = [
  // ── Admin ──
  {
    name: 'SkillBridge Admin',
    email: 'admin@skillbridge.dev',
    password: 'Admin@123456',
    role: 'admin',
    bio: 'Platform administrator managing SkillBridge marketplace.',
    location: 'Remote',
  },
  // ── Providers ──
  {
    name: 'Alex Mercer',
    email: 'alex@skillbridge.dev',
    password: 'Provider@123',
    role: 'provider',
    bio: 'Full-stack developer with 6+ years building scalable web apps with React, Node.js and AWS.',
    location: 'New York, USA',
    skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
    avgRating: 4.9,
    totalReviews: 142,
    totalEarnings: 28000,
    completedProjects: 89,
    pricing: {
      basic: { name: 'Starter', price: 299, description: 'Landing page', deliveryDays: 3 },
      standard: { name: 'Business', price: 799, description: 'Multi-page website', deliveryDays: 7 },
      premium: { name: 'Enterprise', price: 1999, description: 'Full-stack web app', deliveryDays: 21 },
    },
  },
  {
    name: 'Sofia Ramirez',
    email: 'sofia@skillbridge.dev',
    password: 'Provider@123',
    role: 'provider',
    bio: 'Brand identity designer. I turn ideas into memorable visual identities — logos, style guides, and packaging.',
    location: 'Barcelona, Spain',
    skills: ['Logo Design', 'Brand Identity', 'Figma', 'Illustrator', 'Typography'],
    avgRating: 4.8,
    totalReviews: 98,
    totalEarnings: 18500,
    completedProjects: 72,
    pricing: {
      basic: { name: 'Basic Logo', price: 99, description: 'Logo + 2 revisions', deliveryDays: 2 },
      standard: { name: 'Brand Kit', price: 349, description: 'Logo + brand guidelines', deliveryDays: 5 },
      premium: { name: 'Full Brand Identity', price: 899, description: 'Complete visual identity package', deliveryDays: 10 },
    },
  },
  {
    name: 'David Chen',
    email: 'david@skillbridge.dev',
    password: 'Provider@123',
    role: 'provider',
    bio: 'Social media growth strategist. Managed accounts growing from 0 to 200k+ followers across Instagram, TikTok, and LinkedIn.',
    location: 'Toronto, Canada',
    skills: ['Social Media', 'Content Strategy', 'Instagram', 'TikTok', 'Analytics'],
    avgRating: 4.7,
    totalReviews: 64,
    totalEarnings: 12000,
    completedProjects: 51,
    pricing: {
      basic: { name: 'Starter', price: 199, description: '10 posts/month on 1 platform', deliveryDays: 30 },
      standard: { name: 'Growth', price: 499, description: '20 posts on 3 platforms + strategy', deliveryDays: 30 },
      premium: { name: 'Dominate', price: 999, description: 'Full management + paid ads', deliveryDays: 30 },
    },
  },
  {
    name: 'Emma Wilson',
    email: 'emma@skillbridge.dev',
    password: 'Provider@123',
    role: 'provider',
    bio: 'SEO specialist & content writer. Helped 30+ businesses rank on Google page 1 and generate consistent organic traffic.',
    location: 'London, UK',
    skills: ['SEO', 'Content Writing', 'WordPress', 'Ahrefs', 'Google Analytics'],
    avgRating: 4.9,
    totalReviews: 112,
    totalEarnings: 22000,
    completedProjects: 105,
    pricing: {
      basic: { name: 'Blog Post', price: 49, description: '1000-word SEO article', deliveryDays: 2 },
      standard: { name: 'SEO Audit', price: 199, description: 'Full website SEO audit + report', deliveryDays: 5 },
      premium: { name: 'SEO Monthly', price: 699, description: 'Monthly retainer: content + backlinks + reporting', deliveryDays: 30 },
    },
  },
  {
    name: 'Kai Nakamura',
    email: 'kai@skillbridge.dev',
    password: 'Provider@123',
    role: 'provider',
    bio: 'Mobile app developer specializing in React Native and Flutter. Delivered 40+ apps to the App Store and Google Play.',
    location: 'Tokyo, Japan',
    skills: ['React Native', 'Flutter', 'Firebase', 'Swift', 'Kotlin'],
    avgRating: 4.8,
    totalReviews: 78,
    totalEarnings: 35000,
    completedProjects: 44,
    pricing: {
      basic: { name: 'MVP App', price: 999, description: 'Simple mobile app', deliveryDays: 14 },
      standard: { name: 'Full App', price: 2499, description: 'Full-featured mobile app', deliveryDays: 30 },
      premium: { name: 'Enterprise App', price: 5999, description: 'Complex app with backend + admin panel', deliveryDays: 60 },
    },
  },
  // ── Customers ──
  {
    name: 'James Thompson',
    email: 'james@example.com',
    password: 'Customer@123',
    role: 'customer',
    bio: 'Founder of a growing e-commerce startup.',
    location: 'Austin, TX',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'Customer@123',
    role: 'customer',
    bio: 'Marketing manager looking for creative freelancers.',
    location: 'Mumbai, India',
  },
  {
    name: 'Carlos Gomez',
    email: 'carlos@example.com',
    password: 'Customer@123',
    role: 'customer',
    bio: 'Restaurant chain owner needing digital marketing support.',
    location: 'Miami, FL',
  },
];

/* ─── Service Seeds ──────────────────────────────────────── */
function makeServices(providers) {
  const [alex, sofia, david, emma, kai] = providers;
  return [
    // ── Alex — Web Dev ──
    {
      provider: alex._id,
      title: 'Full-Stack MERN Web Application Development',
      description: 'I will build you a production-ready web application using MongoDB, Express, React, and Node.js. Includes authentication, database design, REST API, responsive UI, and deployment to Vercel + Railway.',
      category: 'Website Development',
      price: 1999, deliveryTime: 21,
      images: img('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop'),
      tags: ['react', 'node.js', 'mongodb', 'full-stack'],
      avgRating: 4.9, totalReviews: 42, status: 'active',
    },
    {
      provider: alex._id,
      title: 'React.js Frontend Development with TypeScript',
      description: 'Professional React development with TypeScript, Tailwind CSS, state management (Redux/Zustand), and modern best practices. Pixel-perfect, fully responsive.',
      category: 'Website Development',
      price: 799, deliveryTime: 7,
      images: img('https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&auto=format&fit=crop'),
      tags: ['react', 'typescript', 'tailwind'],
      avgRating: 4.9, totalReviews: 28, status: 'active',
    },
    {
      provider: alex._id,
      title: 'REST API & Node.js Backend Development',
      description: 'Robust, scalable backend with Express.js, JWT auth, MongoDB/PostgreSQL, Stripe integration, email notifications, and full Swagger documentation.',
      category: 'Website Development',
      price: 599, deliveryTime: 7,
      images: img('https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop'),
      tags: ['node.js', 'express', 'rest api', 'mongodb'],
      avgRating: 4.8, totalReviews: 19, status: 'active',
    },
    // ── Sofia — Design ──
    {
      provider: sofia._id,
      title: 'Professional Logo Design + Brand Identity Kit',
      description: 'I will design a stunning, original logo with full vector source files plus a comprehensive brand identity kit (color palette, typography, usage guidelines). All formats included.',
      category: 'Logo Design',
      price: 349, deliveryTime: 5,
      images: img('https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop'),
      tags: ['logo', 'branding', 'figma', 'illustrator'],
      avgRating: 4.9, totalReviews: 35, status: 'active',
    },
    {
      provider: sofia._id,
      title: 'Minimalist Modern Logo Design',
      description: 'Clean, timeless logo design that communicates your brand message at a glance. Delivered in SVG, PNG, and PDF with unlimited revisions until you are 100% happy.',
      category: 'Logo Design',
      price: 149, deliveryTime: 3,
      images: img('https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop'),
      tags: ['logo', 'minimal', 'branding'],
      avgRating: 4.8, totalReviews: 29, status: 'active',
    },
    {
      provider: sofia._id,
      title: 'UI/UX Design for Web & Mobile Apps',
      description: 'Complete product design: wireframes, user flows, high-fidelity mockups, and interactive Figma prototypes. Delivered in Figma with developer handoff file.',
      category: 'UI/UX Design',
      price: 599, deliveryTime: 7,
      images: img('https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&auto=format&fit=crop'),
      tags: ['figma', 'ui design', 'prototype', 'mobile'],
      avgRating: 4.7, totalReviews: 22, status: 'active',
    },
    // ── David — Social Media ──
    {
      provider: david._id,
      title: 'Instagram & TikTok Growth Strategy + Management',
      description: 'Monthly social media management: content calendar, 20 custom-designed posts, captions, hashtag research, engagement boosting, and monthly performance report.',
      category: 'Social Media Management',
      price: 499, deliveryTime: 30,
      images: img('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop'),
      tags: ['instagram', 'tiktok', 'content', 'social media'],
      avgRating: 4.7, totalReviews: 18, status: 'active',
    },
    {
      provider: david._id,
      title: 'LinkedIn Brand Building & Lead Generation',
      description: 'Professional LinkedIn profile optimization + content strategy + weekly posts + outreach campaign to attract high-quality B2B leads organically.',
      category: 'Social Media Management',
      price: 349, deliveryTime: 30,
      images: img('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop'),
      tags: ['linkedin', 'lead generation', 'b2b'],
      avgRating: 4.6, totalReviews: 14, status: 'active',
    },
    // ── Emma — SEO / Content ──
    {
      provider: emma._id,
      title: 'Complete Website SEO Audit & Strategy Report',
      description: 'In-depth technical SEO audit covering on-page, off-page, site speed, Core Web Vitals, competitor analysis, and a 90-day action plan to grow organic traffic.',
      category: 'SEO & Digital Marketing',
      price: 199, deliveryTime: 5,
      images: img('https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop'),
      tags: ['seo', 'audit', 'google', 'traffic'],
      avgRating: 4.9, totalReviews: 31, status: 'active',
    },
    {
      provider: emma._id,
      title: 'Long-Form SEO Blog Articles (1500-3000 words)',
      description: 'Researched, expert-written SEO content designed to rank and convert. Includes keyword research, meta titles, headers, internal link plan, and original images.',
      category: 'Content Writing',
      price: 79, deliveryTime: 3,
      images: img('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop'),
      tags: ['content writing', 'seo', 'blog', 'articles'],
      avgRating: 4.9, totalReviews: 48, status: 'active',
    },
    {
      provider: emma._id,
      title: 'Email Marketing Campaign Setup & Copywriting',
      description: 'Full email marketing setup: welcome sequence, sales funnels, product announcement, re-engagement — written with proven copywriting frameworks that convert.',
      category: 'Content Writing',
      price: 249, deliveryTime: 5,
      images: img('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop'),
      tags: ['email marketing', 'copywriting', 'mailchimp'],
      avgRating: 4.8, totalReviews: 21, status: 'active',
    },
    // ── Kai — Mobile ──
    {
      provider: kai._id,
      title: 'React Native Cross-Platform Mobile App Development',
      description: 'Full-featured React Native app for iOS + Android from scratch. Includes UI/UX, Firebase backend, push notifications, in-app purchases, and App Store submission support.',
      category: 'Mobile App Development',
      price: 2499, deliveryTime: 30,
      images: img('https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop'),
      tags: ['react native', 'ios', 'android', 'firebase'],
      avgRating: 4.8, totalReviews: 24, status: 'active',
    },
    {
      provider: kai._id,
      title: 'Flutter Mobile App — Beautiful UI + Firebase Backend',
      description: 'Stunning, performant Flutter app with pixel-perfect custom UI, Firebase Firestore, Auth, Storage, real-time features, and play store release packaging.',
      category: 'Mobile App Development',
      price: 1999, deliveryTime: 25,
      images: img('https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop'),
      tags: ['flutter', 'firebase', 'dart', 'mobile'],
      avgRating: 4.9, totalReviews: 18, status: 'active',
    },
  ];
}

/* ─── Jobs Seeds ─────────────────────────────────────────── */
function makeJobs(customers) {
  const [james, priya, carlos] = customers;
  const future = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return [
    {
      customerId: james._id,
      title: 'Need a Full-Stack E-Commerce Website with Payment Integration',
      description: 'Looking for an experienced full-stack developer to build a complete e-commerce platform for our growing online store. The platform should include product listings, shopping cart, checkout with Stripe/PayPal, order management, admin panel, and responsive design. Must be built with React frontend and Node.js backend with MongoDB. We need this to launch our new product line.',
      category: 'Website Development',
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux'],
      budget: { type: 'fixed', min: 1500, max: 3500 },
      deadline: future(30),
      status: 'open',
      proposalCount: 3,
      views: 142,
    },
    {
      customerId: james._id,
      title: 'React Native App for iOS and Android - Delivery Tracking App',
      description: 'We are a local courier company looking to build a mobile application for real-time package tracking. The app should allow customers to track deliveries on a map, receive push notifications, manage their orders, and communicate with drivers. We need separate panels for customers, drivers, and admin. Firebase integration for real-time updates is required.',
      category: 'Mobile App Development',
      skills: ['React Native', 'Firebase', 'Google Maps API', 'Push Notifications'],
      budget: { type: 'fixed', min: 2000, max: 5000 },
      deadline: future(45),
      status: 'open',
      proposalCount: 7,
      views: 289,
    },
    {
      customerId: priya._id,
      title: 'Complete Brand Identity Design for SaaS Startup',
      description: 'Our AI-powered SaaS startup needs a complete brand identity overhaul. We need a modern, professional logo that reflects innovation and trust, a comprehensive brand style guide including color palette, typography, icon system, and usage guidelines. The visual identity should work across digital and print materials. Looking for someone who has designed for tech/SaaS companies before.',
      category: 'Logo Design',
      skills: ['Logo Design', 'Brand Identity', 'Figma', 'Adobe Illustrator', 'Typography'],
      budget: { type: 'fixed', min: 500, max: 1200 },
      deadline: future(14),
      status: 'open',
      proposalCount: 12,
      views: 456,
    },
    {
      customerId: priya._id,
      title: 'Monthly SEO Management & Content Strategy for B2B SaaS',
      description: 'We need an experienced SEO specialist to manage our monthly organic growth strategy. Responsibilities include keyword research and tracking, on-page optimization, monthly blog content (4 articles/month), backlink outreach, competitor analysis, and monthly reporting. Experience with B2B SaaS companies and tools like Ahrefs, SEMrush, and Google Search Console is required.',
      category: 'SEO & Digital Marketing',
      skills: ['SEO', 'Content Strategy', 'Ahrefs', 'SEMrush', 'Link Building'],
      budget: { type: 'hourly', min: 40, max: 80 },
      deadline: future(60),
      status: 'open',
      proposalCount: 5,
      views: 201,
    },
    {
      customerId: carlos._id,
      title: 'Social Media Content Creation & Management for Restaurant Chain',
      description: 'Our restaurant chain (3 locations) needs a creative social media manager who can create engaging content for Instagram, Facebook, and TikTok. We want to grow our local following, promote daily specials and events, run engagement campaigns, and build a consistent brand voice. Monthly deliverables: 30 posts, 10 Reels/TikToks, monthly analytics report.',
      category: 'Social Media Management',
      skills: ['Instagram', 'TikTok', 'Content Creation', 'Canva', 'Video Editing'],
      budget: { type: 'fixed', min: 300, max: 700 },
      deadline: future(30),
      status: 'open',
      proposalCount: 9,
      views: 377,
    },
    {
      customerId: carlos._id,
      title: 'UI/UX Design for Restaurant Online Ordering Platform',
      description: 'We are launching an online ordering and table reservation system for our restaurant chain. Need a talented UI/UX designer to create wireframes, user flows, and high-fidelity Figma mockups for the customer ordering app (mobile-first) and the restaurant management dashboard. Must include menu builder, order tracking, reservation management, and analytics views.',
      category: 'UI/UX Design',
      skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Mobile Design'],
      budget: { type: 'fixed', min: 800, max: 1800 },
      deadline: future(21),
      status: 'open',
      proposalCount: 6,
      views: 312,
    },
    {
      customerId: james._id,
      title: 'WordPress Website Redesign with WooCommerce Integration',
      description: 'Our existing WordPress website needs a complete redesign. The new site must be modern, fast-loading, mobile-responsive, and integrated with WooCommerce for our online store. We have approximately 200 products. Work includes new theme design/development, plugin setup, migration of existing content, speed optimization, and basic SEO setup. Must be completed within 3 weeks.',
      category: 'Website Development',
      skills: ['WordPress', 'WooCommerce', 'PHP', 'CSS', 'Speed Optimization'],
      budget: { type: 'fixed', min: 600, max: 1400 },
      deadline: future(21),
      status: 'open',
      proposalCount: 15,
      views: 521,
    },
    {
      customerId: priya._id,
      title: 'Video Editing & Motion Graphics for Product Launch Campaign',
      description: 'We are launching our new software product and need professional video content for our marketing campaign. Project includes: 1x hero product video (2-3 min), 3x short social media versions (30-60 sec), motion graphics and animated text, color grading, and background music. Source footage will be provided. Looking for someone with SaaS/tech product experience.',
      category: 'Video Editing',
      skills: ['Adobe Premiere Pro', 'After Effects', 'Motion Graphics', 'Color Grading'],
      budget: { type: 'fixed', min: 400, max: 900 },
      deadline: future(10),
      status: 'open',
      proposalCount: 4,
      views: 189,
    },
    {
      customerId: carlos._id,
      title: 'Data Science & ML Model for Customer Churn Prediction',
      description: 'We need a data scientist to build a machine learning model to predict customer churn for our subscription business. Project scope: exploratory data analysis on our customer dataset, feature engineering, model training (we prefer XGBoost or similar), model evaluation and tuning, deployment as a REST API endpoint, and a dashboard to visualize predictions. Python preferred.',
      category: 'Data Science & AI',
      skills: ['Python', 'Machine Learning', 'XGBoost', 'Pandas', 'Flask/FastAPI'],
      budget: { type: 'fixed', min: 1000, max: 2500 },
      deadline: future(30),
      status: 'open',
      proposalCount: 2,
      views: 134,
    },
    {
      customerId: james._id,
      title: 'Long-Form Blog Content Writing for Tech Startup (Ongoing)',
      description: 'Growing tech startup looking for a skilled content writer to produce high-quality, SEO-optimized blog posts on a recurring monthly basis. We need 6 articles per month (1500-2500 words each) covering topics like productivity tools, remote work, software reviews, and tech industry trends. The writer must conduct keyword research, include proper internal/external links, and deliver publication-ready content.',
      category: 'Content Writing',
      skills: ['Content Writing', 'SEO Writing', 'Research', 'WordPress', 'Grammarly'],
      budget: { type: 'hourly', min: 25, max: 50 },
      deadline: future(90),
      status: 'open',
      proposalCount: 8,
      views: 267,
    },
  ];
}

/* ─── Main Seed Function ─────────────────────────────────── */
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 10 });
    console.log('✅ MongoDB Connected');

    // Wipe existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Job.deleteMany({});
    console.log('🧹 Cleared existing Users, Services, and Jobs');

    // Create users (bcrypt handled by pre-save hook)
    const users = await User.create(usersData);
    console.log(`👥 Created ${users.length} users`);

    const admin = users.find(u => u.role === 'admin');
    const providers = users.filter(u => u.role === 'provider');
    const customers = users.filter(u => u.role === 'customer');

    console.log(`  ↳ Admin:     ${admin.email}`);
    console.log(`  ↳ Providers: ${providers.map(p => p.name).join(', ')}`);
    console.log(`  ↳ Customers: ${customers.map(c => c.name).join(', ')}`);

    // Create services
    const servicesData = makeServices(providers);
    const services = await Service.create(servicesData);
    console.log(`📦 Created ${services.length} services`);

    // Create jobs
    const jobsData = makeJobs(customers);
    const jobs = await Job.create(jobsData);
    console.log(`💼 Created ${jobs.length} jobs`);

    console.log('\n✨ Seed completed successfully!');
    console.log('══════════════════════════════════════════');
    console.log('  Test Accounts:');
    console.log('  ADMIN:    admin@skillbridge.dev  | Admin@123456');
    console.log('  PROVIDER: alex@skillbridge.dev   | Provider@123');
    console.log('  PROVIDER: sofia@skillbridge.dev  | Provider@123');
    console.log('  CUSTOMER: james@example.com      | Customer@123');
    console.log('══════════════════════════════════════════');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(k => console.error(`  Field "${k}": ${err.errors[k].message}`));
    }
    process.exit(1);
  }
}

seed();

