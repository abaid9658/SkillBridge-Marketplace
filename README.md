# SkillBridge - Multi-Vendor Market Platform

A premium, production-ready MERN-stack service marketplace (similar to Fiverr/Upwork) featuring a 3D interactive, animated UI (built with React Three Fiber, Three.js, and Vanilla CSS), real-time notifications, chat (Socket.io), MongoDB transaction-safe operations, and full-featured customer, provider, and administrator portals.

**GitHub Repository:** https://github.com/abaid9658/SkillBridge-Marketplace

---

## 🚀 Key Features

### 🎨 3D & Premium Interactive UI/UX
- **Dynamic 3D Hero Scene**: Floating, animated 3D geometries responding to cursor movements and scroll states.
- **Glassmorphism Design System**: Harmonious color palettes using custom HSL/CSS variables, smooth micro-animations, and modern typography (Inter & Outfit).
- **Responsive Portals**: Tailored interfaces for Customers, Service Providers, and Administrators.
- **System-Aware Dark Mode**: Adaptive theme toggling with smooth transitions.

### ⚡ Professional Backend & Database Optimization
- **Mongoose Transaction Safety**: MongoDB ACID transactions guarantee consistency on crucial operations, such as reviewing a provider and atomically recalculating reviews and ratings.
- **Connection Pooling**: Pre-configured MongoDB connection pool (`minPoolSize: 5`, `maxPoolSize: 50`) with automatic retry policies for high-traffic environments.
- **Indexing & Queries**: Compounded and text-based indexing on services and requests to enable high-concurrency read-write optimization.
- **Rate-Limiting & Security**: Implemented `express-rate-limit`, `helmet`, CORS, and standard CSRF/JWT protection mechanisms.

### 💬 Real-Time Communications
- **Socket.io Integration**: Live chat messaging between customers and service providers, showing online/offline states, message status, and instant delivery.

### 💳 Stripe & Notifications Integration
- **Stripe Checkout**: Complete booking payment flow with Stripe webhook processing for database confirmation.
- **Nodemailer Alerts**: Automatic email notifications when request statuses update.

---

## 🛠️ Database Schema

### 1. User Model (`User.js`)
- `name` (String, required)
- `email` (String, unique, indexed)
- `password` (String, bcrypt hashed)
- `role` (Enum: `customer`, `provider`, `admin`)
- `profilePicture` (String)
- `skills` (Array of Strings, indexed)
- `experience` (String)
- `pricing` (Number)
- `portfolio` (Array of Strings/URLs)
- `bio` (String)
- `location` (String)
- `avgRating` (Number, default 0)
- `totalReviews` (Number, default 0)

### 2. Service Model (`Service.js`)
- `provider` (ObjectId -> User ref, indexed)
- `title` (String, text-indexed)
- `description` (String, text-indexed)
- `category` (String, indexed)
- `price` (Number, indexed)
- `deliveryTime` (Number, days)
- `images` (Array of Strings)
- `status` (Enum: `active`, `inactive`)
- `avgRating` (Number)

### 3. ServiceRequest Model (`ServiceRequest.js`)
- `customer` (ObjectId -> User ref, indexed)
- `service` (ObjectId -> Service ref)
- `provider` (ObjectId -> User ref, indexed)
- `requirements` (String)
- `budget` (Number)
- `deadline` (Date)
- `status` (Enum: `pending`, `accepted`, `in-progress`, `delivered`, `completed`, `cancelled`, indexed)
- `paymentStatus` (Enum: `pending`, `paid`, `refunded`)
- `stripeSessionId` (String)

---

## 📡 Core API Routes

### Auth Routes (`/api/auth`)
- `POST /register` - Register a new user (with role choice)
- `POST /login` - Login user (returns JWT inside cookie)
- `GET /me` - Get current authenticated user details
- `POST /logout` - Log out and clear tokens

### Service Routes (`/api/services`)
- `GET /` - Query, paginate, search, and filter services
- `POST /` - Create a service listing (Providers only)
- `GET /:id` - Get individual service details
- `PUT /:id` - Edit a service (Owner only)
- `DELETE /:id` - Delete a service (Owner/Admin)

### Request Routes (`/api/requests`)
- `POST /` - Submit a service request/booking (Customers only)
- `GET /` - List requests for authenticated user (scoped by role)
- `PUT /:id/status` - Update request workflow state (pending -> accepted -> in-progress -> delivered -> completed)

### Review Routes (`/api/reviews`)
- `POST /` - Add review for service & provider (Transaction-safe avg rating calculation)
- `GET /provider/:id` - Fetch all reviews for a specific provider

---

## ⚙️ Running Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster or local instance

### 2. Environment Variables (.env)
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Server Setup
```bash
cd server
npm install
npm run dev
```

### 4. Client Setup
```bash
cd client
npm install
npm run dev
```
