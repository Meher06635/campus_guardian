import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CounselorDashboard from './pages/CounselorDashboard';
import HostelDashboard from './pages/HostelDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container" style={{textAlign: 'center', marginTop: '100px'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />; // Or a generic unauthorized page

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/counselor/*" element={
              <ProtectedRoute allowedRoles={['counselor']}>
                <CounselorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/hostel/*" element={
              <ProtectedRoute allowedRoles={['hostel_manager']}>
                <HostelDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
