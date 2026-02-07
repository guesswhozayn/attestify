import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VerificationPortal from './components/verification/VerificationPortal';
import AdminManagement from './pages/AdminManagement';
import AuditLogs from './pages/AuditLogs';
import RevokedCertificates from './pages/RevokedCertificates';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import InstituteProfile from './pages/InstituteProfile';
import VerifyPage from './pages/Verify';
import PrivateRoute from './components/shared/PrivateRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';



function App() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/verify" element={<VerificationPortal />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {user?.role === 'STUDENT' ? <Navigate to="/student-dashboard" /> : <Navigate to="/admin-dashboard" />}
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
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRoles={['INSTITUTE']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-management"
          element={
            <PrivateRoute allowedRoles={['INSTITUTE']}>
              <AdminManagement />
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

        <Route
          path="/institute-profile"
          element={
            <PrivateRoute allowedRoles={['INSTITUTE']}>
              <InstituteProfile />
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
