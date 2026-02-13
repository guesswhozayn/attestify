import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import InstituteDashboard from './pages/InstituteDashboard';
import Credentials from './pages/Credentials'; // Import Credentials page
import StudentDashboard from './pages/StudentDashboard';
import StudentCredentials from './pages/StudentCredentials';
import VerificationPortal from './components/verification/VerificationPortal';
import AuditLogs from './pages/AuditLogs';
import RevokedCertificates from './pages/RevokedCertificates';
import Settings from './pages/Settings';
import Profile from './pages/profile';
import StudentPublicProfile from './pages/StudentPublicProfile';
import VerifyPage from './pages/Verify';
import Documentation from './pages/Documentation';
import PublicSearch from './pages/PublicSearch';
import InstitutePublicProfile from './pages/InstitutePublicProfile';
import PrivateRoute from './components/shared/PrivateRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';



function App() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<PublicSearch />} />
        <Route path="/student/:walletAddress" element={<StudentPublicProfile />} />
        <Route path="/institute/:id" element={<InstitutePublicProfile />} />
        <Route path="/institute/wallet/:walletAddress" element={<InstitutePublicProfile />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/verify" element={<VerificationPortal />} />
        <Route path="/profile/:walletAddress" element={<StudentPublicProfile />} />
        <Route path="/docs" element={<Documentation />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {user?.role === 'STUDENT' ? <Navigate to="/student-dashboard" /> : <Navigate to="/institute-dashboard" />}
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
          path="/institute-dashboard"
          element={
            <PrivateRoute allowedRoles={['INSTITUTE']}>
              <InstituteDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/credentials"
          element={
            <PrivateRoute allowedRoles={['INSTITUTE']}>
              <Credentials />
            </PrivateRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <PrivateRoute allowedRoles={['INSTITUTE']}>
              <AuditLogs />
            </PrivateRoute>
          }
        />

        <Route
          path="/revoked"
          element={
            <PrivateRoute allowedRoles={['INSTITUTE']}>
              <RevokedCertificates />
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
