import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/shared/PrivateRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

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
const VerifyPage        = lazy(() => import('./pages/Verify'));
const Documentation     = lazy(() => import('./pages/Documentation'));
const About             = lazy(() => import('./pages/About'));
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService    = lazy(() => import('./pages/TermsOfService'));
const NotFound          = lazy(() => import('./pages/NotFound'));
const PartnershipGuide  = lazy(() => import('./pages/PartnershipGuide'));

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
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>

          <Route path="/" element={<Landing />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify/:id" element={<VerifyPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/partnership-guide" element={<PartnershipGuide />} />

          {/* Nested Dashboard Layout Routes */}
          <Route element={<Layout />}>
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
