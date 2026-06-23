# SkillBridge Multi-Vendor Service Marketplace Platform

A premium, production-ready MERN-stack service marketplace (similar to Fiverr/Upwork) featuring a 3D interactive UI, real-time Socket.io chat, Stripe payments, and a fully containerized DevOps pipeline.

---

## 🔗 Live Project Deployments

* **Live Frontend Website**: [https://skill-bridge-marketplace.vercel.app/](https://skill-bridge-marketplace.vercel.app/)
* **Live API Backend Endpoint**: [https://skillbridge-api-n6qv.onrender.com](https://skillbridge-api-n6qv.onrender.com)
* **GitHub Repository**: [https://github.com/abaid9658/SkillBridge-Marketplace](https://github.com/abaid9658/SkillBridge-Marketplace)

---

## 🚀 Key Features

### 🎨 3D & Premium Interactive UI/UX
- **Dynamic 3D Hero Scene**: Floating, animated 3D geometries responding to cursor movements and scroll states.
- **Glassmorphism Design System**: Harmonious color palettes using custom HSL/CSS variables, smooth micro-animations.
- **Responsive Portals**: Tailored interfaces for Customers, Service Providers, and Administrators.

### ⚡ Professional Backend & Database Optimization
- **Mongoose Transaction Safety**: MongoDB ACID transactions guarantee consistency on crucial operations (reviews, ratings).
- **Connection Pooling**: Pre-configured MongoDB connection pool (`minPoolSize: 5`, `maxPoolSize: 50`).
- **Indexing**: Compounded and text-based indexing on services for fast search.

### 💬 Real-Time Communications
- **Socket.io Integration**: Live chat messaging between customers and service providers.

### 💳 Stripe & Notifications Integration
- **Stripe Checkout**: Complete booking payment flow with webhook processing.
- **Nodemailer Alerts**: Automatic email notifications when request statuses update.

---

## 🛡️ Security Hardening

This project implements a robust 7-layer security middleware stack:

1. **NoSQL Injection Prevention**: `express-mongo-sanitize` strips `$` and `.` operators.
2. **Cross-Site Scripting (XSS)**: `xss-clean` filters malicious scripts and HTML tags from user input.
3. **HTTP Parameter Pollution (HPP)**: `hpp` prevents duplicate query string parameter exploits.
4. **Custom Payload Guard**: Blocks common malicious patterns (e.g., `$where`, `eval()`).
5. **Rate Limiting**: Dedicated auth route limiting (10 requests / 15 mins) to prevent brute-force attacks.
6. **Security Headers**: `helmet` + custom headers (CSP, nosniff, frame-options).
7. **Rich Text Sanitization**: `sanitize-html` strictly controls allowed tags in bio/descriptions.

---

## 🐳 DevOps & Containerization

### Docker Environment

The full application is containerized using multi-stage builds.

**Run locally with Docker Compose:**
```bash
docker compose up --build
```
This spins up:
- `mongodb` (Port 27017)
- `server` Node.js API (Port 5000)
- `client` Nginx serving React (Port 80)

### Kubernetes (K8s)

Production-ready Kubernetes manifests are located in the `/k8s` directory:
- **Deployments**: Client (Nginx) and Server (Node.js)
- **HPA**: Server automatically scales from 3 to 10 pods based on CPU/Memory usage.
- **Ingress**: Configured for routing `/` to the frontend and `/api` to the backend.

To apply to a cluster:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
# Edit k8s/secret.yaml.template with your base64 secrets first, then apply
kubectl apply -f k8s/server/
kubectl apply -f k8s/client/
kubectl apply -f k8s/ingress.yaml
```

---

## 🔄 CI/CD Pipelines

Automated via **GitHub Actions** (`.github/workflows`):

1. **Continuous Integration (`ci.yml`)**:
   - Triggers on push/PR to `main` and `develop`.
   - Runs npm lint, build checks, and server syntax verification.
   - On successful build to `main`, automatically deploys:
     - Frontend to **Vercel**
     - Backend to **Render**

2. **Security Scanning (`security-scan.yml`)**:
   - Runs weekly and on PRs.
   - Executes `npm audit` for dependency vulnerabilities.
   - Uses **Trivy** to scan Docker images for OS and library vulnerabilities.

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillbridge
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 🚀 Deployment Configs Included

- **Vercel**: Pre-configured `vercel.json` (inside `client/vercel.json`) for SPA routing and build output.
- **Nginx**: Production `nginx.conf` included for Docker/K8s client serving with aggressive caching and security headers.
- **Render**: Configured for manual Free Web Service deployment (see [walkthrough.md](walkthrough.md) for details).
