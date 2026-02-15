import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import IssuerDashboard from './pages/IssuerDashboard';
import Credentials from './pages/Credentials'; // Import Credentials page
import StudentDashboard from './pages/StudentDashboard';
import StudentCredentials from './pages/StudentCredentials';
import VerificationPortal from './components/verification/VerificationPortal';
import NetworkStatus from './pages/NetworkStatus';
import RevokedCredentials from './pages/RevokedCredentials';
import Settings from './pages/Settings';
import Profile from './pages/profile';
import StudentPublicProfile from './pages/StudentPublicProfile';
import VerifyPage from './pages/Verify';
import Documentation from './pages/Documentation';
import PublicSearch from './pages/PublicSearch';
import IssuerPublicProfile from './pages/IssuerPublicProfile';
import PrivateRoute from './components/shared/PrivateRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';



function App() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<PublicSearch />} />
        <Route path="/student/:walletAddress" element={<StudentPublicProfile />} />
        <Route path="/issuer/:id" element={<IssuerPublicProfile />} />
        <Route path="/issuer/wallet/:walletAddress" element={<IssuerPublicProfile />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/profile/:walletAddress" element={<StudentPublicProfile />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {user?.role === 'STUDENT' ? <Navigate to="/student-dashboard" /> : <Navigate to="/issuer-dashboard" />}
            </PrivateRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/student/credentials"
          element={
            <PrivateRoute allowedRoles={['STUDENT']}>
              <StudentCredentials />
            </PrivateRoute>
          }
        />

        <Route
          path="/issuer-dashboard"
          element={
            <PrivateRoute allowedRoles={['ISSUER']}>
              <IssuerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/credentials"
          element={
            <PrivateRoute allowedRoles={['ISSUER']}>
              <Credentials />
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
    </Layout>
  );
}

export default App;
