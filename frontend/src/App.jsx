import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/shared/PrivateRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Lazy-loaded pages — each is a separate JS chunk, only downloaded on first visit
const Landing           = lazy(() => import('./pages/Landing'));
const Login             = lazy(() => import('./pages/Login'));
const Register          = lazy(() => import('./pages/Register'));
const IssuerDashboard   = lazy(() => import('./pages/IssuerDashboard'));
const StudentDashboard  = lazy(() => import('./pages/StudentDashboard'));
const CredentialArchive = lazy(() => import('./pages/CredentialArchive'));
const StudentCredentials= lazy(() => import('./pages/StudentCredentials'));
const NetworkStatus     = lazy(() => import('./pages/NetworkStatus'));
const RevokedCredentials= lazy(() => import('./pages/RevokedCredentials'));
const Settings          = lazy(() => import('./pages/Settings'));
const Profile           = lazy(() => import('./pages/Profile'));
const PublicProfile     = lazy(() => import('./pages/PublicProfile'));
const VerifyPage        = lazy(() => import('./pages/Verify'));
const Documentation     = lazy(() => import('./pages/Documentation'));
const PublicExplorer    = lazy(() => import('./pages/PublicExplorer'));
const About             = lazy(() => import('./pages/About'));
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService    = lazy(() => import('./pages/TermsOfService'));
const NotFound          = lazy(() => import('./pages/NotFound'));

// Full-screen fallback shown while a lazy page chunk is loading
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="relative z-10 flex flex-col items-center">
            <LoadingSpinner size="xl" text="Initializing Secure Access..." />
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<PublicExplorer />} />
          <Route path="/student/:walletAddress" element={<PublicProfile profileType="student" />} />
          <Route path="/issuer/:id" element={<PublicProfile profileType="issuer" />} />
          <Route path="/issuer/wallet/:walletAddress" element={<PublicProfile profileType="issuer" />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {user?.role === 'STUDENT' ? <StudentDashboard /> : <IssuerDashboard />}
              </PrivateRoute>
            }
          />

          <Route
            path="/credentials"
            element={
              <PrivateRoute>
                {user?.role === 'STUDENT' ? <StudentCredentials /> : <CredentialArchive />}
              </PrivateRoute>
            }
          />

          <Route
            path="/network-status"
            element={
              <PrivateRoute allowedRoles={['ISSUER']}>
                <NetworkStatus />
              </PrivateRoute>
            }
          />

          <Route
            path="/revoked"
            element={
              <PrivateRoute allowedRoles={['ISSUER']}>
                <RevokedCredentials />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
