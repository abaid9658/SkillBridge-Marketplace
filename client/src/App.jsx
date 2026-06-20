import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Eagerly loaded core pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import ProviderProfile from './pages/ProviderProfile';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateService from './pages/CreateService';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

// Lazy-loaded pages
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Support = lazy(() => import('./pages/Support'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const CreateJob = lazy(() => import('./pages/CreateJob'));
const MyJobs = lazy(() => import('./pages/MyJobs'));
const JobProposals = lazy(() => import('./pages/JobProposals'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Deposit = lazy(() => import('./pages/Deposit'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Explore = lazy(() => import('./pages/Explore'));
const Pricing = lazy(() => import('./pages/Pricing'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const AITools = lazy(() => import('./pages/ai/AITools'));
const ServiceGenerator = lazy(() => import('./pages/ai/ServiceGenerator'));
const ProposalGenerator = lazy(() => import('./pages/ai/ProposalGenerator'));

// Loading spinner
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <span style={{ width: '40px', height: '40px', border: '3px solid var(--primary-glow)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'block' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Protected Route wrapper component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'provider') return <Navigate to="/provider-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/profile/:id" element={<ProviderProfile />} />

            {/* ── Company / Static Pages ── */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<AboutUs />} />

            {/* ── Jobs / Proposal Board (Public browse) ── */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            {/* ── Customer Portal ── */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><Chat /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><Wallet /></ProtectedRoute>} />
            <Route path="/wallet/deposit" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><Deposit /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><Transactions /></ProtectedRoute>} />
            <Route path="/my-jobs" element={<ProtectedRoute allowedRoles={['customer']}><MyJobs /></ProtectedRoute>} />
            <Route path="/jobs/create" element={<ProtectedRoute allowedRoles={['customer']}><CreateJob /></ProtectedRoute>} />
            <Route path="/jobs/:id/proposals" element={<ProtectedRoute allowedRoles={['customer']}><JobProposals /></ProtectedRoute>} />

            {/* ── Provider Portal ── */}
            <Route path="/provider-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/create-service" element={<ProtectedRoute allowedRoles={['provider']}><CreateService /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><ProfileEdit /></ProtectedRoute>} />
            <Route path="/profile/portfolio" element={<ProtectedRoute allowedRoles={['provider']}><Portfolio /></ProtectedRoute>} />

            {/* ── AI Tools (Provider) ── */}
            <Route path="/ai" element={<ProtectedRoute allowedRoles={['provider']}><AITools /></ProtectedRoute>} />
            <Route path="/ai/service-generator" element={<ProtectedRoute allowedRoles={['provider']}><ServiceGenerator /></ProtectedRoute>} />
            <Route path="/ai/proposal-generator" element={<ProtectedRoute allowedRoles={['provider']}><ProposalGenerator /></ProtectedRoute>} />

            {/* ── Admin Portal ── */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

export default App;
