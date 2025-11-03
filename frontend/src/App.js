import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Pages
import LandingPage from '@/pages/LandingPage';
import PatientLogin from '@/pages/PatientLogin';
import PatientDashboard from '@/pages/PatientDashboard';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App" dir="rtl">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/patient/login" 
            element={
              user && user.role === 'patient' ? 
                <Navigate to="/patient/dashboard" /> : 
                <PatientLogin onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/patient/dashboard" 
            element={
              user && user.role === 'patient' ? 
                <PatientDashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/patient/login" />
            } 
          />
          <Route 
            path="/admin/login" 
            element={
              user && user.role === 'admin' ? 
                <Navigate to="/admin/dashboard" /> : 
                <AdminLogin onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              user && user.role === 'admin' ? 
                <AdminDashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/admin/login" />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;